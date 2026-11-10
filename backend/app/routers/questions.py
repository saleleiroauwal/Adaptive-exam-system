# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.exam import Exam
from ..models.question import Question
from ..schemas.question import QuestionCreate, QuestionUpdate, QuestionAdminResponse
from ..utils.security import require_admin

router = APIRouter(tags=["Questions Management (Admin)"])

@router.get("/exams/{exam_id}/questions", response_model=List[QuestionAdminResponse])
def list_exam_questions(
    exam_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    questions = db.query(Question).filter(Question.exam_id == exam_id).order_by(Question.difficulty.asc(), Question.id.asc()).all()
    return questions


@router.post("/exams/{exam_id}/questions", response_model=QuestionAdminResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    exam_id: int,
    req: QuestionCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    question = Question(
        exam_id=exam_id,
        question_text=req.question_text.strip(),
        option_a=req.option_a.strip(),
        option_b=req.option_b.strip(),
        option_c=req.option_c.strip(),
        option_d=req.option_d.strip(),
        correct_answer=req.correct_answer.upper().strip(),
        difficulty=req.difficulty,
        topic=req.topic.strip() if req.topic else "General"
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.post("/exams/{exam_id}/questions/bulk", response_model=List[QuestionAdminResponse], status_code=status.HTTP_201_CREATED)
def bulk_create_questions(
    exam_id: int,
    questions_data: List[QuestionCreate],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    created = []
    for req in questions_data:
        question = Question(
            exam_id=exam_id,
            question_text=req.question_text.strip(),
            option_a=req.option_a.strip(),
            option_b=req.option_b.strip(),
            option_c=req.option_c.strip(),
            option_d=req.option_d.strip(),
            correct_answer=req.correct_answer.upper().strip(),
            difficulty=req.difficulty,
            topic=req.topic.strip() if req.topic else "General"
        )
        db.add(question)
        created.append(question)

    db.commit()
    for q in created:
        db.refresh(q)
    return created


@router.put("/questions/{question_id}", response_model=QuestionAdminResponse)
def update_question(
    question_id: int,
    req: QuestionUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    if req.question_text is not None:
        question.question_text = req.question_text.strip()
    if req.option_a is not None:
        question.option_a = req.option_a.strip()
    if req.option_b is not None:
        question.option_b = req.option_b.strip()
    if req.option_c is not None:
        question.option_c = req.option_c.strip()
    if req.option_d is not None:
        question.option_d = req.option_d.strip()
    if req.correct_answer is not None:
        ans = req.correct_answer.upper().strip()
        if ans in ["A", "B", "C", "D"]:
            question.correct_answer = ans
    if req.difficulty is not None:
        if req.difficulty in [1, 2, 3]:
            question.difficulty = req.difficulty
    if req.topic is not None:
        question.topic = req.topic.strip()

    db.commit()
    db.refresh(question)
    return question


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    db.delete(question)
    db.commit()
    return None
