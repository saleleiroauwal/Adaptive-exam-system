import random
from typing import List, Optional, Set
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from ..models.question import Question
from .engine import DifficultyLevel

class QuestionSelector:
    """
    Intelligent Question Selector
    - Prevents question duplication across an active session.
    - Selects an unanswered question matching the target difficulty.
    - If target difficulty pool is exhausted, gracefully searches the nearest available difficulty level.
    """

    @classmethod
    def select_from_database(
        cls,
        db: Session,
        exam_id: int,
        target_difficulty: int,
        answered_question_ids: Set[int]
    ) -> Optional[Question]:
        """
        Database-backed question selector with nearest-difficulty fallback.
        """
        # Fetch all questions for this exam
        all_exam_questions = db.query(Question).filter(Question.exam_id == exam_id).all()
        
        # Filter out already answered questions
        unanswered = [q for q in all_exam_questions if q.id not in answered_question_ids]
        if not unanswered:
            return None

        # Try exact target difficulty first
        exact_matches = [q for q in unanswered if q.difficulty == target_difficulty]
        if exact_matches:
            return random.choice(exact_matches)

        # Fallback to nearest difficulty levels sorted by absolute difference
        all_difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD]
        # Sort by distance to target_difficulty
        sorted_diffs = sorted(all_difficulties, key=lambda d: abs(d.value - target_difficulty))

        for diff in sorted_diffs:
            matches = [q for q in unanswered if q.difficulty == diff.value]
            if matches:
                return random.choice(matches)

        # If any unanswered remains, return a random one
        return random.choice(unanswered)

    @classmethod
    def select_from_list(
        cls,
        questions: List[dict],
        target_difficulty: int,
        answered_ids: Set[int]
    ) -> Optional[dict]:
        """
        In-memory selector used for pure unit testing and offline evaluation.
        """
        unanswered = [q for q in questions if q["id"] not in answered_ids]
        if not unanswered:
            return None

        exact_matches = [q for q in unanswered if q["difficulty"] == target_difficulty]
        if exact_matches:
            return random.choice(exact_matches)

        all_difficulties = [1, 2, 3]
        sorted_diffs = sorted(all_difficulties, key=lambda d: abs(d - target_difficulty))

        for diff in sorted_diffs:
            matches = [q for q in unanswered if q["difficulty"] == diff]
            if matches:
                return random.choice(matches)

        return random.choice(unanswered)
