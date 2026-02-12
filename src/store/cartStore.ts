import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parsePrice } from "@/utils/money";

export type CartItemOptions = {
  model?: string;
  color?: string;
  material?: string;
};

export type CartItem = {
  key: string;
  productId: number;
  variationId?: number;
  name: string;
  slug: string;
  imageSrc?: string;
  unitPrice: number;
  options?: CartItemOptions;
  quantity: number;
};

type AddToCartInput = {
  productId: number;
  variationId?: number;
  name: string;
  slug: string;
  imageSrc?: string;
  price: string | number;
  options?: CartItemOptions;
  quantity?: number;
};

type CartState = {
  items: CartItem[];
  packOfferId: "pack2" | "pack3" | null;
  setPackOfferId: (offerId: CartState["packOfferId"]) => void;
  addItem: (input: AddToCartInput) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

function makeKey(input: { productId: number; variationId?: number; options?: CartItemOptions }) {
  const parts = [
    String(input.productId),
    input.variationId ? `v${input.variationId}` : "",
    input.options?.model ? `m:${input.options.model}` : "",
    input.options?.color ? `c:${input.options.color}` : "",
    input.options?.material ? `t:${input.options.material}` : "",
  ].filter(Boolean);
  return parts.join("|");
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      packOfferId: null,
      setPackOfferId: (offerId) => set({ packOfferId: offerId }),
      addItem: (input) => {
        const quantity = Math.max(1, input.quantity ?? 1);
        const key = makeKey(input);
        const unitPrice = parsePrice(input.price);
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          set({
            items: get().items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i)),
          });
          return;
        }
        const item: CartItem = {
          key,
          productId: input.productId,
          variationId: input.variationId,
          name: input.name,
          slug: input.slug,
          imageSrc: input.imageSrc,
          unitPrice,
          options: input.options,
          quantity,
        };
        set({ items: [item, ...get().items] });
      },
      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      setQuantity: (key, quantity) => {
        const q = Math.max(1, Math.floor(quantity || 1));
        set({ items: get().items.map((i) => (i.key === key ? { ...i, quantity: q } : i)) });
      },
      clear: () => set({ items: [], packOfferId: null }),
    }),
    { name: "impexo-cart-v1" },
  ),
);

export function selectCartCount(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

export function selectCartSubtotal(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
}

export function selectCartDiscount(subtotal: number, itemsCount: number, offerId: "pack2" | "pack3" | null) {
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

