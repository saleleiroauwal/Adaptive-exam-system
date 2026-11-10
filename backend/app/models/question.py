from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_answer = Column(String(2), nullable=False)  # "A", "B", "C", "D"
    difficulty = Column(Integer, nullable=False, default=2)  # 1 = Easy, 2 = Medium, 3 = Hard
    topic = Column(String(100), nullable=False, default="General")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    exam = relationship("Exam", back_populates="questions")
    responses = relationship("StudentResponse", back_populates="question", cascade="all, delete-orphan")
