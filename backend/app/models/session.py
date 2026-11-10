from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    current_question_index = Column(Integer, nullable=False, default=1)  # e.g., 1, 2, ... N
    current_question_id = Column(Integer, ForeignKey("questions.id", ondelete="SET NULL"), nullable=True)
    current_difficulty = Column(Integer, nullable=False, default=2)  # starts at 2 (Medium)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False, default="IN_PROGRESS")  # "IN_PROGRESS", "COMPLETED", "TIMED_OUT"

    # Relationships
    student = relationship("User", back_populates="exam_sessions")
    exam = relationship("Exam", back_populates="sessions")
    current_question = relationship("Question", foreign_keys=[current_question_id])
    responses = relationship("StudentResponse", back_populates="session", cascade="all, delete-orphan", order_by="StudentResponse.id")
    result = relationship("ExamResult", back_populates="session", uselist=False, cascade="all, delete-orphan")


class StudentResponse(Base):
    __tablename__ = "student_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    selected_answer = Column(String(2), nullable=False)  # "A", "B", "C", "D"
    is_correct = Column(Boolean, nullable=False)
    question_difficulty = Column(Integer, nullable=False)  # 1, 2, 3
    response_time_seconds = Column(Float, nullable=False, default=0.0)
    answered_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("ExamSession", back_populates="responses")
    question = relationship("Question", back_populates="responses")


class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("exam_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    incorrect_answers = Column(Integer, nullable=False)
    score_percentage = Column(Float, nullable=False)
    final_level = Column(String(50), nullable=False)  # "Beginner / Foundational", "Intermediate", "Advanced / Mastery"
    easy_count = Column(Integer, nullable=False, default=0)
    medium_count = Column(Integer, nullable=False, default=0)
    hard_count = Column(Integer, nullable=False, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("ExamSession", back_populates="result")
    student = relationship("User", back_populates="results")
    exam = relationship("Exam", back_populates="results")
