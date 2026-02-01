FROM python:3.11-slim

WORKDIR /app

# Copier tout
COPY . .

# Lister les fichiers (debug)
RUN ls -la

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Créer le dossier data
RUN mkdir -p data

EXPOSE 8000

CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8000"]