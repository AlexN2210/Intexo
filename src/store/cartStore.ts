import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Panier 100 % côté client (localStorage).
 * Aucun appel à la Store API WooCommerce → pas de 429 Imunify360.
 * La commande est créée côté WordPress uniquement au checkout (POST custom endpoint).
 */

export type CartItemOptions = {
  model?: string;
  color?: string;
  material?: string;
};

export type CartItem = {
  key: string; // `${productId}-${variationId ?? 0}`
  productId: number;
  variationId?: number;
  name: string;
  slug: string;
  imageSrc?: string;
  unitPrice: number; // en euros
  options?: CartItemOptions;
  quantity: number;
};

type AddToCartInput = {
  productId: number;
  variationId?: number;
  name: string;
  slug: string;
  imageSrc?: string;
  price: string | number; // REST API = string "29.00", on parse en euros
  options?: CartItemOptions;
  quantity?: number;
};

function itemKey(productId: number, variationId?: number): string {
  return `${productId}-${variationId ?? 0}`;
}

/** Parse prix depuis l'API REST (string "29.00") ou nombre, en euros (pas de /100) */
function parsePriceEur(price: string | number | null | undefined): number {
  if (typeof price === "number") return Number.isFinite(price) ? price : 0;
  if (!price) return 0;
  const n = Number(String(price).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

type CartState = {
  items: CartItem[];
  packOfferId: "pack2" | "pack3" | null;
  isLoading: boolean; // uniquement pendant le checkout (création commande)
  error: string | null;
  setPackOfferId: (offerId: CartState["packOfferId"]) => void;
  addItem: (input: AddToCartInput) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  setCheckoutLoading: (loading: boolean, error?: string | null) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      packOfferId: null,
      isLoading: false,
      error: null,

      setPackOfferId: (offerId) => set({ packOfferId: offerId }),

      addItem: (input) => {
        const quantity = Math.max(1, input.quantity ?? 1);
        const unitPrice = parsePriceEur(input.price);
        const key = itemKey(input.productId, input.variationId);
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          const next = existing
            ? state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [
                ...state.items,
                {
                  key,
                  productId: input.productId,
                  variationId: input.variationId,
                  name: input.name,
                  slug: input.slug,
                  imageSrc: input.imageSrc,
                  unitPrice,
                  options: input.options,
                  quantity,
                },
              ];
          return { items: next };
        });
      },

      removeItem: (key) => {
        set((state) => ({ items: state.items.filter((i) => i.key !== key) }));
      },

      setQuantity: (key, quantity) => {
        const q = Math.max(1, Math.floor(quantity || 1));
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, quantity: q } : i)),
        }));
      },

      clear: () => set({ items: [], packOfferId: null }),

      setCheckoutLoading: (loading, error = null) =>
        set({ isLoading: loading, error: loading ? null : error }),
    }),
    { name: "impexo-cart", version: 1 }
  )
);

export function selectCartCount(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

export function selectCartSubtotal(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
}

export function selectCartDiscount(
  subtotal: number,
  itemsCount: number,
  offerId: "pack2" | "pack3" | null
) {
  if (!offerId) return 0;
  if (offerId === "pack3") {
    if (itemsCount < 3) return 0;
    return subtotal * 0.15;
  }
  if (offerId === "pack2") {
    if (itemsCount < 2) return 0;
    return subtotal * 0.1;
  }
  return 0;
}

/** Payload pour l’endpoint WordPress create-order (product_id, variation_id, quantity) */
export function getCartPayloadForCheckout(items: CartItem[]) {
  return items.map((i) => ({
    product_id: i.productId,
    variation_id: i.variationId ?? 0,
    quantity: i.quantity,
  }));
}
