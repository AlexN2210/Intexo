/**
 * Proxy API Route Vercel pour WooCommerce (version JavaScript)
 * 
 * Cette route proxy toutes les requêtes vers l'API WooCommerce
 * en ajoutant les clés d'authentification côté serveur.
 * 
 * Usage: /api/woocommerce/products, /api/woocommerce/products/123, etc.
 */

export default async function handler(req, res) {
  // Wrapper try-catch global pour capturer toutes les erreurs
  try {
    // ==========================================
    // 1. EXTRACTION DU CHEMIN (une seule fois)
    // ==========================================
    // Pour Vercel [...path].js, req.query["...path"] contient le chemin
    // Exemple: /api/woocommerce/products -> req.query["...path"] = ['products'] ou "products"
    // Exemple: /api/woocommerce/products/123 -> req.query["...path"] = ['products', '123']
    const rawPath = req.query["...path"];
    let path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || '';
    
    // Fallback : extraire depuis l'URL si req.query["...path"] n'est pas disponible
    if (!path) {
      const urlMatch = req.url.match(/\/api\/woocommerce\/(.+?)(?:\?|$)/);
      if (urlMatch) {
        path = urlMatch[1];
        console.log('[Proxy WooCommerce] ⚠️ req.query["...path"] non disponible, extraction depuis URL:', path);
      }
    }
    
    // Log pour debug
    console.log('[Proxy WooCommerce] ✅ Handler appelé - Requête reçue:', {
      method: req.method,
      url: req.url,
      rawPath: req.query["...path"],
      pathFinal: path,
      timestamp: new Date().toISOString(),
    });
    
    // Log détaillé de req.query pour diagnostiquer
    console.log('[Proxy WooCommerce] 🔍 REQ QUERY (détaillé):', JSON.stringify(req.query, null, 2));

    // ==========================================
    // 2. VALIDATION DU CHEMIN
    // ==========================================
    if (!path) {
      console.error('[Proxy WooCommerce] ❌ ERREUR: Impossible d\'extraire le chemin!', {
        query: req.query,
        url: req.url,
        rawPath: req.query["...path"],
      });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(400).json({
        error: 'Chemin WooCommerce manquant',
        message: 'Le chemin de l\'API WooCommerce est manquant dans la requête',
        diagnostic: {
          query: req.query,
          url: req.url,
          rawPath: req.query["...path"],
          hint: 'Vérifiez que vous appelez /api/woocommerce/products et que le fichier est bien nommé [...path].js'
        },
        data: []
      });
    }

    // ==========================================
    // 3. GESTION CORS ET MÉTHODES HTTP
    // ==========================================
    // Gestion OPTIONS pour CORS
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
      return res.status(200).end();
    }

    // Méthodes HTTP autorisées
    if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
      console.log('[Proxy WooCommerce] Méthode non autorisée:', req.method);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ==========================================
    // 4. VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT
    // ==========================================
    const wp = process.env.WP_BASE_URL;
    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;

    if (!wp || !ck || !cs) {
      console.error('Configuration WooCommerce manquante:', {
        wp: !!wp,
        ck: !!ck,
        cs: !!cs,
      });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json({ 
        error: 'Configuration WooCommerce manquante',
        message: 'Les variables d\'environnement WooCommerce ne sont pas configurées'
      });
    }

    // ==========================================
    // 5. CONSTRUCTION DE L'URL WOOCOMMERCE
    // ==========================================
    const wooPath = `/wp-json/wc/v3/${path}`;
    
    console.log('[Proxy WooCommerce] Chemin construit:', {
      rawPath: req.query["...path"],
      pathFinal: path,
      wooPath,
      url: req.url,
    });
    
    // Construction de la query string (sauf '...path' et 'products' qui sont pour le routing)
    // Note: Vercel ajoute parfois 'products' comme clé fantôme dans req.query avec les routes dynamiques
    const queryParams = new URLSearchParams();
    const reservedKeys = ['...path', 'path', 'products']; // Clés réservées pour le routing Vercel
    
    Object.entries(req.query).forEach(([key, value]) => {
      // Exclure les clés réservées ET les valeurs vides/undefined
      if (!reservedKeys.includes(key) && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.set(key, String(value));
        }
      }
    });
    const queryString = queryParams.toString();
    
    // Construction de l'URL WooCommerce
    const url = `${wp}${wooPath}${queryString ? `?${queryString}` : ''}`;
    
    console.log('[Proxy WooCommerce] URL WooCommerce:', url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'));

    // ==========================================
    // 6. PRÉPARATION DE LA REQUÊTE
    // ==========================================
    // Préparation de l'authentification Basic Auth
    const auth = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');

    // Préparation des headers pour la requête vers WooCommerce avec Basic Auth
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': auth,
    };

    // Copie des headers pertinents de la requête client (optionnel)
    const forwardedHeaders = ['user-agent', 'accept-language'];
    forwardedHeaders.forEach(header => {
      const value = req.headers[header];
      if (value && typeof value === 'string') {
        headers[header] = value;
      }
    });

    // Options de la requête fetch
    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Ajout du body pour les requêtes POST/PUT
    if (req.method === 'POST' || req.method === 'PUT') {
      if (req.body) {
        fetchOptions.body = typeof req.body === 'string' 
          ? req.body 
          : JSON.stringify(req.body);
      }
    }

    // ==========================================
    // 7. EXÉCUTION DE LA REQUÊTE VERS WOOCOMMERCE
    // ==========================================
    console.log('[Proxy WooCommerce] Envoi de la requête vers:', url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'));
    console.log('[Proxy WooCommerce] Authentification: Basic Auth (credentials masquées)');
    
    const wooResponse = await fetch(url, fetchOptions);
    
    const contentType = wooResponse.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    console.log('[Proxy WooCommerce] Réponse reçue:', {
      status: wooResponse.status,
      statusText: wooResponse.statusText,
      contentType,
      isJson,
      url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
    });

    // ==========================================
    // 8. TRAITEMENT DE LA RÉPONSE
    // ==========================================
    let data;
    let rawText = '';
    
    if (isJson) {
      data = await wooResponse.json();
      console.log('[Proxy WooCommerce] Données JSON reçues:', Array.isArray(data) ? `Array(${data.length})` : typeof data);
      
      // Vérification : si on attend un tableau mais qu'on reçoit un objet d'erreur
      if (!Array.isArray(data) && data && typeof data === 'object') {
        if ('error' in data || 'message' in data || 'code' in data) {
          // C'est probablement une erreur WooCommerce
          console.error('[Proxy WooCommerce] WooCommerce API error response:', data);
          res.status(wooResponse.status);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.json({
            error: data.message || data.error || 'WooCommerce API error',
            code: data.code || 'unknown',
            data: [] // Retourner un tableau vide pour éviter les erreurs côté frontend
          });
        }
      }
    } else {
      // Si ce n'est pas du JSON, lire le texte pour diagnostiquer
      rawText = await wooResponse.text();
      data = rawText;
      
      // Logger les premières lignes pour diagnostic
      const preview = rawText.substring(0, 500);
      console.error('[Proxy WooCommerce] ⚠️ Réponse HTML reçue au lieu de JSON:', {
        status: wooResponse.status,
        contentType,
        preview,
        isHtml: rawText.includes('<!doctype') || rawText.includes('<html'),
        url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
      });
      
      // Si c'est une erreur 404, c'est probablement que l'URL est incorrecte
      if (wooResponse.status === 404) {
        console.error('[Proxy WooCommerce] ❌ Erreur 404 - URL probablement incorrecte');
        console.error('[Proxy WooCommerce] URL testée:', url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'));
        console.error('[Proxy WooCommerce] Base URL:', wp);
        console.error('[Proxy WooCommerce] Chemin WooCommerce:', wooPath);
      }
      
      // Si c'est une erreur 401, les clés API sont probablement invalides
      if (wooResponse.status === 401) {
        console.error('[Proxy WooCommerce] ❌ Erreur 401 - Clés API probablement invalides');
      }
    }

    // ==========================================
    // 9. RETOUR DE LA RÉPONSE
    // ==========================================
    res.status(wooResponse.status);
    
    // Copie des headers pertinents
    const responseHeaders = ['cache-control', 'x-total', 'x-total-pages'];
    responseHeaders.forEach(header => {
      const value = wooResponse.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });

    // Ajout de headers CORS pour permettre les requêtes depuis le frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    
    // Toujours retourner du JSON (même si la réponse WooCommerce n'était pas du JSON)
    res.setHeader('Content-Type', 'application/json');
    
    if (isJson) {
      return res.json(data);
    } else {
      // Si ce n'est pas du JSON, retourner une erreur JSON avec plus de détails
      const preview = typeof data === 'string' ? data.substring(0, 500) : String(data).substring(0, 500);
      const isHtml = typeof data === 'string' && (data.includes('<!doctype') || data.includes('<html'));
      
      console.error('[Proxy WooCommerce] ❌ ERREUR: WooCommerce a retourné du non-JSON:', {
        status: wooResponse.status,
        contentType,
        isHtml,
        preview,
        url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
      });
      
      // Messages d'erreur plus spécifiques selon le status
      let errorMessage = 'Réponse non-JSON reçue de WooCommerce';
      if (wooResponse.status === 404) {
        errorMessage = 'Endpoint WooCommerce introuvable (404). Vérifiez que l\'URL est correcte et que WooCommerce REST API est activée.';
      } else if (wooResponse.status === 401) {
        errorMessage = 'Authentification échouée (401). Vérifiez que les clés API WooCommerce sont correctes.';
      } else if (isHtml) {
        errorMessage = 'WordPress a retourné une page HTML au lieu de JSON. Vérifiez que l\'URL de l\'API est correcte.';
      }
      
      return res.status(wooResponse.status >= 400 ? wooResponse.status : 500).json({
        error: errorMessage,
        status: wooResponse.status,
        contentType,
        preview: typeof data === 'string' ? data.substring(0, 200) : 'Réponse inattendue',
        diagnostic: {
          url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
          baseUrl: wp,
          wooPath,
          isHtml,
        },
        data: [] // Retourner un tableau vide pour éviter les erreurs côté frontend
      });
    }

  } catch (error) {
    // ==========================================
    // 10. GESTION DES ERREURS
    // ==========================================
    console.error('[Proxy WooCommerce] ❌ Erreur capturée:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
    });
    
    // Toujours retourner du JSON, même en cas d'erreur
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    
    return res.status(500).json({ 
      error: 'Erreur lors de la requête WooCommerce',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      type: error instanceof Error ? error.name : 'Unknown',
      data: []
    });
  }
}
