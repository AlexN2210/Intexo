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

export default async function handler(req, res) {
  try {
    // ==========================================
    // 1. EXTRACTION DU CHEMIN
    // ==========================================
    const rawPath = req.query['...path'];
    let path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || '';

    // Fallback : extraire depuis l'URL si req.query["...path"] n'est pas disponible
    if (!path) {
      const urlMatch = req.url.match(/\/api\/woocommerce\/(.+?)(?:\?|$)/);
      if (urlMatch) {
        path = urlMatch[1];
        log('⚠️ req.query["...path"] non disponible, extraction depuis URL:', path);
      }
    }

    log('✅ Requête reçue:', {
      method: req.method,
      url: req.url,
      pathFinal: path,
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
      });
    }

    // ==========================================
    // 3. GESTION CORS ET MÉTHODES HTTP
    // ==========================================
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!allowedMethods.includes(req.method)) {
      log('Méthode non autorisée:', req.method);
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    // ==========================================
    // 4. VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT
    // ==========================================
    const wp = process.env.WP_BASE_URL;
    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;

    if (!wp || !ck || !cs) {
      logError('Configuration WooCommerce manquante:', { wp: !!wp, ck: !!ck, cs: !!cs });
      return sendJson(res, 500, {
        error: 'Configuration WooCommerce manquante',
        message: 'Les variables d\'environnement WooCommerce ne sont pas configurées',
      });
    }

    // ==========================================
    // 5. CONSTRUCTION DE L'URL WOOCOMMERCE
    // ==========================================
    const wooPath = `/wp-json/wc/v3/${path}`;

    // Construction de la query string
    // On exclut uniquement les clés de routing Vercel ("...path")
    // Note: on n'exclut plus "products" pour ne pas bloquer un vrai paramètre éponyme
    const queryParams = new URLSearchParams();
    const routingKeys = ['...path'];

    Object.entries(req.query).forEach(([key, value]) => {
      if (!routingKeys.includes(key) && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.set(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    const url = `${wp}${wooPath}${queryString ? `?${queryString}` : ''}`;

    log('URL WooCommerce:', maskSecret(url));

    // ==========================================
    // 6. PRÉPARATION DE LA REQUÊTE
    // ==========================================
    const auth = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: auth,
    };

    // Forward de quelques headers clients non-sensibles
    ['user-agent', 'accept-language'].forEach(h => {
      const v = req.headers[h];
      if (v && typeof v === 'string') headers[h] = v;
    });

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

    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      fetchOptions.body =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    // ==========================================
    // 8. EXÉCUTION DE LA REQUÊTE VERS WOOCOMMERCE
    // ==========================================
    let wooResponse;
    try {
      wooResponse = await fetch(url, fetchOptions);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        logError('❌ Timeout - WooCommerce n\'a pas répondu dans les délais');
        return sendJson(res, 504, {
          error: 'Timeout WooCommerce',
          message: 'WooCommerce n\'a pas répondu dans les 8 secondes',
          data: [],
        });
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

    // Copie des headers utiles de WooCommerce
    ['cache-control', 'x-total', 'x-total-pages'].forEach(h => {
      const v = wooResponse.headers.get(h);
      if (v) res.setHeader(h, v);
    });

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

      return sendJson(res, wooResponse.status, data);
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
        baseUrl: wp,
        wooPath,
        isHtml,
      },
      data: [],
    });
  } catch (error) {
    // ==========================================
    // 10. GESTION DES ERREURS GLOBALES
    // ==========================================
    logError('❌ Erreur non gérée:', {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
    });

    return sendJson(res, 500, {
      error: 'Erreur lors de la requête WooCommerce',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      type: error instanceof Error ? error.name : 'Unknown',
      data: [],
    });
  }
}

// ==========================================
// HELPERS
// ==========================================

/** Envoie une réponse JSON avec les bons headers */
function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json');
  setCorsHeaders(res);
  return res.status(status).json(body);
}

/** Ajoute les headers CORS */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

/** Masque le consumer_secret dans les logs */
function maskSecret(url) {
  return url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***');
}