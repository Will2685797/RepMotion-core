from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import FetcherServerCfgDB
from fastapi import APIRouter, Depends, HTTPException
"""
GET /active (active cfg)
"""




# ==============================================================
# --- APIRouter  ---
# ==============================================================
router = APIRouter(prefix="/internal/config/fetcher", tags=["internal-config"])




# ==============================================================
# --- Fetcher Config  ---
# ==============================================================
@router.get("/active")
def get_active_fetcher_cfg(db: Session = Depends(get_db)):
    row = db.execute(
        select(FetcherServerCfgDB)
        .where(FetcherServerCfgDB.active == True)
        .order_by(FetcherServerCfgDB.id.desc())
        .limit(1)
    ).scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=404, detail="No active config")

    return {
        "sha256": row.sha256,
        "config_json": row.config_json,
        "created_utc": row.created_utc,
    }
