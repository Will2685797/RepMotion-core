from typing import List
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import SourceIn, RSSFeedIn
from app.db.models import SourceDB, RSSFeedDB
from fastapi import APIRouter, Depends, HTTPException
from app.db.models import RawRSSItemDB, EventNewsItemDB, EventDB, NewsItemDB
"""
"""




# ==============================================================
# --- APIRouter ---
# ==============================================================
router = APIRouter(prefix="", tags=["Sources", "RSSFeeds"])




# ==============================================================
# --- Source ---
# ==============================================================
@router.get("/sources", response_model=list[SourceIn])
def list_sources(db: Session = Depends(get_db)):
    return db.query(SourceDB).order_by(SourceDB.is_active.desc()).limit(50).all()

@router.post("/internal/ingest/sources")
def ingest_sources(items: List[SourceIn], db: Session = Depends(get_db)):
    inserted = 0
    updated = 0

    try:
        # db.query(EventNewsItemDB).delete()
        # db.commit()
        # db.query(EventDB).delete()
        # db.commit()
        # db.query(EventDB).delete()
        # db.commit()
        # db.query(RawRSSItemDB).delete()
        # db.commit()      


        for item in items:
            existing = db.query(SourceDB).filter(SourceDB.id == item.id).first()

            if existing:
                existing.name = item.name
                existing.domain = item.domain
                existing.weight_default = item.weight_default
                existing.is_active = item.is_active
                # existing.created_utc = item.created_utc
                updated += 1
            else:
                db.add(SourceDB(
                    id=item.id,
                    name=item.name,
                    domain=item.domain,
                    weight_default=item.weight_default,
                    is_active=item.is_active,
                    # created_utc=item.created_utc
                ))
                inserted += 1

        db.commit()
        return {"received": len(items), "inserted": inserted, "updated": updated}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))




# ==============================================================
# --- RSSFeed ---
# ==============================================================
@router.get("/rss-feeds", response_model=list[RSSFeedIn])
def list_rss_feeds(db: Session = Depends(get_db)):
    return db.query(RSSFeedDB).order_by(RSSFeedDB).limit(50).all()

@router.post("/internal/ingest/rss-feeds")
def ingest_rss_feeds(items: List[RSSFeedIn], db: Session = Depends(get_db)):
    inserted = 0
    updated = 0

    try:
        for item in items:
            # FK check : la Source doit exister
            source = db.query(SourceDB).filter(SourceDB.id == item.source_id).first()
            if not source:
                raise HTTPException(status_code=400, detail=f"Source inexistante: {item.source_id}")

            existing = db.query(RSSFeedDB).filter(RSSFeedDB.id == item.id).first()

            if existing:
                existing.source_id = item.source_id
                existing.url = str(item.url)  # HttpUrl -> str
                existing.topic = item.topic
                updated += 1
            else:
                db.add(RSSFeedDB(
                    id=item.id,
                    source_id=item.source_id,
                    url=str(item.url),          # HttpUrl -> str
                    topic=item.topic
                ))
                inserted += 1

        db.commit()
        return {"received": len(items), "inserted": inserted, "updated": updated}

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
