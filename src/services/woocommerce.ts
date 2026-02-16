import { env, assertWpBaseUrl } from "@/services/env";
import { mockProducts, mockProductVariationsByProductId } from "@/services/mock/products";
import type { WooProduct, WooVariation } from "@/types/woocommerce";

type Primitive = string | number | boolean;
type QueryParams = Record<string, Primitive | Primitive[] | undefined>;

function toSearchParams(params: QueryParams) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (typeof v === "undefined") return;
    if (Array.isArray(v)) v.forEach((vv) => sp.append(k, String(vv)));
    else sp.set(k, String(v));
  });
  return sp;
}

function buildWooUrl(path: string, params: QueryParams = {}) {
  // Si le proxy est activé, utiliser le proxy backend au lieu de l'API directe
  if (env.useProxy && !env.useMocks) {
    // Le proxy gère l'authentification côté serveur
    const proxyBase = env.proxyUrl;
    const url = new URL(`${proxyBase}/${path.replace(/^\/wp-json\/wc\/v3\//, "")}`, window.location.origin);
    const sp = toSearchParams(params);
    url.search = sp.toString();
    return url.toString();
  }

  // Mode direct (développement uniquement)
  assertWpBaseUrl();
  const base = env.wpBaseUrl;
  const url = new URL(`${base}${path.startsWith("/") ? "" : "/"}${path}`);
  const sp = toSearchParams(params);

  // ⚠️ En prod, évite d’exposer le secret WooCommerce côté frontend.
  // Idéalement: proxy serveur (Edge/Node) qui signe les requêtes.
  if (env.wcConsumerKey && env.wcConsumerSecret) {
    sp.set("consumer_key", env.wcConsumerKey);
    sp.set("consumer_secret", env.wcConsumerSecret);
  }

  url.search = sp.toString();
  return url.toString();
}

function normalizeForSearch(input: string) {
  return (input ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[’'"]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tokenSynonyms: Record<string, string[]> = {
  magsafe: ["magnetique", "magnetisme", "magnet"],
  magnetic: ["magnetique", "magnetisme", "magnet"],
  crystal: ["transparent", "transparente", "transparence", "acrylique"],
  transparent: ["transparente", "transparence", "crystal", "acrylique"],
  camera: ["optique", "objectif", "lentille"],
  matte: ["mat", "mate", "antiderapante", "texture"],
};

async function wooFetch<T>(path: string, params?: QueryParams, init?: RequestInit): Promise<T> {
  const url = buildWooUrl(path, params);
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WooCommerce API error ${res.status} — ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function getProducts(params?: {
  per_page?: number;
  page?: number;
  orderby?: "date" | "popularity" | "rating" | "title" | "price" | "include" | string;
  order?: "asc" | "desc";
  featured?: boolean;
  search?: string;
}): Promise<WooProduct[]> {
  if (env.useMocks || !env.wpBaseUrl) {
    const list = [...mockProducts];
    const raw = params?.search?.trim();
    const search = raw ? normalizeForSearch(raw) : "";
    if (search)
      return list.filter((p) => {
        const hay = normalizeForSearch(
          [
          p.name,
          p.slug,
          p.short_description,
          p.description,
          (p.categories ?? []).map((c) => c.name).join(" "),
        ]
          .join(" ")
        );

        // matching par mots (plus tolérant que includes sur toute la chaîne)
        const tokens = search.split(" ").filter(Boolean);
        return tokens.every((t) => {
          const alts = [t, ...(tokenSynonyms[t] ?? [])];
          return alts.some((alt) => hay.includes(alt));
        });
      });
    return list;
  }
  return await wooFetch<WooProduct[]>("/wp-json/wc/v3/products", {
    per_page: params?.per_page ?? 24,
    page: params?.page ?? 1,
    orderby: params?.orderby ?? "date",
    order: params?.order ?? "desc",
    featured: params?.featured,
    search: params?.search,
    status: "publish",
  });
}

export async function getProductBySlug(slug: string): Promise<WooProduct | null> {
  if (env.useMocks || !env.wpBaseUrl) return mockProducts.find((p) => p.slug === slug) ?? null;
  const list = await wooFetch<WooProduct[]>("/wp-json/wc/v3/products", { slug, status: "publish", per_page: 1 });
  return list[0] ?? null;
}

export async function getProductById(id: number): Promise<WooProduct> {
  if (env.useMocks || !env.wpBaseUrl) {
    const p = mockProducts.find((pp) => pp.id === id);
    if (!p) throw new Error("Produit introuvable (mock).");
    return p;
  }
  return await wooFetch<WooProduct>(`/wp-json/wc/v3/products/${id}`);
}

export async function getProductVariations(productId: number): Promise<WooVariation[]> {
  if (env.useMocks || !env.wpBaseUrl) return mockProductVariationsByProductId[productId] ?? [];
  return await wooFetch<WooVariation[]>(`/wp-json/wc/v3/products/${productId}/variations`, {
    per_page: 100,
    status: "publish",
  });
}

