from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.db.database import Base, engine

# Important : importe les modèles pour que SQLAlchemy connaisse les tables
from app.models.user import User 


# ==============================================================
# --- Init DB (dev seulement)
# ==============================================================
Base.metadata.create_all(bind=engine)


# ==============================================================
# --- FastAPI
# ==============================================================
app = FastAPI(title="RepMotion-Core API")


# ==============================================================
# --- CORS
# ==============================================================
ALLOWED_ORIGINS = [
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================
# --- Routes de base
# ==============================================================
@app.get("/")
def root():
    return {"status": "RepMotion-Core API opérationnelle"}


@app.get("/routes")
def list_routes():
    output = []
    for route in app.routes:
        if hasattr(route, "methods"):
            output.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name,
            })
    return {"routes": output}


# ==============================================================
# --- Routers
# ==============================================================
app.include_router(auth_router)