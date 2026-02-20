export function parsePrice(price: string | number | null | undefined): number {
  if (typeof price === "number") {
    // L'API WooCommerce Store Cart retourne les prix en centimes
    // Diviser par 100 pour convertir en euros
    return Number.isFinite(price) ? price / 100 : 0;
  }
  if (!price) return 0;
  const n = Number(String(price).replace(",", "."));
  // L'API WooCommerce Store Cart retourne les prix en centimes
  // Diviser par 100 pour convertir en euros
  return Number.isFinite(n) ? n / 100 : 0;
}

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function formatEUR(value: number): string {
  return eur.format(value);
}

