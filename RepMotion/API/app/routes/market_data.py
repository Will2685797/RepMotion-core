from sqlalchemy import tuple_
from datetime import timezone
from typing import List, Tuple
from sqlalchemy import func, and_
from app.db.database import get_db
from sqlalchemy.orm import Session
from app.models import QuoteIn, CandleIn
from app.db.models import QuoteDB, CandleDB
from sqlalchemy.dialects.mysql import insert as mysql_insert
from fastapi import APIRouter, Depends, HTTPException, Query
"""
"""




# ==============================================================
# --- APIRouter ---
# ==============================================================
router = APIRouter(prefix="", tags=["MarketData"])




# ==============================================================
# --- Helpers ---
# ==============================================================
def _chunks(seq, n: int):
    """
    existing_rows = []
    key_list = list(key_set)
    for ch in _chunks(key_list, 1000):
        existing_rows.extend(
            db.query(QuoteDB)
            .filter(tuple_(QuoteDB.symbol, QuoteDB.ts_utc).in_(ch))
            .all()
        )
    """
    for i in range(0, len(seq), n):
        yield seq[i:i+n]




# ==============================================================
# --- Quotes ---
# ==============================================================
# ingest
def to_naive_utc(dt):
    if dt is None:
        return None
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

@router.post("/internal/ingest/quotes")
def ingest_quotes(items: List[QuoteIn], db: Session = Depends(get_db)):
    if not items:
        return {"inserted": 0, "updated": 0}

    rows = [it.model_dump() for it in items]

    # dedupe + ts normalize
    dedup = {}
    for r in rows:
        r["ts_utc"] = to_naive_utc(r["ts_utc"])
        dedup[(r["symbol"], r["ts_utc"])] = r
    rows = list(dedup.values())

    inserted = 0  # with upsert, exact counts are tricky; keep simple or compute separately
    updated = 0

    CHUNK = 1000
    for ch in _chunks(rows, CHUNK):
        stmt = mysql_insert(QuoteDB).values(ch)
        update_cols = {  # update everything except PK
            "price": stmt.inserted.price,
            "change_pct": stmt.inserted.change_pct,
            "change_price": stmt.inserted.change_price,
            "volume": stmt.inserted.volume,
            "dayLow": stmt.inserted.dayLow,
            "dayHigh": stmt.inserted.dayHigh,
            "raw": stmt.inserted.raw,
        }
        stmt = stmt.on_duplicate_key_update(**update_cols)
        db.execute(stmt)

    db.commit()
    return {"inserted": inserted, "updated": updated}

# @router.post("/internal/ingest/quotes")
def ingest_quotesold(items: List[QuoteIn], db: Session = Depends(get_db)):
    inserted = 0
    updated = 0

    if not items:
        return {"inserted": 0, "updated": 0}

    # 1) normalize
    rows = [it.model_dump() for it in items]

    # 2) build keys
    keys: List[Tuple[str, object]] = [(r["symbol"], r["ts_utc"]) for r in rows]
    key_set = set(keys)

    # 3) fetch existing in bulk (tuple_ for composite PK)
    existing_rows = (
        db.query(QuoteDB)
        .filter(tuple_(QuoteDB.symbol, QuoteDB.ts_utc).in_(list(key_set)))
        .all()
    )
    existing_map = {(r.symbol, r.ts_utc): r for r in existing_rows}

    # 4) split insert/update
    to_insert = []
    for r in rows:
        k = (r["symbol"], r["ts_utc"])
        existing = existing_map.get(k)

        if existing is None:
            to_insert.append(QuoteDB(**r))
            inserted += 1
        else:
            # update fields (exclude PK)
            # PK fields: symbol, ts_utc
            for field, val in r.items():
                if field in ("symbol", "ts_utc"):
                    continue
                setattr(existing, field, val)
            updated += 1

    # 5) bulk insert
    if to_insert:
        db.bulk_save_objects(to_insert)

    db.commit()
    return {"inserted": inserted, "updated": updated}

# latest
@router.get("/quotes/latest")
def get_latest_quotes(
    symbols: List[str] = Query(...),
    db: Session = Depends(get_db),
):
    sub = (
        db.query(
            QuoteDB.symbol.label("symbol"),
            func.max(QuoteDB.ts_utc).label("max_ts"),
        )
        .filter(QuoteDB.symbol.in_(symbols))
        .group_by(QuoteDB.symbol)
        .subquery()
    )

    rows = (
        db.query(QuoteDB)
        .join(sub, and_(QuoteDB.symbol == sub.c.symbol, QuoteDB.ts_utc == sub.c.max_ts))
        .order_by(func.abs(QuoteDB.change_pct).desc())
        .all()
    )

    return rows




# ==============================================================
# --- Candles ---
# ==============================================================
@router.post("/internal/ingest/candles")
def ingest_candles(items: List[CandleIn], db: Session = Depends(get_db)):
    inserted = 0
    updated = 0

    if not items:
        return {"inserted": 0, "updated": 0}

    rows = [it.model_dump() for it in items]

    keys = [(r["symbol"], r["tf_s"], r["t_open_utc"]) for r in rows]
    key_set = set(keys)

    existing_rows = (
        db.query(CandleDB)
        .filter(tuple_(CandleDB.symbol, CandleDB.tf_s, CandleDB.t_open_utc).in_(list(key_set)))
        .all()
    )
    existing_map = {(r.symbol, r.tf_s, r.t_open_utc): r for r in existing_rows}

    to_insert = []
    for r in rows:
        k = (r["symbol"], r["tf_s"], r["t_open_utc"])
        existing = existing_map.get(k)

        if existing is None:
            to_insert.append(CandleDB(**r))
            inserted += 1
        else:
            # don't overwrite PK
            for field, val in r.items():
                if field in ("symbol", "tf_s", "t_open_utc"):
                    continue
                setattr(existing, field, val)
            updated += 1

    if to_insert:
        db.bulk_save_objects(to_insert)

    db.commit()
    return {"inserted": inserted, "updated": updated}
