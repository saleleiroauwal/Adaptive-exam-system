from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExamCreate(BaseModel):
    title: str
    course: str
    description: Optional[str] = ""
    duration_minutes: int = 30
    total_questions: int = 10

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    course: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    total_questions: Optional[int] = None
    status: Optional[str] = None

class ExamResponse(BaseModel):
    id: int
    title: str
    course: str
    description: Optional[str] = ""
    duration_minutes: int
    total_questions: int
    created_by: int
    status: str
    created_at: datetime
    
    # Question bank statistics
    total_questions_in_bank: Optional[int] = 0
    easy_questions_count: Optional[int] = 0
    medium_questions_count: Optional[int] = 0
    hard_questions_count: Optional[int] = 0

    class Config:
        from_attributes = True
