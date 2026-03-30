from typing import List
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import NewsItemDB
from fastapi import APIRouter, Depends, HTTPException
from app.models import SourceIn, RSSFeedIn, NewsItemIn
"""
"""




# ==============================================================
# --- APIRouter ---
# ==============================================================
router = APIRouter(prefix="", tags=["NewsItem"])




# ==============================================================
# --- NewsItem ---
# ==============================================================
@router.get("/news-items", response_model=list[NewsItemIn])
def list_news_items(db: Session = Depends(get_db)):
    return db.query(NewsItemDB).order_by(NewsItemDB.published_utc.desc()).limit(50).all()

@router.post("/internal/ingest/news-items")
def ingest_news_items(items: List[NewsItemIn], db: Session = Depends(get_db)):
    inserted = 0
    updated = 0

    try:
        for item in items:
            existing = db.query(NewsItemDB).filter(NewsItemDB.id == item.id).first()

            if existing:
                # UPDATE
                existing.feed_id = item.feed_id
                existing.source_domain = item.source_domain
                existing.title = item.title
                existing.snippet = item.snippet
                existing.url = item.url
                existing.published_utc = item.published_utc

                existing.macro_category = item.macro_category
                existing.macro_method = item.macro_method
                existing.macro_confidence = item.macro_confidence
                existing.macro_debug = item.macro_debug

                existing.sentiment = item.sentiment
                existing.sentiment_method = item.sentiment_method
                existing.sentiment_confidence = item.sentiment_confidence
                existing.sentiment_debug = item.sentiment_debug

                existing.extracted_subjects = item.extracted_subjects

                existing.event_type = item.event_type
                existing.stance = item.stance
                existing.severity = item.severity
                existing.certainty = item.certainty
                existing.horizon = item.horizon

                updated += 1

            else:
                # INSERT
                db.add(NewsItemDB(
                    id=item.id,
                    feed_id=item.feed_id,

                    source_domain=item.source_domain,
                    title=item.title,
                    snippet=item.snippet,
                    url=item.url,
                    published_utc=item.published_utc,

                    macro_category=item.macro_category,
                    macro_method=item.macro_method,
                    macro_confidence=item.macro_confidence,
                    macro_debug=item.macro_debug,

                    sentiment=item.sentiment,
                    sentiment_method=item.sentiment_method,
                    sentiment_confidence=item.sentiment_confidence,
                    sentiment_debug=item.sentiment_debug,

                    extracted_subjects=item.extracted_subjects,

                    event_type=item.event_type,
                    stance=item.stance,
                    severity=item.severity,
                    certainty=item.certainty,
                    horizon=item.horizon,
                ))
                inserted += 1

        db.commit()
        return {"received": len(items), "inserted": inserted, "updated": updated}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"{e} | failing_news_id={item.id} url={item.url}")
    