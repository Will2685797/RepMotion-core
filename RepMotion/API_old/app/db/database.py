import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
"""
"""




# ==============================================================
# --- ENV  ---
# ==============================================================
# lit le fichier .env à la racine du projet (api/)
load_dotenv()

# Récupération des variables d'environnement pour la configuration de la base de données
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

if not all([DB_NAME, DB_USER, DB_PASSWORD]):
    raise RuntimeError("Variables .env manquantes: DB_NAME, DB_USER, DB_PASSWORD")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    echo=True, # mettre a false après que sa marche pour pas spam dans le terminal 
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        