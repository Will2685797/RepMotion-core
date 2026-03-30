from typing import Any, Dict
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr
"""
"""




# ==============================================================
# --- Literals ---
# ==============================================================
MacroCategory = Literal["tech", "economy", "commodities", "macro_pillars", "other"]
Sentiment = Literal["bad", "neutral", "good"]
Method = Literal["rules", "ensemble", "both", "other"]
Stance = Literal["escalation", "deescalation", "neutral"]
Horizon = Literal["immediate", "intraday", "multiday"]




# ==============================================================
# --- RSS Classes ---
# ==============================================================
# définition des schémas de données pour les opérations d'entrée et de sortie ( de la bd ) liées aux sources, flux RSS et éléments RSS bruts
class SourceIn(BaseModel):
    id: str
    name: str
    domain: Optional[str]

class RSSFeedIn(BaseModel):
    id: str
    source_id: str #changer depuis les test de optional a str 
    url: str
    topic: Optional[str]
    
class RawRSSItemIn(BaseModel):
    id: str
    feed_id: Optional[str] = None
    source_domain: Optional[str] = None
    title: Optional[str] = None
    snippet: Optional[str] = None
    url: str
    published_utc: Optional[datetime] = None
    # macro_category: Optional[MacroCategory] = None
    # sentiment: Optional[Sentiment] = None
    
class NewsItemIn(BaseModel):
    id: str

    raw_id: Optional[str] = None
    source_id: Optional[str] = None

    title: Optional[str] = None
    snippet: Optional[str] = None
    url: Optional[str] = None
    published_utc: Optional[datetime] = None

    macro_category: Optional[MacroCategory] = None
    macro_method: Optional[Method] = None
    macro_confidence: Optional[float] = None
    macro_debug: Optional[Dict[str, Any]] = None

    sentiment: Optional[Sentiment] = None
    sentiment_method: Optional[Method] = None
    sentiment_confidence: Optional[float] = None
    sentiment_debug: Optional[Dict[str, Any]] = None

    extracted_subjects: Optional[Dict[str, Any]] = None

    event_type: Optional[str] = None
    stance: Optional[Stance] = None
    severity: Optional[float] = None
    certainty: Optional[float] = None
    horizon: Optional[Horizon] = None




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