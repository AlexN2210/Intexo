# Fix : Le frontend n'utilise pas le proxy

## Problème identifié

Le frontend construisait une URL cassée :
```
https://www.impexo.fr/wp.impexo.fr/wp-json/wc/v3/products
```

Au lieu de :
```
https://www.impexo.fr/api/woocommerce/products
```

**Cause :** `env.proxyUrl` contenait probablement `https://wp.impexo.fr/wp-json/wc/v3` au lieu de `/api/woocommerce`.

## Solution appliquée

### ✅ Correction dans `buildWooUrl()`

**Avant :**
```typescript
const proxyBase = env.proxyUrl || '/api/woocommerce';
```

**Après :**
```typescript
// FORCER l'utilisation de /api/woocommerce (ignorer env.proxyUrl qui peut être incorrect)
const proxyPath = `/api/woocommerce/${wooPath}`.replace(/\/+/g, '/');
```

**Changements :**
1. ✅ **Forcer `/api/woocommerce`** directement, sans utiliser `env.proxyUrl`
2. ✅ **Vérification supplémentaire** : L'URL ne doit PAS contenir `wp.impexo.fr`
3. ✅ **Logs améliorés** : Pour voir exactement quelle URL est construite

## Résultat attendu

### ✅ URL correcte générée
```
https://www.impexo.fr/api/woocommerce/products?per_page=48&page=1&search=transparente&status=publish
```

### ✅ Dans les DevTools Network
```
GET /api/woocommerce/products?per_page=48&page=1&search=transparente&status=publish
Status: 200 OK
```

### ✅ Dans la console
```
[WooCommerce] ✅ URL proxy construite: https://www.impexo.fr/api/woocommerce/products?per_page=48...
[WooCommerce] Requête vers le proxy: https://www.impexo.fr/api/woocommerce/products?per_page=48...
```

## Vérification

### Étape 1 : Vérifier dans les DevTools

1. Ouvrez les **DevTools** → **Network**
2. Rechargez la page ou faites une recherche
3. Cherchez les requêtes vers `/api/woocommerce/products`

**✅ Si vous voyez :**
```
GET /api/woocommerce/products?per_page=48...
```
→ Le proxy est utilisé ✅

**❌ Si vous voyez encore :**
```
GET https://wp.impexo.fr/wp-json/wc/v3/products...
```
→ Le problème persiste ❌

### Étape 2 : Vérifier la console

Vous devriez voir :
```
[WooCommerce] ✅ URL proxy construite: https://www.impexo.fr/api/woocommerce/products?per_page=48...
```

**Si vous voyez une erreur :**
```
[WooCommerce] ❌ ERREUR: URL contient wp.impexo.fr au lieu du proxy!
```
→ Videz le cache du navigateur et redéployez

## Variables d'environnement

### Dans Vercel (côté serveur uniquement)
```
WP_BASE_URL=https://wp.impexo.fr
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
```

### Optionnel pour le frontend
```
VITE_USE_WC_PROXY=true
VITE_WC_PROXY_URL=/api/woocommerce
```

**Note :** Même si `VITE_WC_PROXY_URL` est mal configuré, le code utilise maintenant directement `/api/woocommerce`.

## Fichiers modifiés

- ✅ `src/services/woocommerce.ts` - Force l'utilisation de `/api/woocommerce` directement

## Prochaines étapes

1. ✅ Redéployez sur Vercel
2. ✅ Videz le cache du navigateur (Ctrl+Shift+R)
3. ✅ Vérifiez dans les DevTools que les requêtes vont vers `/api/woocommerce/products`
4. ✅ Vérifiez les logs Vercel pour confirmer que le proxy est appelé
