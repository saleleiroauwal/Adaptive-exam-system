from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.user import User
from ..models.exam import Exam
from ..models.question import Question
from ..models.session import ExamSession, StudentResponse, ExamResult
from ..schemas.session import ExamResultResponse, AdaptiveStep
from ..adaptive_engine.engine import DifficultyLevel
from ..utils.security import get_current_user, require_admin

router = APIRouter(prefix="/results", tags=["Results & Performance Analytics"])

def build_result_response(result: ExamResult, db: Session) -> ExamResultResponse:
    session = db.query(ExamSession).filter(ExamSession.id == result.session_id).first()
    student = db.query(User).filter(User.id == result.student_id).first()
    exam = db.query(Exam).filter(Exam.id == result.exam_id).first()

    # Load sequential student responses to construct adaptive progression trajectory
    responses = db.query(StudentResponse).filter(
        StudentResponse.session_id == result.session_id
    ).order_by(StudentResponse.id.asc()).all()

    trajectory = []
    for idx, r in enumerate(responses, start=1):
        q = db.query(Question).filter(Question.id == r.question_id).first()
        trajectory.append(AdaptiveStep(
            step_number=idx,
            question_id=r.question_id,
            difficulty_level=r.question_difficulty,
            difficulty_label=DifficultyLevel.to_label(r.question_difficulty),
            is_correct=r.is_correct,
            selected_answer=r.selected_answer,
            response_time_seconds=r.response_time_seconds,
            topic=q.topic if q else "General"
        ))

    return ExamResultResponse(
        id=result.id,
        session_id=result.session_id,
        student_id=result.student_id,
        student_name=student.name if student else "Unknown Student",
        student_id_number=student.student_id_number if student else None,
        exam_id=result.exam_id,
        exam_title=exam.title if exam else "Unknown Exam",
        course=exam.course if exam else "General",
        total_questions=result.total_questions,
        correct_answers=result.correct_answers,
        incorrect_answers=result.incorrect_answers,
        score_percentage=result.score_percentage,
        final_level=result.final_level,
        easy_count=result.easy_count,
        medium_count=result.medium_count,
        hard_count=result.hard_count,
        completed_at=result.completed_at,
        trajectory=trajectory
    )


@router.get("/session/{session_id}", response_model=ExamResultResponse)
def get_session_result(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = db.query(ExamResult).filter(ExamResult.session_id == session_id).first()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found for this session")

    # Authorize: Only the student who took it or an Admin can view
    if result.student_id != current_user.id and current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return build_result_response(result, db)


@router.get("/student/my-results", response_model=List[ExamResultResponse])
def get_my_results(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(ExamResult).filter(
        ExamResult.student_id == current_user.id
    ).order_by(ExamResult.completed_at.desc()).all()

    return [build_result_response(r, db) for r in results]


@router.get("/exam/{exam_id}/overview", response_model=List[ExamResultResponse])
def get_exam_results_for_admin(
    exam_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Lecturer / Admin Endpoint:
    Retrieve all completed student results for an examination with full adaptive trajectory.
    """
    results = db.query(ExamResult).filter(
        ExamResult.exam_id == exam_id
    ).order_by(ExamResult.completed_at.desc()).all()

    return [build_result_response(r, db) for r in results]
