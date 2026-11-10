from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str  # "A", "B", "C", "D"
    difficulty: int = 2  # 1 = Easy, 2 = Medium, 3 = Hard
    topic: str = "General"

    @field_validator("correct_answer")
    def validate_correct_answer(cls, v):
        val = v.strip().upper()
        if val not in ["A", "B", "C", "D"]:
            raise ValueError("correct_answer must be one of: A, B, C, D")
        return val

    @field_validator("difficulty")
    def validate_difficulty(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError("difficulty must be 1 (Easy), 2 (Medium), or 3 (Hard)")
        return v


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_answer: Optional[str] = None
    difficulty: Optional[int] = None
    topic: Optional[str] = None


class QuestionAdminResponse(BaseModel):
    id: int
    exam_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    difficulty: int
    topic: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionStudentView(BaseModel):
    """
    CRITICAL SECURITY SCHEMA:
    Student payload that specifically EXCLUDES correct_answer and difficulty.
    """
    id: int
    exam_id: int
    question_index: int
    total_questions: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    topic: str
    remaining_seconds: Optional[int] = None

    class Config:
        from_attributes = True
