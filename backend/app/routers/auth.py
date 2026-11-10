# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from ..utils.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    # Normalize role
    role = req.role.upper().strip() if req.role else "STUDENT"
    if role not in ["ADMIN", "STUDENT"]:
        role = "STUDENT"

    new_user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hash_password(req.password),
        role=role,
        student_id_number=req.student_id_number.strip() if req.student_id_number else None,
        staff_id=req.staff_id.strip() if req.staff_id else None,
        department=req.department.strip() if req.department else None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    requested_role = req.role.upper().strip() if req.role else None

    # Differentiate Admin Login: require Staff ID
    if requested_role == "ADMIN" or user.role == "ADMIN":
        if not req.staff_id or not req.staff_id.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff ID is required for administrator login"
            )

        if user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only registered administrators/lecturers can log in here."
            )

        user_staff_id = (user.staff_id or "").strip().upper()
        provided_staff_id = req.staff_id.strip().upper()
        if user_staff_id != provided_staff_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Staff ID for this administrator account"
            )
    elif requested_role == "STUDENT":
        if user.role != "STUDENT":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This is an administrator account. Please use the Lecturer / Admin Portal with your Staff ID."
            )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
def get_authenticated_user(current_user: User = Depends(get_current_user)):
    return current_user
