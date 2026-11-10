from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .question import QuestionStudentView

class StartExamRequest(BaseModel):
    exam_id: int

class SubmitAnswerRequest(BaseModel):
    question_id: int
    selected_answer: str  # "A", "B", "C", "D"
    response_time_seconds: float = 0.0

class SubmitAnswerResponse(BaseModel):
    session_id: int
    is_completed: bool
    current_question_index: int
    total_questions: int
    next_question: Optional[QuestionStudentView] = None
    message: str

class AdaptiveStep(BaseModel):
    step_number: int
    question_id: int
    difficulty_level: int
    difficulty_label: str
    is_correct: bool
    selected_answer: str
    response_time_seconds: float
    topic: str

class ExamResultResponse(BaseModel):
    id: int
    session_id: int
    student_id: int
    student_name: str
    student_id_number: Optional[str] = None
    exam_id: int
    exam_title: str
    course: str
    total_questions: int
    correct_answers: int
    incorrect_answers: int
    score_percentage: float
    final_level: str
    easy_count: int
    medium_count: int
    hard_count: int
    completed_at: datetime
    trajectory: Optional[List[AdaptiveStep]] = []

    class Config:
        from_attributes = True

class SessionStatusResponse(BaseModel):
    session_id: int
    exam_id: int
    exam_title: str
    status: str
    current_question_index: int
    total_questions: int
    remaining_seconds: int
    current_question: Optional[QuestionStudentView] = None
