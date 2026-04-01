"""
Eye Gem — Eye Test Session Module
"""
import random
import json
from datetime import datetime

SNELLEN_LETTERS = ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
SNELLEN_ROWS = [
    {"row": 0, "size": 120, "acuity": "20/200", "count": 1},
    {"row": 1, "size": 100, "acuity": "20/160", "count": 2},
    {"row": 2, "size": 84, "acuity": "20/125", "count": 2},
    {"row": 3, "size": 70, "acuity": "20/100", "count": 3},
    {"row": 4, "size": 58, "acuity": "20/80", "count": 3},
    {"row": 5, "size": 48, "acuity": "20/63", "count": 4},
    {"row": 6, "size": 40, "acuity": "20/50", "count": 4},
    {"row": 7, "size": 34, "acuity": "20/40", "count": 5},
    {"row": 8, "size": 28, "acuity": "20/32", "count": 5},
    {"row": 9, "size": 22, "acuity": "20/25", "count": 5},
    {"row": 10, "size": 18, "acuity": "20/20", "count": 5},
]

# In-memory test sessions
test_sessions = {}


def create_session(user_id: int) -> dict:
    """Create a new test session."""
    session_id = f"{user_id}_{int(datetime.now().timestamp())}"
    session = {
        "id": session_id,
        "user_id": user_id,
        "current_row": 0,
        "answers": [],
        "letters": generate_row_letters(0),
        "started_at": datetime.now().isoformat()
    }
    test_sessions[session_id] = session
    return {"session_id": session_id, "row": SNELLEN_ROWS[0], "letters": session["letters"]}


def generate_row_letters(row_index: int) -> list:
    """Generate random letters for a row."""
    if row_index >= len(SNELLEN_ROWS):
        return []
    count = SNELLEN_ROWS[row_index]["count"]
    return [random.choice(SNELLEN_LETTERS) for _ in range(count)]


def compare_letter(session_id: str, expected: str, given: str) -> dict:
    """Compare expected and given letter, record result."""
    is_correct = expected.upper().strip() == given.upper().strip()

    if session_id in test_sessions:
        test_sessions[session_id]["answers"].append({
            "expected": expected.upper(),
            "given": given.upper(),
            "correct": is_correct,
            "row": test_sessions[session_id]["current_row"]
        })

    return {"correct": is_correct, "expected": expected.upper(), "given": given.upper()}


def get_next_row(session_id: str) -> dict:
    """Advance to next row."""
    if session_id not in test_sessions:
        return {"error": "Sessiya topilmadi"}

    session = test_sessions[session_id]
    session["current_row"] += 1

    if session["current_row"] >= len(SNELLEN_ROWS):
        return finish_session(session_id)

    letters = generate_row_letters(session["current_row"])
    session["letters"] = letters
    return {"row": SNELLEN_ROWS[session["current_row"]], "letters": letters}


def finish_session(session_id: str) -> dict:
    """Calculate final results."""
    if session_id not in test_sessions:
        return {"error": "Sessiya topilmadi"}

    session = test_sessions[session_id]
    answers = session["answers"]
    correct = sum(1 for a in answers if a["correct"])
    wrong = len(answers) - correct
    total = len(answers)
    score = round((correct / total) * 100) if total > 0 else 0

    # Find best acuity
    last_correct_row = 0
    for a in answers:
        if a["correct"] and a["row"] > last_correct_row:
            last_correct_row = a["row"]

    acuity = SNELLEN_ROWS[last_correct_row]["acuity"] if last_correct_row < len(SNELLEN_ROWS) else "20/200"

    result = {
        "completed": True,
        "score": score,
        "acuity": acuity,
        "correct": correct,
        "wrong": wrong,
        "total": total,
        "answers": answers
    }

    del test_sessions[session_id]
    return result
