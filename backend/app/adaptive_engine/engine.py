from enum import IntEnum
from typing import Dict, Any, List

class DifficultyLevel(IntEnum):
    EASY = 1
    MEDIUM = 2
    HARD = 3

    @classmethod
    def to_label(cls, value: int) -> str:
        mapping = {
            cls.EASY: "Easy",
            cls.MEDIUM: "Medium",
            cls.HARD: "Hard"
        }
        return mapping.get(value, "Unknown")


class AdaptiveEngine:
    """
    Real-Time Adaptive AI Engine
    Analyzes the student's immediate answer and dynamically computes the 
    appropriate difficulty for the next question in real-time.
    """

    MIN_DIFFICULTY = DifficultyLevel.EASY
    MAX_DIFFICULTY = DifficultyLevel.HARD
    INITIAL_DIFFICULTY = DifficultyLevel.MEDIUM

    @classmethod
    def calculate_next_difficulty(cls, current_difficulty: int, is_correct: bool) -> int:
        """
        Core adaptation rule:
        - If student answers correctly, increase difficulty by 1 (clamped at MAX_DIFFICULTY).
        - If student answers incorrectly, decrease difficulty by 1 (clamped at MIN_DIFFICULTY).
        """
        # Ensure current_difficulty is within bounds before calculating
        clamped_current = max(cls.MIN_DIFFICULTY, min(cls.MAX_DIFFICULTY, current_difficulty))

        if is_correct:
            next_diff = clamped_current + 1
            if next_diff > cls.MAX_DIFFICULTY:
                next_diff = cls.MAX_DIFFICULTY  # Boundary clamp: Hard + Correct -> Hard
        else:
            next_diff = clamped_current - 1
            if next_diff < cls.MIN_DIFFICULTY:
                next_diff = cls.MIN_DIFFICULTY  # Boundary clamp: Easy + Wrong -> Easy

        return int(next_diff)

    @classmethod
    def evaluate_performance(cls, responses: List[Any]) -> Dict[str, Any]:
        """
        Computes the final comprehensive ability assessment based on the session's responses.
        Calculates:
        - Total attempted
        - Correct & Incorrect answers
        - Percentage score
        - Difficulty breakdown (Easy, Medium, Hard)
        - Final ability level / classification
        """
        total = len(responses)
        if total == 0:
            return {
                "total_questions": 0,
                "correct_answers": 0,
                "incorrect_answers": 0,
                "score_percentage": 0.0,
                "final_level": "Unrated",
                "easy_count": 0,
                "medium_count": 0,
                "hard_count": 0
            }

        correct_count = sum(1 for r in responses if r.is_correct)
        incorrect_count = total - correct_count
        score_percentage = round((correct_count / total) * 100.0, 2)

        easy_count = sum(1 for r in responses if r.question_difficulty == DifficultyLevel.EASY)
        medium_count = sum(1 for r in responses if r.question_difficulty == DifficultyLevel.MEDIUM)
        hard_count = sum(1 for r in responses if r.question_difficulty == DifficultyLevel.HARD)

        # Ability level estimation:
        # Considers both accuracy and ability to sustain higher difficulty
        hard_correct = sum(1 for r in responses if r.question_difficulty == DifficultyLevel.HARD and r.is_correct)
        medium_correct = sum(1 for r in responses if r.question_difficulty == DifficultyLevel.MEDIUM and r.is_correct)
        
        # Determine final level based on progression and performance
        if hard_count >= 3 and hard_correct >= 2 and score_percentage >= 70.0:
            final_level = "Advanced / Mastery"
        elif hard_correct >= 1 or (medium_correct >= 2 and score_percentage >= 50.0):
            final_level = "Intermediate / Competent"
        else:
            final_level = "Beginner / Foundational"

        return {
            "total_questions": total,
            "correct_answers": correct_count,
            "incorrect_answers": incorrect_count,
            "score_percentage": score_percentage,
            "final_level": final_level,
            "easy_count": easy_count,
            "medium_count": medium_count,
            "hard_count": hard_count
        }
