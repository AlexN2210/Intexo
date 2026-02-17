# 🔍 Diagnostic Complet - Produits + Admin WordPress

## Problèmes signalés
1. ❌ Aucun produit ne s'affiche quand on clique dessus
2. ❌ Impossible d'accéder à WordPress en admin

## Étapes de diagnostic

### Étape 1 : Vérifier que le proxy fonctionne

Testez directement dans votre navigateur :
```
https://intexo.vercel.app/api/woocommerce/products?per_page=1
```

**Résultats attendus :**
- ✅ **JSON avec produits** : Le proxy fonctionne → Passez à l'étape 2
- ❌ **404 Error** : Le proxy n'est pas déployé → Vérifiez le Root Directory dans Vercel
- ❌ **500 Error** : Variables d'environnement manquantes → Vérifiez les variables dans Vercel
- ❌ **HTML** : Le proxy retourne du HTML → Problème de routing Vercel

### Étape 2 : Vérifier les variables d'environnement dans Vercel

Dans Vercel → Settings → Environment Variables, vérifiez que **TOUTES** ces variables existent :

**Pour le proxy backend (sans préfixe VITE_) :**
```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**Pour le frontend (avec préfixe VITE_) :**
```
VITE_WP_BASE_URL=https://www.impexo.fr
VITE_IMPEXO_USE_MOCKS=false
VITE_USE_WC_PROXY=true
VITE_WC_PROXY_URL=https://intexo.vercel.app/api/woocommerce
```

⚠️ **Important** : Les variables pour le proxy (`WP_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`) doivent être configurées **SANS** le préfixe `VITE_` car elles sont utilisées côté serveur.

### Étape 3 : Vérifier l'accès WordPress Admin

**Problème possible** : Si vous avez modifié les permissions CORS ou les headers WordPress, cela peut bloquer l'accès admin.

**Solution** :
1. Essayez d'accéder directement à : `https://www.impexo.fr/wp-admin`
2. Si vous obtenez une erreur CORS ou de redirection, vérifiez :
   - Les plugins WordPress qui gèrent CORS
   - Le fichier `.htaccess` (si vous utilisez Apache)
   - Les paramètres de sécurité WordPress

**Test rapide** : Essayez d'accéder à WordPress en navigation privée pour voir si c'est un problème de cache/cookies.

### Étape 4 : Vérifier que les produits existent dans WooCommerce

Testez directement l'API WooCommerce (sans proxy) :
```
https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1&status=publish
```

**Résultats attendus :**
- ✅ **JSON avec produits** : Les produits existent → Le problème vient du frontend/proxy
- ❌ **Tableau vide []** : Aucun produit publié → Publiez des produits dans WordPress
- ❌ **Erreur 401** : Clés API invalides → Régénérez les clés dans WooCommerce
- ❌ **Erreur 404** : L'API WooCommerce n'est pas activée → Activez WooCommerce REST API

### Étape 5 : Vérifier la console du navigateur

1. Ouvrez votre site : `https://intexo.vercel.app`
2. Ouvrez la console (F12)
3. Allez dans l'onglet **Network** (Réseau)
4. Rechargez la page
5. Cherchez les requêtes vers `/api/woocommerce/products`

**Vérifiez :**
- ✅ Les requêtes sont faites vers `/api/woocommerce/products`
- ✅ Le statut HTTP est 200
- ✅ La réponse est du JSON (pas du HTML)
- ❌ Si vous voyez des erreurs CORS, 404, 500, ou du HTML

### Étape 6 : Vérifier les logs Vercel

1. Allez dans Vercel → Votre projet → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions** ou **Logs**
4. Cherchez `/api/woocommerce/products` ou `/api/woocommerce/[...path]`
5. Cliquez dessus pour voir les logs

**Cherchez :**
- `[Proxy WooCommerce] Requête reçue:` → Le handler est appelé
- `Configuration WooCommerce manquante` → Variables d'environnement manquantes
- `WooCommerce API error` → Problème avec l'API WooCommerce
- `Erreur lors de la requête WooCommerce` → Erreur réseau ou configuration

## Solutions selon les problèmes

### Problème 1 : Le proxy retourne du HTML

**Cause** : Vercel ne trouve pas les fichiers API

**Solution** :
1. Vérifiez que le Root Directory dans Vercel est **vide** (pas `impexo-luxe-e-commerce`)
2. Vérifiez que les fichiers `api/woocommerce/[...path].js` sont bien commités dans Git
3. Redéployez le projet

### Problème 2 : Erreur 500 sur le proxy

**Cause** : Variables d'environnement manquantes ou incorrectes

**Solution** :
1. Vérifiez que `WP_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` sont configurées **SANS** préfixe `VITE_`
2. Vérifiez les logs Vercel pour voir l'erreur exacte
3. Redéployez après avoir corrigé les variables

### Problème 3 : Aucun produit ne s'affiche

**Causes possibles** :
- Les produits ne sont pas publiés dans WooCommerce
- Le proxy retourne un tableau vide
- Le frontend ne gère pas correctement les erreurs

**Solution** :
1. Vérifiez que les produits sont publiés dans WordPress (statut "Publié")
2. Testez le proxy directement : `https://intexo.vercel.app/api/woocommerce/products?per_page=1`
3. Vérifiez la console du navigateur pour les erreurs JavaScript
4. Vérifiez que `VITE_IMPEXO_USE_MOCKS=false` dans Vercel

### Problème 4 : Impossible d'accéder à WordPress Admin

**Causes possibles** :
- Problème de cache/cookies
- Plugin de sécurité qui bloque l'accès
- Configuration CORS qui interfère

**Solution** :
1. Essayez en navigation privée
2. Videz le cache du navigateur
3. Vérifiez les plugins WordPress (surtout les plugins de sécurité)
4. Désactivez temporairement les plugins de sécurité pour tester
5. Vérifiez le fichier `.htaccess` pour des règles qui pourraient bloquer

### Problème 5 : Les produits s'affichent mais ne sont pas cliquables

**Cause** : Erreur JavaScript lors du clic

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Cliquez sur un produit
3. Regardez les erreurs dans la console
4. Vérifiez les requêtes réseau pour `/api/woocommerce/products/[id]` ou `/produit/[slug]`

## Test rapide du proxy

Créez un fichier `test-proxy.html` et ouvrez-le dans votre navigateur :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Proxy WooCommerce</title>
</head>
<body>
    <h1>Test Proxy WooCommerce</h1>
    <button onclick="testProxy()">Tester le proxy</button>
    <pre id="result"></pre>
    
    <script>
        async function testProxy() {
            const resultEl = document.getElementById('result');
            resultEl.textContent = 'Test en cours...';
            
            try {
                const response = await fetch('https://intexo.vercel.app/api/woocommerce/products?per_page=1');
                const data = await response.json();
                
                resultEl.textContent = `Status: ${response.status}\n\n` + JSON.stringify(data, null, 2);
            } catch (error) {
                resultEl.textContent = 'Erreur: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

## Prochaines étapes

Après avoir suivi ces étapes, dites-moi :
1. Ce que vous obtenez pour `/api/woocommerce/products?per_page=1`
2. Les erreurs dans la console du navigateur
3. Les logs Vercel pour le proxy
4. Si vous pouvez accéder à WordPress admin maintenant
