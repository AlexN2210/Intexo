# Fix : Routage Vercel pour le proxy WooCommerce

## Problème identifié

Le fichier `products.js` interceptait les requêtes vers `/api/woocommerce/products` avant que `[...path].js` ne puisse les gérer.

**Structure avant :**
```
api/woocommerce/
├── products.js          ❌ Intercepte /api/woocommerce/products
└── [...path].js         ✅ Devrait gérer toutes les routes
```

**Résultat :**
- `/api/woocommerce/products` → Utilise `products.js` (route explicite)
- `/api/woocommerce/products/123` → Utilise `[...path].js` (catch-all)
- Incohérence dans le routage

## Solution appliquée

### ✅ Suppression de `products.js`

Le fichier `products.js` a été supprimé pour que toutes les requêtes passent par `[...path].js`.

**Structure après :**
```
api/woocommerce/
└── [...path].js         ✅ Gère toutes les routes
```

### ✅ Amélioration de `[...path].js`

Ajout d'une vérification pour s'assurer que `req.query.path` n'est pas vide :

```javascript
if (!path) {
  return res.status(400).json({
    error: 'Chemin WooCommerce manquant',
    ...
  });
}
```

## Comment Vercel route les requêtes

### Route catch-all `[...path].js`

Quand vous appelez `/api/woocommerce/products` :
- Vercel utilise `[...path].js`
- `req.query.path = ['products']`
- Le code extrait : `path = 'products'`
- L'URL construite : `${wp}/wp-json/wc/v3/products`

Quand vous appelez `/api/woocommerce/products/123` :
- Vercel utilise `[...path].js`
- `req.query.path = ['products', '123']`
- Le code extrait : `path = 'products/123'`
- L'URL construite : `${wp}/wp-json/wc/v3/products/123`

### Routes explicites (supprimées)

Les routes explicites comme `products.js` ont la priorité sur les catch-all, c'est pourquoi elles interceptaient les requêtes.

## Vérification

### Test 1 : Route simple

Appelez : `/api/woocommerce/products`

**Dans les logs Vercel, vous devriez voir :**
```
[Proxy WooCommerce] ✅ Handler appelé - Requête reçue: ...
[Proxy WooCommerce] Chemin construit: {
  pathFromQuery: ['products'],
  pathJoined: 'products',
  wooPath: '/wp-json/wc/v3/products'
}
```

### Test 2 : Route avec ID

Appelez : `/api/woocommerce/products/123`

**Dans les logs Vercel, vous devriez voir :**
```
[Proxy WooCommerce] Chemin construit: {
  pathFromQuery: ['products', '123'],
  pathJoined: 'products/123',
  wooPath: '/wp-json/wc/v3/products/123'
}
```

## Fichiers modifiés

- ✅ `api/woocommerce/products.js` - **SUPPRIMÉ** (utiliser uniquement `[...path].js`)
- ✅ `api/woocommerce/[...path].js` - Amélioré avec vérification du path

## Prochaines étapes

1. ✅ Redéployez sur Vercel
2. ✅ Testez `/api/woocommerce/products`
3. ✅ Vérifiez les logs Vercel pour confirmer que `req.query.path = ['products']`
4. ✅ Vérifiez que l'URL construite est correcte : `${wp}/wp-json/wc/v3/products`

## Structure finale

```
api/woocommerce/
└── [...path].js         ✅ Gère toutes les routes WooCommerce
```

**Routes supportées :**
- `/api/woocommerce/products` → `req.query.path = ['products']`
- `/api/woocommerce/products/123` → `req.query.path = ['products', '123']`
- `/api/woocommerce/products/123/variations` → `req.query.path = ['products', '123', 'variations']`
- etc.
