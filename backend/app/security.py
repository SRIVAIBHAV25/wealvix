import os
from passlib.context import CryptContext
from jose import jwt
from datetime import timedelta, datetime

# =========================
# PASSWORD HASHING
# =========================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# =========================
# JWT
# =========================

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["sub"] = str(to_encode["sub"])  # REQUIRED
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
