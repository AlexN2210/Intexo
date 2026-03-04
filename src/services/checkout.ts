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

export type BillingAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  postcode: string;
  country: string;
};

export type CreateOrderPayload = {
  items: Array<{ product_id: number; variation_id: number; quantity: number }>;
  billing_address?: BillingAddress;
  shipping_address?: BillingAddress;
  customer?: CheckoutCustomer;
  /** "stripe" → Store API crée le PaymentIntent, renvoie client_secret (pas de payment_data) */
  payment_method?: string;
  customer_note?: string;
};

/** Réponse WooPayments Store API : PaymentIntent à confirmer côté client */
export type PaymentResult = {
  payment_intent_client_secret?: string;
  payment_status?: string;
  redirect_url?: string;
};

export type CreateOrderResult = {
  order_id?: number;
  order_key?: string;
  payment_url?: string;
  status?: string;
  /** WooPayments : contient payment_intent_client_secret pour confirmCardPayment */
  payment_result?: PaymentResult;
};

/**
 * URL de l'API checkout.
 * Si le front est hébergé ailleurs que Vercel (ex: www.impexo.fr en statique), définir
 * VITE_CHECKOUT_API_BASE_URL avec l'URL du projet Vercel (ex: https://xxx.vercel.app).
 */
const CHECKOUT_API_BASE = (import.meta.env.VITE_CHECKOUT_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
const CHECKOUT_API_URL = CHECKOUT_API_BASE ? `${CHECKOUT_API_BASE}/api/checkout/create-order` : "/api/checkout/create-order";
const CONFIRM_ORDER_URL = CHECKOUT_API_BASE ? `${CHECKOUT_API_BASE}/api/checkout/confirm-order` : "/api/checkout/confirm-order";

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

/** Après confirmCardPayment succès : vérifie le PaymentIntent côté WordPress et passe la commande en processing */
export async function confirmOrderAfterPayment(orderId: number, paymentIntentId: string): Promise<{ success: boolean; order_id: number; status?: string }> {
  const res = await fetch(CONFIRM_ORDER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, payment_intent_id: paymentIntentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? err?.error ?? `Confirmation failed: ${res.status}`);
  }
  return res.json();
}
