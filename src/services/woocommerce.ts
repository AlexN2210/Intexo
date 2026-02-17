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
  // Si le proxy est activé et n'a pas échoué, utiliser le proxy backend
  if (env.useProxy && !env.useMocks && !proxyFailed) {
    // Le proxy gère l'authentification côté serveur
    const proxyBase = env.proxyUrl;
    
    // Si l'URL du proxy est complète (commence par http:// ou https://), l'utiliser directement
    // Sinon, utiliser window.location.origin pour un chemin relatif
    let proxyUrl: string;
    if (proxyBase.startsWith('http://') || proxyBase.startsWith('https://')) {
      proxyUrl = `${proxyBase}/${path.replace(/^\/wp-json\/wc\/v3\//, "")}`;
    } else {
      proxyUrl = new URL(`${proxyBase}/${path.replace(/^\/wp-json\/wc\/v3\//, "")}`, window.location.origin).toString();
    }
    
    const url = new URL(proxyUrl);
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

// Variable pour tracker si le proxy a échoué (fallback vers API directe)
let proxyFailed = false;

async function wooFetch<T>(path: string, params?: QueryParams, init?: RequestInit): Promise<T> {
  const url = buildWooUrl(path, params);
  const isProxyRequest = url.includes('/api/woocommerce');
  
  // Préparation des headers avec Basic Auth pour l'API directe
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init?.headers ?? {}),
  };

  // Si on utilise l'API directe (pas le proxy), ajouter Basic Auth
  if (!isProxyRequest && env.wcConsumerKey && env.wcConsumerSecret) {
    // Basic Auth: base64(consumer_key:consumer_secret)
    const credentials = btoa(`${env.wcConsumerKey}:${env.wcConsumerSecret}`);
    headers['Authorization'] = `Basic ${credentials}`;
    console.log('[WooCommerce] Utilisation de Basic Auth pour l\'API directe');
  }
  
  try {
    const res = await fetch(url, {
      ...init,
      headers,
    });
    
    // Vérifier le content-type avant de parser
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    
    // Lire le texte une seule fois pour vérifier si c'est du HTML
    const text = await res.text().catch(() => "");
    
    // Détection HTML plus robuste : vérifier plusieurs patterns
    const isHtml = 
      text.trim().startsWith("<!") || 
      text.trim().startsWith("<html") ||
      text.trim().startsWith("<!doctype") ||
      text.includes("<html") ||
      text.includes("<!DOCTYPE") ||
      (contentType.includes("text/html") && !contentType.includes("json"));
    
    // PRIORITÉ 1: Si on reçoit du HTML (même avec status 200), c'est probablement une erreur du proxy
    if (isHtml && isProxyRequest && !proxyFailed) {
      console.warn(`[WooCommerce] Proxy retourne du HTML au lieu de JSON (status: ${res.status}), basculement vers l'API directe`);
      console.warn(`[WooCommerce] URL proxy: ${url}`);
      console.warn(`[WooCommerce] Content-Type: ${contentType}`);
      proxyFailed = true;
      // Réessayer avec l'API directe
      return wooFetch(path, params, init);
    }
    
    // PRIORITÉ 2: Si ce n'est pas du JSON et qu'on utilise le proxy, essayer le fallback
    if (!isJson && isProxyRequest && !proxyFailed) {
      console.warn(`[WooCommerce] Proxy retourne du non-JSON (${contentType}), basculement vers l'API directe`);
      proxyFailed = true;
      return wooFetch(path, params, init);
    }
    
    if (!res.ok) {
      // Si la réponse JSON contient un tableau "data" (ex: erreur proxy avec data: []), le retourner pour éviter de planter l'UI
      if (isJson) {
        try {
          const errData = JSON.parse(text);
          if (errData && typeof errData === "object" && Array.isArray(errData.data)) {
            console.warn(`[WooCommerce] Réponse d'erreur ${res.status} avec data: [], retour de la liste vide`);
            return errData.data as T;
          }
        } catch {
          // ignore
        }
      }

      // Si erreur 401 ou 500 depuis le proxy, essayer l'API directe (nécessite VITE_WP_BASE_URL, VITE_WC_CONSUMER_KEY, VITE_WC_CONSUMER_SECRET)
      if ((res.status === 401 || res.status === 500) && isProxyRequest && !proxyFailed) {
        console.warn(`[WooCommerce] Proxy retourne ${res.status}, basculement vers l'API directe`);
        proxyFailed = true;
        return wooFetch(path, params, init);
      }
      
      // Si c'est une erreur 401 en mode direct, donner un message plus clair
      if (res.status === 401 && !isProxyRequest) {
        let errorMsg = res.statusText;
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.message || errorData.error || text;
        } catch {
          errorMsg = text || res.statusText;
        }
        throw new Error(`Erreur 401 - Permissions insuffisantes: ${errorMsg}. Vérifiez que VITE_WC_CONSUMER_KEY et VITE_WC_CONSUMER_SECRET sont configurées dans Vercel.`);
      }
      
      throw new Error(`WooCommerce API error ${res.status} — ${text.substring(0, 200) || res.statusText}`);
    }
    
    // Si ce n'est pas du JSON après avoir vérifié res.ok, c'est une erreur
    if (!isJson) {
      if (isProxyRequest && !proxyFailed) {
        console.warn(`[WooCommerce] Proxy retourne du non-JSON après status OK, basculement vers l'API directe`);
        proxyFailed = true;
        return wooFetch(path, params, init);
      }
      throw new Error(`Réponse non-JSON reçue (${contentType}): ${text.substring(0, 200)}`);
    }
    
    // Parser le JSON depuis le texte déjà lu
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // Si le parsing échoue et qu'on utilisait le proxy, essayer l'API directe
      if (isProxyRequest && !proxyFailed) {
        console.warn("[WooCommerce] Erreur de parsing JSON depuis le proxy, basculement vers l'API directe");
        proxyFailed = true;
        return wooFetch(path, params, init);
      }
      throw new Error(`Erreur de parsing JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
    // Vérification de sécurité : si on attend un tableau mais qu'on reçoit un objet d'erreur
    if (Array.isArray(data)) {
      return data as T;
    }
    
    // Si ce n'est pas un tableau, vérifier si c'est une erreur
    if (data && typeof data === 'object' && ('error' in data || 'message' in data)) {
      throw new Error(`WooCommerce API error: ${data.message || data.error || 'Unknown error'}`);
    }
    
    return data as T;
  } catch (error) {
    // Si c'est une erreur de parsing JSON et qu'on utilisait le proxy, essayer l'API directe
    if (error instanceof SyntaxError && isProxyRequest && !proxyFailed) {
      console.warn("[WooCommerce] Erreur SyntaxError depuis le proxy, basculement vers l'API directe");
      proxyFailed = true;
      return wooFetch(path, params, init);
    }
    
    // Si l'erreur contient "Réponse non-JSON" et qu'on utilisait le proxy, essayer le fallback
    if (error instanceof Error && error.message.includes("Réponse non-JSON") && isProxyRequest && !proxyFailed) {
      console.warn("[WooCommerce] Erreur 'Réponse non-JSON' depuis le proxy, basculement vers l'API directe");
      proxyFailed = true;
      return wooFetch(path, params, init);
    }
    
    throw error;
  }
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
  
  try {
    const result = await wooFetch<WooProduct[]>("/wp-json/wc/v3/products", {
      per_page: params?.per_page ?? 24,
      page: params?.page ?? 1,
      orderby: params?.orderby ?? "date",
      order: params?.order ?? "desc",
      featured: params?.featured,
      search: params?.search,
      status: "publish",
    });
    
    // Garantir qu'on retourne toujours un tableau
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    // En cas d'erreur, retourner un tableau vide plutôt que de planter
    return [];
  }
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
  
  try {
    const result = await wooFetch<WooVariation[]>(`/wp-json/wc/v3/products/${productId}/variations`, {
      per_page: 100,
      status: "publish",
    });
    
    // Garantir qu'on retourne toujours un tableau
    const variations = Array.isArray(result) ? result : [];
    
    // Vérification supplémentaire : s'assurer que les variations ont bien un ID
    return variations.filter(v => v && v.id);
  } catch (error) {
    console.error(`Erreur lors de la récupération des variations pour le produit ${productId}:`, error);
    return [];
  }
}

