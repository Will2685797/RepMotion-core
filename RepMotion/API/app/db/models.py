from .database import Base
from sqlalchemy.sql import func
from sqlalchemy import (
    Column, 
    String,
    Integer, 
    Float, 
    Boolean, 
    TIMESTAMP, 
    Text, 
    ForeignKey, 
    DateTime, 
    Enum,
    JSON,
    text,
    UniqueConstraint,
    Computed,
    Index
)
from sqlalchemy.dialects.mysql import TINYINT



# ==============================================================
# --- User Classes  ---
# ==============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, nullable=False, index=True)

    password_hash = Column(String(255), nullable=False)
    
    username = Column(String(50), unique=True, index=True, nullable=False)
    
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires_at = Column(TIMESTAMP, nullable=True)

    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, nullable=True, server_default=None, onupdate=func.current_timestamp())