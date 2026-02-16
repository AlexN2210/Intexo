#!/usr/bin/env python3
"""
Script pour remplacer les URLs placeholder par le vrai domaine WordPress.
"""

import csv
import sys
from pathlib import Path

def main():
    # Domaine WordPress réel
    REAL_DOMAIN = "www.impexo.fr"
    PLACEHOLDER = "TON-DOMAINE.TLD"
    
    in_path = Path(__file__).parent / "woocommerce_import_corrige.csv"
    out_path = Path(__file__).parent / "woocommerce_import_corrige_final.csv"
    
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
    
    print(f"Remplacement des URLs placeholder par {REAL_DOMAIN}...")
    
    # Remplacer les URLs
    replaced_count = 0
    for row in data_rows:
        if images_idx < len(row) and row[images_idx]:
            old_url = row[images_idx]
            if PLACEHOLDER in old_url:
                new_url = old_url.replace(PLACEHOLDER, REAL_DOMAIN)
                row[images_idx] = new_url
                replaced_count += 1
                if replaced_count <= 5:  # Afficher les 5 premiers
                    print(f"  {old_url} -> {new_url}")
    
    print(f"\n{replaced_count} URLs remplacees")
    
    # Écrire le CSV corrigé
    out_rows = [header] + data_rows
    
    with open(out_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(out_rows)
    
    print(f"\nOK: CSV final cree : {out_path}")
    print(f"  - {len(data_rows)} lignes traitees")
    print(f"  - {replaced_count} URLs d'images corrigees")

if __name__ == "__main__":
    main()
