from app.db import models
from typing import Optional
from jose import jwt, JWTError
from app.db.database import get_db
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials




# ==============================================================
# --- HTTPBearer ---
# ==============================================================
ALGORITHM = "HS256"
bearer_scheme = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




# ==============================================================
# --- Helpers ---
# ==============================================================
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def create_access_token(*, subject: str, secret_key: str, expires_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_minutes)).timestamp()),
    }
    return jwt.encode(payload, secret_key, algorithm=ALGORITHM)

def decode_access_token(token: str, secret_key: str) -> Optional[dict]:
    try:
        return jwt.decode(token, secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return None




# ==============================================================
# --- Current User ---
# ==============================================================
def get_current_user(
    secret_key: str,
):
    """
    Factory de dépendance pour que tu puisses utiliser ton JWT_SECRET (env)
    sans le dupliquer partout.
    """

    def _dep(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
        db: Session = Depends(get_db),
    ):
        token = credentials.credentials
        payload = decode_access_token(token, secret_key=secret_key)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide ou expiré",
            )

        sub = payload.get("sub")
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide (sub manquant)",
            )

        try:
            user_id = int(sub)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide (sub)",
            )

        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur introuvable",
            )

        return user

    return _dep
