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

/** WooCommerce Payments : payment_method_id issu de stripe.createPaymentMethod */
export type PaymentDataItem = { key: string; value: string };

export type CreateOrderPayload = {
  items: Array<{ product_id: number; variation_id: number; quantity: number }>;
  /** WooPayments : billing_address à la racine */
  billing_address?: BillingAddress;
  /** Ancien format (optionnel) */
  customer?: CheckoutCustomer;
  payment_method?: string; // "woocommerce_payments" pour WooPayments
  /** Stripe : [{ key: "payment_method_id", value: "pm_xxx" }] */
  payment_data?: PaymentDataItem[];
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
