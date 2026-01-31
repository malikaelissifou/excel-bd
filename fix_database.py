"""
Script de nettoyage pour corriger le fichier database.xlsx
- Fixe les séparateurs incohérents
- Remplace "Sheet1" par les vraies valeurs
- Nettoie les données
"""

import pandas as pd
import numpy as np
from pathlib import Path

print("🚀 Démarrage du nettoyage...")

# Configuration
DATABASE_FILE = Path("data/database.xlsx")
BACKUP_FILE = Path("data/database_backup.xlsx")
OUTPUT_FILE = Path("data/database_clean.xlsx")

# Valeurs correctes
CORRECT_REGION = "BRONG AHAFO"
CORRECT_ASSEMBLY = "NKORANZA SOUTH MUNICIPAL ASSEMBLY"
CORRECT_YEAR = "2014"

# Colonnes attendues
EXPECTED_COLUMNS = [
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

def clean_value(val):
    """Nettoie une valeur"""
    if pd.isna(val) or val is None:
        return None
    
    # Convertir en string
    val_str = str(val).strip()
    
    # Vide si juste des espaces
    if not val_str or val_str == 'nan':
        return None
    
    return val_str

def fix_row(row):
    """Corrige une ligne de données"""
    # Créer un dictionnaire pour la ligne corrigée
    fixed = {}
    
    # Corriger Region et Assembly
    region = clean_value(row.get('Region', ''))
    assembly = clean_value(row.get('Assembly', ''))
    
    # Si c'est "Sheet1", remplacer par les vraies valeurs
    if region == "Sheet1":
        region = CORRECT_REGION
    if assembly == "Sheet1":
        assembly = CORRECT_ASSEMBLY
    
    # Si Region contient des virgules (données mal parsées)
    if region and ',' in region:
        parts = region.split(',')
        if len(parts) >= 2:
            region = parts[0].strip()
            assembly = parts[1].strip() if len(parts) > 1 else CORRECT_ASSEMBLY
    
    fixed['Region'] = region if region else CORRECT_REGION
    fixed['Assembly'] = assembly if assembly else CORRECT_ASSEMBLY
    
    # Corriger Year
    year = clean_value(row.get('Year', ''))
    if not year or year == "Sheet1":
        year = CORRECT_YEAR
    # Gérer les années mal formatées (ex: "2 014")
    year = year.replace(' ', '')
    fixed['Year'] = year
    
    # Copier les autres colonnes
    for col in EXPECTED_COLUMNS:
        if col not in ['Region', 'Assembly', 'Year']:
            val = clean_value(row.get(col, ''))
            fixed[col] = val
    
    return fixed

def main():
    print(f"📂 Lecture du fichier: {DATABASE_FILE}")
    
    # Créer une backup
    if DATABASE_FILE.exists():
        print(f"💾 Création backup: {BACKUP_FILE}")
        import shutil
        shutil.copy2(DATABASE_FILE, BACKUP_FILE)
    
    try:
        # Lire le fichier Excel
        df = pd.read_excel(DATABASE_FILE, sheet_name='Sheet1', engine='openpyxl')
        print(f"✅ {len(df)} lignes chargées")
        print(f"📊 Colonnes trouvées: {list(df.columns)}")
        
        # Nettoyer les noms de colonnes
        df.columns = df.columns.str.strip()
        
        # Corriger chaque ligne
        cleaned_rows = []
        errors = 0
        
        for idx, row in df.iterrows():
            try:
                fixed_row = fix_row(row)
                cleaned_rows.append(fixed_row)
            except Exception as e:
                print(f"⚠️ Erreur ligne {idx}: {e}")
                errors += 1
        
        # Créer le nouveau DataFrame
        df_clean = pd.DataFrame(cleaned_rows, columns=EXPECTED_COLUMNS)
        
        # Statistiques
        print("\n📊 STATISTIQUES :")
        print(f"  - Lignes traitées: {len(df)}")
        print(f"  - Lignes nettoyées: {len(df_clean)}")
        print(f"  - Erreurs: {errors}")
        
        # Afficher les valeurs uniques pour vérification
        print(f"\n✅ Regions uniques: {df_clean['Region'].unique()}")
        print(f"✅ Assemblies uniques: {df_clean['Assembly'].unique()}")
        print(f"✅ Years uniques: {df_clean['Year'].unique()}")
        
        # Compter les "Sheet1" restants
        sheet1_count = (df_clean == "Sheet1").sum().sum()
        if sheet1_count > 0:
            print(f"⚠️ ATTENTION: {sheet1_count} cellules 'Sheet1' restantes !")
        
        # Sauvegarder le fichier nettoyé
        print(f"\n💾 Sauvegarde du fichier nettoyé: {OUTPUT_FILE}")
        
        # Créer le nouveau fichier Excel
        with pd.ExcelWriter(OUTPUT_FILE, engine='openpyxl') as writer:
            df_clean.to_excel(writer, sheet_name='BRONG AHAFO_NKORANZA SOUTH', index=False)
        
        print(f"✅ Fichier nettoyé sauvegardé !")
        print(f"\n🎉 NETTOYAGE TERMINÉ !")
        print(f"\n📝 PROCHAINES ÉTAPES :")
        print(f"  1. Vérifier le fichier: {OUTPUT_FILE}")
        print(f"  2. Si OK, remplacer database.xlsx par ce fichier")
        print(f"  3. Relancer ton application")
        
        # Afficher un aperçu
        print(f"\n👀 APERÇU DES 5 PREMIÈRES LIGNES :")
        print(df_clean[['Region', 'Assembly', 'Month', 'Year', 'Payee', 'Bank_Payment']].head())
        
    except Exception as e:
        print(f"\n❌ ERREUR FATALE: {e}")
        import traceback
        traceback.print_exc()
        print(f"\n💡 La backup est dans: {BACKUP_FILE}")

if __name__ == "__main__":
    main()