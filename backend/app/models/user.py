from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="STUDENT")  # "ADMIN" or "STUDENT"
    student_id_number = Column(String(50), nullable=True)  # Student matric/ID number
    staff_id = Column(String(50), nullable=True)  # Staff/Lecturer ID number
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    exams_created = relationship("Exam", back_populates="creator", cascade="all, delete-orphan")
    exam_sessions = relationship("ExamSession", back_populates="student", cascade="all, delete-orphan")
    results = relationship("ExamResult", back_populates="student", cascade="all, delete-orphan")
