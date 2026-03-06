#!/usr/bin/env python3
"""
Teste toutes les URLs d'images du CSV WooCommerce.
Usage: python scripts/test_images_csv.py [chemin/vers/fichier.csv]
Sans argument, utilise exports/woocommerce_import_images_correctes.csv
"""
import sys
import urllib.request
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("Installez pandas: pip install pandas")
    sys.exit(1)

# Racine du projet (parent du dossier scripts)
ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CSV = ROOT / "exports" / "woocommerce_import_images_correctes.csv"


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CSV
    csv_path = Path(csv_path)

    if not csv_path.exists():
        print(f"Fichier introuvable: {csv_path}")
        sys.exit(1)

    print(f"Lecture de: {csv_path}\n")

    df = pd.read_csv(csv_path, low_memory=False)

    if "Images" not in df.columns:
        print("Colonne 'Images' absente du CSV.")
        sys.exit(1)

    # Toutes les URLs: une cellule peut contenir "url1, url2, url3"
    urls = set()
    for val in df["Images"].dropna().astype(str):
        for part in val.split(","):
            u = part.strip()
            if u and (u.startswith("http://") or u.startswith("https://")):
                urls.add(u)

    urls = sorted(urls)
    total = len(urls)
    ok = 0
    ko = 0

    for url in urls:
        try:
            req = urllib.request.urlopen(url, timeout=10)
            status = req.getcode()
        except Exception as e:
            status = getattr(e, "code", None) or "ERR"
        if status == 200:
            ok += 1
            icon = "✅"
        else:
            ko += 1
            icon = "❌"
        name = url.split("/")[-1] if "/" in url else url
        print(f"{icon} {status} — {name}")

    print(f"\n--- Total: {ok}/{total} OK, {ko} erreur(s) ---")


if __name__ == "__main__":
    main()
