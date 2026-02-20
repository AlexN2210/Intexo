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
    // 4. VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT
    // ==========================================
    const wp = process.env.WP_BASE_URL;
    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;

    // Log défensif pour diagnostiquer les variables d'environnement
    logError('ENV CHECK:', {
      WP_BASE_URL: wp || 'UNDEFINED',
      WP_length: wp ? wp.length : 0,
      WP_type: typeof wp,
      hasCK: !!ck,
      hasCS: !!cs,
    });

    if (!wp || !ck || !cs) {
      logError('❌ Configuration WooCommerce manquante:', { 
        wp: wp || 'UNDEFINED', 
        wpType: typeof wp,
        ck: !!ck, 
        cs: !!cs 
      });
      return sendJson(res, 500, {
        error: 'Configuration WooCommerce manquante',
        message: 'Les variables d\'environnement WooCommerce ne sont pas configurées',
        diagnostic: {
          WP_BASE_URL: wp ? 'présent' : 'MANQUANT',
          WP_BASE_URL_type: typeof wp,
          WC_CONSUMER_KEY: ck ? 'présent' : 'MANQUANT',
          WC_CONSUMER_SECRET: cs ? 'présent' : 'MANQUANT',
        },
      });
    }

    // ==========================================
    // 5. CONSTRUCTION DE L'URL WOOCOMMERCE
    // ==========================================
    // Déterminer le namespace WooCommerce selon le chemin
    // wc/store/v1 pour l'API Store Cart, wc/v3 pour l'API REST classique
    logError('🔍 CONSTRUCTION URL:', { path, pathType: typeof path, pathLength: path ? path.length : 0 });
    
    let wooPath = '';
    if (!path) {
      logError('❌ Path est vide ou undefined lors de la construction de l\'URL!');
      return sendJson(res, 400, {
        error: 'Chemin WooCommerce manquant',
        message: 'Le chemin de l\'API WooCommerce est manquant lors de la construction de l\'URL',
        diagnostic: {
          url: req.url,
          query: req.query,
        },
        data: [],
      }, req);
    }
    
    if (path.startsWith('store/v1/')) {
      // API Store Cart (wc/store/v1) - ne nécessite pas d'authentification
      // CORRECTION : Ajouter le préfixe 'wc/' manquant
      wooPath = `/wp-json/wc/${path}`;
      logError('✅ Utilisation de l\'API Store Cart (wc/store/v1):', wooPath);
    } else {
      // API REST classique (wc/v3) - nécessite l'authentification
      wooPath = `/wp-json/wc/v3/${path}`;
      logError('✅ Utilisation de l\'API REST classique (wc/v3):', wooPath);
    }

    // Construction de l'URL proprement avec URL et URLSearchParams
    // Exclure explicitement les clés de routing Vercel pour éviter la pollution de l'URL WordPress
    const routingKeys = ['...path', 'path']; // Exclure les clés de routing Vercel
    
    // Validation défensive : s'assurer que wp est valide avant de construire l'URL
    if (!wp || typeof wp !== 'string' || !wp.startsWith('http')) {
      logError('❌ WP_BASE_URL invalide avant construction URL:', {
        wp,
        wpType: typeof wp,
        wpStartsWithHttp: wp ? wp.startsWith('http') : false,
      });
      return sendJson(res, 500, {
        error: 'Configuration WooCommerce invalide',
        message: `WP_BASE_URL est invalide: ${wp}`,
        diagnostic: { wp, wpType: typeof wp },
      });
    }
    
    // Construire l'URL de base sans query params
    let cleanUrl;
    try {
      const baseUrl = `${wp}${wooPath}`;
      logError('🔍 Construction URL avec baseUrl:', baseUrl.substring(0, 100));
      cleanUrl = new URL(baseUrl);
      logError('✅ URL CONSTRUITE:', cleanUrl.toString());
    } catch (urlError) {
      logError('❌ Erreur lors de la construction de l\'URL:', {
        error: urlError.message,
        wp,
        wooPath,
        combined: `${wp}${wooPath}`,
      });
      return sendJson(res, 500, {
        error: 'Erreur lors de la construction de l\'URL WooCommerce',
        message: urlError.message,
        diagnostic: { wp, wooPath },
      });
    }
    
    // Ajouter uniquement les query params valides (exclure les paramètres de routing)
    Object.entries(req.query).forEach(([key, value]) => {
      if (!routingKeys.includes(key) && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => cleanUrl.searchParams.append(key, String(v)));
        } else {
          cleanUrl.searchParams.set(key, String(value));
        }
      }
    });
    
    const url = cleanUrl.toString();
    
    logError('🔍 URL NETTOYÉE:', maskSecret(url));
    logError('🔍 URL AVANT MASQUAGE:', url); // Pour debug complet
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

    // CRITIQUE : Transmettre le Cart-Token du client vers WordPress
    // Le Cart-Token JWT identifie la session panier et doit être transmis pour maintenir la session
    const cartToken = req.headers['cart-token'] || req.headers['Cart-Token'];
    if (isStoreCart && cartToken) {
      headers['Cart-Token'] = String(cartToken);
      log('✅ Cart-Token transmis pour l\'API Store Cart:', String(cartToken).substring(0, 20) + '...');
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
        wooPath: wooPath,
      });
      
      // Validation finale de l'URL avant le fetch
      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        logError('❌ URL invalide avant fetch:', { url, type: typeof url });
        return sendJson(res, 500, {
          error: 'URL WooCommerce invalide',
          message: `L'URL construite est invalide: ${url}`,
          diagnostic: { path, wooPath, url },
        }, req);
      }
      
      // Vérifier que l'URL ne contient pas de paramètres de routing polluants
      const urlObj = new URL(url);
      if (urlObj.searchParams.has('path') || urlObj.searchParams.has('...path')) {
        logError('⚠️ URL CONTIENT ENCORE path= ! Nettoyage...');
        urlObj.searchParams.delete('path');
        urlObj.searchParams.delete('...path');
        const cleanedUrl = urlObj.toString();
        logError('🔧 URL NETTOYÉE FINALE:', cleanedUrl);
        // Utiliser l'URL nettoyée
        const finalUrl = cleanedUrl;
        
        logError('URL FINALE AVANT FETCH:', finalUrl);
        logError('🔍 FETCH OPTIONS COMPLET:', {
          method: fetchOptions.method,
          headers: JSON.stringify(fetchOptions.headers),
          hasBody: !!fetchOptions.body,
          bodyType: typeof fetchOptions.body,
          bodyLength: fetchOptions.body ? String(fetchOptions.body).length : 0,
          hasSignal: !!fetchOptions.signal,
          signalType: fetchOptions.signal ? fetchOptions.signal.constructor.name : 'undefined',
        });
        
        wooResponse = await fetch(finalUrl, fetchOptions);
      } else {
        logError('URL FINALE AVANT FETCH:', url);
        logError('🔍 FETCH OPTIONS COMPLET:', {
          method: fetchOptions.method,
          headers: JSON.stringify(fetchOptions.headers),
          hasBody: !!fetchOptions.body,
          bodyType: typeof fetchOptions.body,
          bodyLength: fetchOptions.body ? String(fetchOptions.body).length : 0,
          hasSignal: !!fetchOptions.signal,
          signalType: fetchOptions.signal ? fetchOptions.signal.constructor.name : 'undefined',
        });
        
        // Test optionnel avec agent undici pour diagnostiquer les problèmes SSL
        // Décommenter si le fetch échoue avec des erreurs SSL/TLS
        // try {
        //   const { Agent } = await import('undici');
        //   wooResponse = await fetch(url, {
        //     ...fetchOptions,
        //     // @ts-ignore - undici dispatcher option
        //     dispatcher: new Agent({
        //       connect: { rejectUnauthorized: false } // temporaire pour tester
        //     }),
        //   });
        // } catch (undiciError) {
        //   logError('❌ Erreur avec agent undici, fallback sur fetch standard:', undiciError);
        //   wooResponse = await fetch(url, fetchOptions);
        // }
        
        wooResponse = await fetch(url, fetchOptions);
      }
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

    // CRITIQUE : Désactiver le cache pour les réponses Store Cart
    // Le nonce doit toujours être frais, ne pas utiliser de cache
    if (isStoreCart) {
      res.setHeader('Cache-Control', 'no-store, no-cache');
    }

    // Copie des headers utiles de WooCommerce
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