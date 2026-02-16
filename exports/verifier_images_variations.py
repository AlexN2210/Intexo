#!/usr/bin/env python3
"""
Script pour vérifier que les images correspondent bien aux variations dans le CSV.
"""

import csv
from pathlib import Path
from collections import defaultdict

def normalize(s):
    return (s or "").strip().lower().replace(" ", "").replace("-", "").replace("_", "")

def extract_ref_from_image_url(url):
    """Extrait la référence depuis l'URL de l'image"""
    if not url:
        return None
    # Exemple: https://www.impexo.fr/product/IMPEXO-IPHONE%2017%20SERIES12-31/JOJO1015-24.JPG
    # ou: JOJO1015-24.JPG
    filename = url.split('/')[-1]
    # Enlever l'extension
    ref = filename.split('.')[0]
    # Normaliser (enlever les suffixes comme -scaled, -1, etc.)
    ref = ref.split('-')[0] if '-' in ref and not ref.startswith('JOJO') else ref
    return ref.upper()

def main():
    csv_path = Path(__file__).parent / "woocommerce_import_corrige_final.csv"
    
    if not csv_path.exists():
        print(f"ERREUR: Fichier introuvable : {csv_path}")
        return
    
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
    name_idx = header.index("Name")
    parent_idx = header.index("Parent")
    attr1_name_idx = header.index("Attribute 1 name")
    attr1_value_idx = header.index("Attribute 1 value(s)")
    attr2_name_idx = header.index("Attribute 2 name")
    attr2_value_idx = header.index("Attribute 2 value(s)")
    attr3_name_idx = header.index("Attribute 3 name")
    attr3_value_idx = header.index("Attribute 3 value(s)")
    images_idx = header.index("Images")
    
    # Analyser les variations
    issues = []
    variations_by_parent = defaultdict(list)
    
    for row in data_rows:
        if row[type_idx].lower() == "variation":
            parent_sku = row[parent_idx] if parent_idx < len(row) else ""
            model = row[attr1_value_idx] if attr1_value_idx < len(row) else ""
            color = row[attr2_value_idx] if attr2_value_idx < len(row) else ""
            ref = row[attr3_value_idx] if attr3_value_idx < len(row) else ""
            image_url = row[images_idx] if images_idx < len(row) else ""
            
            # Extraire la référence de l'image
            image_ref = extract_ref_from_image_url(image_url)
            
            # Normaliser les références pour comparaison
            ref_normalized = normalize(ref)
            image_ref_normalized = normalize(image_ref) if image_ref else None
            
            # Vérifier la correspondance
            if ref and image_ref:
                if ref_normalized != image_ref_normalized:
                    issues.append({
                        'parent': parent_sku,
                        'model': model,
                        'color': color,
                        'ref': ref,
                        'image_url': image_url,
                        'image_ref': image_ref,
                        'issue': 'Reference mismatch'
                    })
            
            variations_by_parent[parent_sku].append({
                'model': model,
                'color': color,
                'ref': ref,
                'image_url': image_url,
                'image_ref': image_ref,
            })
    
    print("=" * 80)
    print("VERIFICATION DES IMAGES ET VARIATIONS")
    print("=" * 80)
    print()
    
    # Afficher les problèmes
    if issues:
        print(f"ATTENTION: {len(issues)} problemes detectes:")
        print()
        for issue in issues:
            print(f"Produit: {issue['parent']}")
            print(f"  Variation: {issue['model']} + {issue['color']}")
            print(f"  Reference attendue: {issue['ref']}")
            print(f"  Reference dans l'image: {issue['image_ref']}")
            print(f"  URL image: {issue['image_url']}")
            print()
    else:
        print("OK: Toutes les images correspondent aux references des variations")
        print()
    
    # Afficher un résumé par produit
    print("=" * 80)
    print("RESUME PAR PRODUIT")
    print("=" * 80)
    print()
    
    for parent_sku, variations in variations_by_parent.items():
        print(f"Produit: {parent_sku}")
        print(f"  {len(variations)} variations")
        
        # Vérifier les doublons d'images
        image_refs = {}
        for v in variations:
            if v['image_ref']:
                if v['image_ref'] not in image_refs:
                    image_refs[v['image_ref']] = []
                image_refs[v['image_ref']].append(f"{v['model']} + {v['color']}")
        
        duplicates = {ref: vars_list for ref, vars_list in image_refs.items() if len(vars_list) > 1}
        if duplicates:
            print(f"  ATTENTION: Images dupliquees:")
            for ref, vars_list in duplicates.items():
                print(f"    - {ref}: utilisee par {len(vars_list)} variations")
                for var_combo in vars_list:
                    print(f"      • {var_combo}")
        else:
            print(f"  OK: Chaque image est unique")
        
        print()

if __name__ == "__main__":
    main()
