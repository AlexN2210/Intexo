/**
 * Route explicite pour tester le proxy WooCommerce
 * Route de test : /api/woocommerce/products
 */

export default async function handler(req, res) {
  // Wrapper try-catch global pour capturer toutes les erreurs
  try {
    // Log immédiat pour confirmer que le handler est appelé
    console.log('[Proxy WooCommerce Products] ✅ Handler appelé - Requête reçue:', {
      method: req.method,
      url: req.url,
      query: req.query,
      timestamp: new Date().toISOString(),
    });

    // Gestion OPTIONS pour CORS
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(405).json({ error: 'Method not allowed' });
    }

  // Récupération des variables d'environnement
  const wpBaseUrl = process.env.VITE_WP_BASE_URL || process.env.WP_BASE_URL;
  const consumerKey = process.env.VITE_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.VITE_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET;

  console.log('[Proxy WooCommerce Products] Variables d\'environnement:', {
    wpBaseUrl: wpBaseUrl ? `${wpBaseUrl.substring(0, 20)}...` : 'MANQUANTE',
    consumerKey: consumerKey ? `${consumerKey.substring(0, 10)}...` : 'MANQUANTE',
    consumerSecret: consumerSecret ? 'PRÉSENTE' : 'MANQUANTE',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('WP') || k.includes('WC')).join(', '),
  });

  // Vérification de la configuration
  if (!wpBaseUrl || !consumerKey || !consumerSecret) {
    console.error('[Proxy WooCommerce Products] ❌ Configuration manquante:', {
      wpBaseUrl: !!wpBaseUrl,
      consumerKey: !!consumerKey,
      consumerSecret: !!consumerSecret,
      availableEnvKeys: Object.keys(process.env).filter(k => k.includes('WP') || k.includes('WC')),
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ 
      error: 'Configuration WooCommerce manquante',
      message: 'Les variables d\'environnement WooCommerce ne sont pas configurées',
      diagnostic: {
        wpBaseUrl: !!wpBaseUrl,
        consumerKey: !!consumerKey,
        consumerSecret: !!consumerSecret,
        hint: 'Vérifiez que WP_BASE_URL, WC_CONSUMER_KEY et WC_CONSUMER_SECRET sont définies dans Vercel'
      },
      data: []
    });
  }

  try {
    // Construction de l'URL WooCommerce
    let url;
    try {
      url = new URL('/wp-json/wc/v3/products', wpBaseUrl);
    } catch (urlError) {
      console.error('[Proxy WooCommerce Products] ❌ Erreur lors de la construction de l\'URL:', {
        error: urlError instanceof Error ? urlError.message : String(urlError),
        wpBaseUrl,
      });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json({
        error: 'Erreur lors de la construction de l\'URL WooCommerce',
        message: urlError instanceof Error ? urlError.message : 'Erreur inconnue',
        diagnostic: { wpBaseUrl },
        data: []
      });
    }
    
    // Ajout des paramètres de requête
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
    
    const safeUrl = url.toString();
    console.log('[Proxy WooCommerce Products] URL WooCommerce construite:', safeUrl);
    console.log('[Proxy WooCommerce Products] Base URL:', wpBaseUrl);
    
    // Vérification que l'URL est valide
    if (!url.hostname || !url.protocol.startsWith('http')) {
      console.error('[Proxy WooCommerce Products] ❌ URL invalide:', {
        hostname: url.hostname,
        protocol: url.protocol,
        href: url.href,
      });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json({
        error: {
          code: 'INVALID_URL',
          message: 'URL WooCommerce invalide',
        },
        diagnostic: {
          wpBaseUrl,
          constructedUrl: url.toString(),
          hostname: url.hostname,
          protocol: url.protocol,
        },
        data: []
      });
    }

    // Préparation de l'authentification Basic Auth
    // Basic Auth: base64(consumer_key:consumer_secret)
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const authHeader = `Basic ${credentials}`;

    // Exécution de la requête vers WooCommerce avec Basic Auth
    let wooResponse;
    try {
      console.log('[Proxy WooCommerce Products] Envoi de la requête vers WooCommerce avec Basic Auth...');
      wooResponse = await fetch(url.toString(), {
        method: req.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      });
      console.log('[Proxy WooCommerce Products] Réponse reçue:', {
        status: wooResponse.status,
        statusText: wooResponse.statusText,
        contentType: wooResponse.headers.get('content-type'),
      });
    } catch (fetchError) {
      console.error('[Proxy WooCommerce Products] ❌ Erreur lors de la requête fetch:', {
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
        url: safeUrl,
      });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json({
        error: 'Erreur lors de la requête vers WooCommerce',
        message: fetchError instanceof Error ? fetchError.message : 'Erreur inconnue',
        diagnostic: { url: safeUrl },
        data: []
      });
    }

    const contentType = wooResponse.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    let data;
    let rawText = '';
    
    try {
      if (isJson) {
        data = await wooResponse.json();
      } else {
        rawText = await wooResponse.text();
        data = rawText;
        
        // Logger pour diagnostic
        const preview = rawText.substring(0, 500);
        const isHtml = rawText.includes('<!doctype') || rawText.includes('<html');
        console.error('[Proxy WooCommerce Products] ⚠️ Réponse HTML reçue:', {
          status: wooResponse.status,
          contentType,
          isHtml,
          preview,
        });
        
        if (wooResponse.status === 404) {
          console.error('[Proxy WooCommerce Products] ❌ 404 - URL probablement incorrecte');
          console.error('[Proxy WooCommerce Products] URL testée:', url.toString().replace(/consumer_secret=[^&]+/, 'consumer_secret=***'));
        }
        if (wooResponse.status === 401) {
          console.error('[Proxy WooCommerce Products] ❌ 401 - Clés API probablement invalides');
        }
      }
    } catch (parseError) {
      console.error('[Proxy WooCommerce Products] ❌ Erreur lors du parsing de la réponse:', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        contentType,
        status: wooResponse.status,
      });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json({
        error: 'Erreur lors du parsing de la réponse WooCommerce',
        message: parseError instanceof Error ? parseError.message : 'Erreur inconnue',
        diagnostic: {
          status: wooResponse.status,
          contentType,
        },
        data: []
      });
    }

    console.log('[Proxy WooCommerce Products] Réponse reçue:', {
      status: wooResponse.status,
      contentType,
      isJson,
      dataType: Array.isArray(data) ? `Array(${data.length})` : typeof data,
    });

    // Retour de la réponse
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Content-Type', 'application/json');

    // Gestion des erreurs WooCommerce
    if (wooResponse.status >= 400) {
      console.error('[Proxy WooCommerce Products] ❌ Erreur WooCommerce:', {
        status: wooResponse.status,
        statusText: wooResponse.statusText,
        data,
      });
      
      // Si c'est une erreur et qu'on a du JSON, formater la réponse d'erreur
      if (isJson && data) {
        const errorMessage = data.message || data.error || data.code || `Erreur ${wooResponse.status}`;
        const errorCode = data.code || `HTTP_${wooResponse.status}`;
        
        return res.status(wooResponse.status).json({
          error: {
            code: errorCode,
            message: errorMessage,
          },
          status: wooResponse.status,
          diagnostic: {
            url: safeUrl,
            baseUrl: wpBaseUrl,
            wooCommerceError: data,
          },
          data: []
        });
      }
      
      // Si c'est une erreur mais pas de JSON, retourner une erreur formatée
      return res.status(wooResponse.status).json({
        error: {
          code: `HTTP_${wooResponse.status}`,
          message: wooResponse.statusText || 'Erreur inconnue',
        },
        status: wooResponse.status,
        diagnostic: {
          url: safeUrl,
          baseUrl: wpBaseUrl,
          contentType,
          rawResponse: typeof data === 'string' ? data.substring(0, 500) : String(data),
        },
        data: []
      });
    }

    // Si tout va bien, retourner les données
    if (isJson) {
      return res.status(wooResponse.status).json(data);
    } else {
      const isHtml = typeof data === 'string' && (data.includes('<!doctype') || data.includes('<html'));
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
          url: url.toString().replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
          baseUrl: wpBaseUrl,
          isHtml,
        },
        data: []
      });
    }

  } catch (error) {
    console.error('[Proxy WooCommerce Products] ❌ Erreur capturée:', {
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
