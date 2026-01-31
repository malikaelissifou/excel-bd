# Excel Database Manager

Gestionnaire de base de données Excel multi-tableaux avec interface web moderne.

## 📋 Description

Application full-stack permettant de gérer plusieurs tableaux Excel dans un seul fichier, avec :
- Création/suppression de tableaux (identifiés par Région + Assemblée)
- Ajout/modification de lignes avec détection de doublons
- Import/export de fichiers Excel avec fusion intelligente
- Interface moderne et responsive en React + TailwindCSS

---

## 🛠️ Technologies

**Backend :**
- Python 3.8+
- FastAPI
- Pandas
- OpenPyXL

**Frontend :**
- React 18
- TypeScript
- TailwindCSS
- React Router
- Vite

---

## 📦 Installation

### Prérequis

- Python 3.8 ou supérieur
- Node.js 16 ou supérieur
- npm ou yarn

### 1️⃣ Backend (FastAPI)

```bash
# Créer un environnement virtuel Python
python -m venv .venv

# Activer l'environnement virtuel
# Windows :
.venv\Scripts\activate
# Linux/Mac :
source .venv/bin/activate

# Installer les dépendances
pip install fastapi==0.104.1 uvicorn==0.24.0 pandas==2.1.3 openpyxl==3.1.2 python-multipart==0.0.6
```

**OU** créer un fichier `requirements.txt` :

```txt
fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.3
openpyxl==3.1.2
python-multipart==0.0.6
```

Puis :
```bash
pip install -r requirements.txt
```

### 2️⃣ Frontend (React)

```bash
# Aller dans le dossier frontend
cd front

# Installer les dépendances
npm install

# Installer React Router (si pas déjà fait)
npm install react-router-dom
```

---

## 🚀 Lancement

### Terminal 1 : Backend

```bash
# À la racine du projet
uvicorn backend:app --reload
```

Le serveur démarre sur **http://127.0.0.1:8000**

### Terminal 2 : Frontend

```bash
# Dans le dossier front/
cd front
npm run dev
```

Le frontend démarre sur **http://localhost:3000** (ou 5173 selon Vite)

---

## 📂 Structure du projet

```
excel_bd/
├── backend.py              # API FastAPI
├── requirements.txt        # Dépendances Python
├── data/
│   └── database.xlsx      # Base de données (créée automatiquement)
└── front/
    ├── package.json
    ├── src/
    │   ├── App.tsx
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   └── TableViewPage.tsx
    │   ├── components/
    │   │   ├── CreateTableModal.tsx
    │   │   ├── AddSequenceModal.tsx
    │   │   ├── EditModal.tsx
    │   │   ├── ImportModal.tsx
    │   │   └── DataTable.tsx
    │   ├── lib/
    │   │   └── api.ts
    │   └── types/
    │       └── index.ts
    └── ...
```

---

## 🎯 Utilisation

### Créer un nouveau tableau

1. Cliquez sur **"+ Nouveau tableau"** ou **"Créer un tableau"**
2. Saisissez :
   - **Région** (ex: Borgou)
   - **Assemblée** (ex: Parakou)
3. Cliquez sur **"Créer"**

Le tableau est créé avec 14 colonnes prédéfinies.

### Ajouter une ligne

1. Ouvrez un tableau (cliquez sur sa carte)
2. Cliquez sur **"+ Ajouter une ligne"**
3. Remplissez les champs étape par étape
4. Cliquez sur **"Terminer"**

La ligne est ajoutée si elle n'est pas un doublon.

### Modifier une ligne

1. Dans la vue d'un tableau, cliquez sur **"edit"** à droite d'une ligne
2. Modifiez les valeurs
3. Cliquez sur **"Sauvegarder"**

### Importer un fichier Excel

1. Sur la page d'accueil, cliquez sur **"Importer"** (bouton vert en haut)
2. Sélectionnez un fichier `.xlsx` ou `.xls`
3. Cliquez sur **"Importer"**

**Le système va automatiquement :**
- Créer les nouveaux tableaux (si les feuilles n'existent pas)
- Fusionner les tableaux existants (ajout des nouvelles lignes)
- Ignorer les doublons
- Afficher un rapport détaillé

### Télécharger la base de données

Cliquez sur **"Télécharger"** (bouton vert foncé en haut) pour obtenir le fichier `database.xlsx` complet.

### Supprimer un tableau

1. Sur une carte de tableau, cliquez sur l'icône **🗑️** (poubelle)
2. Confirmez la suppression

---

## 📊 Structure du fichier Excel

Le fichier `data/database.xlsx` contient plusieurs feuilles :

```
database.xlsx
├── Borgou_Parakou        # Tableau pour Borgou - Parakou
├── Atacora_Natitingou   # Tableau pour Atacora - Natitingou
└── ...                  # Autres tableaux
```

Chaque feuille contient **14 colonnes** :

| **RECEIPTS** | | | **PAYMENTS** | | | | | | | | **CONSTITUENCY** | | |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Date (Receipt) | Particulars of Receipt | Receipt No. | Bank (Receipt) | Date (Payment) | Payee | Particulars (Payment) | Folio | P.V. No. | Chq. No. | Bank (Payment) | Health | Education | Local Government |

---

## 🔧 API Endpoints

### Tables Management

- `GET /tables` - Liste tous les tableaux
- `POST /tables` - Créer un nouveau tableau
  ```json
  { "region": "Borgou", "assembly": "Parakou" }
  ```
- `DELETE /tables/{region}/{assembly}` - Supprimer un tableau

### Data Management

- `GET /tables/{region}/{assembly}` - Récupérer les données d'un tableau
- `GET /tables/{region}/{assembly}/schema` - Récupérer les colonnes
- `POST /tables/{region}/{assembly}/rows` - Ajouter une ligne
  ```json
  { "row": { "Date (Receipt)": "2024-01-15", ... } }
  ```
- `PUT /tables/{region}/{assembly}/rows/{index}` - Modifier une ligne

### Import/Export

- `POST /import-excel` - Importer un fichier Excel (multipart/form-data)
- `GET /download` - Télécharger la base de données

### Documentation interactive

Accédez à **http://127.0.0.1:8000/docs** pour tester l'API avec Swagger UI.

---

## ⚠️ Notes importantes

### Détection de doublons

Le système détecte les doublons par **égalité stricte de toutes les colonnes** :
- Normalisation (trim, lowercase)
- Comparaison complète de ligne

### Format des dates

Les dates sont stockées au format ISO : `YYYY-MM-DD`

### Gestion concurrente

Un verrou (`threading.Lock`) protège l'accès au fichier Excel pour éviter les corruptions.

### Sauvegarde atomique

Les modifications utilisent un fichier temporaire puis un remplacement atomique (`os.replace`).

---

## 🐛 Dépannage

### Backend ne démarre pas

```bash
# Vérifier que l'environnement virtuel est activé
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Réinstaller les dépendances
pip install --upgrade -r requirements.txt
```

### Frontend ne se connecte pas au backend

1. Vérifier que le backend tourne sur `http://127.0.0.1:8000`
2. Vérifier la variable d'environnement :
   ```bash
   # Dans front/.env
   VITE_API_URL=http://127.0.0.1:8000
   ```

### Erreur 500 lors de l'ouverture d'un tableau

Problème de valeurs `NaN` dans Excel. Solution :
- Ouvrir le fichier `data/database.xlsx` dans Excel
- Supprimer les cellules avec formules invalides
- Sauvegarder

### Le fichier Excel est corrompu

```bash
# Supprimer et recréer
rm data/database.xlsx
# Relancer le backend, il sera recréé automatiquement
```

---

## 📝 Personnalisation

### Changer les colonnes

Modifier la liste `DEFAULT_HEADERS` dans `backend.py` (ligne ~47) :

```python
DEFAULT_HEADERS = [
    "Colonne 1",
    "Colonne 2",
    # ...
]
```

### Changer les couleurs

Les couleurs principales sont dans les fichiers React :
- Vert principal : `#00c853`
- Vert secondaire : `#4caf50`
- Vert foncé : `#1b5e20`

---

## 📄 Licence

Ce projet est un outil personnel développé pour un usage local.

---

## 👤 Auteur

Développé avec ❤️ et l'aide de Claude (Anthropic)

---

## 🚀 Améliorations futures possibles

- [ ] Authentification utilisateur
- [ ] Export PDF des tableaux
- [ ] Recherche/filtrage avancé
- [ ] Graphiques et statistiques
- [ ] Historique des modifications
- [ ] Mode hors-ligne (PWA)

---

**Bon usage ! 🎉**