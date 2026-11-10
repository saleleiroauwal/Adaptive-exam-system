import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["adaptive_engine"] == "operational"


def test_auth_login_student_and_admin():
    # Login Student
    student_res = client.post("/api/auth/login", json={"email": "student@exam.com", "password": "student123"})
    assert student_res.status_code == 200
    student_data = student_res.json()
    assert "access_token" in student_data
    assert student_data["user"]["role"] == "STUDENT"

    # Login Admin
    admin_res = client.post("/api/auth/login", json={"email": "admin@exam.com", "password": "admin123"})
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert "access_token" in admin_data
    assert admin_data["user"]["role"] == "ADMIN"


def test_security_no_correct_answer_leakage_to_student():
    """
    Verify security rule: Students must NEVER receive correct_answer or question difficulty
    in the question payload during an active exam.
    """
    # 1. Login student
    login_res = client.post("/api/auth/login", json={"email": "student@exam.com", "password": "student123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Start exam
    start_res = client.post("/api/exam-sessions/start", json={"exam_id": 1}, headers=headers)
    assert start_res.status_code == 200
    payload = start_res.json()
    assert "current_question" in payload
    question_view = payload["current_question"]

    # Strict check: these fields MUST NOT exist in student's question view
    assert "correct_answer" not in question_view
    assert "difficulty" not in question_view

    # Verify expected sanitized student fields are present
    assert "id" in question_view
    assert "question_text" in question_view
    assert "option_a" in question_view
    assert "option_b" in question_view
    assert "option_c" in question_view
    assert "option_d" in question_view


def test_student_adaptive_session_flow():
    # Login student
    login_res = client.post("/api/auth/login", json={"email": "student@exam.com", "password": "student123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Start exam
    start_res = client.post("/api/exam-sessions/start", json={"exam_id": 1}, headers=headers)
    session_data = start_res.json()
    session_id = session_data["session_id"]
    current_q = session_data["current_question"]

    # Submit an answer to Q1
    ans_res = client.post(
        f"/api/exam-sessions/{session_id}/submit-answer",
        json={"question_id": current_q["id"], "selected_answer": "B", "response_time_seconds": 12.5},
        headers=headers
    )
    assert ans_res.status_code == 200
    ans_payload = ans_res.json()
    assert ans_payload["session_id"] == session_id
    assert "is_completed" in ans_payload

    # Fetch session status
    status_res = client.get(f"/api/exam-sessions/{session_id}", headers=headers)
    assert status_res.status_code == 200
    status_payload = status_res.json()
    assert status_payload["session_id"] == session_id
