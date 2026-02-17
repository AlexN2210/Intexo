/**
 * Route explicite pour tester le proxy WooCommerce
 * Route de test : /api/woocommerce/products
 */

export default async function handler(req, res) {
  console.log('[Proxy WooCommerce Products] Requête reçue:', {
    method: req.method,
    url: req.url,
    query: req.query,
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Récupération des variables d'environnement
  const wpBaseUrl = process.env.VITE_WP_BASE_URL || process.env.WP_BASE_URL;
  const consumerKey = process.env.VITE_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.VITE_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET;

  // Vérification de la configuration
  if (!wpBaseUrl || !consumerKey || !consumerSecret) {
    console.error('[Proxy WooCommerce Products] Configuration manquante:', {
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
    // Construction de l'URL WooCommerce
    const url = new URL('/wp-json/wc/v3/products', wpBaseUrl);
    
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
    
    // Ajout des clés d'authentification WooCommerce
    url.searchParams.set('consumer_key', consumerKey);
    url.searchParams.set('consumer_secret', consumerSecret);

    console.log('[Proxy WooCommerce Products] URL WooCommerce:', url.toString());

    // Exécution de la requête vers WooCommerce
    const wooResponse = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const contentType = wooResponse.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    let data;
    if (isJson) {
      data = await wooResponse.json();
    } else {
      data = await wooResponse.text();
    }

    console.log('[Proxy WooCommerce Products] Réponse reçue:', {
      status: wooResponse.status,
      contentType,
      isJson,
    });

    // Retour de la réponse
    res.status(wooResponse.status);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Content-Type', 'application/json');

    if (isJson) {
      return res.json(data);
    } else {
      return res.json({
        error: 'Réponse non-JSON reçue de WooCommerce',
        message: typeof data === 'string' ? data.substring(0, 200) : 'Réponse inattendue',
        data: []
      });
    }

  } catch (error) {
    console.error('[Proxy WooCommerce Products] Erreur:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la requête WooCommerce',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
