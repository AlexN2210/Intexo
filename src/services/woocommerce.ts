import { env } from "@/services/env";
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
  // TOUJOURS utiliser le proxy backend - FORCER /api/woocommerce
  // Le proxy gère l'authentification côté serveur
  
  // Extraire le chemin WooCommerce (ex: /wp-json/wc/v3/products -> products)
  const wooPath = path.replace(/^\/wp-json\/wc\/v3\//, "").replace(/\/$/, "");
  
  // FORCER l'utilisation de /api/woocommerce (ignorer env.proxyUrl qui peut être incorrect)
  // Ne JAMAIS utiliser env.proxyUrl qui peut contenir une URL WordPress
  const proxyPath = `/api/woocommerce/${wooPath}`.replace(/\/+/g, '/'); // Nettoyer les doubles slashes
  
  // Construire l'URL complète avec les paramètres (chemin relatif)
  const url = new URL(proxyPath, window.location.origin);
  const sp = toSearchParams(params);
  url.search = sp.toString();
  
  const finalUrl = url.toString();
  
  // Vérification critique : l'URL doit contenir /api/woocommerce et PAS wp.impexo.fr
  if (!finalUrl.includes('/api/woocommerce')) {
    console.error('[WooCommerce] ❌ ERREUR CRITIQUE: URL ne pointe pas vers le proxy!', {
      finalUrl,
      wooPath,
      proxyPath,
      windowOrigin: window.location.origin,
      envProxyUrl: env.proxyUrl, // Pour debug
    });
    throw new Error(`URL ne pointe pas vers le proxy: ${finalUrl}`);
  }
  
  // Vérification supplémentaire : l'URL ne doit PAS contenir wp.impexo.fr
  if (finalUrl.includes('wp.impexo.fr')) {
    console.error('[WooCommerce] ❌ ERREUR: URL contient wp.impexo.fr au lieu du proxy!', {
      finalUrl,
      wooPath,
      proxyPath,
    });
    throw new Error(`URL contient wp.impexo.fr au lieu du proxy: ${finalUrl}`);
  }
  
  console.log('[WooCommerce] ✅ URL proxy construite:', finalUrl);
  return finalUrl;
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
  
  // Vérification que l'URL utilise bien le proxy
  if (!url.includes('/api/woocommerce')) {
    console.error('[WooCommerce] ❌ ERREUR: L\'URL ne pointe pas vers le proxy!', url);
    throw new Error(`L'URL ne pointe pas vers le proxy: ${url}. Vérifiez la configuration.`);
  }
  
  console.log('[WooCommerce] Requête vers le proxy:', url);
  
  // Le proxy gère l'authentification, pas besoin de Basic Auth côté frontend
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init?.headers ?? {}),
  };
  
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
    
    // Si on reçoit du HTML, c'est une erreur du proxy
    if (isHtml) {
      console.error(`[WooCommerce] Proxy retourne du HTML au lieu de JSON (status: ${res.status})`);
      console.error(`[WooCommerce] URL proxy: ${url}`);
      console.error(`[WooCommerce] Content-Type: ${contentType}`);
      throw new Error(`Proxy retourne du HTML au lieu de JSON. Vérifiez la configuration du proxy.`);
    }
    
    // Si ce n'est pas du JSON, c'est une erreur
    if (!isJson) {
      console.error(`[WooCommerce] Proxy retourne du non-JSON (${contentType})`);
      throw new Error(`Réponse non-JSON reçue (${contentType})`);
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
      
      throw new Error(`WooCommerce API error ${res.status} — ${text.substring(0, 200) || res.statusText}`);
    }
    
    // Parser le JSON depuis le texte déjà lu
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
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
  // Toujours utiliser le proxy, sauf si les mocks sont activés
  if (env.useMocks) {
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
  if (env.useMocks) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }
  
  try {
    const products = await wooFetch<WooProduct[]>("/wp-json/wc/v3/products", {
      slug,
      status: "publish",
    });
    
    return products?.[0] ?? null;
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return null;
  }
}

export async function getProductVariations(productId: number): Promise<WooVariation[]> {
  if (env.useMocks) {
    return mockProductVariationsByProductId[productId] ?? [];
  }
  
  try {
    // Solution pour le bug WooCommerce : récupérer les IDs depuis le produit parent
    // Le champ "variations" du produit contient toujours les IDs, même si /variations renvoie 404
    console.log(`[WooCommerce] Récupération des variations pour le produit ${productId}`);
    
    // 1. Récupérer le produit parent pour obtenir les IDs des variations
    const product = await wooFetch<WooProduct>(
      `/wp-json/wc/v3/products/${productId}`,
      {}
    );
    
    // 2. Si le produit a des IDs de variations, les utiliser pour récupérer chaque variation individuellement
    if (product?.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      console.log(`[WooCommerce] Produit ${productId} a ${product.variations.length} variations (IDs: ${product.variations.join(', ')})`);
      
      // Récupérer chaque variation individuellement (cet endpoint fonctionne toujours, même si /variations renvoie 404)
      const variationPromises = product.variations.map(async (variationId) => {
        try {
          const variation = await wooFetch<WooVariation>(
            `/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
            {}
          );
          return variation;
        } catch (error) {
          console.warn(`[WooCommerce] Impossible de récupérer la variation ${variationId} du produit ${productId}:`, error);
          return null;
        }
      });
      
      const variations = await Promise.all(variationPromises);
      const validVariations = variations.filter((v): v is WooVariation => v !== null);
      
      console.log(`[WooCommerce] ${validVariations.length}/${product.variations.length} variations récupérées avec succès`);
      
      return validVariations;
    }
    
    // 3. Fallback : essayer l'endpoint /variations classique (peut renvoyer 404 ou vide)
    console.log(`[WooCommerce] Aucun ID de variation trouvé dans le produit ${productId}, tentative avec /variations`);
    const variations = await wooFetch<WooVariation[]>(
      `/wp-json/wc/v3/products/${productId}/variations`,
      { status: "publish" }
    );
    
    return Array.isArray(variations) ? variations : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des variations:", error);
    return [];
  }
}
