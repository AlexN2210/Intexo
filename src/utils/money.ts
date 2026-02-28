/**
 * Parse un prix en euros (nombre).
 * - Chaîne ou nombre de l'API produits WooCommerce = déjà en euros (ex. "29.00").
 * - Nombre en centimes (Store API) : passer après division par 100 côté appelant si besoin.
 * On ne divise plus par 100 ici pour que l’affichage produit et panier soit correct.
 */
export function parsePrice(price: string | number | null | undefined): number {
  if (typeof price === "number") {
    return Number.isFinite(price) ? price : 0;
  }
  if (!price) return 0;
  const n = Number(String(price).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function formatEUR(value: number): string {
  return eur.format(value);
}

