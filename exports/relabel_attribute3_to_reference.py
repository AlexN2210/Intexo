import csv
import re
from pathlib import Path


def version_to_ref(value: str) -> str:
    """
    Convert 'Version 01' -> 'JOJO1015-1'
    Keeps other values unchanged.
    """
    v = (value or "").strip()
    m = re.fullmatch(r"Version\s+(\d{1,2})", v, flags=re.IGNORECASE)
    if not m:
        return v
    n = int(m.group(1))
    return f"JOJO1015-{n}"


def main() -> None:
    exports_dir = Path(__file__).resolve().parent
    inputs = [
        exports_dir / "woocommerce_gammes_import_wc_no_images.csv",
        exports_dir / "woocommerce_gammes_import_wc_images_url.csv",
    ]

    for in_path in inputs:
        if not in_path.exists():
            raise SystemExit(f"Fichier introuvable: {in_path}")

        rows = list(csv.reader(in_path.read_text(encoding="utf-8-sig").splitlines()))
        if not rows:
            raise SystemExit(f"CSV vide: {in_path}")

        header = rows[0]
        data = rows[1:]

        def idx(name: str) -> int:
            try:
                return header.index(name)
            except ValueError:
                raise SystemExit(f"Colonne manquante '{name}' dans {in_path.name}")

        sku_i = idx("SKU")
        a3_name_i = idx("Attribute 3 name")
        a3_vals_i = idx("Attribute 3 value(s)")

        out_rows = [header]

        for r in data:
            rr = r.copy()

            # Attribute 3: rename to client wording + values are JOJO refs
            rr[a3_name_i] = "Référence"

            if rr[a3_vals_i]:
                # list (parents): "Version 01, Version 03" etc
                if "," in rr[a3_vals_i]:
                    parts = [p.strip() for p in rr[a3_vals_i].split(",")]
                    parts = [version_to_ref(p) for p in parts if p]
                    rr[a3_vals_i] = ", ".join(parts)
                else:
                    rr[a3_vals_i] = version_to_ref(rr[a3_vals_i])

            # SKU: replace --v01-- with --jojo1015-1--
            sku = rr[sku_i]
            if "--v" in sku:
                sku = re.sub(
                    r"--v(\d{1,2})--",
                    lambda m: f"--jojo1015-{int(m.group(1))}--",
                    sku,
                    flags=re.IGNORECASE,
                )
                rr[sku_i] = sku

            out_rows.append(rr)

        out_path = in_path.with_name(in_path.stem + "_refs.csv")
        with out_path.open("w", encoding="utf-8-sig", newline="") as f:
            w = csv.writer(f)
            w.writerows(out_rows)

        print(f"Wrote {out_path} ({len(out_rows)-1} lignes).")


if __name__ == "__main__":
    main()

