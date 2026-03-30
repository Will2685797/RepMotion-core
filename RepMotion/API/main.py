from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.admin import router as admin_router
from app.routes.events import router as event_router
from app.routes.health import router as health_router
from app.routes.raw_rss_items import router as raw_rss_router
from app.routes.news_items import router as news_items_router
from app.routes.sources_feeds import router as sources_feeds_router
from app.routes.internal_fetcher_config import router as internal_fetcher_router
from app.routes.market_data import router as market_data_router
from app.routes.auth import router as auth_router
"""
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug --access-log
"""
"""
"""




# ==============================================================
# --- FastAPI ---
# ==============================================================
app = FastAPI(title="RepMotion API")

ALLOWED_ORIGINS = [
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "https://xlxwpvs-iammacmac-8081.exp.direct",
    "https://mlvmcca-iammacmac-8081.exp.direct/",
]
app.add_middleware(
    CORSMiddleware,
    # allow_origins=ALLOWED_ORIGINS,
    allow_origins=["*"],
    # allow_credentials=True,
    allow_credentials=False,  # must be False if allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)




# ==============================================================
# --- Root ---
# ==============================================================
@app.get("/")
def root():
    return {"status": "API RepMotion opérationnelle"}

@app.get("/routes")
def list_routes():
    output = []
    for route in app.routes:
        if hasattr(route, "methods"):
            output.append({
                "path": route.path,
                # "methods": list(route.methods),
                # "name": route.name,
            })
    return {"routes": output}




# ==============================================================
# --- Rooters ---
# ==============================================================
app.include_router(health_router)
app.include_router(internal_fetcher_router)
app.include_router(admin_router)
app.include_router(sources_feeds_router)
app.include_router(raw_rss_router)
app.include_router(news_items_router)
app.include_router(event_router)
app.include_router(market_data_router)
app.include_router(auth_router)
