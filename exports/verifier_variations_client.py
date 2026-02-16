#!/usr/bin/env python3
"""
Script pour vérifier que toutes les variations correspondent exactement aux spécifications du client.
"""

import csv
from pathlib import Path
from collections import defaultdict

# Spécifications du client
SPECS_CLIENT = {
    "impexo-camera-protection": {
        "name": "Coque Protection Caméra Renforcée – Série iPhone 17",
        "references": ["JOJO1015-1", "JOJO1015-3", "JOJO1015-5", "JOJO1015-9", "JOJO1015-10", "JOJO1015-13", "JOJO1015-19"],
        "colors": ["Blanc", "Noir", "Vert", "Rose", "Bleu", "Rouge", "Gris", "Violet", "Argent", "Marron"],
    },
    "impexo-transparent": {
        "name": "Coque Transparente Premium – Série iPhone 17",
        "references": ["JOJO1015-2", "JOJO1015-4"],
        "colors": ["Transparent", "Gris", "Jaune", "Violet"],
    },
    "impexo-luxury-transparent": {
        "name": "Coque Luxury Transparente – Série iPhone 17",
        "references": ["JOJO1015-24", "JOJO1015-25"],
        "colors": ["Argent", "Rose", "Bleu", "Violet", "Noir", "Or", "Rouge"],
    },
    "impexo-magnetic": {
        "name": "Coque Magnétique – Série iPhone 17",
        "references": ["JOJO1015-6", "JOJO1015-11", "JOJO1015-21"],
        "colors": ["Noir", "Blanc", "Violet", "Bleu", "Vert sombre", "Or désert", "Jaune", "Fuchsia"],
    },
    "impexo-luxury-metal": {
        "name": "Coque Luxury Metal Frame – Série iPhone 17",
        "references": ["JOJO1015-22", "JOJO1015-18", "JOJO1015-23"],
        "colors": ["Violet", "Gris", "Or désert", "Orange", "Argent", "Or rose", "Noir", "Vert sombre", "Marron", "Bleu"],
    },
    "impexo-anti-slip-matte": {
        "name": "Coque Texture Antidérapante – Série iPhone 17",
        "references": ["JOJO1015-15", "JOJO1015-12"],
        "colors": ["Noir", "Rose", "Violet", "Marron", "Bleu nuit"],
    },
    "impexo-jean": {
        "name": "Coque Effet Cuir / Jean – Série iPhone 17",
        "references": ["JOJO1015-16"],
        "colors": ["Bleu denim", "Noir", "Gris", "Marron"],
    },
    "impexo-pc-tpu": {
        "name": "Coque Renforcée PC + TPU – Série iPhone 17",
        "references": ["JOJO1015-7", "JOJO1015-8", "JOJO1015-14", "JOJO1015-17", "JOJO1015-20"],
        "colors": ["Noir", "Vert", "Rose", "Violet", "Argent", "Vert sombre", "Doré", "Rouge", "Bleu", "Bordeaux", "Marron"],
    },
}

MODELS = ["iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max"]

def normalize_color(color):
    """Normalise les couleurs pour comparaison"""
    return color.strip().lower().replace(" ", "").replace("-", "")

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
    name_idx = header.index("Name")
    parent_idx = header.index("Parent")
    attr1_value_idx = header.index("Attribute 1 value(s)")
    attr2_value_idx = header.index("Attribute 2 value(s)")
    attr3_value_idx = header.index("Attribute 3 value(s)")
    
    # Analyser les produits et variations
    products = {}
    variations_by_product = defaultdict(list)
    
    for row in data_rows:
        if row[type_idx].lower() == "variable":
            sku = row[sku_idx]
            products[sku] = {
                'name': row[name_idx],
                'sku': sku,
            }
        elif row[type_idx].lower() == "variation":
            parent_sku = row[parent_idx] if parent_idx < len(row) else ""
            model = row[attr1_value_idx] if attr1_value_idx < len(row) else ""
            color = row[attr2_value_idx] if attr2_value_idx < len(row) else ""
            ref = row[attr3_value_idx] if attr3_value_idx < len(row) else ""
            
            variations_by_product[parent_sku].append({
                'model': model,
                'color': color,
                'ref': ref,
            })
    
    print("=" * 80)
    print("VERIFICATION DES VARIATIONS SELON LES SPECIFICATIONS CLIENT")
    print("=" * 80)
    print()
    
    all_issues = []
    
    # Vérifier chaque produit
    for product_sku, product_info in products.items():
        if product_sku not in SPECS_CLIENT:
            print(f"ATTENTION: Produit {product_sku} non trouve dans les specs client")
            continue
        
        specs = SPECS_CLIENT[product_sku]
        variations = variations_by_product.get(product_sku, [])
        
        print(f"PRODUIT: {specs['name']} ({product_sku})")
        print(f"  Variations dans CSV: {len(variations)}")
        
        # Construire les combinaisons attendues
        expected_combos = set()
        for model in MODELS:
            for color in specs['colors']:
                for ref in specs['references']:
                    expected_combos.add((model, normalize_color(color), ref))
        
        # Construire les combinaisons présentes
        actual_combos = set()
        for v in variations:
            combo = (v['model'], normalize_color(v['color']), v['ref'])
            actual_combos.add(combo)
        
        # Vérifier les références
        refs_in_csv = {v['ref'] for v in variations if v['ref']}
        refs_expected = set(specs['references'])
        
        missing_refs = refs_expected - refs_in_csv
        extra_refs = refs_in_csv - refs_expected
        
        if missing_refs:
            print(f"  ATTENTION: References manquantes: {missing_refs}")
            all_issues.append(f"{product_sku}: Références manquantes {missing_refs}")
        
        if extra_refs:
            print(f"  ATTENTION: References en trop: {extra_refs}")
            all_issues.append(f"{product_sku}: Références en trop {extra_refs}")
        
        # Vérifier les combinaisons
        missing_combos = expected_combos - actual_combos
        extra_combos = actual_combos - expected_combos
        
        if missing_combos:
            print(f"  ATTENTION: {len(missing_combos)} combinaisons manquantes")
            for combo in list(missing_combos)[:5]:  # Afficher les 5 premières
                print(f"    - {combo[0]} + {combo[1]} + {combo[2]}")
            if len(missing_combos) > 5:
                print(f"    ... et {len(missing_combos) - 5} autres")
            all_issues.append(f"{product_sku}: {len(missing_combos)} combinaisons manquantes")
        
        if extra_combos:
            print(f"  ATTENTION: {len(extra_combos)} combinaisons en trop")
            for combo in list(extra_combos)[:5]:  # Afficher les 5 premières
                print(f"    - {combo[0]} + {combo[1]} + {combo[2]}")
            if len(extra_combos) > 5:
                print(f"    ... et {len(extra_combos) - 5} autres")
            all_issues.append(f"{product_sku}: {len(extra_combos)} combinaisons en trop")
        
        if not missing_refs and not extra_refs and not missing_combos and not extra_combos:
            print(f"  OK: Toutes les variations sont correctes")
        
        print()
    
    # Résumé
    print("=" * 80)
    if all_issues:
        print(f"ATTENTION: {len(all_issues)} problemes detectes:")
        for issue in all_issues:
            print(f"  - {issue}")
    else:
        print("OK: Toutes les variations correspondent aux specifications client")

if __name__ == "__main__":
    main()
