from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
# --- Rout ---
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
# --- Routers ---
# ==============================================================
app.include_router(auth_router)
