FROM python:3.11-slim

WORKDIR /app

# Copier les requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le backend
COPY backend.py .

# Créer le dossier data
RUN mkdir -p data

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### **B. Crée un fichier `.dockerignore`** à la racine :
```
.venv/
__pycache__/
front/
data/database.xlsx
*.pyc
.git/
.gitignore