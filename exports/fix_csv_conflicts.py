#!/usr/bin/env python3
"""
Script pour corriger les conflits dans le CSV WooCommerce.

Problème : Plusieurs variations avec la même combinaison Modèle + Couleur
Solution : Garder une seule variation par combinaison Modèle + Couleur par produit parent
"""

import csv
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

def normalize_value(s: str) -> str:
    """Normalise une valeur pour la comparaison."""
    return (s or "").strip().lower().replace(" ", "").replace("-", "")

def extract_variation_key(row: List[str], header: List[str]) -> Tuple[str, str, str]:
    """Extrait la clé unique d'une variation : (parent_sku, model, color)."""
    try:
        parent_idx = header.index("Parent")
        attr1_name_idx = header.index("Attribute 1 name")
        attr1_value_idx = header.index("Attribute 1 value(s)")
        attr2_name_idx = header.index("Attribute 2 name")
        attr2_value_idx = header.index("Attribute 2 value(s)")
        
        parent = row[parent_idx] if parent_idx < len(row) else ""
        model = row[attr1_value_idx] if attr1_value_idx < len(row) else ""
        color = row[attr2_value_idx] if attr2_value_idx < len(row) else ""
        
        return (parent, normalize_value(model), normalize_value(color))
    except (ValueError, IndexError):
        return ("", "", "")

def main():
    in_path = Path(__file__).parent / "woocommerce_import.csv"
    out_path = Path(__file__).parent / "woocommerce_import_corrige.csv"
    
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
    
    print(f"Analyse de {len(data_rows)} lignes...")
    
    # Séparer les produits parents et les variations
    parent_rows = []
    variation_rows = []
    
    type_idx = header.index("Type") if "Type" in header else -1
    
    for row in data_rows:
        if type_idx >= 0 and type_idx < len(row):
            if row[type_idx].lower() == "variable":
                parent_rows.append(row)
            elif row[type_idx].lower() == "variation":
                variation_rows.append(row)
        else:
            # Si pas de colonne Type, déterminer par la présence de Parent
            parent_idx = header.index("Parent") if "Parent" in header else -1
            if parent_idx >= 0 and parent_idx < len(row):
                if not row[parent_idx] or row[parent_idx].strip() == "":
                    parent_rows.append(row)
                else:
                    variation_rows.append(row)
    
    print(f"  - {len(parent_rows)} produits parents")
    print(f"  - {len(variation_rows)} variations")
    
    # Analyser les conflits
    variation_by_key: Dict[Tuple[str, str, str], List[List[str]]] = defaultdict(list)
    
    for row in variation_rows:
        key = extract_variation_key(row, header)
        if key[0]:  # Si parent existe
            variation_by_key[key].append(row)
    
    # Identifier les conflits
    conflicts = {k: v for k, v in variation_by_key.items() if len(v) > 1}
    
    if conflicts:
        print(f"\nATTENTION: {len(conflicts)} conflits detectes (meme Modele + Couleur avec references differentes):")
        for (parent, model, color), variations in list(conflicts.items())[:10]:  # Afficher les 10 premiers
            ref_idx = header.index("Attribute 3 value(s)") if "Attribute 3 value(s)" in header else -1
            refs = []
            for v in variations:
                if ref_idx >= 0 and ref_idx < len(v):
                    refs.append(v[ref_idx])
            print(f"  - {parent}: {model} + {color} -> {len(variations)} variations ({', '.join(refs[:3])}...)")
        if len(conflicts) > 10:
            print(f"  ... et {len(conflicts) - 10} autres conflits")
    else:
        print("\nOK: Aucun conflit detecte")
    
    # Créer le CSV corrigé
    # Pour chaque conflit, garder seulement la première variation (ou celle avec la référence la plus récente)
    corrected_variations = []
    kept_variations = set()
    
    for row in variation_rows:
        key = extract_variation_key(row, header)
        
        if key in conflicts:
            # Si c'est un conflit, garder seulement la première occurrence
            if key not in kept_variations:
                corrected_variations.append(row)
                kept_variations.add(key)
                
                # Afficher quelle variation est gardée
                ref_idx = header.index("Attribute 3 value(s)") if "Attribute 3 value(s)" in header else -1
                sku_idx = header.index("SKU") if "SKU" in header else -1
                ref = row[ref_idx] if ref_idx >= 0 and ref_idx < len(row) else "?"
                sku = row[sku_idx] if sku_idx >= 0 and sku_idx < len(row) else "?"
                print(f"  Gardee: {sku} (Ref: {ref})")
        else:
            # Pas de conflit, garder la variation
            corrected_variations.append(row)
    
    # Écrire le CSV corrigé
    out_rows = [header] + parent_rows + corrected_variations
    
    with open(out_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(out_rows)
    
    removed_count = len(variation_rows) - len(corrected_variations)
    print(f"\nOK: CSV corrige cree : {out_path}")
    print(f"  - {len(parent_rows)} produits parents")
    print(f"  - {len(corrected_variations)} variations ({removed_count} supprimees)")
    
    if conflicts:
        print(f"\nATTENTION: {len(conflicts)} combinaisons Modele + Couleur avaient plusieurs references.")
        print("   Seule la premiere reference a ete conservee pour chaque combinaison.")
        print("   Verifiez manuellement si d'autres references doivent etre ajoutees.")

if __name__ == "__main__":
    main()
