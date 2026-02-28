/**
 * Proxy API Route Vercel pour WooCommerce (version JavaScript)
 *
 * Cette route proxy toutes les requêtes vers l'API WooCommerce
 * en ajoutant les clés d'authentification côté serveur.
 *
 * Usage: /api/woocommerce/products, /api/woocommerce/products/123, etc.
 */

// ==========================================
// CONFIG VERCEL - Body parser activé explicitement
// ==========================================
export const config = {
  api: {
    bodyParser: true,
  },
};

// ==========================================
// HELPER - Logger conditionnel (désactivé en prod sauf DEBUG=true)
// ==========================================
const DEBUG = process.env.DEBUG === 'true';
const log = (...args) => DEBUG && console.log('[Proxy WooCommerce]', ...args);
const logError = (...args) => console.error('[Proxy WooCommerce]', ...args);

// ==========================================
// CACHE GET (produits / variations) - réduit les 429 Imunify360
// Ne pas cacher Store Cart (panier dépend des cookies)
// ==========================================
const GET_CACHE_TTL_MS = 3 * 60 * 1000; // 3 min (pas de whitelist possible côté hébergeur)
const GET_CACHE_MAX = 200;
const getProductCache = new Map();

function getCachedResponse(url) {
  const entry = getProductCache.get(url);
  if (!entry || entry.expiresAt < Date.now()) {
    if (entry) getProductCache.delete(url);
    return null;
  }
  return entry;
}

function setCachedResponse(url, entry) {
  if (getProductCache.size >= GET_CACHE_MAX) {
    const now = Date.now();
    for (const [k, v] of getProductCache) {
      if (v.expiresAt < now) getProductCache.delete(k);
    }
    if (getProductCache.size >= GET_CACHE_MAX) {
      const first = getProductCache.keys().next().value;
      if (first) getProductCache.delete(first);
    }
  }
  getProductCache.set(url, { ...entry, expiresAt: Date.now() + GET_CACHE_TTL_MS });
}

// ==========================================
// FILE D'ATTENTE : une seule requête à la fois vers wp.impexo.fr (éviter 429)
// ==========================================
let wpFetchTail = Promise.resolve();
function runWpFetch(fn) {
  const next = wpFetchTail.then(() => fn(), () => fn());
  wpFetchTail = next;
  return next;
}

export default async function handler(req, res) {
  // Log RAW IMMÉDIATEMENT, avant tout traitement - DIAGNOSTIC DÉFINITIF
  console.error('[Proxy WooCommerce] 🚀 HANDLER DÉMARRÉ:', {
    method: req.method,
    url: req.url,
    query: JSON.stringify(req.query),
    body: req.body ? JSON.stringify(req.body).substring(0, 100) : 'null',
    WP_BASE_URL: process.env.WP_BASE_URL ? process.env.WP_BASE_URL.substring(0, 30) : 'MANQUANT',
  });
  
  // Vérifier si l'URL contient déjà un paramètre path=
  if (req.url && req.url.includes('path=')) {
    console.error('⚠️ URL CONTIENT path=:', req.url);
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      console.error('   Query params dans URL:', Object.fromEntries(urlObj.searchParams));
    } catch (e) {
      console.error('   Erreur lors du parsing de l\'URL:', e.message);
    }
  }
  
  try {
    logError('🔍 DEBUT HANDLER:', {
      method: req.method,
      url: req.url,
      query: JSON.stringify(req.query),
      queryKeys: Object.keys(req.query || {}),
    });
    
    // ==========================================
    // 1. EXTRACTION DU CHEMIN
    // ==========================================
    const rawPath = req.query['...path'];
    logError('🔍 EXTRACTION PATH:', {
      rawPath: rawPath,
      rawPathType: typeof rawPath,
      isArray: Array.isArray(rawPath),
    });
    
    let path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || '';
    logError('🔍 PATH APRÈS JOIN:', { path });

    // AJOUT : fallback sur req.query.path (cas où le client envoie ?path=...)
    if (!path && req.query.path) {
      path = Array.isArray(req.query.path) 
        ? req.query.path.join('/') 
        : req.query.path;
      logError('⚠️ Path récupéré depuis req.query.path:', path);
    }

    // Fallback : extraire depuis l'URL si req.query["...path"] n'est pas disponible
    if (!path) {
      logError('⚠️ Path vide, tentative extraction depuis URL');
      logError('   req.url:', req.url);
      logError('   typeof req.url:', typeof req.url);
      
      // Regex améliorée : capture tout jusqu'au ? ou jusqu'à la fin
      const urlMatch = req.url?.match(/\/api\/woocommerce\/([^?]+)/);
      if (urlMatch) {
        path = urlMatch[1];
        logError('✅ Path extrait depuis URL:', path);
      } else {
        logError('❌ Impossible d\'extraire le path depuis l\'URL:', req.url);
      }
    }
    
    logError('🔍 PATH FINAL:', { path });

    // Log des headers pour déboguer (surtout pour le nonce)
    const headersForLog = {};
    Object.keys(req.headers).forEach(key => {
      if (key.toLowerCase().includes('nonce') || key.toLowerCase().includes('cookie')) {
        const value = req.headers[key];
        headersForLog[key] = typeof value === 'string' && value.length > 20 
          ? value.substring(0, 20) + '...' 
          : value;
      }
    });
    
    log('✅ Requête reçue:', {
      method: req.method,
      url: req.url,
      pathFinal: path,
      headersRelevants: headersForLog,
      timestamp: new Date().toISOString(),
    });

    // ==========================================
    // 2. VALIDATION DU CHEMIN
    // ==========================================
    if (!path) {
      logError('❌ Impossible d\'extraire le chemin!', { query: req.query, url: req.url });
      return sendJson(res, 400, {
        error: 'Chemin WooCommerce manquant',
        message: 'Le chemin de l\'API WooCommerce est manquant dans la requête',
        diagnostic: {
          url: req.url,
          hint: 'Vérifiez que vous appelez /api/woocommerce/products et que le fichier est bien nommé [...path].js',
        },
        data: [],
      }, req);
    }

    // ==========================================
    // 3. GESTION CORS ET MÉTHODES HTTP
    // ==========================================
    setCorsHeaders(res, req);

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!allowedMethods.includes(req.method)) {
      log('Méthode non autorisée:', req.method);
      return sendJson(res, 405, { error: 'Method not allowed' }, req);
    }

    // ==========================================
    // 4. URL de l'endpoint custom woo-api.php (doit être le serveur où le PHP tourne = WordPress)
    // www.impexo.fr = Vercel (front) → pas de PHP. wp.impexo.fr = hébergeur WordPress → woo-api.php
    // ==========================================
    const wooApiOrigin = (process.env.WOO_API_ORIGIN || process.env.WP_BASE_URL || 'https://wp.impexo.fr').replace(/\/+$/, '');
    const wooApiUrl = `${wooApiOrigin}/woo-api.php`;
    logError('ENV CHECK:', { WOO_API_ORIGIN: wooApiOrigin });

    // ==========================================
    // 5. CONSTRUCTION DE L'URL — redirection vers woo-api.php (jamais /wp-json/ ni chemin relatif)
    // ==========================================
    logError('🔍 CONSTRUCTION URL:', { path, pathType: typeof path });

    if (!path) {
      logError('❌ Path manquant');
      return sendJson(res, 400, {
        error: 'Chemin WooCommerce manquant',
        message: 'Path manquant dans la requête',
        diagnostic: { url: req.url, query: req.query },
        data: [],
      }, req);
    }

    // Store API (cart/items, cart/add-item) → proxy WordPress wc-store-proxy.php
    if (path.startsWith('store/')) {
      const storeEndpoint = path.replace(/^store\/v1\/?/i, '');
      if (!storeEndpoint) {
        return sendJson(res, 400, {
          error: 'Store API : endpoint manquant',
          message: 'Ex: store/v1/cart/items ou store/v1/cart/add-item',
          data: [],
        }, req);
      }
      const storeProxyUrl = `${wooApiOrigin}/wc-store-proxy.php?endpoint=${encodeURIComponent(storeEndpoint)}`;
      const storeHeaders = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (req.headers.cookie) storeHeaders['Cookie'] = req.headers.cookie;
      if (req.headers.nonce) storeHeaders['Nonce'] = req.headers.nonce;
      if (req.headers['cart-token']) storeHeaders['Cart-Token'] = req.headers['cart-token'];
      const hasBody =
        req.body &&
        (typeof req.body === 'string' ? req.body.length > 0 : Object.keys(req.body).length > 0);
      const storeOptions = {
        method: req.method,
        headers: storeHeaders,
      };
      if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && hasBody) {
        storeOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
      try {
        const storeRes = await runWpFetch(() => fetch(storeProxyUrl, storeOptions));
        ['Nonce', 'Cart-Token'].forEach(h => {
          const v = storeRes.headers.get(h);
          if (v) res.setHeader(h, v);
        });
        const setCookies = [];
        storeRes.headers.forEach((value, key) => {
          if (key.toLowerCase() === 'set-cookie') setCookies.push(value);
        });
        if (setCookies.length > 0) res.setHeader('Set-Cookie', setCookies);
        const ct = storeRes.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await storeRes.json().catch(() => ({}));
          return res.status(storeRes.status).json(data);
        }
        const text = await storeRes.text();
        return res.status(storeRes.status).setHeader('Content-Type', ct || 'text/plain').send(text);
      } catch (storeErr) {
        logError('Store API proxy error:', storeErr);
        return sendJson(res, 502, {
          error: 'Erreur proxy Store API',
          message: storeErr?.message || 'wc-store-proxy.php injoignable',
          data: [],
        }, req);
      }
    }

    let cleanUrl;
    try {
      cleanUrl = new URL(wooApiUrl);
    } catch (urlError) {
      return sendJson(res, 500, {
        error: 'Erreur construction URL',
        message: urlError.message,
        diagnostic: { wooApiUrl },
      }, req);
    }

    // Mapping path + query → action woo-api.php
    const variationsMatch = path.match(/^products\/(\d+)\/variations$/);
    const hasSlug = req.query.slug !== undefined && req.query.slug !== '';

    if (variationsMatch) {
      cleanUrl.searchParams.set('action', 'variations');
      cleanUrl.searchParams.set('product_id', variationsMatch[1]);
      cleanUrl.searchParams.set('per_page', String(req.query.per_page || 100));
      cleanUrl.searchParams.set('status', String(req.query.status || 'publish'));
    } else if (path === 'products' && hasSlug) {
      cleanUrl.searchParams.set('action', 'product-by-slug');
      cleanUrl.searchParams.set('slug', String(req.query.slug));
      cleanUrl.searchParams.set('status', String(req.query.status || 'publish'));
    } else if (path === 'products' || path.startsWith('products')) {
      cleanUrl.searchParams.set('action', 'products');
      cleanUrl.searchParams.set('per_page', String(req.query.per_page || 24));
      cleanUrl.searchParams.set('page', String(req.query.page || 1));
      cleanUrl.searchParams.set('orderby', String(req.query.orderby || 'date'));
      cleanUrl.searchParams.set('order', String(req.query.order || 'desc'));
      cleanUrl.searchParams.set('status', String(req.query.status || 'publish'));
      if (req.query.search) cleanUrl.searchParams.set('search', String(req.query.search));
      if (req.query.featured === 'true' || req.query.featured === true) cleanUrl.searchParams.set('featured', 'true');
    } else {
      return sendJson(res, 400, {
        error: 'Action non supportée',
        message: `Path non géré: ${path}. Endpoint custom woo-api.php : products, product-by-slug, variations.`,
        data: [],
      }, req);
    }

    const url = cleanUrl.toString();
    
    logError('🔍 URL NETTOYÉE:', maskSecret(url));
    logError('🔍 URL AVANT MASQUAGE:', url); // Pour debug complet
    log('URL WooCommerce:', maskSecret(url));

    // Cache GET produits/variations (pas Store Cart) pour limiter les 429
    if (req.method === 'GET' && !path.startsWith('store/')) {
      const cached = getCachedResponse(url);
      if (cached) {
        log('Cache hit (GET):', maskSecret(url).substring(0, 80));
        setCorsHeaders(res, req);
        res.setHeader('Content-Type', cached.contentType || 'application/json');
        return res.status(cached.status).json(cached.data);
      }
    }

    // ==========================================
    // 6. PRÉPARATION DE LA REQUÊTE (woo-api.php = GET seul, pas d'auth)
    // ==========================================
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    };
    const acceptLang = req.headers['accept-language'];
    if (acceptLang && typeof acceptLang === 'string') headers['accept-language'] = acceptLang;

    // ==========================================
    // 7. TIMEOUT VIA AbortController
    // ==========================================
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s max

    const fetchOptions = {
      method: req.method,
      headers,
      signal: controller.signal,
    };

    // Ajouter le body pour POST, PUT et DELETE (DELETE peut avoir un body pour l'API Store Cart)
    // Vérifier que req.body existe et n'est pas un objet vide (bodyParser: true peut créer {} pour les GET)
    const hasBody =
      req.body &&
      (typeof req.body === 'string'
        ? req.body.length > 0
        : Object.keys(req.body).length > 0);
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && hasBody) {
      fetchOptions.body =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    // ==========================================
    // 8. EXÉCUTION DE LA REQUÊTE VERS WOOCOMMERCE
    // ==========================================
    logError('🔍 DEBUG REQUEST:', {
      url: maskSecret(url),
      method: req.method,
      path: path,
      bodyType: typeof req.body,
      body: req.body ? JSON.stringify(req.body).substring(0, 200) : 'null',
      hasContentLength: !!req.headers['content-length'],
      fetchOptionsBody: fetchOptions.body ? (typeof fetchOptions.body === 'string' ? fetchOptions.body.substring(0, 200) : String(fetchOptions.body).substring(0, 200)) : 'undefined',
      fetchOptionsMethod: fetchOptions.method,
      headersKeys: (() => {
        try {
          return Object.keys(fetchOptions.headers || {});
        } catch (e) {
          return ['error: ' + String(e)];
        }
      })(),
      headersSample: (() => {
        try {
          const headers = fetchOptions.headers || {};
          const entries = Object.entries(headers);
          return Object.fromEntries(
            entries.slice(0, 5).map(([k, v]) => [
              k,
              typeof v === 'string' && v.length > 50 ? v.substring(0, 50) + '...' : v
            ])
          );
        } catch (e) {
          return { error: 'Impossible de lire les headers: ' + String(e) };
        }
      })(),
    });
    
    let wooResponse;
    try {
      logError('🔍 AVANT FETCH:', {
        url: maskSecret(url),
        urlRaw: url,
        method: fetchOptions.method,
        hasBody: !!fetchOptions.body,
        bodyLength: fetchOptions.body ? String(fetchOptions.body).length : 0,
        bodyPreview: fetchOptions.body ? (typeof fetchOptions.body === 'string' ? fetchOptions.body.substring(0, 100) : String(fetchOptions.body).substring(0, 100)) : 'undefined',
        signalType: fetchOptions.signal ? 'AbortSignal' : 'undefined',
        path: path,
        wooApiUrl,
      });

      // Validation finale de l'URL avant le fetch
      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        logError('❌ URL invalide avant fetch:', { url, type: typeof url });
        return sendJson(res, 500, {
          error: 'URL WooCommerce invalide',
          message: `L'URL construite est invalide: ${url}`,
          diagnostic: { path, wooApiUrl, url },
        }, req);
      }
      
      let fetchTargetUrl = url;
      const urlObj = new URL(url);
      if (urlObj.searchParams.has('path') || urlObj.searchParams.has('...path')) {
        logError('⚠️ URL CONTIENT ENCORE path= ! Nettoyage...');
        urlObj.searchParams.delete('path');
        urlObj.searchParams.delete('...path');
        fetchTargetUrl = urlObj.toString();
        logError('🔧 URL NETTOYÉE FINALE:', fetchTargetUrl);
      }
      logError('URL FINALE AVANT FETCH:', fetchTargetUrl);
      logError('🔍 FETCH OPTIONS COMPLET:', {
        method: fetchOptions.method,
        headers: JSON.stringify(fetchOptions.headers),
        hasBody: !!fetchOptions.body,
        bodyType: typeof fetchOptions.body,
        bodyLength: fetchOptions.body ? String(fetchOptions.body).length : 0,
        hasSignal: !!fetchOptions.signal,
        signalType: fetchOptions.signal ? fetchOptions.signal.constructor.name : 'undefined',
      });
      
      // Une seule requête à la fois vers wp.impexo.fr pour rester sous le rate limit
      wooResponse = await runWpFetch(() => fetch(fetchTargetUrl, fetchOptions));
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Log détaillé du cause pour diagnostiquer le problème réseau
      logError('FETCH CAUSE:', fetchError?.cause?.code, fetchError?.cause?.message);
      logError('FETCH ERROR CAUSE (full):', fetchError.cause); // Très important pour diagnostiquer
      logError('FETCH ERROR:', fetchError.message);
      logError('❌ ERREUR FETCH:', {
        name: fetchError.name,
        message: fetchError.message,
        url: maskSecret(url),
        method: fetchOptions.method,
        hasBody: !!fetchOptions.body,
        cause: fetchError.cause ? String(fetchError.cause) : undefined,
        causeType: fetchError.cause ? typeof fetchError.cause : undefined,
        causeCode: fetchError?.cause?.code,
        causeMessage: fetchError?.cause?.message,
        causeKeys: fetchError.cause && typeof fetchError.cause === 'object' ? Object.keys(fetchError.cause) : undefined,
      });
      if (fetchError.name === 'AbortError') {
        logError('❌ Timeout - WooCommerce n\'a pas répondu dans les délais');
        return sendJson(res, 504, {
          error: 'Timeout WooCommerce',
          message: 'WooCommerce n\'a pas répondu dans les 8 secondes',
          data: [],
        }, req);
      }
      throw fetchError; // relancé vers le catch global
    } finally {
      clearTimeout(timeoutId);
    }

    const contentType = wooResponse.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    log('Réponse reçue:', {
      status: wooResponse.status,
      contentType,
      url: maskSecret(url),
    });

    // ==========================================
    // 9. TRAITEMENT DE LA RÉPONSE
    // ==========================================

    // Copie des headers utiles (woo-api.php = produits/variations uniquement)
    // CORRECTION : Ajouter 'Nonce' et 'Cart-Token' à la liste des headers copiés
    ['cache-control', 'x-total', 'x-total-pages', 'Nonce', 'Cart-Token'].forEach(h => {
      const v = wooResponse.headers.get(h);
      if (v) {
        res.setHeader(h, v);
        if (h === 'Nonce') {
          log('Nonce retourné au client:', v.substring(0, 10) + '...');
        } else if (h === 'Cart-Token') {
          log('Cart-Token retourné au client:', v.substring(0, 20) + '...');
        }
      }
    });

    // CRITIQUE : Transmettre les cookies Set-Cookie de WooCommerce vers le client
    // Le cookie woocommerce_session doit être transmis pour maintenir la session
    // CORRECTION : Utiliser headers.forEach() pour compatibilité avec fetch natif Node.js 18+
    // headers.raw() n'existe pas sur fetch natif, et get() concatène les cookies avec des virgules
    const setCookies = [];
    wooResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        setCookies.push(value);
      }
    });
    if (setCookies.length > 0) {
      res.setHeader('Set-Cookie', setCookies);
      log(`Set-Cookie transmis (${setCookies.length} cookie(s))`);
    }

    if (isJson) {
      const data = await wooResponse.json();
      log('Données JSON reçues:', Array.isArray(data) ? `Array(${data.length})` : typeof data);

      // Détection d'erreur WooCommerce : uniquement si le status HTTP indique un échec
      // (on ne se fie plus aux champs "message"/"code" qui existent aussi dans les succès)
      if (!wooResponse.ok && data && typeof data === 'object') {
        logError('WooCommerce API error:', { status: wooResponse.status, data });
        return sendJson(res, wooResponse.status, {
          error: data.message || data.error || 'WooCommerce API error',
          code: data.code || 'unknown',
          data: [],
        });
      }

      // Mettre en cache les GET (200)
      if (req.method === 'GET' && wooResponse.status === 200) {
        setCachedResponse(url, {
          status: wooResponse.status,
          contentType: 'application/json',
          data,
        });
      }

      return sendJson(res, wooResponse.status, data, req);
    }

    // Réponse non-JSON (HTML, texte, etc.)
    const rawText = await wooResponse.text();
    const isHtml = rawText.includes('<!doctype') || rawText.includes('<html');
    const preview = rawText.substring(0, 200);

    logError('⚠️ Réponse non-JSON reçue de WooCommerce:', {
      status: wooResponse.status,
      contentType,
      isHtml,
      preview,
      url: maskSecret(url),
    });

    let errorMessage = 'Réponse non-JSON reçue de WooCommerce';
    if (wooResponse.status === 404) {
      errorMessage =
        'Endpoint WooCommerce introuvable (404). Vérifiez que l\'URL est correcte et que WooCommerce REST API est activée.';
    } else if (wooResponse.status === 401) {
      errorMessage =
        'Authentification échouée (401). Vérifiez que les clés API WooCommerce sont correctes.';
    } else if (isHtml) {
      errorMessage =
        'WordPress a retourné une page HTML au lieu de JSON. Vérifiez que l\'URL de l\'API est correcte.';
    }

    return sendJson(res, wooResponse.status >= 400 ? wooResponse.status : 500, {
      error: errorMessage,
      status: wooResponse.status,
      contentType,
      preview,
      diagnostic: {
        url: maskSecret(url),
        wooApiUrl: wooApiUrl,
        isHtml,
      },
      data: [],
    });
  } catch (error) {
    // ==========================================
    // 10. GESTION DES ERREURS GLOBALES
    // ==========================================
    // Essayer d'extraire le path depuis l'URL si req.query n'est pas disponible
    let errorPath = req.query?.['...path'];
    if (!errorPath && req.url) {
      const urlMatch = req.url.match(/\/api\/woocommerce\/(.+?)(?:\?|$)/);
      if (urlMatch) {
        errorPath = urlMatch[1];
      }
    }
    
    logError('❌ Erreur non gérée:', {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      url: req.url,
      method: req.method,
      path: errorPath || 'undefined',
      queryKeys: req.query ? Object.keys(req.query) : 'no query',
      hasBody: !!req.body,
      bodyType: typeof req.body,
    });

    return sendJson(res, 500, {
      error: 'Erreur lors de la requête WooCommerce',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      type: error instanceof Error ? error.name : 'Unknown',
      data: [],
    }, req);
  }
}

// ==========================================
// HELPERS
// ==========================================

/** Envoie une réponse JSON avec les bons headers */
function sendJson(res, status, body, req = null) {
  res.setHeader('Content-Type', 'application/json');
  setCorsHeaders(res, req);
  return res.status(status).json(body);
}

/** Ajoute les headers CORS */
function setCorsHeaders(res, req = null) {
  // CORRECTION : Access-Control-Allow-Origin: * est incompatible avec credentials: true
  // Il faut spécifier le domaine exact de la requête
  const origin = req?.headers?.origin 
    || (req?.headers?.referer ? req.headers.referer.match(/^(https?:\/\/[^\/]+)/)?.[1] : null)
    || 'https://www.impexo.fr';
  
  // Liste des origines autorisées (sécurité)
  const allowedOrigins = [
    'https://www.impexo.fr',
    'https://impexo.fr',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];
  
  // Vérifier si l'origine est autorisée (ou utiliser l'origine de la requête en dev)
  const finalOrigin = allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')
    ? origin
    : 'https://www.impexo.fr'; // Fallback sécurisé
  
  res.setHeader('Access-Control-Allow-Origin', finalOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Nonce, Cart-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Nonce, Set-Cookie, Cart-Token');
}

/** Masque le consumer_secret dans les logs */
function maskSecret(url) {
  return url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***');
}