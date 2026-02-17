# Fix : req.query.path est undefined

## Problème identifié

Le proxy reçoit bien la requête, mais `req.query.path` est `undefined`, ce qui signifie que Vercel ne reconnaît pas le fichier comme une route catch-all `[...path].js`.

**Résultat :**
- `path = ''` (vide)
- `wooPath = '/wp-json/wc/v3/'` (incorrect)
- URL finale : `https://wp.impexo.fr/wp-json/wc/v3/?per_page=48...` (endpoint inexistant)
- WooCommerce renvoie 400 Bad Request

## Solution appliquée

### ✅ Extraction du chemin depuis l'URL

Ajout d'un fallback pour extraire le chemin depuis `req.url` si `req.query.path` n'est pas disponible :

```javascript
// Essayer d'abord req.query.path (route catch-all Vercel)
let path = '';
if (req.query.path) {
  path = Array.isArray(req.query.path) 
    ? req.query.path.join('/') 
    : req.query.path;
}

// Si path est vide, essayer d'extraire depuis l'URL
if (!path) {
  const urlMatch = req.url.match(/\/api\/woocommerce\/(.+?)(?:\?|$)/);
  if (urlMatch) {
    path = urlMatch[1]; // Exemple: "products" depuis "/api/woocommerce/products?per_page=48"
  }
}
```

### ✅ Logs de diagnostic améliorés

Ajout de logs pour voir exactement ce qui se passe :

```javascript
console.log('[Proxy WooCommerce] ✅ Handler appelé - Requête reçue:', {
  method: req.method,
  url: req.url,
  query: req.query,
  pathFromQuery: req.query.path,
  pathFromUrl, // Chemin extrait depuis l'URL si req.query.path est undefined
  timestamp: new Date().toISOString(),
});
```

## Comment ça fonctionne maintenant

### Cas 1 : req.query.path est disponible (route catch-all fonctionne)

**Requête :** `/api/woocommerce/products?per_page=48`
- `req.query.path = ['products']`
- `path = 'products'`
- `wooPath = '/wp-json/wc/v3/products'`
- URL finale : `${wp}/wp-json/wc/v3/products?per_page=48`

### Cas 2 : req.query.path est undefined (fallback depuis URL)

**Requête :** `/api/woocommerce/products?per_page=48`
- `req.query.path = undefined`
- Extraction depuis URL : `req.url.match(/\/api\/woocommerce\/(.+?)(?:\?|$)/)`
- `path = 'products'` (extrait depuis l'URL)
- `wooPath = '/wp-json/wc/v3/products'`
- URL finale : `${wp}/wp-json/wc/v3/products?per_page=48`

## Vérification dans les logs Vercel

Après redéploiement, vous devriez voir dans les logs :

**Si req.query.path fonctionne :**
```
[Proxy WooCommerce] ✅ Handler appelé - Requête reçue: {
  pathFromQuery: ['products'],
  pathFromUrl: ''
}
[Proxy WooCommerce] Chemin construit: {
  pathFinal: 'products',
  wooPath: '/wp-json/wc/v3/products'
}
```

**Si req.query.path est undefined (fallback) :**
```
[Proxy WooCommerce] ⚠️ req.query.path non disponible, extraction depuis URL: products
[Proxy WooCommerce] ✅ Handler appelé - Requête reçue: {
  pathFromQuery: undefined,
  pathFromUrl: 'products'
}
[Proxy WooCommerce] Chemin construit: {
  pathFinal: 'products',
  wooPath: '/wp-json/wc/v3/products'
}
```

## Pourquoi req.query.path peut être undefined

### Cause possible 1 : Vercel ne reconnaît pas le fichier comme route catch-all

Le fichier doit être exactement nommé `[...path].js` (avec trois points et des crochets).

**Vérification :**
```bash
ls -la api/woocommerce/
# Doit afficher: [...path].js
```

### Cause possible 2 : Le fichier n'est pas déployé correctement

Vérifiez dans Vercel → **Deployments** → **Functions** que le fichier `/api/woocommerce/[...path]` est bien listé.

### Cause possible 3 : Configuration Vercel incorrecte

Vérifiez que le **Root Directory** dans Vercel est correctement configuré si votre projet est dans un sous-dossier.

## Solution de contournement

Même si `req.query.path` est undefined, le code extrait maintenant le chemin depuis `req.url`, donc le proxy devrait fonctionner dans tous les cas.

## Fichiers modifiés

- ✅ `api/woocommerce/[...path].js` - Ajout de l'extraction du chemin depuis l'URL

## Prochaines étapes

1. ✅ Redéployez sur Vercel
2. ✅ Testez `/api/woocommerce/products?per_page=48`
3. ✅ Vérifiez les logs Vercel pour voir si `pathFromQuery` ou `pathFromUrl` est utilisé
4. ✅ Vérifiez que l'URL construite est correcte : `${wp}/wp-json/wc/v3/products?per_page=48`
