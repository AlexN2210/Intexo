#!/usr/bin/env python3
"""
Script pour corriger les images dans le CSV : chaque référence doit utiliser son image de base.
Exemple : toutes les variations avec référence JOJO1015-24 doivent utiliser JOJO1015-24.JPG
"""

import csv
from pathlib import Path
import re

def extract_reference_from_sku(sku):
    """Extrait la référence depuis le SKU de la variation"""
    # Exemple: impexo-luxury-transparent--jojo1015-24--17--argent
    # On cherche le pattern JOJO1015-XX
    match = re.search(r'JOJO1015-(\d+)', sku.upper())
    if match:
        return f"JOJO1015-{match.group(1)}"
    return None

def get_base_image_url(reference):
    """Génère l'URL de l'image de base pour une référence"""
    if not reference:
        return None
    base_url = "https://www.impexo.fr/product/IMPEXO-IPHONE%2017%20SERIES12-31"
    return f"{base_url}/{reference}.JPG"

def main():
    csv_path = Path(__file__).parent / "woocommerce_import_corrige_final.csv"
    
    if not csv_path.exists():
        print(f"ERREUR: Fichier introuvable : {csv_path}")
        return
    
    # Lire le CSV
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    if not rows:
        print("ERREUR: CSV vide")
        return
    
    header = rows[0]
    data_rows = rows[1:]
    
    # Indices des colonnes
    type_idx = header.index("Type")
    sku_idx = header.index("SKU")
    attr3_name_idx = header.index("Attribute 3 name")
    attr3_value_idx = header.index("Attribute 3 value(s)")
    images_idx = header.index("Images")
    
    print("Correction des images par reference...")
    print("=" * 80)
    
    corrections = []
    
    for i, row in enumerate(data_rows, start=2):  # start=2 car ligne 1 = header
        if row[type_idx].lower() == "variation":
            sku = row[sku_idx]
            ref_attr = row[attr3_value_idx] if attr3_value_idx < len(row) else ""
            current_image = row[images_idx] if images_idx < len(row) else ""
            
            # Extraire la référence depuis le SKU ou l'attribut
            ref_from_sku = extract_reference_from_sku(sku)
            ref = ref_from_sku or ref_attr.strip()
            
            if ref:
                # Générer l'URL de l'image de base
                base_image_url = get_base_image_url(ref)
                
                if base_image_url and current_image != base_image_url:
                    old_image = current_image.split('/')[-1] if current_image else 'Pas d\'image'
                    new_image = base_image_url.split('/')[-1]
                    
                    print(f"Ligne {i}: {sku}")
                    print(f"  Reference: {ref}")
                    print(f"  Ancienne image: {old_image}")
                    print(f"  Nouvelle image: {new_image}")
                    print()
                    
                    # Corriger l'image
                    row[images_idx] = base_image_url
                    corrections.append({
                        'line': i,
                        'sku': sku,
                        'ref': ref,
                        'old': old_image,
                        'new': new_image
                    })
    
    print("=" * 80)
    print(f"{len(corrections)} corrections effectuees")
    print()
    
    # Écrire le CSV corrigé
    output_rows = [header] + data_rows
    
    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(output_rows)
    
    print(f"OK: CSV corrige sauvegarde : {csv_path}")
    print(f"  - {len(data_rows)} lignes traitees")
    print(f"  - {len(corrections)} images corrigees")
    print()
    print("Vous pouvez maintenant reimporter le fichier dans WooCommerce.")

if __name__ == "__main__":
    main()
