from typing import Any, Dict
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr
"""
"""


# ==============================================================
# --- Users ---
# ==============================================================
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None   # ← AJOUT

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str   

    class Config:
        from_attributes = True  # pydantic v2 (si v1: orm_mode = True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ==============================================================
# --- Password reset ---
# ==============================================================
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str