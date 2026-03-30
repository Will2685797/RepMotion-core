from sqlalchemy import text
from fastapi import APIRouter
from app.db.database import engine
"""
"""




# ==============================================================
# --- APIRouter ---
# ==============================================================
router = APIRouter(prefix="/health", tags=["health"])




# ==============================================================
# --- API Health ---
# ==============================================================
@router.get("")
def health_check():
    try:
        # Test simple de connexion MySQL
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "detail": str(e)
        }
