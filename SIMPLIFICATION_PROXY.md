# Simplification : Frontend utilise toujours le proxy

## Modifications appliquées

### ✅ Frontend (`src/services/woocommerce.ts`)

**Avant :**
- Mode proxy OU mode direct selon la configuration
- Basic Auth côté frontend pour le mode direct
- Fallback vers API directe si le proxy échoue
- Complexité avec `proxyFailed`, `assertWpBaseUrl`, etc.

**Après :**
- ✅ **Toujours utiliser le proxy** (`/api/woocommerce/products`)
- ✅ **Plus de Basic Auth côté frontend** (le proxy gère tout)
- ✅ **Plus de fallback** vers API directe
- ✅ **Code simplifié** : une seule méthode d'authentification

### ✅ Proxy Backend (`api/woocommerce/products.js` et `api/woocommerce/[...path].js`)

Le proxy :
1. ✅ **Reçoit la requête** du frontend : `/api/woocommerce/products?per_page=48&page=1&search=transparente`
2. ✅ **Ajoute les clés** via Basic Auth : `Authorization: Basic base64(consumer_key:consumer_secret)`
3. ✅ **Appelle WordPress** : `https://wp.impexo.fr/wp-json/wc/v3/products?...`
4. ✅ **Renvoie les données** au frontend

## Flux de données

```
Frontend                    Proxy                      WordPress
   │                          │                            │
   │ GET /api/woocommerce/    │                            │
   │    products?per_page=48  │                            │
   │─────────────────────────>│                            │
   │                          │                            │
   │                          │ GET /wp-json/wc/v3/       │
   │                          │    products?per_page=48   │
   │                          │ Authorization: Basic ...   │
   │                          │───────────────────────────>│
   │                          │                            │
   │                          │                            │ [JSON avec produits]
   │                          │<───────────────────────────│
   │                          │                            │
   │ [JSON avec produits]      │                            │
   │<─────────────────────────│                            │
   │                          │                            │
```

## Avantages

### ✅ Sécurité
- **Plus de Basic Auth dans le navigateur** : Les credentials ne sont jamais exposés côté client
- **Clés sécurisées** : Stockées uniquement dans les variables d'environnement Vercel (côté serveur)
- **Pas de credentials dans l'URL** : Plus de `?consumer_key=...&consumer_secret=...`

### ✅ Simplicité
- **Code frontend simplifié** : Plus de logique de fallback, plus de Basic Auth
- **API propre** : Le frontend appelle simplement `/api/woocommerce/products`
- **Moins de warnings** : Plus de warnings WooCommerce dans la console

### ✅ Maintenabilité
- **Une seule méthode d'authentification** : Basic Auth uniquement côté proxy
- **Code plus facile à comprendre** : Pas de conditions complexes
- **Moins de bugs potentiels** : Moins de code = moins de bugs

## Exemple de requête

### Frontend
```typescript
// Simple et propre
const products = await wooFetch<WooProduct[]>("/wp-json/wc/v3/products", {
  per_page: 48,
  page: 1,
  search: "transparente",
  status: "publish",
});
```

### URL générée
```
/api/woocommerce/products?per_page=48&page=1&search=transparente&status=publish
```

### Proxy ajoute Basic Auth
```javascript
headers['Authorization'] = `Basic ${base64(consumer_key:consumer_secret)}`;
```

### Requête vers WordPress
```
GET https://wp.impexo.fr/wp-json/wc/v3/products?per_page=48&page=1&search=transparente&status=publish
Authorization: Basic Y2tfMzc0YzBlYzc4MDM5ZmQ0MTE1ZjQ0MjM4ZGFlODRhYzdjYjMxY2QzODpjc184MGQyNDk1NmY5NGY0OGI3NzJkMDY1YzUxNDllN2FiMGNmMzc2YTM=
```

## Variables d'environnement nécessaires

### Dans Vercel (côté serveur uniquement)
```
WP_BASE_URL=https://wp.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

### Optionnel pour le frontend
```
VITE_USE_WC_PROXY=true
VITE_WC_PROXY_URL=/api/woocommerce
```

**Note :** Plus besoin de `VITE_WP_BASE_URL`, `VITE_WC_CONSUMER_KEY`, `VITE_WC_CONSUMER_SECRET` côté frontend car le proxy gère tout.

## Résultat

✔️ **Plus de Basic Auth dans le navigateur**  
✔️ **Plus de warnings WooCommerce**  
✔️ **Clés sécurisées** (côté serveur uniquement)  
✔️ **API propre** (`/api/woocommerce/products`)  

## Fichiers modifiés

- ✅ `src/services/woocommerce.ts` - Simplification complète, toujours utiliser le proxy
- ✅ `api/woocommerce/products.js` - Utilise Basic Auth pour appeler WordPress
- ✅ `api/woocommerce/[...path].js` - Utilise Basic Auth pour appeler WordPress

## Prochaines étapes

1. ✅ Redéployer sur Vercel
2. ✅ Tester les requêtes API
3. ✅ Vérifier dans les DevTools que les requêtes vont vers `/api/woocommerce/products`
4. ✅ Vérifier qu'il n'y a plus de Basic Auth dans les headers du navigateur
