# Développement Backend

## Environnement

Le backend de RepMotion utilise :

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite en développement
- PostgreSQL prévu pour la production

Le backend est principalement exécuté depuis WSL Ubuntu.

---

# Démarrer l'API

Depuis le dossier contenant `main.py` :

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Signification

```text
uvicorn
→ serveur ASGI utilisé pour exécuter FastAPI

main
→ fichier main.py

app
→ instance FastAPI déclarée dans main.py

--host 0.0.0.0
→ rend l'API accessible depuis l'extérieur de WSL

--port 8000
→ démarre l'API sur le port 8000

--reload
→ redémarre automatiquement le serveur lorsque le code change
```

---

# Adresse de l'API

Une fois le serveur lancé :

```text
http://localhost:8000
```

---

# Swagger

Documentation interactive FastAPI :

```text
http://localhost:8000/docs
```

---

# ReDoc

Documentation alternative :

```text
http://localhost:8000/redoc
```

---

# Workflow habituel

```text
Ouvrir WSL
↓
Aller dans le dossier backend
↓
Activer le virtual environment si nécessaire
↓
Démarrer Uvicorn
↓
Développer / tester
↓
FastAPI reload automatiquement
```

Commande principale à retenir :

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

# Important

Le `--host 0.0.0.0` est important pour RepMotion lorsque l'API doit être accessible depuis :

- l'application mobile
- Windows
- un autre appareil du réseau local

Utiliser seulement `127.0.0.1` limiterait l'accès à la machine qui exécute directement Uvicorn.