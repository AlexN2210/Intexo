/**
 * Service WooCommerce Cart API
 * 
 * Utilise l'API WooCommerce Store Cart (wc/store/v1) pour gérer le panier
 * Cette API nécessite un nonce pour les opérations d'écriture (POST/PUT/DELETE)
 * et utilise des cookies de session pour identifier le panier
 */

// Configuration
const DEFAULT_TIMEOUT = 8000; // 8 secondes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

// URL du proxy Vercel - SIMPLIFIÉ : utilise toujours window.location.origin
// Le proxy est accessible sur le même domaine que le frontend
function getProxyBaseUrl(): string {
  // TOUJOURS utiliser l'origine actuelle - le proxy est sur le même domaine
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Si une variable d'environnement est définie, la nettoyer mais l'utiliser seulement
  // si elle ne pointe pas vers wp.impexo.fr (WordPress)
  const envVar = import.meta.env.VITE_WC_PROXY_BASE_URL;
  if (envVar) {
    let cleanedUrl = envVar.trim().replace(/\/api\/woocommerce.*$/, '').replace(/\/+$/, '');
    
    // Seule protection : bloquer wp.impexo.fr (WordPress)
    // www.impexo.fr est VALIDE car c'est Vercel
    if (cleanedUrl.includes('wp.impexo.fr')) {
      console.warn('[WooCommerce Cart] ⚠️ VITE_WC_PROXY_BASE_URL pointe vers WordPress, ignorée');
      return currentOrigin;
    }
    
    // Sinon, utiliser la variable d'environnement
    return cleanedUrl;
  }
  
  // Par défaut : utiliser l'origine actuelle (www.impexo.fr, localhost, ou vercel.app)
  return currentOrigin;
}

// Stockage du nonce en mémoire (sera récupéré automatiquement)
let currentNonce: string | null = null;

// Stockage du Cart-Token JWT en mémoire (identifie la session panier)
let currentCartToken: string | null = null;

// Types pour l'API WooCommerce Cart
export type WooCartItem = {
  id: number; // Corrigé : WooCommerce retourne un number, pas string
  key: string; // Clé unique de l'article
  quantity: number;
  name: string;
  title: string;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    price_range: null;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  images: Array<{
    id: number;
    src: string;
    thumbnail: string;
    srcset: string;
    sizes: string;
    name: string;
    alt: string;
  }>;
  variation?: Array<{
    attribute: string;
    value: string;
  }>;
};

export type ShippingRate = {
  key: string;
  name: string;
  price: string;
  method_id: string;
  selected: boolean;
};

export type Fee = {
  id: string;
  name: string;
  totals: {
    total: string;
    total_tax: string;
  };
};

export type TaxLine = {
  name: string;
  price: string;
  rate: string;
};

export type CrossSell = {
  id: number;
  name: string;
  permalink: string;
  price: string;
  image: {
    id: number;
    src: string;
    thumbnail: string;
  };
};

export type WooCart = {
  items: WooCartItem[];
  items_count: number;
  items_weight: number;
  cross_sells: CrossSell[];
  needs_payment: boolean;
  needs_shipping: boolean;
  shipping_rates: ShippingRate[];
  fees: Fee[];
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string;
    total_shipping_tax: string;
    total_price: string;
    total_tax: string;
    tax_lines: TaxLine[];
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
};

/**
 * Construit l'URL du proxy pour l'API Store Cart
 * Le proxy attend le chemin relatif sans préfixe /wp-json/wc/store/v1/
 */
function buildStoreCartUrl(endpoint: string): string {
  // Nettoyer le chemin de l'endpoint
  let cleanPath = endpoint
    .replace(/^\/wp-json\/wc\/store\/v1\//, '') // Enlever préfixe complet
    .replace(/^\/api\/woocommerce\/store\/v1\//, '') // Enlever préfixe proxy (au cas où)
    .replace(/^\//, ''); // Enlever slash initial
  
  // Le proxy attend : /api/woocommerce/store/v1/{endpoint}
  const proxyPath = `/api/woocommerce/store/v1/${cleanPath}`.replace(/\/+/g, '/');
  
  // Obtenir l'URL de base du proxy
  const baseUrl = getProxyBaseUrl();
  
  // Construire l'URL complète
  const url = new URL(proxyPath, baseUrl);
  const finalUrl = url.toString();
  
  // SECURITE : Seule protection contre wp.impexo.fr (WordPress)
  // www.impexo.fr est VALIDE car c'est Vercel
  if (finalUrl.includes('wp.impexo.fr')) {
    console.error('[WooCommerce Cart] ❌ ERREUR: URL pointe vers WordPress (wp.impexo.fr)!', finalUrl);
    console.error('[WooCommerce Cart] 🔧 Correction automatique vers www.impexo.fr');
    return finalUrl.replace(/https?:\/\/wp\.impexo\.fr/, 'https://www.impexo.fr');
  }
  
  // Vérification de sécurité
  if (!finalUrl.includes('/api/woocommerce/store/v1')) {
    console.error('[WooCommerce Cart] ❌ ERREUR: URL invalide!', {
      finalUrl,
      endpoint,
      proxyPath,
      baseUrl,
    });
    throw new Error(`URL invalide: ${finalUrl}`);
  }
  
  console.log('[WooCommerce Cart] ✅ URL proxy construite:', finalUrl);
  return finalUrl;
}

/**
 * Récupère le nonce depuis les headers de réponse
 */
function extractNonceFromResponse(response: Response): void {
  const nonce = response.headers.get('Nonce');
  if (nonce) {
    currentNonce = nonce;
    console.log('[WooCommerce Cart] Nonce mis à jour:', nonce.substring(0, 10) + '...');
  }
}

/**
 * Récupère le Cart-Token depuis les headers de réponse
 */
function extractCartTokenFromResponse(response: Response): void {
  const token = response.headers.get('Cart-Token');
  if (token) {
    currentCartToken = token;
    console.log('[WooCommerce Cart] Cart-Token mis à jour:', token.substring(0, 20) + '...');
  }
}

/**
 * Récupère un nonce initial en faisant un GET sur le panier
 */
async function fetchInitialNonce(): Promise<void> {
  try {
    const url = buildStoreCartUrl('cart');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include', // Important : inclure les cookies
    });
    
    extractNonceFromResponse(response);
    extractCartTokenFromResponse(response);
    
    if (!response.ok) {
      console.warn('[WooCommerce Cart] Échec de récupération du nonce initial');
    }
  } catch (error) {
    console.warn('[WooCommerce Cart] Erreur lors de la récupération du nonce:', error);
  }
}

/**
 * Fonction helper pour faire des requêtes vers l'API Store Cart avec retry
 */
async function storeCartFetch<T>(
  endpoint: string,
  init?: RequestInit,
  retryCount = 0
): Promise<T> {
  const url = buildStoreCartUrl(endpoint);
  const isWriteOperation = init?.method && ['POST', 'PUT', 'DELETE'].includes(init.method);
  
  // IMPORTANT : Pour les opérations d'écriture, toujours récupérer un nonce frais
  // Le nonce peut expirer rapidement, donc on le récupère juste avant chaque opération
  if (isWriteOperation) {
    console.log('[WooCommerce Cart] Récupération d\'un nonce frais pour l\'opération d\'écriture...');
    await fetchInitialNonce();
    
    if (!currentNonce) {
      console.error('[WooCommerce Cart] ❌ Impossible de récupérer un nonce - l\'opération va échouer');
    }
  }
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  };
  
  // Ajouter le nonce pour les opérations d'écriture
  if (isWriteOperation && currentNonce) {
    headers['Nonce'] = currentNonce;
    console.log(`[WooCommerce Cart] Envoi du nonce pour ${init?.method} ${endpoint}:`, currentNonce.substring(0, 10) + '...');
  } else if (isWriteOperation && !currentNonce) {
    console.warn(`[WooCommerce Cart] ⚠️ Pas de nonce disponible pour ${init?.method} ${endpoint}`);
  }
  
  // Ajouter le Cart-Token pour maintenir la session panier
  if (currentCartToken) {
    headers['Cart-Token'] = currentCartToken;
    console.log(`[WooCommerce Cart] Envoi du Cart-Token pour ${init?.method || 'GET'} ${endpoint}:`, currentCartToken.substring(0, 20) + '...');
  }
  
  // Créer un AbortController pour le timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...init,
      headers,
      credentials: 'include', // CRITIQUE : inclure les cookies (woocommerce_session)
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Mettre à jour le nonce et le Cart-Token depuis la réponse
    extractNonceFromResponse(response);
    extractCartTokenFromResponse(response);
    
    if (!response.ok) {
      // Gestion spéciale pour les erreurs 403 (nonce invalide)
      if (response.status === 403 && isWriteOperation) {
        const errorText = await response.text().catch(() => response.statusText);
        let errorMessage = 'Le nonce n\'est pas valide.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        // Si c'est une erreur de nonce et qu'on n'a pas encore retenté, récupérer un nouveau nonce et réessayer
        if (errorMessage.toLowerCase().includes('nonce') && retryCount < MAX_RETRIES) {
          console.log(`[WooCommerce Cart] Erreur 403 - Nonce invalide, récupération d'un nouveau nonce...`);
          currentNonce = null; // Réinitialiser le nonce
          await fetchInitialNonce(); // Récupérer un nouveau nonce
          
          if (currentNonce) {
            console.log(`[WooCommerce Cart] Nouveau nonce récupéré, retry ${retryCount + 1}/${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
            return storeCartFetch<T>(endpoint, init, retryCount + 1);
          } else {
            console.error('[WooCommerce Cart] Impossible de récupérer un nouveau nonce');
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Gestion des erreurs avec retry pour les erreurs réseau/transitoires
      const isRetryableError = 
        response.status === 0 || // Erreur réseau
        response.status === 408 || // Timeout
        response.status === 429 || // Too Many Requests
        response.status >= 500; // Erreurs serveur
      
      // Récupérer le message d'erreur AVANT le retry pour le logger
      const errorText = await response.text().catch(() => response.statusText);
      let errorMessage = `WooCommerce Cart API error ${response.status}`;
      let errorDetails: any = null;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
        errorDetails = errorJson;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      // Logger l'erreur avant retry
      console.error(`[WooCommerce Cart] ❌ Erreur ${response.status} du serveur:`, {
        status: response.status,
        url: response.url,
        endpoint,
        errorMessage: errorMessage.substring(0, 200),
        errorDetails: errorDetails ? JSON.stringify(errorDetails).substring(0, 200) : null,
      });
      
      // Retry pour les erreurs réseau/transitoires
      if (isRetryableError && retryCount < MAX_RETRIES) {
        console.log(`[WooCommerce Cart] Retry ${retryCount + 1}/${MAX_RETRIES} après erreur ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return storeCartFetch<T>(endpoint, init, retryCount + 1);
      }
      
      // Pour les erreurs 500, inclure plus de détails
      if (response.status === 500) {
        const fullError = new Error(`Erreur serveur (500): ${errorMessage}`);
        (fullError as any).details = errorDetails;
        (fullError as any).status = response.status;
        (fullError as any).url = response.url;
        throw fullError;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry pour les erreurs réseau (AbortError, etc.)
    if (
      (error instanceof Error && error.name === 'AbortError') ||
      (error instanceof TypeError && error.message.includes('fetch'))
    ) {
      if (retryCount < MAX_RETRIES) {
        console.log(`[WooCommerce Cart] Retry ${retryCount + 1}/${MAX_RETRIES} après erreur réseau`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return storeCartFetch<T>(endpoint, init, retryCount + 1);
      }
    }
    
    throw error;
  }
}

// Ajouter un article au panier WooCommerce
export async function addToWooCart(params: {
  id: number; // ID du produit
  quantity?: number;
  variation?: {
    id: number; // ID de la variation
    attributes?: Record<string, string>; // Attributs de la variation
  };
}): Promise<WooCart> {
  const body: any = {
    id: params.id,
    quantity: params.quantity || 1,
  };

  if (params.variation) {
    body.variation_id = params.variation.id;
    if (params.variation.attributes) {
      body.variation = Object.entries(params.variation.attributes).map(([name, value]) => ({
        attribute: name,
        value,
      }));
    }
  }

  return await storeCartFetch<WooCart>('cart/add-item', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Récupérer le panier WooCommerce
export async function getWooCart(): Promise<WooCart> {
  return await storeCartFetch<WooCart>('cart', {
    method: 'GET',
  });
}

// Mettre à jour la quantité d'un article dans le panier
export async function updateWooCartItem(key: string, quantity: number): Promise<WooCart> {
  return await storeCartFetch<WooCart>('cart/update-item', {
    method: 'PUT',
    body: JSON.stringify({
      key,
      quantity: Math.max(1, quantity),
    }),
  });
}

// Supprimer un article du panier
export async function removeFromWooCart(key: string): Promise<WooCart> {
  return await storeCartFetch<WooCart>('cart/remove-item', {
    method: 'DELETE',
    body: JSON.stringify({ key }),
  });
}

// Vider le panier
export async function clearWooCart(): Promise<WooCart> {
  return await storeCartFetch<WooCart>('cart/items', {
    method: 'DELETE',
  });
}

// Créer une commande depuis le panier (checkout)
export async function createWooOrder(params: {
  billing_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
    email: string;
    phone?: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
  };
  payment_method: string; // Ex: "stripe", "bacs", etc.
  payment_method_title?: string;
  customer_note?: string;
}): Promise<{
  id: number;
  status: string;
  order_key: string;
  payment_url?: string; // URL de paiement Stripe si disponible
}> {
  const result = await storeCartFetch<{
    id: number;
    status: string;
    order_key: string;
    payment_url?: string;
  }>('checkout', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  
  // Rediriger vers l'URL de paiement si disponible (ex: Stripe)
  if (result.payment_url) {
    console.log('[WooCommerce Cart] Redirection vers le paiement:', result.payment_url);
    // Note: La redirection doit être gérée par le composant appelant
    // car cette fonction ne peut pas rediriger directement depuis un service
  }
  
  return result;
}
