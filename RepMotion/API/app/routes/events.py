from datetime import datetime
from app.models import EventIn
from sqlalchemy import func, and_
from app.db.database import get_db
from sqlalchemy.orm import Session
from collections import defaultdict
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.models import NewsItemIn
from app.db.models import NewsItemDB
from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.models import EventDB, EventNewsItemDB
from app.models import (
    NewsItemPreviewOut, 
    EventPreviewOut,
    PaginatedEventPreviews,
)
"""
"""




# ==============================================================
# --- APIRouter ---
# ==============================================================
router = APIRouter(prefix="", tags=["Event"])




# ==============================================================
# --- Helpers ---
# ==============================================================
class EventOut(EventIn):
    model_config = ConfigDict(from_attributes=True)

class PaginatedEvents(BaseModel):
    items: List[EventOut]
    page: int
    limit: int
    total: int
    has_more: bool




# ==============================================================
# --- Events ---
# ==============================================================
# ingest
@router.post("/internal/ingest/events")
def ingest_events(items: list[dict], db: Session = Depends(get_db)):
    inserted = updated = links_inserted = links_deleted = 0

    for item in items:
        # 1) upsert Event row
        existing = db.query(EventDB).filter(EventDB.id == item["id"]).first()

        if existing:
            # UPDATE (set fields...)
            for k, v in item.items():
                if k == "news_item_ids":
                    continue
                setattr(existing, k, v)
            updated += 1
            event_row = existing
        else:
            event_row = EventDB(**{k: v for k, v in item.items() if k != "news_item_ids"})
            db.add(event_row)
            inserted += 1

        db.flush()  # ensure Event.id exists

        # 2) sync EventNewsItem links
        incoming_ids = set(item.get("news_item_ids") or [])

        # Fetch existing links
        existing_rows = (
            db.query(EventNewsItemDB.news_item_id)
            .filter(EventNewsItemDB.event_id == event_row.id)
            .all()
        )
        existing_ids = {r[0] for r in existing_rows}

        to_add = incoming_ids - existing_ids
        to_del = existing_ids - incoming_ids

        if to_add:
            db.bulk_save_objects([
                EventNewsItemDB(event_id=event_row.id, news_item_id=nid)
                for nid in to_add
            ])
            links_inserted += len(to_add)

        if to_del:
            db.query(EventNewsItemDB).filter(
                and_(
                    EventNewsItemDB.event_id == event_row.id,
                    EventNewsItemDB.news_item_id.in_(list(to_del)),
                )
            ).delete(synchronize_session=False)
            links_deleted += len(to_del)

    db.commit()
    return {
        "inserted": inserted,
        "updated": updated,
        "links_inserted": links_inserted,
        "links_deleted": links_deleted,
    }

# list
@router.get("/events", response_model=PaginatedEvents)
def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=200),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(EventDB)
    if category:
        q = q.filter(EventDB.event_type == category)
        
    total = q.with_entities(func.count()).scalar() or 0
    events = (
        q.order_by(EventDB.latest_update_utc.desc(), EventDB.published_utc.desc())
         .offset((page - 1) * limit)
         .limit(limit)
         .all()
    )
    
    event_ids = [e.id for e in events]
    if not event_ids:
        return {"items": [], "page": page, "limit": limit, "total": total, "has_more": False}

    rows = (
        db.query(EventNewsItemDB.event_id, EventNewsItemDB.news_item_id)
          .filter(EventNewsItemDB.event_id.in_(event_ids))
          .all()
    )
    
    grouped = defaultdict(list)
    for eid, news_id in rows:
        grouped[eid].append(news_id)

    out_items = []
    for e in events:
        news_ids = grouped.get(e.id, [])
        payload = EventIn.model_validate(e, from_attributes=True).model_dump()
        payload["news_item_ids"] = news_ids
        out_items.append(payload)

    print("out_items, out_items, out_items", out_items[0])
    return {
        "items": out_items,
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": page * limit < total,
    }

@router.get("/events-details", response_model=PaginatedEventPreviews)
def list_events_details(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=200),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(EventDB)
    if category:
        q = q.filter(EventDB.event_type == category)

    total = q.with_entities(func.count()).scalar() or 0

    events = (
        q.order_by(EventDB.published_utc.desc())
         .offset((page - 1) * limit)
         .limit(limit)
         .all()
    )

    event_ids = [e.id for e in events]
    if not event_ids:
        return {"items": [], "page": page, "limit": limit, "total": total, "has_more": False}

    # Fetch all linked news items for just these events (one query)
    rows = (
        db.query(EventNewsItemDB.event_id, NewsItemDB)
          .join(NewsItemDB, NewsItemDB.id == EventNewsItemDB.news_item_id)
          .filter(EventNewsItemDB.event_id.in_(event_ids))
          .order_by(NewsItemDB.published_utc.desc())
          .all()
    )

    grouped = defaultdict(list)
    for eid, ni in rows:
        grouped[eid].append(ni)

    out_items = []
    for e in events:
        news_list = grouped.get(e.id, [])
        top = news_list[0] if news_list else None

        payload = EventPreviewOut.model_validate(e, from_attributes=True).model_dump()
        payload["news_count"] = len(news_list)
        payload["top_news"] = NewsItemPreviewOut.model_validate(top, from_attributes=True).model_dump() if top else None

        out_items.append(payload)

    return {
        "items": out_items,
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": page * limit < total,
    }


# single
@router.get("/events/{event_id}", response_model=EventIn)
def get_event_by_id(event_id: str, db: Session = Depends(get_db)):
    event = db.query(EventDB).filter(EventDB.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # get linked ids
    ids = (
        db.query(EventNewsItemDB.news_item_id)
        .filter(EventNewsItemDB.event_id == event_id)
        .all()
    )
    news_item_ids = [r[0] for r in ids]

    # build response (pydantic)
    payload = EventIn.model_validate(event, from_attributes=True).model_dump()
    payload["news_item_ids"] = news_item_ids
    return payload

@router.get("/events/{event_id}/news-items", response_model=list[NewsItemIn])
def get_event_news_items(event_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(NewsItemDB)
        .join(EventNewsItemDB, NewsItemDB.id == EventNewsItemDB.news_item_id)
        .filter(EventNewsItemDB.event_id == event_id)
        .order_by(NewsItemDB.published_utc.desc())
        .all()
    )
    return rows




"""
@router.get("/events/{event_id}", response_model=EventIn)
def get_event_by_id(event_id: str, db: Session = Depends(get_db)):
    event = db.query(EventDB).filter(EventDB.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
"""

"""
@router.post("/internal/ingest/events")
def ingest_events(items: List[EventIn], db: Session = Depends(get_db)):
    inserted = updated = links_inserted = links_deleted = 0

    try:
        for item in items:
            existing = db.query(EventDB).filter(EventDB.id == item.id).first()

            if existing:
                # UPDATE (copy fields)
                existing.fingerprint = item.fingerprint
                existing.event_type = item.event_type
                existing.stance = item.stance
                existing.horizon = item.horizon
                existing.horizon_tau = item.horizon_tau
                existing.published_utc = item.published_utc
                existing.latest_update_utc = item.latest_update_utc
                existing.title = item.title

                existing.consensus_sentiment = item.consensus_sentiment
                existing.sentiment_dispersion = item.sentiment_dispersion
                existing.agreement_score = item.agreement_score
                existing.credibility = item.credibility
                existing.confidence = item.confidence
                existing.impact_strength = item.impact_strength
                existing.impact_score = item.impact_score

                existing.distinct_sources = item.distinct_sources or 1
                existing.sources_domains = item.sources_domains
                existing.entities = item.entities
                existing.keywords = item.keywords
                updated += 1

            else:
                db.add(EventDB(
                    id=item.id,
                    fingerprint=item.fingerprint,
                    event_type=item.event_type,
                    stance=item.stance,
                    horizon=item.horizon,
                    horizon_tau=item.horizon_tau,
                    published_utc=item.published_utc,
                    latest_update_utc=item.latest_update_utc,
                    title=item.title,
                    consensus_sentiment=item.consensus_sentiment,
                    sentiment_dispersion=item.sentiment_dispersion,
                    agreement_score=item.agreement_score,
                    credibility=item.credibility,
                    confidence=item.confidence,
                    impact_strength=item.impact_strength,
                    impact_score=item.impact_score,
                    distinct_sources=item.distinct_sources or 1,
                    sources_domains=item.sources_domains,
                    entities=item.entities,
                    keywords=item.keywords,
                ))
                inserted += 1

            # Links refresh
            if item.news_item_ids is not None:
                del_q = db.query(EventNewsItemDB).filter(EventNewsItemDB.event_id == item.id)
                links_deleted += del_q.count()
                del_q.delete(synchronize_session=False)

                for nid in item.news_item_ids:
                    db.add(EventNewsItemDB(event_id=item.id, news_item_id=nid))
                    links_inserted += 1

        db.commit()
        return {
            "received": len(items),
            "inserted": inserted,
            "updated": updated,
            "links_deleted": links_deleted,
            "links_inserted": links_inserted,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
"""
