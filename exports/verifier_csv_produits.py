#!/usr/bin/env python3
"""
Script pour vérifier que le CSV est correct et qu'il n'y a pas de mélange entre produits.
"""

import csv
from pathlib import Path
from collections import defaultdict

def normalize(s):
    return (s or "").strip().lower().replace(" ", "").replace("-", "")

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
    
    # Séparer produits parents et variations
    parents = {}
    variations_by_parent = defaultdict(list)
    
    for row in data_rows:
        if row[type_idx].lower() == "variable":
            sku = row[sku_idx]
            parents[sku] = {
                'name': row[name_idx],
                'sku': sku,
                'attr1': row[attr1_value_idx] if attr1_value_idx < len(row) else "",
                'attr2': row[attr2_value_idx] if attr2_value_idx < len(row) else "",
                'attr3': row[attr3_value_idx] if attr3_value_idx < len(row) else "",
            }
        elif row[type_idx].lower() == "variation":
            parent_sku = row[parent_idx] if parent_idx < len(row) else ""
            if parent_sku:
                variations_by_parent[parent_sku].append({
                    'sku': row[sku_idx],
                    'model': row[attr1_value_idx] if attr1_value_idx < len(row) else "",
                    'color': row[attr2_value_idx] if attr2_value_idx < len(row) else "",
                    'ref': row[attr3_value_idx] if attr3_value_idx < len(row) else "",
                    'image': row[images_idx] if images_idx < len(row) else "",
                })
    
    print(f"Analyse de {len(parents)} produits parents et {sum(len(v) for v in variations_by_parent.values())} variations\n")
    
    # Vérifier chaque produit parent
    all_issues = []
    
    for parent_sku, parent_info in parents.items():
        variations = variations_by_parent.get(parent_sku, [])
        print(f"PRODUIT: {parent_info['name']} ({parent_sku})")
        print(f"   {len(variations)} variations")
        
        # Vérifier les doublons Modèle + Couleur
        combos = defaultdict(list)
        for v in variations:
            key = (normalize(v['model']), normalize(v['color']))
            combos[key].append(v)
        
        duplicates = {k: v for k, v in combos.items() if len(v) > 1}
        if duplicates:
            print(f"   ATTENTION: DOUBLONS detectes:")
            for (model, color), vars_list in duplicates.items():
                print(f"      - {model} + {color}: {len(vars_list)} variations")
                for v in vars_list:
                    img_name = v['image'].split('/')[-1] if v['image'] else 'Pas d\'image'
                    print(f"        • {v['sku']} (Ref: {v['ref']}, Image: {img_name})")
            all_issues.append(f"{parent_info['name']}: {len(duplicates)} combinaisons en double")
        else:
            print(f"   OK: Aucun doublon Modele + Couleur")
        
        # Vérifier que les références correspondent aux attributs du parent
        parent_refs = set()
        if parent_info['attr3']:
            parent_refs = {r.strip() for r in parent_info['attr3'].split(',')}
        
        variation_refs = {v['ref'] for v in variations if v['ref']}
        missing_refs = variation_refs - parent_refs
        extra_refs = parent_refs - variation_refs
        
        if missing_refs:
            print(f"   ATTENTION: References dans variations mais pas dans parent: {missing_refs}")
        if extra_refs:
            print(f"   ATTENTION: References dans parent mais pas dans variations: {extra_refs}")
        
        print()
    
    # Résumé
    print("=" * 60)
    if all_issues:
        print(f"ATTENTION: {len(all_issues)} produits avec des problemes:")
        for issue in all_issues:
            print(f"  - {issue}")
    else:
        print("OK: Aucun probleme detecte dans le CSV")
    
    # Vérifier les images
    print("\n" + "=" * 60)
    print("Vérification des images:")
    all_images = set()
    for variations_list in variations_by_parent.values():
        for v in variations_list:
            if v['image']:
                filename = v['image'].split('/')[-1]
                all_images.add(filename)
    
    print(f"  {len(all_images)} images uniques référencées")
    print(f"  Exemples: {', '.join(list(all_images)[:5])}")

if __name__ == "__main__":
    main()
