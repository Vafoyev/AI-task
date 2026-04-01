"""
Eye Gem — Authentication Module (JWT + bcrypt)
"""
import hashlib
import hmac
import jwt
import time
from datetime import datetime, timedelta

SECRET_KEY = "eyegem_secret_key_2024_changeme"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = "eyegem_salt_v1"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash."""
    return hmac.compare_digest(hash_password(password), password_hash)


def create_token(user_id: int, email: str) -> str:
    """Create JWT token."""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token muddati tugagan")
    except jwt.InvalidTokenError:
        raise ValueError("Token yaroqsiz")
