import csv
import sys
from pathlib import Path
from urllib.parse import quote


def main() -> None:
    """
    Usage:
      python apply_images_base_url.py <base_url> [input_csv] [output_csv]

    - base_url: e.g. https://example.com/wp-content/uploads/impexo/
      (with or without trailing slash)
    - input_csv defaults to woocommerce_gammes_import_wc_no_images_refs.csv
    - output_csv defaults to woocommerce_gammes_import_wc_images_refs.csv
    """

    if len(sys.argv) < 2:
        raise SystemExit(
            "Usage: python apply_images_base_url.py <base_url> [input_csv] [output_csv]\n"
            "Example: python apply_images_base_url.py https://example.com/wp-content/uploads/impexo/"
        )

    base_url = sys.argv[1].strip()
    if not base_url:
        raise SystemExit("base_url vide.")
    if not base_url.endswith("/"):
        base_url += "/"

    exports_dir = Path(__file__).resolve().parent
    in_path = Path(sys.argv[2]) if len(sys.argv) >= 3 else exports_dir / "woocommerce_gammes_import_wc_no_images_refs.csv"
    out_path = Path(sys.argv[3]) if len(sys.argv) >= 4 else exports_dir / "woocommerce_gammes_import_wc_images_refs.csv"

    rows = list(csv.reader(in_path.read_text(encoding="utf-8-sig").splitlines()))
    if not rows:
        raise SystemExit(f"CSV vide: {in_path}")

    header = rows[0]
    if "Images" not in header:
        raise SystemExit("Colonne 'Images' introuvable.")
    img_idx = header.index("Images")
    
    # Find attribute columns
    attr3_name_idx = None
    attr3_value_idx = None
    attr1_value_idx = None
    
    for i, col in enumerate(header):
        if col == "Attribute 3 name":
            attr3_name_idx = i
        elif col == "Attribute 3 value(s)":
            attr3_value_idx = i
        elif col == "Attribute 1 value(s)":
            attr1_value_idx = i

    out_rows = [header]
    for r in rows[1:]:
        rr = r.copy()
        val = (rr[img_idx] if img_idx < len(rr) else "").strip()

        # If empty, try to infer from attributes (Référence + Modèle)
        if not val and attr3_value_idx is not None and attr1_value_idx is not None:
            ref = (rr[attr3_value_idx] if attr3_value_idx < len(rr) else "").strip()
            model = (rr[attr1_value_idx] if attr1_value_idx < len(rr) else "").strip()
            
            if ref and model:
                # Normalize reference (JOJO1015-X)
                ref = ref.upper().strip()
                
                # Map model to filename suffix
                model_lower = model.lower()
                if "air" in model_lower:
                    val = f"{ref}AIR.JPG"
                elif "pro max" in model_lower:
                    val = f"{ref}PM.JPG"
                elif "pro" in model_lower:
                    val = f"{ref}P.JPG"
                elif "iphone 17" in model_lower and "pro" not in model_lower and "air" not in model_lower:
                    val = f"{ref}.JPG"

        if val:
            # URL-encode filename (spaces, accents, etc.)
            rr[img_idx] = base_url + quote(val)
        out_rows.append(rr)

    with out_path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerows(out_rows)

    print(f"Wrote {out_path} ({len(out_rows)-1} lignes).")


if __name__ == "__main__":
    main()

