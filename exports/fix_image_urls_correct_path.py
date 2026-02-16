#!/usr/bin/env python3
"""
Script pour corriger les URLs d'images avec le bon chemin.
Les images sont dans /product/IMPEXO-IPHONE%2017%20SERIES12-31/ et non dans /wp-content/uploads/impexo/
"""

import csv
from pathlib import Path
import re

def main():
    # Chemin correct des images
    CORRECT_BASE_URL = "https://www.impexo.fr/product/IMPEXO-IPHONE%2017%20SERIES12-31"
    WRONG_BASE_URL = "https://www.impexo.fr/wp-content/uploads/impexo"
    
    in_path = Path(__file__).parent / "woocommerce_import_corrige_final.csv"
    out_path = Path(__file__).parent / "woocommerce_import_corrige_final.csv"  # Écraser le fichier
    
    if not in_path.exists():
        print(f"ERREUR: Fichier introuvable : {in_path}")
        return
    
    # Lire le CSV
    with open(in_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    if not rows:
        print("ERREUR: CSV vide")
        return
    
    header = rows[0]
    data_rows = rows[1:]
    
    # Trouver l'index de la colonne Images
    try:
        images_idx = header.index("Images")
    except ValueError:
        print("ERREUR: Colonne 'Images' introuvable")
        return
    
    print(f"Correction des URLs d'images...")
    print(f"Ancien chemin: {WRONG_BASE_URL}")
    print(f"Nouveau chemin: {CORRECT_BASE_URL}")
    
    # Remplacer les URLs
    replaced_count = 0
    for row in data_rows:
        if images_idx < len(row) and row[images_idx]:
            old_url = row[images_idx]
            if WRONG_BASE_URL in old_url:
                # Extraire le nom du fichier (ex: JOJO1015-1P.JPG)
                filename = old_url.split('/')[-1]
                new_url = f"{CORRECT_BASE_URL}/{filename}"
                row[images_idx] = new_url
                replaced_count += 1
                if replaced_count <= 5:  # Afficher les 5 premiers
                    print(f"  {old_url}")
                    print(f"  -> {new_url}")
    
    print(f"\n{replaced_count} URLs corrigees")
    
    # Écrire le CSV corrigé
    out_rows = [header] + data_rows
    
    with open(out_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(out_rows)
    
    print(f"\nOK: CSV corrige sauvegarde : {out_path}")
    print(f"  - {len(data_rows)} lignes traitees")
    print(f"  - {replaced_count} URLs d'images corrigees")
    print(f"\nVous pouvez maintenant reimporter le fichier dans WooCommerce.")

if __name__ == "__main__":
    main()
