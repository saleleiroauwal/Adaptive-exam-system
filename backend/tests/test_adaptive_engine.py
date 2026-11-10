import pytest
from app.adaptive_engine.engine import AdaptiveEngine, DifficultyLevel
from app.adaptive_engine.selector import QuestionSelector

def test_1_correct_answer_from_medium():
    """
    Test 1 — Correct Answer
    Current difficulty: Medium (2)
    Answer: Correct
    Expected next difficulty: Hard (3)
    """
    current_diff = DifficultyLevel.MEDIUM
    next_diff = AdaptiveEngine.calculate_next_difficulty(current_diff, is_correct=True)
    assert next_diff == DifficultyLevel.HARD


def test_2_wrong_answer_from_medium():
    """
    Test 2 — Wrong Answer
    Current difficulty: Medium (2)
    Answer: Wrong
    Expected next difficulty: Easy (1)
    """
    current_diff = DifficultyLevel.MEDIUM
    next_diff = AdaptiveEngine.calculate_next_difficulty(current_diff, is_correct=False)
    assert next_diff == DifficultyLevel.EASY


def test_3_correct_at_hard():
    """
    Test 3 — Correct at Hard (Boundary Condition)
    Current difficulty: Hard (3)
    Answer: Correct
    Expected next difficulty: Hard (3)
    """
    current_diff = DifficultyLevel.HARD
    next_diff = AdaptiveEngine.calculate_next_difficulty(current_diff, is_correct=True)
    assert next_diff == DifficultyLevel.HARD


def test_4_wrong_at_easy():
    """
    Test 4 — Wrong at Easy (Boundary Condition)
    Current difficulty: Easy (1)
    Answer: Wrong
    Expected next difficulty: Easy (1)
    """
    current_diff = DifficultyLevel.EASY
    next_diff = AdaptiveEngine.calculate_next_difficulty(current_diff, is_correct=False)
    assert next_diff == DifficultyLevel.EASY


def test_5_no_duplicate_questions():
    """
    Test 5 — No Duplicate Questions
    Verify that the system never presents a question that the student has already answered
    during the current examination.
    """
    mock_questions = [
        {"id": 1, "difficulty": 2, "question": "Medium Q1"},
        {"id": 2, "difficulty": 2, "question": "Medium Q2"},
        {"id": 3, "difficulty": 3, "question": "Hard Q1"},
        {"id": 4, "difficulty": 1, "question": "Easy Q1"},
    ]

    answered = set()

    # Select first question (Medium)
    q1 = QuestionSelector.select_from_list(mock_questions, target_difficulty=2, answered_ids=answered)
    assert q1 is not None
    assert q1["id"] in [1, 2]
    answered.add(q1["id"])

    # Select second question (assume correct -> Hard)
    q2 = QuestionSelector.select_from_list(mock_questions, target_difficulty=3, answered_ids=answered)
    assert q2 is not None
    assert q2["id"] == 3
    assert q2["id"] not in answered
    answered.add(q2["id"])

    # Select third question (assume wrong -> Medium)
    q3 = QuestionSelector.select_from_list(mock_questions, target_difficulty=2, answered_ids=answered)
    assert q3 is not None
    assert q3["id"] not in answered
    assert q3["id"] in [1, 2]
    answered.add(q3["id"])

    # Now all medium and hard questions are answered. Select again:
    assert len(answered) == 3
    # Next question must be the remaining one (Easy Q1)
    q4 = QuestionSelector.select_from_list(mock_questions, target_difficulty=2, answered_ids=answered)
    assert q4 is not None
    assert q4["id"] == 4
    assert q4["id"] not in answered


def test_6_different_students_different_trajectories():
    """
    Test 6 — Different Students
    Two students with different answer patterns should receive different question sequences.
    
    Student A: Correct -> Correct -> Correct
    Trajectory: Medium (2) -> Hard (3) -> Hard (3) -> Hard (3)
    
    Student B: Wrong -> Wrong -> Correct
    Trajectory: Medium (2) -> Easy (1) -> Easy (1) -> Medium (2)
    """
    # Student A simulation
    student_a_diff = DifficultyLevel.MEDIUM
    student_a_history = [student_a_diff]

    # Q1: Correct
    student_a_diff = AdaptiveEngine.calculate_next_difficulty(student_a_diff, is_correct=True)
    student_a_history.append(student_a_diff)
    # Q2: Correct
    student_a_diff = AdaptiveEngine.calculate_next_difficulty(student_a_diff, is_correct=True)
    student_a_history.append(student_a_diff)
    # Q3: Correct
    student_a_diff = AdaptiveEngine.calculate_next_difficulty(student_a_diff, is_correct=True)
    student_a_history.append(student_a_diff)

    assert student_a_history == [2, 3, 3, 3]

    # Student B simulation
    student_b_diff = DifficultyLevel.MEDIUM
    student_b_history = [student_b_diff]

    # Q1: Wrong
    student_b_diff = AdaptiveEngine.calculate_next_difficulty(student_b_diff, is_correct=False)
    student_b_history.append(student_b_diff)
    # Q2: Wrong
    student_b_diff = AdaptiveEngine.calculate_next_difficulty(student_b_diff, is_correct=False)
    student_b_history.append(student_b_diff)
    # Q3: Correct
    student_b_diff = AdaptiveEngine.calculate_next_difficulty(student_b_diff, is_correct=True)
    student_b_history.append(student_b_diff)

    assert student_b_history == [2, 1, 1, 2]

    # Verify trajectories diverged completely
    assert student_a_history != student_b_history


def test_7_fallback_when_difficulty_pool_exhausted():
    """
    Test 7: If requested difficulty is Hard but all Hard questions are answered,
    gracefully select from Medium, and if Medium is exhausted, select from Easy.
    """
    mock_questions = [
        {"id": 101, "difficulty": 1, "question": "Easy Only"},
    ]
    answered = set()

    # Request Hard (3), but only Easy (1) exists
    selected = QuestionSelector.select_from_list(mock_questions, target_difficulty=3, answered_ids=answered)
    assert selected is not None
    assert selected["id"] == 101
    assert selected["difficulty"] == 1
