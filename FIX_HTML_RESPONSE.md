# 🔧 Solution : WooCommerce retourne du HTML au lieu de JSON

## Problème

Le proxy fonctionne mais WooCommerce retourne du HTML (`<!doctype html>`) au lieu de JSON. Cela signifie que WordPress retourne une page HTML, probablement une page d'erreur ou une redirection.

## Causes possibles

### 1. Variables d'environnement incorrectes dans Vercel

**⚠️ CRITIQUE** : Les variables pour le proxy backend doivent être **SANS** le préfixe `VITE_`.

**Variables CORRECTES pour le proxy (sans préfixe VITE_) :**
```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**Variables INCORRECTES (ne fonctionneront pas pour le proxy) :**
```
VITE_WP_BASE_URL=...  ❌
VITE_WC_CONSUMER_KEY=...  ❌
VITE_WC_CONSUMER_SECRET=...  ❌
```

### 2. URL WooCommerce incorrecte

Si `WP_BASE_URL` est mal configuré, l'URL construite sera incorrecte et WordPress retournera une page HTML d'erreur 404.

### 3. Clés API invalides

Si les clés API sont incorrectes, WordPress peut retourner une page HTML d'erreur 401.

### 4. WooCommerce REST API désactivée

Si l'API REST WooCommerce n'est pas activée, WordPress retournera une page HTML.

## Solutions

### Solution 1 : Vérifier les variables d'environnement dans Vercel

1. Allez dans **Vercel** → **Votre projet** → **Settings** → **Environment Variables**
2. Vérifiez que vous avez **EXACTEMENT** ces variables (sans préfixe `VITE_`) :
   - `WP_BASE_URL` (pas `VITE_WP_BASE_URL`)
   - `WC_CONSUMER_KEY` (pas `VITE_WC_CONSUMER_KEY`)
   - `WC_CONSUMER_SECRET` (pas `VITE_WC_CONSUMER_SECRET`)

3. Si vous avez des variables avec le préfixe `VITE_` pour le proxy, **supprimez-les** et créez-les sans le préfixe.

4. **Redéployez** le projet après modification.

### Solution 2 : Tester directement l'API WooCommerce

Testez cette URL directement dans votre navigateur (remplacez les clés si nécessaire) :

```
https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1&status=publish
```

**Résultats attendus :**
- ✅ **JSON avec produits** : L'API fonctionne → Le problème vient du proxy/Vercel
- ❌ **HTML** : L'API ne fonctionne pas → Vérifiez WooCommerce REST API
- ❌ **404** : L'URL est incorrecte → Vérifiez `WP_BASE_URL`
- ❌ **401** : Les clés sont invalides → Régénérez les clés dans WooCommerce

### Solution 3 : Vérifier les logs Vercel

1. Allez dans **Vercel** → **Votre projet** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions** ou **Logs**
4. Cherchez `/api/woocommerce/products` ou `/api/woocommerce/[...path]`
5. Regardez les logs pour voir :
   - L'URL exacte qui est appelée
   - Le status code de la réponse
   - Le message d'erreur

**Cherchez ces messages dans les logs :**
- `[Proxy WooCommerce] URL WooCommerce:` → Vérifiez que l'URL est correcte
- `❌ 404 - URL probablement incorrecte` → L'URL est mal construite
- `❌ 401 - Clés API probablement invalides` → Les clés sont incorrectes
- `⚠️ Réponse HTML reçue` → WordPress retourne du HTML

### Solution 4 : Vérifier que WooCommerce REST API est activée

1. Connectez-vous à WordPress admin : `https://www.impexo.fr/wp-admin`
2. Allez dans **WooCommerce** → **Settings** → **Advanced** → **REST API**
3. Vérifiez que l'API REST est activée
4. Vérifiez que les clés API existent et sont actives

### Solution 5 : Vérifier l'URL de base WordPress

Testez cette URL dans votre navigateur :
```
https://www.impexo.fr/wp-json/
```

**Résultats attendus :**
- ✅ **JSON avec les routes disponibles** : WordPress REST API fonctionne
- ❌ **HTML** : WordPress REST API n'est pas activée ou l'URL est incorrecte

## Diagnostic étape par étape

### Étape 1 : Vérifier les variables Vercel

Dans Vercel, vérifiez que vous avez ces variables **SANS** préfixe `VITE_` :
- `WP_BASE_URL`
- `WC_CONSUMER_KEY`
- `WC_CONSUMER_SECRET`

### Étape 2 : Tester l'API directement

Testez cette URL dans votre navigateur :
```
https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1
```

### Étape 3 : Vérifier les logs Vercel

Regardez les logs du dernier déploiement pour voir l'URL exacte qui est appelée.

### Étape 4 : Redéployer

Après avoir corrigé les variables, **redéployez** le projet dans Vercel.

### Étape 5 : Tester le proxy

Testez cette URL :
```
https://intexo.vercel.app/api/woocommerce/products?per_page=1
```

## Messages d'erreur améliorés

J'ai amélioré le proxy pour retourner des messages d'erreur plus détaillés. Maintenant, vous devriez voir :

- **404** : "Endpoint WooCommerce introuvable (404). Vérifiez que l'URL est correcte et que WooCommerce REST API est activée."
- **401** : "Authentification échouée (401). Vérifiez que les clés API WooCommerce sont correctes."
- **HTML** : "WordPress a retourné une page HTML au lieu de JSON. Vérifiez que l'URL de l'API est correcte."

Ces messages incluent aussi des informations de diagnostic (URL testée, base URL, etc.) pour vous aider à identifier le problème.

## Prochaines étapes

1. ✅ Vérifiez les variables d'environnement dans Vercel (sans préfixe `VITE_`)
2. ✅ Testez l'API WooCommerce directement dans votre navigateur
3. ✅ Vérifiez les logs Vercel pour voir l'URL exacte appelée
4. ✅ Redéployez le projet
5. ✅ Testez le proxy : `https://intexo.vercel.app/api/woocommerce/products?per_page=1`

Dites-moi ce que vous obtenez à chaque étape !
