import os
import secrets
from app.db import models
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.security import get_current_user
from fastapi import APIRouter, Depends, HTTPException, status
from app.security import hash_password, verify_password, create_access_token
from app.db.schema import UserCreate, UserLogin, TokenResponse, UserOut, UserUpdate
from datetime import datetime, timedelta
from app.db.schema import ForgotPasswordRequest, ResetPasswordRequest
from app.services.email_service import send_reset_email




# ==============================================================
# --- APIRouter ---
# ==============================================================
print("AUTH ROUTER LOADED")
print("AUTH FILE PATH =", __file__)
router = APIRouter(prefix="/auth", tags=["auth"])




# ==============================================================
# --- Helpers ---
# ==============================================================
JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_ME")
CurrentUser = get_current_user(JWT_SECRET)
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))




# ==============================================================
# --- User CRUD ---
# ==============================================================
@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    username = payload.username.strip() 

    # Email unique
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Username obligatoire + unique
    if not username:
        raise HTTPException(status_code=400, detail="Nom d'utilisateur requis")

    existing_u = db.query(models.User).filter(models.User.username == username).first()
    if existing_u:
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà utilisé")

    # Password garde-fous
    pw = payload.password
    if not isinstance(pw, str):
        raise HTTPException(status_code=400, detail="Password invalide (type)")
    pw = pw.strip()
    if len(pw.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Mot de passe trop long (max 72 bytes)")
    if len(pw) < 8:
        raise HTTPException(status_code=400, detail="Mot de passe trop court (min 8)")

    user = models.User(
        email=email,
        username=username,
        password_hash=hash_password(pw),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        subject=str(user.id),
        secret_key=JWT_SECRET,
        expires_minutes=JWT_EXPIRES_MINUTES,
    )

    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(
        subject=str(user.id),
        secret_key=JWT_SECRET,
        expires_minutes=JWT_EXPIRES_MINUTES,
    )

    return {"access_token": token, "token_type": "bearer", "user": user}

@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(CurrentUser),
):
    # EMAIL
    if payload.email is not None:
        new_email = payload.email.lower().strip()
        exists = db.query(models.User).filter(models.User.email == new_email).first()
        if exists and exists.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email déjà utilisé")
        current_user.email = new_email

    # USERNAME
    if payload.username is not None:
        new_username = payload.username.strip()
        if new_username == "":
            new_username = None

        if new_username:
            exists_u = db.query(models.User).filter(models.User.username == new_username).first()
            if exists_u and exists_u.id != current_user.id:
                raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà utilisé")

        current_user.username = new_username

    # PASSWORD
    if payload.password is not None:
        new_pw = payload.password.strip()
        if len(new_pw) < 8:
            raise HTTPException(status_code=400, detail="Mot de passe trop court (min 8)")
        if len(new_pw.encode("utf-8")) > 72:
            raise HTTPException(status_code=400, detail="Mot de passe trop long (max 72 bytes)")
        current_user.password_hash = hash_password(new_pw)

    db.commit()
    db.refresh(current_user)
    return current_user
    
@router.get("/me", response_model=UserOut)
def me(current_user: models.User = Depends(CurrentUser)):
    return current_user

@router.delete("/me", status_code=200)
def delete_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(CurrentUser),
):
    db.delete(current_user)
    db.commit()
    return {"message": "Compte supprimé"}

# ==============================================================
# --- User forgot-password ---
# ==============================================================


@router.post("/forgot-password", status_code=200)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()

    user = db.query(models.User).filter(models.User.email == email).first()

    # Réponse neutre pour ne pas révéler si l'email existe ou non
    generic_message = {
        "message": "Si un compte existe avec cet email, un jeton de réinitialisation a été envoyé."
    }

    if not user:
        return generic_message

    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    user.reset_token = reset_token
    user.reset_token_expires_at = expires_at

    db.commit()

    send_reset_email(user.email, reset_token)

    return generic_message


@router.post("/reset-password", status_code=200)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token = payload.token.strip()

    user = db.query(models.User).filter(models.User.reset_token == token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Jeton invalide ou expiré")

    if user.reset_token_expires_at is None:
        raise HTTPException(status_code=400, detail="Jeton invalide ou expiré")

    if user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Jeton invalide ou expiré")

    # Même logique que register / update_me
    pw = payload.new_password
    if not isinstance(pw, str):
        raise HTTPException(status_code=400, detail="Password invalide (type)")
    pw = pw.strip()
    if len(pw.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Mot de passe trop long (max 72 bytes)")
    if len(pw) < 8:
        raise HTTPException(status_code=400, detail="Mot de passe trop court (min 8)")

    user.password_hash = hash_password(pw)
    user.reset_token = None
    user.reset_token_expires_at = None

    db.commit()

    return {"message": "Mot de passe réinitialisé avec succès"}