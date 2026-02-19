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
    // Déterminer le namespace WooCommerce selon le chemin
    // wc/store/v1 pour l'API Store Cart, wc/v3 pour l'API REST classique
    let wooPath = '';
    if (path.startsWith('store/v1/')) {
      // API Store Cart (wc/store/v1) - ne nécessite pas d'authentification
      // CORRECTION : Ajouter le préfixe 'wc/' manquant
      wooPath = `/wp-json/wc/${path}`;
      log('Utilisation de l\'API Store Cart (wc/store/v1)');
    } else {
      // API REST classique (wc/v3) - nécessite l'authentification
      wooPath = `/wp-json/wc/v3/${path}`;
      log('Utilisation de l\'API REST classique (wc/v3)');
    }

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
    // L'API Store Cart (wc/store/v1) ne nécessite pas d'authentification
    // L'API REST classique (wc/v3) nécessite l'authentification
    const isStoreCart = path.startsWith('store/v1/');
    
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Ajouter l'authentification seulement pour l'API REST classique
    if (!isStoreCart) {
      const auth = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');
      headers.Authorization = auth;
      log('Authentification Basic Auth ajoutée pour l\'API REST classique');
    } else {
      log('Pas d\'authentification nécessaire pour l\'API Store Cart');
    }

    // CRITIQUE : Transmettre les cookies pour l'API Store Cart
    // Le cookie woocommerce_session identifie le panier
    // Vérifier les deux cas possibles (minuscule et majuscule)
    const cookieHeader = req.headers.cookie || req.headers['Cookie'] || req.headers['cookie'];
    if (isStoreCart && cookieHeader) {
      headers.Cookie = cookieHeader;
      log('Cookies transmis pour l\'API Store Cart:', cookieHeader.substring(0, 50) + '...');
    } else if (isStoreCart) {
      log('⚠️ Aucun cookie trouvé pour l\'API Store Cart - un nouveau panier sera créé');
    }

    // CRITIQUE : Transmettre le header Nonce pour les opérations d'écriture Store Cart
    // Le nonce est requis pour POST/PUT/DELETE sur l'API Store Cart
    // Vérifier toutes les variantes de casse possibles (Node.js/Vercel normalise en minuscules)
    const nonceHeader = req.headers.nonce 
      || req.headers['Nonce'] 
      || req.headers['nonce']
      || req.headers['NONCE'];
    
    if (isStoreCart && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
      if (nonceHeader) {
        // IMPORTANT : WooCommerce attend le header avec la casse exacte "Nonce"
        headers.Nonce = String(nonceHeader);
        log('✅ Nonce transmis pour l\'API Store Cart:', String(nonceHeader).substring(0, 10) + '...');
      } else {
        logError('❌ Aucun nonce fourni pour l\'opération d\'écriture Store Cart - risque de 403');
        logError('   Headers reçus:', Object.keys(req.headers).filter(h => h.toLowerCase().includes('nonce')));
      }
    }

    // CRITIQUE : Désactiver le cache pour les requêtes Store Cart
    // Le nonce doit toujours être frais, ne pas utiliser de cache
    if (isStoreCart) {
      headers['Cache-Control'] = 'no-cache, no-store';
      headers['Pragma'] = 'no-cache';
    }

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

    // Ajouter le body pour POST, PUT et DELETE (DELETE peut avoir un body pour l'API Store Cart)
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && req.body) {
      fetchOptions.body =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    // ==========================================
    // 8. EXÉCUTION DE LA REQUÊTE VERS WOOCOMMERCE
    // ==========================================
    logError('🔍 DEBUG POST:', {
      url: maskSecret(url),
      method: req.method,
      bodyType: typeof req.body,
      body: req.body ? JSON.stringify(req.body).substring(0, 200) : 'null',
      hasContentLength: !!req.headers['content-length'],
    });
    
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

    // CRITIQUE : Désactiver le cache pour les réponses Store Cart
    // Le nonce doit toujours être frais, ne pas utiliser de cache
    if (isStoreCart) {
      res.setHeader('Cache-Control', 'no-store, no-cache');
    }

    // Copie des headers utiles de WooCommerce
    // CORRECTION : Ajouter 'Nonce' à la liste des headers copiés
    ['cache-control', 'x-total', 'x-total-pages', 'Nonce'].forEach(h => {
      const v = wooResponse.headers.get(h);
      if (v) {
        res.setHeader(h, v);
        if (h === 'Nonce') {
          log('Nonce retourné au client:', v.substring(0, 10) + '...');
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Nonce');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Nonce, Set-Cookie');
}

/** Masque le consumer_secret dans les logs */
function maskSecret(url) {
  return url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***');
}