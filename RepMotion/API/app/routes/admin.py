import json
import html
import hashlib
from sqlalchemy.orm import Session
from app.db.database import get_db
from typing import Any, List, Tuple
from app.db.models import FetcherServerCfgDB
from fastapi.templating import Jinja2Templates
from fastapi import APIRouter, Form, HTTPException, Request, Depends
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
"""
GET /admin/config (HTML page)
POST /admin/config (publish)
"""




# ==============================================================
# --- APIRouter ---
# ==============================================================
router = APIRouter(prefix="/admin", tags=["admin"])
templates = Jinja2Templates(directory="templates")




# ==============================================================
# --- Helpers ---
# ==============================================================
Change = Tuple[str, str]  # (kind, message)




# ==============================================================
# --- Admin ---
# ==============================================================
# admin page
@router.get("/config", response_class=HTMLResponse)
def admin_page(request: Request, db: Session = Depends(get_db)):
    cfg = _db_get_active_config(db)
    cfg_text = json.dumps(cfg, indent=2, ensure_ascii=False)

    return templates.TemplateResponse(
        "admin_config.html",
        {
            "request": request,
            "cfg_text": cfg_text
        }
    )

def _db_get_active_config(db: Session) -> dict:
    row = (
        db.query(FetcherServerCfgDB)
        .filter(FetcherServerCfgDB.active == True)
        .order_by(FetcherServerCfgDB.id.desc())
        .first()
    )

    if not row:
        return {}

    return row.config_json

def _diff_cfg(old: Any, new: Any, path="") -> List[Change]:
    out: List[Change] = []

    # dict
    if isinstance(old, dict) and isinstance(new, dict):
        old_keys = set(old.keys())
        new_keys = set(new.keys())

        for k in sorted(old_keys - new_keys):
            out.append(("removed", f"{path}{k}"))
        for k in sorted(new_keys - old_keys):
            out.append(("added", f"{path}{k} = {repr(new[k])[:160]}"))

        for k in sorted(old_keys & new_keys):
            out += _diff_cfg(old[k], new[k], path=f"{path}{k}.")
        return out

    # list (keep it non-confusing: show size + optionally first few item diffs)
    if isinstance(old, list) and isinstance(new, list):
        if old == new:
            return out
        out.append(("changed", f"{path[:-1]}: list changed (len {len(old)} -> {len(new)})"))
        # optional: show small set diff for string lists
        if all(isinstance(x, str) for x in old) and all(isinstance(x, str) for x in new):
            so, sn = set(old), set(new)
            added = sorted(sn - so)[:10]
            removed = sorted(so - sn)[:10]
            for v in added:
                out.append(("added", f"{path[:-1]}: + {v}"))
            for v in removed:
                out.append(("removed", f"{path[:-1]}: - {v}"))
        return out

    # scalar
    if old != new:
        out.append(("changed", f"{path[:-1]}: {old!r} -> {new!r}"))
    return out

# publish config
@router.post("/config")
def publish_config(
    cfg_json: str = Form(...),
    db: Session = Depends(get_db),
):
    try:
        raw = json.loads(cfg_json)
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid JSON: {e}")

    canonical_json = json.dumps(raw, sort_keys=True)
    sha256 = hashlib.sha256(canonical_json.encode()).hexdigest()

    try:
        db.query(FetcherServerCfgDB).filter(
            FetcherServerCfgDB.active == True
        ).update({"active": False})

        new_cfg = FetcherServerCfgDB(
            sha256=sha256,
            active=True,
            config_json=raw,
            created_by="admin",  # later: from auth
            comment="Manual publish"
        )

        db.add(new_cfg)
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Publish failed: {str(e)}")

    return RedirectResponse("/admin/config", status_code=303)
