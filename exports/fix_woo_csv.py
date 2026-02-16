import csv
from pathlib import Path

IN_PATH = Path(__file__).with_name("woocommerce_gammes_import.csv")
OUT_PATH = Path(__file__).with_name("woocommerce_gammes_import_wc.csv")


def main() -> None:
    text = IN_PATH.read_text(encoding="utf-8")
    rows = list(csv.reader(text.splitlines()))
    if not rows:
        raise SystemExit("CSV vide.")

    header = rows[0]
    data = rows[1:]

    # WooCommerce CSV importer behaves best when Attribute X global is provided.
    # We force attributes to be *custom* (not global taxonomy) by setting global=0.
    def inject_global_columns(h: list[str]) -> list[str]:
        out: list[str] = []
        i = 0
        while i < len(h):
            col = h[i]
            out.append(col)
            if col.endswith(" visible") and col.startswith("Attribute "):
                out.append(col.replace(" visible", " global"))
            i += 1
        return out

    out_header = inject_global_columns(header)

    visible_to_global_idx = {}
    for idx, col in enumerate(out_header):
        if col.endswith(" visible") and col.startswith("Attribute "):
            visible_to_global_idx[idx + 1] = True  # the injected one

    # map old index -> new index shift
    # we'll build row by scanning header similarly
    def transform_row(r: list[str]) -> list[str]:
        out: list[str] = []
        for i, col in enumerate(header):
            out.append(r[i] if i < len(r) else "")
            if col.endswith(" visible") and col.startswith("Attribute "):
                out.append("0")
        # pad/truncate to header length
        if len(out) < len(out_header):
            out.extend([""] * (len(out_header) - len(out)))
        if len(out) > len(out_header):
            out = out[: len(out_header)]
        return out

    out_rows = [out_header] + [transform_row(r) for r in data]

    # Write with UTF-8 BOM for maximum compatibility on Windows/Woo importers
    with OUT_PATH.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerows(out_rows)

    print(f"Wrote {OUT_PATH} with {len(out_rows)-1} data rows.")


if __name__ == "__main__":
    main()

