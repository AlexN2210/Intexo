import { env, assertWpBaseUrl } from "@/services/env";
import { mockProducts } from "@/services/mock/products";
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
  if (env.useMocks || !env.wpBaseUrl) return mockProducts;
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
  if (env.useMocks || !env.wpBaseUrl) return [];
  return await wooFetch<WooVariation[]>(`/wp-json/wc/v3/products/${productId}/variations`, {
    per_page: 100,
    status: "publish",
  });
}

