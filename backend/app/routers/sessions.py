from datetime import datetime, timedelta
from typing import Set
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.exam import Exam
from ..models.question import Question
from ..models.session import ExamSession, StudentResponse, ExamResult
from ..schemas.session import (
    StartExamRequest,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    SessionStatusResponse
)
from ..schemas.question import QuestionStudentView
from ..adaptive_engine.engine import AdaptiveEngine, DifficultyLevel
from ..adaptive_engine.selector import QuestionSelector
from ..utils.security import get_current_user

router = APIRouter(prefix="/exam-sessions", tags=["Exam Sessions & Real-Time Adaptive Flow"])


def calculate_remaining_seconds(session: ExamSession, exam: Exam) -> int:
    """Compute remaining examination seconds based on duration_minutes and start_time."""
    total_allowed_seconds = exam.duration_minutes * 60
    elapsed_seconds = (datetime.utcnow() - session.start_time).total_seconds()
    remaining = int(total_allowed_seconds - elapsed_seconds)
    return max(0, remaining)


def build_student_question_view(
    q: Question,
    session: ExamSession,
    exam: Exam
) -> QuestionStudentView:
    """Builds a secure, sanitized question payload withholding answer and difficulty."""
    remaining = calculate_remaining_seconds(session, exam)
    return QuestionStudentView(
        id=q.id,
        exam_id=exam.id,
        question_index=session.current_question_index,
        total_questions=exam.total_questions,
        question_text=q.question_text,
        option_a=q.option_a,
        option_b=q.option_b,
        option_c=q.option_c,
        option_d=q.option_d,
        topic=q.topic,
        remaining_seconds=remaining
    )


def finalize_session_internal(session: ExamSession, exam: Exam, db: Session, reason="COMPLETED") -> ExamResult:
    """Helper to compute final result, save ExamResult and update session status."""
    if session.status not in ["COMPLETED", "TIMED_OUT"]:
        session.status = reason
        session.end_time = datetime.utcnow()

    # Check if result already exists
    existing_result = db.query(ExamResult).filter(ExamResult.session_id == session.id).first()
    if existing_result:
        return existing_result

    # Compute performance using Adaptive Engine
    responses = db.query(StudentResponse).filter(StudentResponse.session_id == session.id).all()
    perf = AdaptiveEngine.evaluate_performance(responses)

    result = ExamResult(
        session_id=session.id,
        student_id=session.student_id,
        exam_id=session.exam_id,
        total_questions=perf["total_questions"],
        correct_answers=perf["correct_answers"],
        incorrect_answers=perf["incorrect_answers"],
        score_percentage=perf["score_percentage"],
        final_level=perf["final_level"],
        easy_count=perf["easy_count"],
        medium_count=perf["medium_count"],
        hard_count=perf["hard_count"],
        completed_at=datetime.utcnow()
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.post("/start", response_model=SessionStatusResponse)
def start_exam_session(
    req: StartExamRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == req.exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    if exam.status != "PUBLISHED" and current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Exam is not published")

    # Check if there is already an active session for this user
    active_session = db.query(ExamSession).filter(
        ExamSession.student_id == current_user.id,
        ExamSession.exam_id == exam.id,
        ExamSession.status == "IN_PROGRESS"
    ).first()

    if active_session:
        # Check if time expired
        remaining = calculate_remaining_seconds(active_session, exam)
        if remaining <= 0:
            finalize_session_internal(active_session, exam, db, reason="TIMED_OUT")
        else:
            current_q = db.query(Question).filter(Question.id == active_session.current_question_id).first()
            return SessionStatusResponse(
                session_id=active_session.id,
                exam_id=exam.id,
                exam_title=exam.title,
                status=active_session.status,
                current_question_index=active_session.current_question_index,
                total_questions=exam.total_questions,
                remaining_seconds=remaining,
                current_question=build_student_question_view(current_q, active_session, exam) if current_q else None
            )

    # Begin new session starting at MEDIUM difficulty (2)
    initial_difficulty = DifficultyLevel.MEDIUM.value
    initial_question = QuestionSelector.select_from_database(
        db=db,
        exam_id=exam.id,
        target_difficulty=initial_difficulty,
        answered_question_ids=set()
    )

    if not initial_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The question bank for this exam is empty. Please contact the administrator."
        )

    session = ExamSession(
        student_id=current_user.id,
        exam_id=exam.id,
        current_question_index=1,
        current_question_id=initial_question.id,
        current_difficulty=initial_difficulty,
        start_time=datetime.utcnow(),
        status="IN_PROGRESS"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    remaining_seconds = exam.duration_minutes * 60
    return SessionStatusResponse(
        session_id=session.id,
        exam_id=exam.id,
        exam_title=exam.title,
        status=session.status,
        current_question_index=session.current_question_index,
        total_questions=exam.total_questions,
        remaining_seconds=remaining_seconds,
        current_question=build_student_question_view(initial_question, session, exam)
    )


@router.get("/{session_id}", response_model=SessionStatusResponse)
def get_session_status(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.student_id != current_user.id and current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    exam = db.query(Exam).filter(Exam.id == session.exam_id).first()
    remaining = calculate_remaining_seconds(session, exam)

    if session.status == "IN_PROGRESS" and remaining <= 0:
        finalize_session_internal(session, exam, db, reason="TIMED_OUT")
        remaining = 0

    current_q = None
    if session.status == "IN_PROGRESS" and session.current_question_id:
        current_q = db.query(Question).filter(Question.id == session.current_question_id).first()

    return SessionStatusResponse(
        session_id=session.id,
        exam_id=exam.id,
        exam_title=exam.title,
        status=session.status,
        current_question_index=session.current_question_index,
        total_questions=exam.total_questions,
        remaining_seconds=remaining,
        current_question=build_student_question_view(current_q, session, exam) if current_q else None
    )


@router.post("/{session_id}/submit-answer", response_model=SubmitAnswerResponse)
def submit_student_answer(
    session_id: int,
    req: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    exam = db.query(Exam).filter(Exam.id == session.exam_id).first()

    # Check if session is already completed or timed out
    if session.status != "IN_PROGRESS":
        return SubmitAnswerResponse(
            session_id=session.id,
            is_completed=True,
            current_question_index=session.current_question_index,
            total_questions=exam.total_questions,
            next_question=None,
            message=f"Exam session is already {session.status.lower()}."
        )

    # Check timer
    remaining = calculate_remaining_seconds(session, exam)
    if remaining <= 0:
        finalize_session_internal(session, exam, db, reason="TIMED_OUT")
        return SubmitAnswerResponse(
            session_id=session.id,
            is_completed=True,
            current_question_index=session.current_question_index,
            total_questions=exam.total_questions,
            next_question=None,
            message="Time has expired. Examination submitted automatically."
        )

    # Validate active question
    current_question = db.query(Question).filter(Question.id == session.current_question_id).first()
    if not current_question or current_question.id != req.question_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submitted question does not match the active examination question."
        )

    # 1. EVALUATE ANSWER
    normalized_selected = req.selected_answer.strip().upper()
    is_correct = (normalized_selected == current_question.correct_answer.strip().upper())

    # 2. RECORD STUDENT RESPONSE
    student_response = StudentResponse(
        session_id=session.id,
        question_id=current_question.id,
        selected_answer=normalized_selected,
        is_correct=is_correct,
        question_difficulty=current_question.difficulty,
        response_time_seconds=max(0.0, float(req.response_time_seconds)),
        answered_at=datetime.utcnow()
    )
    db.add(student_response)

    # 3. REAL-TIME ADAPTIVE ENGINE DECISION
    # Adapt difficulty immediately based on current answer
    next_difficulty = AdaptiveEngine.calculate_next_difficulty(
        current_difficulty=session.current_difficulty,
        is_correct=is_correct
    )
    session.current_difficulty = next_difficulty

    # Gather answered question IDs so far
    existing_responses = db.query(StudentResponse.question_id).filter(
        StudentResponse.session_id == session.id
    ).all()
    answered_ids: Set[int] = {r[0] for r in existing_responses}
    answered_ids.add(current_question.id)

    # 4. CHECK COMPLETION CONDITION
    if session.current_question_index >= exam.total_questions:
        # Reached total questions required by exam
        db.commit()
        finalize_session_internal(session, exam, db, reason="COMPLETED")
        return SubmitAnswerResponse(
            session_id=session.id,
            is_completed=True,
            current_question_index=session.current_question_index,
            total_questions=exam.total_questions,
            next_question=None,
            message="Examination completed successfully! All questions answered."
        )

    # 5. SELECT NEXT QUESTION VIA ADAPTIVE SELECTOR
    next_question = QuestionSelector.select_from_database(
        db=db,
        exam_id=exam.id,
        target_difficulty=next_difficulty,
        answered_question_ids=answered_ids
    )

    if not next_question:
        # Question bank exhausted before reaching total questions
        db.commit()
        finalize_session_internal(session, exam, db, reason="COMPLETED")
        return SubmitAnswerResponse(
            session_id=session.id,
            is_completed=True,
            current_question_index=session.current_question_index,
            total_questions=exam.total_questions,
            next_question=None,
            message="All available questions in the question bank have been completed."
        )

    # 6. ADVANCE SESSION TO NEXT QUESTION
    session.current_question_index += 1
    session.current_question_id = next_question.id
    db.commit()
    db.refresh(session)

    next_question_view = build_student_question_view(next_question, session, exam)

    return SubmitAnswerResponse(
        session_id=session.id,
        is_completed=False,
        current_question_index=session.current_question_index,
        total_questions=exam.total_questions,
        next_question=next_question_view,
        message="Answer recorded. Next adaptive question presented."
    )


@router.post("/{session_id}/finalize", response_model=SubmitAnswerResponse)
def manual_finalize_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows student to manually finalize and submit their examination early."""
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.student_id != current_user.id and current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    exam = db.query(Exam).filter(Exam.id == session.exam_id).first()
    finalize_session_internal(session, exam, db, reason="COMPLETED")

    return SubmitAnswerResponse(
        session_id=session.id,
        is_completed=True,
        current_question_index=session.current_question_index,
        total_questions=exam.total_questions,
        next_question=None,
        message="Examination finalized and submitted."
    )
