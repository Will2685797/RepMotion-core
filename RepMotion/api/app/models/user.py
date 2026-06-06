from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func

from app.db.database import Base



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires_at = Column(TIMESTAMP, nullable=True)

    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, nullable=True, server_default=None, onupdate=func.current_timestamp())