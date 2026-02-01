"""
Backend FastAPI pour gestion multi-tableaux Excel (data/database.xlsx)
VERSION FINALE - Gestion automatique Region/Assembly
"""

import os
import re
import threading
import math
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

print("🔧 [DEBUG] Imports OK")

# ============================================================================
# CONFIGURATION
# ============================================================================

DATA_DIR = Path("data")
DATABASE_FILE = DATA_DIR / "database.xlsx"
TEMP_FILE = DATA_DIR / "database_tmp.xlsx"

DEFAULT_HEADERS = [
    "Region",
    "Assembly",
    "Month",
    "Year",
    "Date",
    "Particulars_of_Receipt",
    "Receipt_No",
    "Bank_Receipt",
    "Payment_Date",
    "Payee",
    "Particulars_of_Payments",
    "Folio",
    "PV_No",
    "Chq_No",
    "Bank_Payment",
    "Health",
    "Education",
    "Local_Government"
]

DATA_DIR.mkdir(exist_ok=True)
file_lock = threading.Lock()

print(f"🔧 [DEBUG] Config OK - DATABASE_FILE: {DATABASE_FILE}")

# ============================================================================
# MODELS PYDANTIC
# ============================================================================

class TableCreate(BaseModel):
    region: str
    assembly: str

class RowData(BaseModel):
    row: Dict[str, Any]

class RowUpdate(BaseModel):
    row_index: int
    row: Dict[str, Any]

print("🔧 [DEBUG] Models Pydantic OK")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(title="Multi-Table Excel Manager", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔧 [DEBUG] FastAPI app créée, CORS activé")

# ============================================================================
# HELPERS
# ============================================================================

def sanitize_sheet_name(region: str, assembly: str) -> str:
    """Crée un nom de feuille Excel à partir de region et assembly"""
    print(f"🔧 [DEBUG] sanitize_sheet_name(region='{region}', assembly='{assembly}')")
    
    region_clean = re.sub(r'[\\/*?:\[\]]', '_', region.strip())
    assembly_clean = re.sub(r'[\\/*?:\[\]]', '_', assembly.strip())
    
    if not assembly_clean or assembly_clean == region_clean:
        sheet_name = region_clean[:31]
    else:
        sheet_name = f"{region_clean}_{assembly_clean}"[:31]
    
    print(f"🔧 [DEBUG] → sheet_name: '{sheet_name}'")
    return sheet_name

def parse_sheet_name(sheet_name: str) -> Tuple[str, str]:
    """Parse un nom de feuille Excel pour extraire region et assembly"""
    print(f"🔧 [DEBUG] parse_sheet_name('{sheet_name}')")
    
    if '_' in sheet_name:
        parts = sheet_name.split('_', 1)
        result = (parts[0], parts[1]) if len(parts) == 2 else (sheet_name, "")
    else:
        result = (sheet_name, sheet_name)
    
    print(f"🔧 [DEBUG] → region: '{result[0]}', assembly: '{result[1]}'")
    return result

def detect_region_assembly_from_data(df: pd.DataFrame) -> Tuple[Optional[str], Optional[str]]:
    """
    Détecte la vraie Region et Assembly depuis les données du DataFrame
    Retourne (region, assembly) ou (None, None) si impossible
    """
    print(f"🔧 [DEBUG] detect_region_assembly_from_data()")
    
    if "Region" not in df.columns or "Assembly" not in df.columns:
        print(f"⚠ [DEBUG] Colonnes Region/Assembly manquantes")
        return (None, None)
    
    if len(df) == 0:
        print(f"⚠ [DEBUG] DataFrame vide")
        return (None, None)
    
    # Récupérer toutes les valeurs uniques (non-NaN)
    regions = df["Region"].dropna().unique()
    assemblies = df["Assembly"].dropna().unique()
    
    print(f"🔧 [DEBUG] Regions uniques: {regions}")
    print(f"🔧 [DEBUG] Assemblies uniques: {assemblies}")
    
    # Si une seule valeur unique pour chaque → c'est bon !
    if len(regions) == 1 and len(assemblies) == 1:
        region = str(regions[0])
        assembly = str(assemblies[0])
        print(f"✓ [DEBUG] Détectées: region='{region}', assembly='{assembly}'")
        return (region, assembly)
    
    # Si plusieurs valeurs différentes
    if len(regions) > 1 or len(assemblies) > 1:
        print(f"⚠ [DEBUG] Valeurs multiples détectées - impossible de déterminer")
        return (None, None)
    
    print(f"⚠ [DEBUG] Aucune valeur valide trouvée")
    return (None, None)

def rename_sheet_if_needed(old_name: str, new_region: str, new_assembly: str) -> bool:
    """
    Renomme une feuille si nécessaire
    Retourne True si renommage effectué, False sinon
    """
    print(f"🔧 [DEBUG] rename_sheet_if_needed('{old_name}' → '{new_region}_{new_assembly}')")
    
    new_sheet_name = sanitize_sheet_name(new_region, new_assembly)
    
    if old_name == new_sheet_name:
        print(f"✓ [DEBUG] Nom déjà correct")
        return False
    
    try:
        with pd.ExcelFile(DATABASE_FILE, engine='openpyxl') as xls:
            existing_sheets = {name: pd.read_excel(xls, name) for name in xls.sheet_names}
        
        if old_name not in existing_sheets:
            print(f"✗ [DEBUG] Feuille '{old_name}' introuvable")
            return False
        
        # Si le nouveau nom existe déjà, ajouter un suffixe
        final_name = new_sheet_name
        counter = 1
        while final_name in existing_sheets and final_name != old_name:
            final_name = f"{new_sheet_name}_{counter}"[:31]
            counter += 1
        
        # Renommer
        df = existing_sheets.pop(old_name)
        existing_sheets[final_name] = df
        
        # Sauvegarder
        with pd.ExcelWriter(TEMP_FILE, engine='openpyxl') as writer:
            for name, data in existing_sheets.items():
                data.to_excel(writer, sheet_name=name, index=False)
        
        os.replace(TEMP_FILE, DATABASE_FILE)
        print(f"✓ [DEBUG] Feuille renommée: '{old_name}' → '{final_name}'")
        return True
        
    except Exception as e:
        print(f"✗ [DEBUG] Erreur renommage: {e}")
        if TEMP_FILE.exists():
            TEMP_FILE.unlink()
        return False

def ensure_database_exists():
    print(f"🔧 [DEBUG] ensure_database_exists() - existe: {DATABASE_FILE.exists()}")
    if not DATABASE_FILE.exists():
        with pd.ExcelWriter(DATABASE_FILE, engine='openpyxl') as writer:
            pd.DataFrame({"info": ["Created by Multi-Table Manager"]}).to_excel(
                writer, sheet_name="__info__", index=False
            )
        print(f"✓ Fichier {DATABASE_FILE} créé")

def get_all_sheets() -> Dict[str, pd.DataFrame]:
    print("🔧 [DEBUG] get_all_sheets()")
    ensure_database_exists()
    try:
        sheets = pd.read_excel(DATABASE_FILE, sheet_name=None, engine='openpyxl')
        filtered = {k: v for k, v in sheets.items() if not k.startswith('__')}
        print(f"🔧 [DEBUG] → {len(filtered)} feuilles chargées")
        return filtered
    except Exception as e:
        print(f"✗ [DEBUG] Erreur get_all_sheets: {e}")
        return {}

def get_sheet(region: str, assembly: str) -> Optional[pd.DataFrame]:
    """Récupère une feuille Excel par region et assembly"""
    print(f"🔧 [DEBUG] get_sheet(region='{region}', assembly='{assembly}')")
    
    sheet_name = sanitize_sheet_name(region, assembly)
    print(f"🔧 [DEBUG] Tentative 1: '{sheet_name}'")
    
    try:
        df = pd.read_excel(DATABASE_FILE, sheet_name=sheet_name, engine='openpyxl')
        print(f"✓ [DEBUG] Feuille '{sheet_name}' trouvée: {len(df)} lignes, {len(df.columns)} colonnes")
        return df
    except ValueError:
        print(f"🔧 [DEBUG] Feuille '{sheet_name}' n'existe pas")
    except Exception as e:
        print(f"✗ [DEBUG] Erreur lecture '{sheet_name}': {e}")
    
    # Tentative 2: legacy
    if assembly == region or not assembly:
        print(f"🔧 [DEBUG] Tentative 2 (legacy): '{region}'")
        try:
            df = pd.read_excel(DATABASE_FILE, sheet_name=region, engine='openpyxl')
            print(f"✓ [DEBUG] Feuille legacy '{region}' trouvée: {len(df)} lignes")
            return df
        except ValueError:
            print(f"🔧 [DEBUG] Feuille legacy '{region}' n'existe pas")
        except Exception as e:
            print(f"✗ [DEBUG] Erreur lecture legacy '{region}': {e}")
    
    # Tentative 3: recherche globale
    print(f"🔧 [DEBUG] Tentative 3: recherche dans toutes les feuilles")
    try:
        with pd.ExcelFile(DATABASE_FILE, engine='openpyxl') as xls:
            all_sheets = xls.sheet_names
            print(f"🔧 [DEBUG] Feuilles disponibles: {all_sheets}")
            
            for sheet in all_sheets:
                if sheet.startswith('__'):
                    continue
                if sheet.lower() == region.lower() or sheet.lower() == sheet_name.lower():
                    df = pd.read_excel(xls, sheet)
                    print(f"✓ [DEBUG] Feuille '{sheet}' trouvée par correspondance")
                    return df
    except Exception as e:
        print(f"✗ [DEBUG] Erreur recherche globale: {e}")
    
    print(f"✗ [DEBUG] Aucune feuille trouvée")
    return None

def save_sheet(region: str, assembly: str, df: pd.DataFrame):
    print(f"🔧 [DEBUG] save_sheet(region='{region}', assembly='{assembly}')")
    sheet_name = sanitize_sheet_name(region, assembly)
    
    try:
        with pd.ExcelFile(DATABASE_FILE, engine='openpyxl') as xls:
            existing_sheets = {name: pd.read_excel(xls, name) for name in xls.sheet_names}
        
        existing_sheets[sheet_name] = df
        
        with pd.ExcelWriter(TEMP_FILE, engine='openpyxl') as writer:
            for name, data in existing_sheets.items():
                data.to_excel(writer, sheet_name=name, index=False)
        
        os.replace(TEMP_FILE, DATABASE_FILE)
        print(f"✓ Feuille '{sheet_name}' sauvegardée ({len(df)} lignes)")
        
    except Exception as e:
        print(f"✗ [DEBUG] Erreur save_sheet: {e}")
        if TEMP_FILE.exists():
            TEMP_FILE.unlink()
        raise HTTPException(status_code=500, detail=f"Erreur sauvegarde: {str(e)}")

def delete_sheet(region: str, assembly: str):
    print(f"🔧 [DEBUG] delete_sheet(region='{region}', assembly='{assembly}')")
    sheet_name = sanitize_sheet_name(region, assembly)
    
    try:
        with pd.ExcelFile(DATABASE_FILE, engine='openpyxl') as xls:
            existing_sheets = {name: pd.read_excel(xls, name) for name in xls.sheet_names}
        
        if sheet_name not in existing_sheets:
            raise HTTPException(status_code=404, detail="Tableau introuvable")
        
        del existing_sheets[sheet_name]
        
        with pd.ExcelWriter(TEMP_FILE, engine='openpyxl') as writer:
            for name, data in existing_sheets.items():
                data.to_excel(writer, sheet_name=name, index=False)
        
        os.replace(TEMP_FILE, DATABASE_FILE)
        print(f"✓ Feuille '{sheet_name}' supprimée")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"✗ [DEBUG] Erreur delete_sheet: {e}")
        if TEMP_FILE.exists():
            TEMP_FILE.unlink()
        raise HTTPException(status_code=500, detail=f"Erreur suppression: {str(e)}")

def normalize_value(val):
    if pd.isna(val):
        return None
    if isinstance(val, str):
        return val.strip().lower()
    if isinstance(val, (pd.Timestamp, datetime)):
        return val.strftime('%Y-%m-%d')
    return val

def normalize_row(row: Dict[str, Any]) -> tuple:
    return tuple(normalize_value(v) for v in row.values())

def is_duplicate(new_row: Dict[str, Any], df: pd.DataFrame) -> bool:
    if len(df) == 0:
        return False
    
    new_normalized = normalize_row(new_row)
    existing_normalized = set(
        normalize_row(row) 
        for row in df.to_dict(orient='records')
    )
    
    return new_normalized in existing_normalized

print("🔧 [DEBUG] Helpers définis")

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    print("📍 [DEBUG] Endpoint / appelé")
    return {
        "message": "Multi-Table Excel Manager API",
        "version": "3.0.0",
        "status": "running"
    }

@app.get("/tables")
def list_tables():
    print("📍 [DEBUG] Endpoint /tables appelé")
    try:
        with file_lock:
            sheets = get_all_sheets()
            
            tables = []
            for sheet_name, df in sheets.items():
                # Essayer de détecter les vraies valeurs depuis les données
                detected_region, detected_assembly = detect_region_assembly_from_data(df)
                
                # Si détection réussie, utiliser ces valeurs
                if detected_region and detected_assembly:
                    region = detected_region
                    assembly = detected_assembly
                else:
                    # Sinon, parser depuis le nom de feuille
                    region, assembly = parse_sheet_name(sheet_name)
                
                tables.append({
                    "region": region,
                    "assembly": assembly,
                    "sheet_name": sheet_name,
                    "total_rows": len(df),
                    "total_columns": len(df.columns)
                })
            
            print(f"✓ [DEBUG] {len(tables)} tableaux retournés")
            return {
                "tables": tables,
                "total": len(tables)
            }
    except Exception as e:
        print(f"✗ [DEBUG] Erreur /tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tables")
def create_table(data: TableCreate):
    print(f"📍 [DEBUG] POST /tables - region={data.region}, assembly={data.assembly}")
    try:
        with file_lock:
            existing_df = get_sheet(data.region, data.assembly)
            if existing_df is not None:
                print(f"✗ [DEBUG] Tableau existe déjà")
                raise HTTPException(
                    status_code=409,
                    detail=f"Tableau '{data.region} - {data.assembly}' existe déjà"
                )
            
            # Créer un DataFrame avec les colonnes par défaut
            df = pd.DataFrame(columns=DEFAULT_HEADERS)
            save_sheet(data.region, data.assembly, df)
            
            print(f"✓ [DEBUG] Tableau créé avec Region={data.region}, Assembly={data.assembly}")
            return {
                "success": True,
                "message": f"Tableau '{data.region} - {data.assembly}' créé",
                "region": data.region,
                "assembly": data.assembly,
                "sheet_name": sanitize_sheet_name(data.region, data.assembly)
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"✗ [DEBUG] Erreur POST /tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/tables/{region}/{assembly}")
def remove_table(region: str, assembly: str):
    print(f"📍 [DEBUG] DELETE /tables/{region}/{assembly}")
    try:
        with file_lock:
            delete_sheet(region, assembly)
            return {
                "success": True,
                "message": f"Tableau '{region} - {assembly}' supprimé"
            }
    except Exception as e:
        print(f"✗ [DEBUG] Erreur DELETE: {e}")
        raise

@app.get("/tables/{region}/{assembly}")
def get_table_data(region: str, assembly: str):
    print(f"📍 [DEBUG] GET /tables/{region}/{assembly}")
    try:
        with file_lock:
            df = get_sheet(region, assembly)
            
            if df is None:
                print(f"✗ [DEBUG] Tableau introuvable")
                raise HTTPException(
                    status_code=404, 
                    detail=f"Tableau '{region} - {assembly}' introuvable"
                )
            
            # Détecter les vraies valeurs depuis les données
            detected_region, detected_assembly = detect_region_assembly_from_data(df)
            
            # Si détection réussie et différente du nom de feuille, renommer
            if detected_region and detected_assembly:
                if detected_region != region or detected_assembly != assembly:
                    print(f"🔧 [DEBUG] Renommage automatique détecté...")
                    sheet_name = sanitize_sheet_name(region, assembly)
                    rename_sheet_if_needed(sheet_name, detected_region, detected_assembly)
                    
                    # Utiliser les valeurs détectées
                    region = detected_region
                    assembly = detected_assembly
            
            headers = df.columns.tolist()
            
            # Conversion sécurisée des données
            rows = []
            for idx, row in df.iterrows():
                row_dict = {}
                for col in headers:
                    val = row[col]
                    if pd.isna(val):
                        row_dict[col] = None
                    elif isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                        row_dict[col] = None
                    elif isinstance(val, (np.floating, np.integer)):
                        if np.isnan(val) or np.isinf(val):
                            row_dict[col] = None
                        else:
                            row_dict[col] = val.item()
                    else:
                        row_dict[col] = val
                rows.append(row_dict)
            
            print(f"✓ [DEBUG] Retour: {len(rows)} lignes, {len(headers)} colonnes")
            return {
                "region": region,
                "assembly": assembly,
                "headers": headers,
                "rows": rows,
                "meta": {
                    "total_rows": len(df),
                    "total_columns": len(headers)
                }
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"✗ [DEBUG] Erreur GET table: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tables/{region}/{assembly}/rows")
async def add_table_row(region: str, assembly: str, data: RowData):
    print(f"📍 [DEBUG] POST /tables/{region}/{assembly}/rows")
    print(f"🔧 [DEBUG] Données reçues: {data.row}")
    try:
        with file_lock:
            df = get_sheet(region, assembly)
            
            if df is None:
                raise HTTPException(status_code=404, detail="Tableau introuvable")
            
            # STRATÉGIE DE REMPLISSAGE AUTOMATIQUE Region/Assembly
            if "Region" in df.columns and "Assembly" in df.columns:
                # 1. Essayer de détecter depuis les données existantes
                detected_region, detected_assembly = detect_region_assembly_from_data(df)
                
                if detected_region and detected_assembly:
                    # Utiliser les valeurs détectées
                    data.row["Region"] = detected_region
                    data.row["Assembly"] = detected_assembly
                    print(f"✓ [DEBUG] Region/Assembly depuis données: {detected_region} / {detected_assembly}")
                else:
                    # 2. Utiliser les valeurs de l'URL (du nom de tableau)
                    data.row["Region"] = region
                    data.row["Assembly"] = assembly
                    print(f"✓ [DEBUG] Region/Assembly depuis URL: {region} / {assembly}")
            
            # Vérifier les doublons
            if is_duplicate(data.row, df):
                return JSONResponse(
                    status_code=409,
                    content={"error": "duplicate", "message": "Cette ligne existe déjà"}
                )
            
            # Ajouter la ligne
            new_row_df = pd.DataFrame([data.row])
            df = pd.concat([df, new_row_df], ignore_index=True)
            
            save_sheet(region, assembly, df)
            
            print(f"✓ [DEBUG] Ligne ajoutée avec Region={data.row.get('Region')}, Assembly={data.row.get('Assembly')}")
            return {
                "success": True,
                "message": "Ligne ajoutée",
                "row_index": len(df) - 1
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"✗ [DEBUG] Erreur POST row: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/tables/{region}/{assembly}/rows/{row_index}")
def update_table_row(region: str, assembly: str, row_index: int, data: RowData):
    print(f"📍 [DEBUG] PUT /tables/{region}/{assembly}/rows/{row_index}")
    try:
        with file_lock:
            df = get_sheet(region, assembly)
            
            if df is None:
                raise HTTPException(status_code=404, detail="Tableau introuvable")
            
            if row_index < 0 or row_index >= len(df):
                raise HTTPException(
                    status_code=404,
                    detail=f"Index {row_index} invalide (max: {len(df)-1})"
                )
            
            expected_cols = set(df.columns)
            provided_cols = set(data.row.keys())
            
            if expected_cols != provided_cols:
                return JSONResponse(
                    status_code=400,
                    content={
                        "error": "column_mismatch",
                        "expected": sorted(expected_cols),
                        "found": sorted(provided_cols)
                    }
                )
            
            for col, val in data.row.items():
                df.at[row_index, col] = val
            
            save_sheet(region, assembly, df)
            
            print(f"✓ [DEBUG] Ligne modifiée")
            return {
                "success": True,
                "message": f"Ligne {row_index} modifiée"
            }
    except Exception as e:
        print(f"✗ [DEBUG] Erreur PUT row: {e}")
        raise

@app.post("/tables/fix-legacy")
def fix_legacy_sheets():
    """
    Endpoint pour corriger automatiquement les feuilles legacy (Sheet1, etc.)
    Détecte les vraies valeurs Region/Assembly et renomme les feuilles
    """
    print("📍 [DEBUG] POST /tables/fix-legacy")
    try:
        with file_lock:
            sheets = get_all_sheets()
            
            results = {
                "sheets_renamed": 0,
                "sheets_skipped": 0,
                "errors": []
            }
            
            for sheet_name, df in sheets.items():
                print(f"🔧 [DEBUG] Analyse de '{sheet_name}'...")
                
                # Détecter Region/Assembly
                detected_region, detected_assembly = detect_region_assembly_from_data(df)
                
                if detected_region and detected_assembly:
                    # Vérifier si le nom actuel correspond
                    expected_name = sanitize_sheet_name(detected_region, detected_assembly)
                    
                    if sheet_name != expected_name:
                        success = rename_sheet_if_needed(sheet_name, detected_region, detected_assembly)
                        if success:
                            results["sheets_renamed"] += 1
                        else:
                            results["errors"].append({
                                "sheet": sheet_name,
                                "error": "rename_failed"
                            })
                    else:
                        results["sheets_skipped"] += 1
                        print(f"✓ [DEBUG] '{sheet_name}' déjà correct")
                else:
                    results["sheets_skipped"] += 1
                    results["errors"].append({
                        "sheet": sheet_name,
                        "error": "cannot_detect_region_assembly"
                    })
            
            print(f"✓ [DEBUG] Correction terminée: {results}")
            return {
                "success": True,
                **results,
                "message": f"{results['sheets_renamed']} feuille(s) renommée(s)"
            }
    except Exception as e:
        print(f"✗ [DEBUG] Erreur fix-legacy: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/import-excel")
async def import_excel(file: UploadFile = File(...)):
    print(f"📍 [DEBUG] POST /import-excel - {file.filename}")
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Format invalide")
    
    with file_lock:
        temp_upload = DATA_DIR / f"upload_tmp_{datetime.now().timestamp()}.xlsx"
        
        try:
            content = await file.read()
            with open(temp_upload, 'wb') as f:
                f.write(content)
            
            uploaded_sheets = pd.read_excel(temp_upload, sheet_name=None, engine='openpyxl')
            
            results = {
                "tables_added": 0,
                "tables_merged": 0,
                "rows_added": 0,
                "rows_skipped": 0,
                "errors": []
            }
            
            for sheet_name, uploaded_df in uploaded_sheets.items():
                if sheet_name.startswith('__'):
                    continue
                
                try:
                    uploaded_df.columns = uploaded_df.columns.str.strip()
                    
                    if set(uploaded_df.columns) != set(DEFAULT_HEADERS):
                        results["errors"].append({
                            "sheet": sheet_name,
                            "error": "structure_invalide",
                            "message": f"Structure invalide pour '{sheet_name}'"
                        })
                        continue
                    
                    # Détecter Region/Assembly depuis les données
                    detected_region, detected_assembly = detect_region_assembly_from_data(uploaded_df)
                    
                    if detected_region and detected_assembly:
                        region = detected_region
                        assembly = detected_assembly
                    else:
                        region, assembly = parse_sheet_name(sheet_name)
                    
                    existing_df = get_sheet(region, assembly)
                    
                    if existing_df is None:
                        save_sheet(region, assembly, uploaded_df)
                        results["tables_added"] += 1
                        results["rows_added"] += len(uploaded_df)
                    else:
                        added = 0
                        skipped = 0
                        
                        for _, row in uploaded_df.iterrows():
                            row_dict = row.to_dict()
                            
                            if is_duplicate(row_dict, existing_df):
                                skipped += 1
                            else:
                                new_row_df = pd.DataFrame([row_dict])
                                existing_df = pd.concat([existing_df, new_row_df], ignore_index=True)
                                added += 1
                        
                        save_sheet(region, assembly, existing_df)
                        results["tables_merged"] += 1
                        results["rows_added"] += added
                        results["rows_skipped"] += skipped
                
                except Exception as e:
                    results["errors"].append({
                        "sheet": sheet_name,
                        "error": "exception",
                        "message": str(e)
                    })
            
            print(f"✓ [DEBUG] Import terminé: {results}")
            return {
                "success": True,
                **results,
                "message": f"{results['tables_added']} créées, {results['tables_merged']} fusionnées"
            }
        
        except Exception as e:
            print(f"✗ [DEBUG] Erreur import: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if temp_upload.exists():
                temp_upload.unlink()

@app.get("/download")
def download():
    print("📍 [DEBUG] GET /download")
    if not DATABASE_FILE.exists():
        raise HTTPException(status_code=404, detail="Base introuvable")
    
    return FileResponse(
        path=DATABASE_FILE,
        filename="database.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

print("✅ [DEBUG] Tous les endpoints définis")
print("🚀 Backend prêt à démarrer")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage Multi-Table Manager...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)