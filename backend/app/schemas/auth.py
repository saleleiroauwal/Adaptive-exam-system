# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "STUDENT"  # "STUDENT" or "ADMIN"
    student_id_number: Optional[str] = None
    staff_id: Optional[str] = None
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None  # "ADMIN" or "STUDENT"
    staff_id: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    student_id_number: Optional[str] = None
    staff_id: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
