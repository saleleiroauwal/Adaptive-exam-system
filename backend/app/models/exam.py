from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from ..database import Base

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    course = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=30)
    total_questions = Column(Integer, nullable=False, default=10)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False, default="DRAFT")  # "DRAFT", "PUBLISHED", "ARCHIVED"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="exams_created")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    sessions = relationship("ExamSession", back_populates="exam", cascade="all, delete-orphan")
    results = relationship("ExamResult", back_populates="exam", cascade="all, delete-orphan")
