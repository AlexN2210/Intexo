/**
 * Création de commande depuis le panier local (localStorage).
 * Un seul appel à WordPress au moment du checkout → pas de 429.
 * POST vers l’endpoint personnalisé WordPress qui crée la commande (wc_create_order) et renvoie l’URL Stripe.
 */

export type CheckoutCustomer = {
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
    email: string;
    phone?: string;
    company?: string;
  };
  shipping?: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
    company?: string;
  };
};

export type CreateOrderPayload = {
  items: Array<{ product_id: number; variation_id: number; quantity: number }>;
  customer: CheckoutCustomer;
  payment_method?: string; // ex: "stripe"
  customer_note?: string;
};

export type CreateOrderResult = {
  order_id: number;
  order_key?: string;
  payment_url?: string; // URL Stripe Checkout à ouvrir
  status?: string;
};

/** URL du proxy checkout (Vercel). Ne pas utiliser www.impexo.fr → 404. */
const CHECKOUT_API_URL =
  import.meta.env.VITE_CHECKOUT_API_ORIGIN?.trim()
    ? `${import.meta.env.VITE_CHECKOUT_API_ORIGIN.replace(/\/+$/, "")}/api/checkout/create-order`
    : "https://intexo-git-main-alexn2210s-projects.vercel.app/api/checkout/create-order";

export async function createOrderFromCart(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const url = CHECKOUT_API_URL;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message ?? `Checkout failed: ${res.status}`);
  }
  return res.json();
}
