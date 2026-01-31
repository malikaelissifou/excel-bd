FROM python:3.11-slim

WORKDIR /app

# Copier TOUT le projet (Docker ignore ce qui est dans .dockerignore)
COPY . .

# Installer les dépendances
RUN pip install --no-cache-dir -r Requirements.txt

# Créer le dossier data s'il n'existe pas
RUN mkdir -p data

EXPOSE 8000

CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8000"]