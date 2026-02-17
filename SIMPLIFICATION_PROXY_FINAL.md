# Simplification finale du proxy

## Modifications appliquées

### ✅ Variables d'environnement simplifiées

**Avant :**
```javascript
const wpBaseUrl = process.env.VITE_WP_BASE_URL || process.env.WP_BASE_URL;
const consumerKey = process.env.VITE_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.VITE_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET;
```

**Après :**
```javascript
const wp = process.env.WP_BASE_URL;
const ck = process.env.WC_CONSUMER_KEY;
const cs = process.env.WC_CONSUMER_SECRET;
```

### ✅ Construction d'URL simplifiée

**Avant :**
```javascript
const url = new URL('/wp-json/wc/v3/products', wpBaseUrl);
Object.entries(req.query).forEach(([key, value]) => {
  url.searchParams.set(key, String(value));
});
const finalUrl = url.toString();
```

**Après :**
```javascript
const queryParams = new URLSearchParams();
Object.entries(req.query).forEach(([key, value]) => {
  queryParams.set(key, String(value));
});
const queryString = queryParams.toString();
const url = `${wp}/wp-json/wc/v3/products${queryString ? `?${queryString}` : ''}`;
```

### ✅ Basic Auth simplifié

**Avant :**
```javascript
const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
const authHeader = `Basic ${credentials}`;
headers['Authorization'] = authHeader;
```

**Après :**
```javascript
const auth = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');
headers: {
  'Authorization': auth
}
```

## Code final du proxy

### `api/woocommerce/products.js`

```javascript
// Récupération des variables d'environnement
const wp = process.env.WP_BASE_URL;
const ck = process.env.WC_CONSUMER_KEY;
const cs = process.env.WC_CONSUMER_SECRET;

// Construction de la query string
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

// Préparation de l'authentification Basic Auth
const auth = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');

// Requête vers WooCommerce
const wooResponse = await fetch(url, {
  method: req.method,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': auth,
  },
});
```

## Variables d'environnement dans Vercel

### Côté serveur (pour le proxy)
```
WP_BASE_URL=https://wp.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**Important :** Ces variables sont utilisées **uniquement côté serveur** dans les API Routes. Elles ne sont **jamais exposées** au frontend.

## Résultat

### ✅ Code simplifié
- Variables d'environnement sans préfixe `VITE_`
- Construction d'URL simple avec template string
- Basic Auth en une ligne

### ✅ Sécurité
- Les credentials sont dans les variables d'environnement Vercel (côté serveur)
- Basic Auth injecté automatiquement par le proxy
- Pas d'exposition des clés au frontend

### ✅ Fonctionnement
1. Frontend appelle : `/api/woocommerce/products?per_page=48&page=1&search=transparente`
2. Proxy récupère les variables : `wp`, `ck`, `cs`
3. Proxy construit l'URL : `${wp}/wp-json/wc/v3/products?per_page=48&page=1&search=transparente`
4. Proxy ajoute Basic Auth : `Authorization: Basic base64(ck:cs)`
5. Proxy appelle WordPress et renvoie les données

## Fichiers modifiés

- ✅ `api/woocommerce/products.js` - Simplification complète
- ✅ `api/woocommerce/[...path].js` - Simplification complète

## Prochaines étapes

1. ✅ Redéployez sur Vercel
2. ✅ Vérifiez que les variables d'environnement sont bien configurées (sans préfixe `VITE_`)
3. ✅ Testez les requêtes API
4. ✅ Vérifiez les logs Vercel pour confirmer que le proxy fonctionne
