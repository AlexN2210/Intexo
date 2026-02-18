import { create } from "zustand";
import { parsePrice } from "@/utils/money";
import {
  addToWooCart,
  getWooCart,
  updateWooCartItem,
  removeFromWooCart,
  clearWooCart,
  type WooCartItem,
} from "@/services/woocommerceCart";

export type CartItemOptions = {
  model?: string;
  color?: string;
  material?: string;
};

export type CartItem = {
  key: string; // Clé WooCommerce du panier
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
  isLoading: boolean;
  error: string | null;
  setPackOfferId: (offerId: CartState["packOfferId"]) => void;
  addItem: (input: AddToCartInput) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  setQuantity: (key: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>; // Rafraîchir le panier depuis WooCommerce
};

// Convertir un WooCartItem en CartItem
function wooCartItemToCartItem(wooItem: WooCartItem): CartItem {
  // Extraire les options depuis les variations WooCommerce
  const options: CartItemOptions = {};
  if (wooItem.variation) {
    wooItem.variation.forEach((v) => {
      const attrName = v.attribute.toLowerCase();
      if (attrName.includes("modèle") || attrName.includes("model")) {
        options.model = v.value;
      } else if (attrName.includes("couleur") || attrName.includes("color")) {
        options.color = v.value;
      } else if (attrName.includes("matériau") || attrName.includes("material")) {
        options.material = v.value;
      }
    });
  }

  // Extraire l'ID de variation depuis la clé WooCommerce (format: "variation-{id}")
  const variationIdMatch = wooItem.key.match(/variation-(\d+)/);
  const variationId = variationIdMatch ? parseInt(variationIdMatch[1], 10) : undefined;

  // Extraire l'ID produit depuis la clé WooCommerce (format: "{productId}" ou "{productId}-variation-{variationId}")
  const productIdMatch = wooItem.key.match(/^(\d+)/);
  const productId = productIdMatch ? parseInt(productIdMatch[1], 10) : 0;

  return {
    key: wooItem.key,
    productId,
    variationId,
    name: wooItem.name,
    slug: "", // WooCommerce ne fournit pas le slug dans le panier
    imageSrc: wooItem.images?.[0]?.src || wooItem.images?.[0]?.thumbnail,
    unitPrice: parsePrice(wooItem.prices.price),
    options,
    quantity: wooItem.quantity,
  };
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  packOfferId: null,
  isLoading: false,
  error: null,

  setPackOfferId: (offerId) => set({ packOfferId: offerId }),

  // Rafraîchir le panier depuis WooCommerce
  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await getWooCart();
      const items = cart.items.map(wooCartItemToCartItem);
      set({ items, isLoading: false });
    } catch (error) {
      console.error("[CartStore] Erreur lors du rafraîchissement du panier:", error);
      set({
        error: error instanceof Error ? error.message : "Erreur lors du rafraîchissement du panier",
        isLoading: false,
      });
    }
  },

  // Ajouter un article au panier WooCommerce
  addItem: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const quantity = Math.max(1, input.quantity ?? 1);

      // Préparer les attributs de variation si nécessaire
      const variationAttributes: Record<string, string> = {};
      if (input.options?.model) {
        variationAttributes["Modèle"] = input.options.model;
      }
      if (input.options?.color) {
        variationAttributes["Couleur"] = input.options.color;
      }
      if (input.options?.material) {
        variationAttributes["Matériau"] = input.options.material;
      }

      // Ajouter au panier WooCommerce
      const cart = await addToWooCart({
        id: input.productId,
        quantity,
        variation: input.variationId
          ? {
              id: input.variationId,
              attributes: Object.keys(variationAttributes).length > 0 ? variationAttributes : undefined,
            }
          : undefined,
      });

      // Mettre à jour le store avec le nouveau panier
      const items = cart.items.map(wooCartItemToCartItem);
      set({ items, isLoading: false });
    } catch (error) {
      console.error("[CartStore] Erreur lors de l'ajout au panier:", error);
      set({
        error: error instanceof Error ? error.message : "Erreur lors de l'ajout au panier",
        isLoading: false,
      });
      throw error;
    }
  },

  // Supprimer un article du panier
  removeItem: async (key) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await removeFromWooCart(key);
      const items = cart.items.map(wooCartItemToCartItem);
      set({ items, isLoading: false });
    } catch (error) {
      console.error("[CartStore] Erreur lors de la suppression:", error);
      set({
        error: error instanceof Error ? error.message : "Erreur lors de la suppression",
        isLoading: false,
      });
      throw error;
    }
  },

  // Modifier la quantité d'un article
  setQuantity: async (key, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const q = Math.max(1, Math.floor(quantity || 1));
      const cart = await updateWooCartItem(key, q);
      const items = cart.items.map(wooCartItemToCartItem);
      set({ items, isLoading: false });
    } catch (error) {
      console.error("[CartStore] Erreur lors de la mise à jour de la quantité:", error);
      set({
        error: error instanceof Error ? error.message : "Erreur lors de la mise à jour de la quantité",
        isLoading: false,
      });
      throw error;
    }
  },

  // Vider le panier
  clear: async () => {
    set({ isLoading: true, error: null });
    try {
      await clearWooCart();
      set({ items: [], packOfferId: null, isLoading: false });
    } catch (error) {
      console.error("[CartStore] Erreur lors du vidage du panier:", error);
      set({
        error: error instanceof Error ? error.message : "Erreur lors du vidage du panier",
        isLoading: false,
      });
      throw error;
    }
  },
}));

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
