#!/usr/bin/env python3
"""
Reprend le fichier ORIGINAL woocommerce_import.csv qui a la BONNE image par variation,
et corrige uniquement les URLs (domaine + chemin vers le bon dossier).
"""

import csv
from pathlib import Path

BASE_URL = "https://www.impexo.fr/product/IMPEXO-IPHONE%2017%20SERIES12-31"

def main():
    in_path = Path(__file__).parent / "woocommerce_import.csv"
    out_path = Path(__file__).parent / "woocommerce_import_images_correctes.csv"
    
    if not in_path.exists():
        print(f"ERREUR: Fichier introuvable : {in_path}")
        return
    
    with open(in_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    if not rows:
        print("ERREUR: CSV vide")
        return
    
    header = rows[0]
    try:
        images_idx = header.index("Images")
    except ValueError:
        print("ERREUR: Colonne Images introuvable")
        return
    
    for row in rows[1:]:
        if images_idx < len(row) and row[images_idx]:
            url = row[images_idx].strip()
            # Extraire le nom du fichier (ex: JOJO1015-1P.JPG)
            filename = url.split("/")[-1]
            row[images_idx] = f"{BASE_URL}/{filename}"
    
    with open(out_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    print("OK: Fichier genere avec les BONNES images par variation")
    print(f"  Source: {in_path}")
    print(f"  Sortie: {out_path}")
    print("  Les images sont celles du fichier original (une image specifique par variation).")

if __name__ == "__main__":
    main()
