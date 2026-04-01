"""
Eye Gem — SQLite Database Module
"""
import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "eyegem.db")


def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            acuity TEXT,
            correct_count INTEGER DEFAULT 0,
            wrong_count INTEGER DEFAULT 0,
            details TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()


# --- User Operations ---

def create_user(name: str, email: str, password_hash: str):
    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(user)
    except sqlite3.IntegrityError:
        raise ValueError("Bu email allaqachon ro'yxatdan o'tgan")
    finally:
        conn.close()


def get_user_by_email(email: str):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(user) if user else None


def get_user_by_id(user_id: int):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(user) if user else None


# --- Test Results Operations ---

def save_test_result(user_id: int, score: int, acuity: str, correct: int, wrong: int, details: str = None):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO test_results (user_id, score, acuity, correct_count, wrong_count, details) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, score, acuity, correct, wrong, details)
    )
    conn.commit()
    result_id = cursor.lastrowid
    result = conn.execute("SELECT * FROM test_results WHERE id = ?", (result_id,)).fetchone()
    conn.close()
    return dict(result)


def get_user_results(user_id: int, limit: int = 20):
    conn = get_db()
    results = conn.execute(
        "SELECT * FROM test_results WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in results]


# Initialize DB on import
init_db()
