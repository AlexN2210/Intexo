export function parsePrice(price: string | number | null | undefined): number {
  if (typeof price === "number") return Number.isFinite(price) ? price : 0;
  if (!price) return 0;
  const n = Number(String(price).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function formatEUR(value: number): string {
  return eur.format(value);
}

