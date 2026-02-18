# Corrections appliquées - Module Cart et Proxy

## 🔴 Problèmes critiques corrigés

### 1. URL proxy incorrecte ✅ CORRIGÉ
**Problème** : Le proxy construisait `/wp-json/store/v1/cart` au lieu de `/wp-json/wc/store/v1/cart`

**Correction** : Ligne 104 du proxy `[...path].js`
```javascript
// AVANT
wooPath = `/wp-json/${path}`;

// APRÈS
wooPath = `/wp-json/wc/${path}`; // Ajout du préfixe 'wc/' manquant
```

### 2. Cookies de session non transmis ✅ CORRIGÉ
**Problème** : Les cookies `woocommerce_session` n'étaient pas transmis du navigateur vers WordPress

**Corrections appliquées** :
1. **Frontend** : `credentials: 'include'` déjà présent dans toutes les requêtes fetch
2. **Proxy** : Transmission des cookies du client vers WooCommerce (lignes 154-161)
   ```javascript
   const cookieHeader = req.headers.cookie || req.headers['Cookie'] || req.headers['cookie'];
   if (isStoreCart && cookieHeader) {
     headers.Cookie = cookieHeader;
   }
   ```
3. **Proxy** : Transmission des cookies Set-Cookie de WooCommerce vers le client (lignes 239-250)

### 3. Header Nonce non transmis ✅ CORRIGÉ
**Problème** : Le header `Nonce` retourné par WordPress n'était pas copié vers le client

**Corrections appliquées** :
1. **Proxy** : Ajout de `'Nonce'` à la liste des headers copiés (ligne 226)
   ```javascript
   ['cache-control', 'x-total', 'x-total-pages', 'Nonce'].forEach(h => {
     const v = wooResponse.headers.get(h);
     if (v) res.setHeader(h, v);
   });
   ```
2. **Proxy** : Transmission du header Nonce du client vers WooCommerce (lignes 161-168)
   ```javascript
   const nonceHeader = req.headers.nonce || req.headers['Nonce'] || req.headers['nonce'];
   if (isStoreCart && nonceHeader && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
     headers.Nonce = nonceHeader;
   }
   ```

## 🟠 Améliorations supplémentaires

### 4. Support DELETE avec body
Ajout du support pour les requêtes DELETE avec body (nécessaire pour l'API Store Cart) :
```javascript
if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && req.body) {
  fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
}
```

### 5. Gestion améliorée de la casse des headers
Vérification de plusieurs variantes de casse pour les headers (cookie, Nonce) pour compatibilité avec différents environnements Node.js/Vercel.

## ⚠️ Limitations et recommandations

### Architecture proxy pour wc/store/v1

L'architecture actuelle avec proxy Vercel pour l'API Store Cart (`wc/store/v1`) présente des limitations :

1. **Sessions PHP** : WooCommerce utilise des sessions PHP côté serveur qui peuvent être fragiles à travers un proxy stateless
2. **Nonces basés sur session** : Les nonces peuvent être liés à la session PHP et peuvent expirer
3. **Cookies cross-domain** : Les cookies peuvent avoir des problèmes de domaine entre le frontend et WordPress

### Recommandation : Approche hybride

Pour une solution plus robuste, considérer :

1. **API Store Cart directement** : Appeler `wp.impexo.fr/wp-json/wc/store/v1/...` directement depuis le navigateur avec CORS configuré côté WordPress
2. **Proxy uniquement pour wc/v3** : Garder le proxy uniquement pour l'API REST classique (`wc/v3`) qui utilise Basic Auth sans session

### Configuration CORS WordPress (si approche directe)

Si vous choisissez d'appeler WordPress directement, ajoutez dans `wp-config.php` ou via un plugin :

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://votre-domaine.vercel.app');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept, Nonce');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Expose-Headers: Nonce, Set-Cookie');
        return $value;
    });
}, 15);
```

## ✅ Tests à effectuer

1. **Test d'ajout au panier** : Vérifier que les articles restent dans le panier entre les requêtes
2. **Test de nonce** : Vérifier que les opérations POST/PUT/DELETE fonctionnent sans erreur 403
3. **Test de session** : Vérifier que le cookie `woocommerce_session` est bien créé et transmis
4. **Test cross-domain** : Si vous utilisez un domaine différent pour le frontend, vérifier que les cookies fonctionnent

## 📝 Notes de débogage

Pour vérifier que les corrections fonctionnent :

1. **Cookies** : Vérifier dans les DevTools (Network > Headers) que le cookie `woocommerce_session` est présent dans les requêtes
2. **Nonce** : Vérifier dans les DevTools que le header `Nonce` est présent dans les requêtes POST/PUT/DELETE
3. **URL** : Vérifier dans les logs Vercel que l'URL construite est `/wp-json/wc/store/v1/...` et non `/wp-json/store/v1/...`

## 🔍 Logs utiles

Le proxy log maintenant :
- Les cookies transmis (premiers 50 caractères)
- Le nonce transmis (premiers 10 caractères)
- Les avertissements si cookies/nonce manquants

Vérifiez les logs Vercel pour diagnostiquer les problèmes.
