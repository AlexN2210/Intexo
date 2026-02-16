/**
 * Proxy API Route Vercel pour WooCommerce (version JavaScript)
 * 
 * Cette route proxy toutes les requêtes vers l'API WooCommerce
 * en ajoutant les clés d'authentification côté serveur.
 * 
 * Usage: /api/woocommerce/products, /api/woocommerce/products/123, etc.
 */

export default async function handler(req, res) {
  // Log pour debug
  console.log('[Proxy WooCommerce] Requête reçue:', {
    method: req.method,
    url: req.url,
    query: req.query,
    path: req.query.path,
  });

  // Méthodes HTTP autorisées
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    console.log('[Proxy WooCommerce] Méthode non autorisée:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Récupération des variables d'environnement
  const wpBaseUrl = process.env.VITE_WP_BASE_URL || process.env.WP_BASE_URL;
  const consumerKey = process.env.VITE_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.VITE_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET;

  // Vérification de la configuration
  if (!wpBaseUrl || !consumerKey || !consumerSecret) {
    console.error('Configuration WooCommerce manquante:', {
      wpBaseUrl: !!wpBaseUrl,
      consumerKey: !!consumerKey,
      consumerSecret: !!consumerSecret,
    });
    return res.status(500).json({ 
      error: 'Configuration WooCommerce manquante',
      message: 'Les variables d\'environnement WooCommerce ne sont pas configurées'
    });
  }

  try {
    // Construction du chemin WooCommerce
    // req.query.path est un tableau pour les routes catch-all [...path]
    const path = Array.isArray(req.query.path) 
      ? req.query.path.join('/') 
      : req.query.path || '';
    
    const wooPath = `/wp-json/wc/v3/${path}`;
    
    console.log('[Proxy WooCommerce] Chemin construit:', {
      pathFromQuery: req.query.path,
      pathJoined: path,
      wooPath,
    });
    
    // Construction de l'URL complète
    const baseUrl = wpBaseUrl.replace(/\/+$/, ''); // Retire les slashes finaux
    const url = new URL(wooPath, baseUrl);
    
    console.log('[Proxy WooCommerce] URL WooCommerce:', url.toString());
    
    // Ajout des paramètres de requête (sauf 'path' qui est pour le routing)
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
    
    // Ajout des clés d'authentification WooCommerce
    url.searchParams.set('consumer_key', consumerKey);
    url.searchParams.set('consumer_secret', consumerSecret);

    // Préparation des headers pour la requête vers WooCommerce
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
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

    // Exécution de la requête vers WooCommerce
    console.log('[Proxy WooCommerce] Envoi de la requête vers:', url.toString());
    const wooResponse = await fetch(url.toString(), fetchOptions);
    
    console.log('[Proxy WooCommerce] Réponse reçue:', {
      status: wooResponse.status,
      statusText: wooResponse.statusText,
      contentType: wooResponse.headers.get('content-type'),
      headers: Object.fromEntries(wooResponse.headers.entries()),
    });

    // Récupération du contenu de la réponse
    const contentType = wooResponse.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    let data;
    if (isJson) {
      data = await wooResponse.json();
      console.log('[Proxy WooCommerce] Données JSON reçues:', Array.isArray(data) ? `Array(${data.length})` : typeof data);
      
      // Vérification : si on attend un tableau mais qu'on reçoit un objet d'erreur
      if (!Array.isArray(data) && data && typeof data === 'object') {
        if ('error' in data || 'message' in data || 'code' in data) {
          // C'est probablement une erreur WooCommerce
          console.error('WooCommerce API error response:', data);
          return res.status(wooResponse.status).json({
            error: data.message || data.error || 'WooCommerce API error',
            code: data.code || 'unknown',
            data: [] // Retourner un tableau vide pour éviter les erreurs côté frontend
          });
        }
      }
    } else {
      data = await wooResponse.text();
    }

    // Retour de la réponse avec les mêmes headers et status
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
      // Si ce n'est pas du JSON, retourner une erreur JSON
      const preview = typeof data === 'string' ? data.substring(0, 500) : String(data).substring(0, 500);
      console.error('[Proxy WooCommerce] ERREUR: WooCommerce a retourné du non-JSON:', {
        status: wooResponse.status,
        contentType,
        preview,
        isHtml: typeof data === 'string' && (data.includes('<!doctype') || data.includes('<html')),
      });
      
      return res.status(wooResponse.status >= 400 ? wooResponse.status : 500).json({
        error: 'Réponse non-JSON reçue de WooCommerce',
        message: typeof data === 'string' ? data.substring(0, 200) : 'Réponse inattendue',
        contentType,
        data: [] // Retourner un tableau vide pour éviter les erreurs côté frontend
      });
    }

  } catch (error) {
    console.error('Erreur proxy WooCommerce:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la requête WooCommerce',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
