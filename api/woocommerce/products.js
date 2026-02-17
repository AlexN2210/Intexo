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

  // Récupération des variables d'environnement (sans préfixe VITE_ pour le serveur)
  const wp = process.env.WP_BASE_URL;
  const ck = process.env.WC_CONSUMER_KEY;
  const cs = process.env.WC_CONSUMER_SECRET;

  console.log('[Proxy WooCommerce Products] Variables d\'environnement:', {
    wp: wp ? `${wp.substring(0, 20)}...` : 'MANQUANTE',
    ck: ck ? `${ck.substring(0, 10)}...` : 'MANQUANTE',
    cs: cs ? 'PRÉSENTE' : 'MANQUANTE',
  });

  // Vérification de la configuration
  if (!wp || !ck || !cs) {
    console.error('[Proxy WooCommerce Products] ❌ Configuration manquante:', {
      wp: !!wp,
      ck: !!ck,
      cs: !!cs,
      availableEnvKeys: Object.keys(process.env).filter(k => k.includes('WP') || k.includes('WC')),
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ 
      error: 'Configuration WooCommerce manquante',
      message: 'Les variables d\'environnement WooCommerce ne sont pas configurées',
      diagnostic: {
        wp: !!wp,
        ck: !!ck,
        cs: !!cs,
        hint: 'Vérifiez que WP_BASE_URL, WC_CONSUMER_KEY et WC_CONSUMER_SECRET sont définies dans Vercel'
      },
      data: []
    });
  }

  try {
    // Construction de la query string à partir des paramètres de requête
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.set(key, String(value));
        }
      }
    });
    const queryString = queryParams.toString();
    
    // Construction de l'URL WooCommerce
    const url = `${wp}/wp-json/wc/v3/products${queryString ? `?${queryString}` : ''}`;
    
    console.log('[Proxy WooCommerce Products] URL WooCommerce construite:', url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'));

    // Préparation de l'authentification Basic Auth
    const auth = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');

    // Exécution de la requête vers WooCommerce avec Basic Auth
    let wooResponse;
    try {
      console.log('[Proxy WooCommerce Products] Envoi de la requête vers WooCommerce avec Basic Auth...');
      wooResponse = await fetch(url, {
        method: req.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': auth,
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
        url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
      });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json({
        error: 'Erreur lors de la requête vers WooCommerce',
        message: fetchError instanceof Error ? fetchError.message : 'Erreur inconnue',
        diagnostic: { url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***') },
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
          console.error('[Proxy WooCommerce Products] URL testée:', url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'));
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
            url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
            baseUrl: wp,
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
          url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
          baseUrl: wp,
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
          url: url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'),
          baseUrl: wp,
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
