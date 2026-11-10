# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.exam import Exam
from ..models.question import Question
from ..schemas.exam import ExamCreate, ExamUpdate, ExamResponse
from ..utils.security import get_current_user, require_admin

router = APIRouter(prefix="/exams", tags=["Exams"])

def populate_exam_counts(exam: Exam, db: Session) -> dict:
    questions = db.query(Question).filter(Question.exam_id == exam.id).all()
    easy_count = sum(1 for q in questions if q.difficulty == 1)
    med_count = sum(1 for q in questions if q.difficulty == 2)
    hard_count = sum(1 for q in questions if q.difficulty == 3)
    
    return {
        "id": exam.id,
        "title": exam.title,
        "course": exam.course,
        "description": exam.description or "",
        "duration_minutes": exam.duration_minutes,
        "total_questions": exam.total_questions,
        "created_by": exam.created_by,
        "status": exam.status,
        "created_at": exam.created_at,
        "total_questions_in_bank": len(questions),
        "easy_questions_count": easy_count,
        "medium_questions_count": med_count,
        "hard_questions_count": hard_count,
    }


@router.get("", response_model=List[ExamResponse])
def list_exams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List exams:
    - If user is ADMIN: returns all exams.
    - If user is STUDENT: returns only PUBLISHED exams.
    """
    if current_user.role.upper() == "ADMIN":
        exams = db.query(Exam).order_by(Exam.created_at.desc()).all()
    else:
        exams = db.query(Exam).filter(Exam.status == "PUBLISHED").order_by(Exam.created_at.desc()).all()

    return [populate_exam_counts(e, db) for e in exams]


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_exam(
    req: ExamCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exam = Exam(
        title=req.title.strip(),
        course=req.course.strip(),
        description=req.description.strip() if req.description else "",
        duration_minutes=req.duration_minutes,
        total_questions=req.total_questions,
        created_by=current_user.id,
        status="DRAFT"
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return populate_exam_counts(exam, db)


@router.get("/{exam_id}", response_model=ExamResponse)
def get_exam_details(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    # Non-admins cannot see non-published exams
    if current_user.role.upper() != "ADMIN" and exam.status != "PUBLISHED":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return populate_exam_counts(exam, db)


@router.put("/{exam_id}", response_model=ExamResponse)
def update_exam(
    exam_id: int,
    req: ExamUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    if req.title is not None:
        exam.title = req.title.strip()
    if req.course is not None:
        exam.course = req.course.strip()
    if req.description is not None:
        exam.description = req.description.strip()
    if req.duration_minutes is not None:
        exam.duration_minutes = req.duration_minutes
    if req.total_questions is not None:
        exam.total_questions = req.total_questions
    if req.status is not None:
        valid_statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"]
        status_val = req.status.upper().strip()
        if status_val in valid_statuses:
            exam.status = status_val

    db.commit()
    db.refresh(exam)
    return populate_exam_counts(exam, db)


@router.patch("/{exam_id}/publish", response_model=ExamResponse)
def toggle_publish_exam(
    exam_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    exam.status = "DRAFT" if exam.status == "PUBLISHED" else "PUBLISHED"
    db.commit()
    db.refresh(exam)
    return populate_exam_counts(exam, db)


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(
    exam_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    db.delete(exam)
    db.commit()
    return None
