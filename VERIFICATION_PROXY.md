# Vérification : Le proxy est-il utilisé ?

## ✅ Modifications appliquées

### Frontend (`src/services/woocommerce.ts`)

1. **Toujours utiliser le proxy** : Plus de mode direct, le code utilise toujours `/api/woocommerce/products`
2. **Logs de débogage ajoutés** : Pour vérifier que l'URL pointe bien vers le proxy
3. **Vérification critique** : Le code vérifie que l'URL contient `/api/woocommerce` et affiche une erreur si ce n'est pas le cas

### Proxy Backend (`api/woocommerce/products.js`)

1. **Basic Auth configuré** : Le proxy injecte `Authorization: Basic base64(consumer_key:consumer_secret)`
2. **Logs détaillés** : Pour voir les variables d'environnement et les requêtes

## 🔍 Comment vérifier que le proxy est utilisé

### Étape 1 : Vérifier dans les DevTools du navigateur

1. Ouvrez les **DevTools** → **Network**
2. Faites une requête (rechargez la page ou cherchez un produit)
3. Cherchez les requêtes vers `/api/woocommerce/products`

**✅ Si vous voyez :**
```
GET /api/woocommerce/products?per_page=48&page=1&search=transparente
```
→ Le proxy est utilisé ✅

**❌ Si vous voyez :**
```
GET https://wp.impexo.fr/wp-json/wc/v3/products?per_page=48...
```
→ Le proxy n'est PAS utilisé ❌

### Étape 2 : Vérifier les logs de la console

Dans la console du navigateur, vous devriez voir :
```
[WooCommerce] URL proxy construite: https://www.impexo.fr/api/woocommerce/products?per_page=48...
[WooCommerce] Requête vers le proxy: https://www.impexo.fr/api/woocommerce/products?per_page=48...
```

**Si vous voyez une URL WordPress au lieu de `/api/woocommerce`** → Le proxy n'est pas utilisé

### Étape 3 : Vérifier les logs Vercel

1. Allez dans **Vercel Dashboard** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions**
4. Cherchez `/api/woocommerce/products`
5. Cliquez dessus pour voir les logs

**✅ Si vous voyez :**
```
[Proxy WooCommerce Products] ✅ Handler appelé - Requête reçue: ...
[Proxy WooCommerce Products] Variables d'environnement: ...
[Proxy WooCommerce Products] Envoi de la requête vers WooCommerce avec Basic Auth...
```
→ Le proxy fonctionne ✅

**❌ Si vous ne voyez aucun log** → Le proxy n'est pas appelé ❌

## 🐛 Problèmes possibles et solutions

### Problème 1 : Le frontend appelle encore WordPress directement

**Symptôme :** Vous voyez `GET https://wp.impexo.fr/wp-json/wc/v3/products` dans les DevTools

**Cause :** Le code frontend ne construit pas correctement l'URL du proxy

**Solution :**
1. Vérifiez que `VITE_USE_WC_PROXY=true` dans Vercel
2. Vérifiez que `VITE_WC_PROXY_URL=/api/woocommerce` dans Vercel
3. Redéployez l'application
4. Videz le cache du navigateur

### Problème 2 : Le proxy n'injecte pas les clés

**Symptôme :** Le proxy est appelé mais retourne 401

**Cause :** Les variables d'environnement ne sont pas configurées dans Vercel

**Solution :**
1. Vérifiez dans Vercel → **Settings** → **Environment Variables** :
   - `WP_BASE_URL` = `https://wp.impexo.fr`
   - `WC_CONSUMER_KEY` = `ck_...`
   - `WC_CONSUMER_SECRET` = `cs_...`
2. Vérifiez les logs Vercel pour voir si les variables sont présentes
3. Redéployez après avoir ajouté les variables

### Problème 3 : Les clés WooCommerce sont invalides

**Symptôme :** Le proxy retourne 401 même avec les clés configurées

**Cause :** Les clés ont été régénérées ou sont invalides

**Solution :**
1. Allez dans WordPress → **WooCommerce** → **Réglages** → **Avancé** → **REST API**
2. Vérifiez que la clé API existe et est active
3. Si nécessaire, créez une nouvelle clé API
4. Mettez à jour les variables dans Vercel
5. Redéployez

## 📋 Checklist de vérification

- [ ] Dans les DevTools Network, je vois `/api/woocommerce/products` (pas WordPress)
- [ ] Dans la console, je vois `[WooCommerce] URL proxy construite: .../api/woocommerce/...`
- [ ] Dans les logs Vercel, je vois `[Proxy WooCommerce Products] ✅ Handler appelé`
- [ ] Dans les logs Vercel, je vois `Variables d'environnement: ...` avec les valeurs présentes
- [ ] Dans les logs Vercel, je vois `Envoi de la requête vers WooCommerce avec Basic Auth`
- [ ] Les produits s'affichent correctement (pas d'erreur 401)

## 🎯 Résultat attendu

Après redéploiement, vous devriez voir :

**Dans les DevTools Network :**
```
GET /api/woocommerce/products?per_page=48&page=1&search=transparente&status=publish
Status: 200 OK
```

**Dans la console :**
```
[WooCommerce] URL proxy construite: https://www.impexo.fr/api/woocommerce/products?per_page=48...
[WooCommerce] Requête vers le proxy: https://www.impexo.fr/api/woocommerce/products?per_page=48...
```

**Dans les logs Vercel :**
```
[Proxy WooCommerce Products] ✅ Handler appelé - Requête reçue: ...
[Proxy WooCommerce Products] Variables d'environnement: wpBaseUrl: https://wp.impexo.fr..., consumerKey: ck_..., consumerSecret: PRÉSENTE
[Proxy WooCommerce Products] Envoi de la requête vers WooCommerce avec Basic Auth...
[Proxy WooCommerce Products] Réponse reçue: status: 200, ...
```

## 🚀 Prochaines étapes

1. ✅ Redéployez sur Vercel
2. ✅ Ouvrez les DevTools → Network
3. ✅ Vérifiez que les requêtes vont vers `/api/woocommerce/products`
4. ✅ Vérifiez les logs Vercel pour confirmer que le proxy est appelé
5. ✅ Vérifiez que les produits s'affichent correctement
