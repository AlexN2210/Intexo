#!/usr/bin/env python3
"""
Script pour générer un CSV complet avec TOUTES les combinaisons Modèle × Couleur × Référence
selon les spécifications du client.
"""

import csv
from pathlib import Path

# Spécifications du client
SPECS_CLIENT = {
    "impexo-camera-protection": {
        "name": "Coque Protection Caméra Renforcée – Série iPhone 17",
        "short_desc": "Rebord surélevé autour du module caméra. Finesse élégante, prise en main confortable.",
        "desc": "Conçue pour protéger efficacement l'appareil au quotidien, cette coque intègre un rebord surélevé autour du module caméra afin de limiter les rayures et les impacts directs. Sa structure absorbe les chocs tout en conservant une finesse élégante et une prise en main confortable. Compatibilité par modèle : iPhone 17 : protection précise du module caméra ; iPhone 17 Air : coque légère adaptée au format affiné ; iPhone 17 Pro : protection renforcée pour module avancé ; iPhone 17 Pro Max : maintien optimal sur grand format. Mention légale : Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max. La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.",
        "references": ["JOJO1015-1", "JOJO1015-3", "JOJO1015-5", "JOJO1015-9", "JOJO1015-10", "JOJO1015-13", "JOJO1015-19"],
        "colors": ["Blanc", "Noir", "Vert", "Rose", "Bleu", "Rouge", "Gris", "Violet", "Argent", "Marron"],
        "prices": {"JOJO1015-1": "14.90", "JOJO1015-3": "17.90", "JOJO1015-5": "17.90", "JOJO1015-9": "22.90", "JOJO1015-10": "22.90", "JOJO1015-13": "24.90", "JOJO1015-19": "26.90"},
    },
    "impexo-transparent": {
        "name": "Coque Transparente Premium – Série iPhone 17",
        "short_desc": "Préserve le design d'origine. Protection discrète contre rayures et chocs.",
        "desc": "Idéale pour conserver le design d'origine, cette coque transparente protège contre les rayures et les chocs du quotidien tout en restant discrète et élégante. Mention légale : Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max. La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.",
        "references": ["JOJO1015-2", "JOJO1015-4"],
        "colors": ["Transparent", "Gris", "Jaune", "Violet"],
        "prices": {"JOJO1015-2": "14.90", "JOJO1015-4": "17.90"},
    },
    "impexo-luxury-transparent": {
        "name": "Coque Luxury Transparente – Série iPhone 17",
        "short_desc": "Transparence premium avec détails décoratifs raffinés. Protection fiable.",
        "desc": "Version transparente à finition premium avec détails décoratifs raffinés, alliant esthétique et protection fiable. Mention légale : Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max. La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.",
        "references": ["JOJO1015-24", "JOJO1015-25"],
        "colors": ["Argent", "Rose", "Bleu", "Violet", "Noir", "Or", "Rouge"],
        "prices": {"JOJO1015-24": "29.90", "JOJO1015-25": "29.90"},
    },
    "impexo-magnetic": {
        "name": "Coque Magnétique – Série iPhone 17",
        "short_desc": "Système magnétique intégré. Maintien stable avec accessoires compatibles.",
        "desc": "Équipée d'un système magnétique intégré, cette coque assure un maintien stable avec les accessoires compatibles tout en protégeant efficacement l'appareil. Note : certaines versions peuvent être compatibles MagSafe selon le design. Mention légale : Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max. La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.",
        "references": ["JOJO1015-6", "JOJO1015-11", "JOJO1015-21"],
        "colors": ["Noir", "Blanc", "Violet", "Bleu", "Vert sombre", "Or désert", "Jaune", "Fuchsia"],
        "prices": {"JOJO1015-6": "19.90", "JOJO1015-11": "22.90", "JOJO1015-21": "26.90"},
    },
    "impexo-luxury-metal": {
        "name": "Coque Luxury Metal Frame – Série iPhone 17",
        "short_desc": "Cadre à finition métallique. Protection structurelle renforcée.",
        "desc": "Dotée d'un cadre à finition métallique, cette coque offre une protection structurelle renforcée et un rendu haut de gamme. Mention légale : Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max. La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.",
        "references": ["JOJO1015-22", "JOJO1015-18", "JOJO1015-23"],
        "colors": ["Violet", "Gris", "Or désert", "Orange", "Argent", "Or rose", "Noir", "Vert sombre", "Marron", "Bleu"],
        "prices": {"JOJO1015-22": "17.90", "JOJO1015-18": "19.90", "JOJO1015-23": "29.90"},
    },
    "impexo-anti-slip-matte": {
        "name": "Coque Texture Antidérapante – Série iPhone 17",
        "short_desc": "Surface mate et texture antidérapante. Prise en main sûre.",
        "desc": "Surface mate et texture antidérapante pour une prise en main sûre et confortable au quotidien. Mention légale : Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max. La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.",
        "references": ["JOJO1015-12", "JOJO1015-15"],
        "colors": ["Noir", "Rose", "Violet", "Marron", "Bleu nuit"],
        "prices": {"JOJO1015-12": "24.90", "JOJO1015-15": "17.90"},
    },
    "impexo-jean": {
        "name": "Coque Effet Cuir / Jean – Série iPhone 17",
        "short_desc": "Finition texturée effet cuir / jean. Style distinctif, protection fiable.",
        "desc": "Finition texturée effet cuir / jean, alliant style distinctif et protection fiable. Mention légale : Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max. La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.",
        "references": ["JOJO1015-16"],
        "colors": ["Bleu denim", "Noir", "Gris", "Marron"],
        "prices": {"JOJO1015-16": "26.90"},
    },
    "impexo-pc-tpu": {
        "name": "Coque Renforcée PC + TPU – Série iPhone 17",
        "short_desc": "Association de matériaux résistants. Protection renforcée au quotidien.",
        "desc": "Association de matériaux résistants pour une protection renforcée contre les chocs et l'usure quotidienne. Mention légale : Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max. La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.",
        "references": ["JOJO1015-7", "JOJO1015-8", "JOJO1015-14", "JOJO1015-17", "JOJO1015-20"],
        "colors": ["Noir", "Vert", "Rose", "Violet", "Argent", "Vert sombre", "Doré", "Rouge", "Bleu", "Bordeaux", "Marron"],
        "prices": {"JOJO1015-7": "22.90", "JOJO1015-8": "22.90", "JOJO1015-14": "24.90", "JOJO1015-17": "26.90", "JOJO1015-20": "26.90"},
    },
}

MODELS = ["iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max"]
BASE_URL = "https://www.impexo.fr/product/IMPEXO-IPHONE%2017%20SERIES12-31"

def generate_sku(parent_sku, ref, model, color):
    """Génère un SKU pour une variation"""
    model_short = model.replace("iPhone 17 ", "").replace(" ", "-").lower()
    color_slug = color.lower().replace(" ", "-").replace("é", "e")
    return f"{parent_sku}--{ref.lower()}--{model_short}--{color_slug}"

def main():
    output_path = Path(__file__).parent / "woocommerce_import_complet.csv"
    
    # En-têtes CSV
    header = [
        "Type", "SKU", "Name", "Parent", "Published", "Regular price",
        "Attribute 1 name", "Attribute 1 value(s)", "Attribute 1 visible", "Attribute 1 global",
        "Attribute 2 name", "Attribute 2 value(s)", "Attribute 2 visible", "Attribute 2 global",
        "Attribute 3 name", "Attribute 3 value(s)", "Attribute 3 visible", "Attribute 3 global",
        "Short description", "Description", "Images", "material"
    ]
    
    rows = [header]
    
    # Générer les produits et variations
    for product_sku, specs in SPECS_CLIENT.items():
        # Produit parent (variable)
        models_str = ", ".join(MODELS)
        colors_str = ", ".join(specs["colors"])
        refs_str = ", ".join(specs["references"])
        
        # Image du produit parent (première référence)
        parent_image = f"{BASE_URL}/{specs['references'][0]}.JPG"
        
        parent_row = [
            "variable",
            product_sku,
            specs["name"],
            "",  # Parent
            "1",  # Published
            "",  # Regular price
            "Modèle",
            models_str,
            "1", "0",  # visible, global
            "Couleur",
            colors_str,
            "1", "0",  # visible, global
            "Référence",
            refs_str,
            "1", "0",  # visible, global
            specs["short_desc"],
            specs["desc"],
            parent_image,
            "",  # material
        ]
        rows.append(parent_row)
        
        # Générer TOUTES les variations : Modèle × Couleur × Référence
        for model in MODELS:
            for color in specs["colors"]:
                for ref in specs["references"]:
                    variation_sku = generate_sku(product_sku, ref, model, color)
                    price = specs["prices"][ref]
                    image_url = f"{BASE_URL}/{ref}.JPG"
                    
                    variation_row = [
                        "variation",
                        variation_sku,
                        "",  # Name (vide pour les variations)
                        product_sku,  # Parent
                        "1",  # Published
                        price,
                        "Modèle",
                        model,
                        "1", "0",
                        "Couleur",
                        color,
                        "1", "0",
                        "Référence",
                        ref,
                        "1", "0",
                        "",  # Short description
                        "",  # Description
                        image_url,
                        "",  # material
                    ]
                    rows.append(variation_row)
    
    # Écrire le CSV
    with open(output_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    total_variations = sum(len(MODELS) * len(specs["colors"]) * len(specs["references"]) for specs in SPECS_CLIENT.values())
    
    print("=" * 80)
    print("GENERATION DU CSV COMPLET")
    print("=" * 80)
    print()
    print(f"Produits generes: {len(SPECS_CLIENT)}")
    print(f"Variations totales: {total_variations}")
    print()
    print("Repartition par produit:")
    for product_sku, specs in SPECS_CLIENT.items():
        count = len(MODELS) * len(specs["colors"]) * len(specs["references"])
        print(f"  - {specs['name']}: {count} variations")
    print()
    print(f"OK: CSV sauvegarde : {output_path}")

if __name__ == "__main__":
    main()
