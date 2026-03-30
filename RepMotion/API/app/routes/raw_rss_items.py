from typing import List
from datetime import timezone
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import RawRSSItemIn 
from fastapi import APIRouter, Depends, HTTPException
from app.db.models import RawRSSItemDB, EventNewsItemDB, EventDB, NewsItemDB
"""
"""




# ==============================================================
# --- APIRouter ---
# ==============================================================
router = APIRouter(prefix="", tags=["RawRSSItem"])




# ==============================================================
# --- Helpers ---
# ==============================================================
def _to_naive_utc(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(timezone.utc).replace(tzinfo=None)




# ==============================================================
# --- RawRSSItem ---
# ==============================================================
@router.get("/raw-rss-items", response_model=list[RawRSSItemIn])
def list_raw(db: Session = Depends(get_db)):
    return db.query(RawRSSItemDB).order_by(RawRSSItemDB.published_utc.desc()).limit(200).all()

@router.post("/internal/ingest/raw-rss-items", response_model=None)
def ingest_raw(items: List[RawRSSItemIn], db: Session = Depends(get_db)):
    inserted = updated = skipped = 0

    try:
        # 1) normalize + filter
        clean = []
        for it in items:
            if not it.url:
                skipped += 1
                continue
            data = it.model_dump()
            data["published_utc"] = _to_naive_utc(data.get("published_utc"))
            clean.append(data)

        if not clean:
            return {"received": len(items), "inserted": 0, "updated": 0, "skipped": skipped}

        # 2) prefetch existing by url (ONE query)
        urls = [d["url"] for d in clean]
        existing_rows = db.query(RawRSSItemDB).filter(RawRSSItemDB.url.in_(urls)).all()
        existing_by_url = {r.url: r for r in existing_rows}

        # 3) upsert in memory
        for data in clean:
            url = data["url"]
            existing = existing_by_url.get(url)

            if existing:
                existing.feed_id = data["feed_id"]
                existing.source_domain = data["source_domain"]
                existing.title = data["title"]
                existing.snippet = data["snippet"]
                existing.published_utc = data["published_utc"]
                updated += 1
            else:
                db.add(RawRSSItemDB(**data))
                inserted += 1

        db.commit()
        return {"received": len(items), "inserted": inserted, "updated": updated, "skipped": skipped}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))




# @router.post("/internal/ingest/raw-rss-items", response_model=None)
# def ingest_raw(items: List[RawRSSItemIn], db: Session = Depends(get_db)):
#     inserted = 0
#     updated = 0
#     skipped = 0

#     try:
#         for item in items:
#             url = item.url
#             if not url:
#                 skipped += 1
#                 continue

#             existing = (
#                 db.query(RawRSSItemDB)
#                   .filter(RawRSSItemDB.url == url)
#                   .first()
#             )

#             if existing:
#                 # UPDATE existing canonical row
#                 existing.feed_id = item.feed_id
#                 existing.source_domain = item.source_domain
#                 existing.title = item.title
#                 existing.snippet = item.snippet
#                 existing.published_utc = _to_naive_utc(item.published_utc)
#                 updated += 1
#             else:
#                 data = item.model_dump()
#                 data["published_utc"] = _to_naive_utc(data.get("published_utc"))
#                 db.add(RawRSSItemDB(**data))
#                 inserted += 1

#         db.commit()
#         return {"received": len(items), "inserted": inserted, "updated": updated, "skipped": skipped}

#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


# @router.post("/internal/ingest/raw-rss-items", response_model=None)
# def ingest_raw(items: List[RawRSSItemIn], db: Session = Depends(get_db)):
#     inserted = 0
#     updated = 0

#     try:
#         for item in items:
#             existing = db.query(RawRSSItemDB).filter(RawRSSItemDB.id == item.id).first()

#             if existing:
#                 # UPDATE
#                 existing.feed_id = item.feed_id
#                 existing.source_domain = item.source_domain
#                 existing.title = item.title
#                 existing.snippet = item.snippet
#                 existing.url = item.url
#                 existing.published_utc = item.published_utc
#                 updated += 1
#             else:
#                 db.add(RawRSSItemDB(**item.model_dump()))
#                 inserted += 1

#         db.commit()
#         return {"received": len(items), "inserted": inserted, "updated": updated}

#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))
    
