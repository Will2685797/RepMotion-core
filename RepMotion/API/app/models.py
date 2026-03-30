from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, HttpUrl, ConfigDict, Field
"""
"""




# ==============================================================
# --- Receiving Models ---
# ==============================================================
# source registery
class SourceIn(BaseModel):
    id: str
    name: str
    domain: str
    weight_default: float
    is_active: bool

class RSSFeedIn(BaseModel):
    id: str
    source_id: str  # Must match a Source.id
    url: str
    topic: str

# rss items
class RawRSSItemIn(BaseModel):
    model_config = ConfigDict(from_attributes=True)    
    id: str                
    feed_id: str

    source_domain: str            
    title: str             
    snippet: str           
    url: str          
    published_utc: datetime
    
# news items
class NewsItemIn(BaseModel):
    id: str
    feed_id: str

    source_domain: str
    title: str
    snippet: str
    url: str
    published_utc: datetime

    macro_category: str
    macro_method: str
    macro_confidence: float
    macro_debug: dict

    sentiment: str
    sentiment_method: str
    sentiment_confidence: float
    sentiment_debug: dict

    extracted_subjects: Any

    event_type: str
    stance: str
    severity: float
    certainty: float
    horizon: str

# events
class EventIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    fingerprint: str

    event_type: Optional[str] = None
    stance: Optional[str] = None
    horizon: Optional[str] = None
    horizon_tau: Optional[int] = None

    published_utc: datetime
    latest_update_utc: datetime
    title: str

    consensus_sentiment: float
    sentiment_dispersion: float
    agreement_score: float
    credibility: Optional[float] = None
    confidence: float
    impact_strength: float
    impact_score: float

    distinct_sources: Optional[int] = 1
    sources_domains: Optional[list[str]] = None
    entities: Optional[list[str]] = None
    keywords: Optional[list[str]] = None

    # links
    news_item_ids: Optional[List[str]] = None

# quotes
class QuoteIn(BaseModel):
    symbol: str
    ts_utc: datetime
    price: float

    change_pct: float
    change_price: float
    volume: float

    dayLow: float
    dayHigh: float
    
    # keep raw flexible; defaults to {}
    raw: Dict[str, Any] = Field(default_factory=dict)

# candles
class CandleIn(BaseModel):
    symbol: str
    tf_s: int

    t_open_utc: datetime
    t_close_utc: datetime

    o: float
    h: float
    l: float
    c: float

    v: Optional[float] = None




# ==============================================================
# --- Sending Models ---
# ==============================================================
class NewsItemPreview(BaseModel):
    id: str
    source_domain: Optional[str] = None
    title: Optional[str] = None
    snippet: Optional[str] = None
    url: Optional[str] = None
    published_utc: Optional[str] = None

class NewsItemPreviewOut(BaseModel):
    id: str
    source_domain: Optional[str] = None
    title: Optional[str] = None
    snippet: Optional[str] = None
    url: Optional[str] = None
    published_utc: Optional[datetime] = None

    model_config = {"from_attributes": True}

class EventPreviewOut(BaseModel):
    id: str
    fingerprint: str

    event_type: Optional[str] = None
    stance: Optional[str] = None
    horizon: Optional[str] = None
    horizon_tau: Optional[int] = None

    published_utc: datetime
    latest_update_utc: datetime
    title: str

    consensus_sentiment: float
    sentiment_dispersion: float
    agreement_score: float
    credibility: Optional[float] = None
    confidence: float
    impact_strength: float
    impact_score: float

    distinct_sources: int
    sources_domains: Optional[list[str]] = None

    # preview fields
    news_count: int = 0
    top_news: Optional[NewsItemPreviewOut] = None

    model_config = {"from_attributes": True}

class PaginatedEventPreviews(BaseModel):
    items: List[EventPreviewOut]
    page: int
    limit: int
    total: int
    has_more: bool

class EventOutWithPreview(EventIn):
    news_count: int = 0
    top_news: Optional[NewsItemPreview] = None

class PaginatedEventsWithPreview(BaseModel):
    items: List[EventOutWithPreview]
    page: int
    limit: int
    total: int
    has_more: bool
