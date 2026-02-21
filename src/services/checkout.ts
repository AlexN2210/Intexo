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

/**
 * URL du proxy checkout. Doit pointer vers le projet Vercel (qui expose /api/checkout/create-order),
 * pas vers www.impexo.fr si ce domaine sert WordPress → 404.
 * En prod : définir VITE_CHECKOUT_API_ORIGIN (ex. https://www.impexo.fr si le front est sur Vercel avec ce domaine).
 * En preview Vercel : ex. https://intexo-git-main-alexn2210s-projects.vercel.app
 */
const getCheckoutApiUrl = (): string => {
  const envOrigin = import.meta.env.VITE_CHECKOUT_API_ORIGIN as string | undefined;
  const origin =
    envOrigin?.trim() ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const base = origin.replace(/\/+$/, "");
  return base ? `${base}/api/checkout/create-order` : "/api/checkout/create-order";
};

export async function createOrderFromCart(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const url = getCheckoutApiUrl();
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
