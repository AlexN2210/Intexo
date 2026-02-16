# 🔍 Guide de Débogage - Produits ne s'affichent pas

Si les produits ne s'affichent pas sur votre site déployé, suivez ces étapes de débogage.

## ✅ Checklist de Vérification

### 1. Variables d'environnement dans Vercel

Vérifiez que **TOUTES** ces variables sont configurées dans Vercel (Settings > Environment Variables) :

**OBLIGATOIRES pour le proxy backend :**
```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**OBLIGATOIRES pour le frontend :**
```
VITE_WP_BASE_URL=https://www.impexo.fr
VITE_IMPEXO_USE_MOCKS=false
VITE_USE_WC_PROXY=true
```

⚠️ **Important** : 
- `VITE_IMPEXO_USE_MOCKS` doit être `false` (pas `true` ni vide)
- `VITE_USE_WC_PROXY` doit être `true` (ou non défini, car par défaut c'est `true`)

### 2. Vérifier les logs Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur **"Deployments"**
3. Ouvrez le dernier déploiement
4. Cliquez sur **"Functions"** ou **"Logs"**
5. Cherchez les erreurs liées à `/api/woocommerce`

### 3. Tester le proxy directement

Testez l'URL du proxy directement dans votre navigateur :

```
https://votre-domaine.vercel.app/api/woocommerce/products?per_page=1
```

**Résultats attendus :**
- ✅ **200 OK avec JSON** : Le proxy fonctionne, le problème est ailleurs
- ❌ **500 Error** : Vérifiez les variables d'environnement dans Vercel
- ❌ **404 Not Found** : Le proxy n'est pas déployé correctement

### 4. Vérifier la console du navigateur

1. Ouvrez votre site déployé
2. Ouvrez la console du navigateur (F12)
3. Allez dans l'onglet **"Network"** (Réseau)
4. Rechargez la page
5. Cherchez les requêtes vers `/api/woocommerce/products`

**Vérifiez :**
- ✅ Les requêtes sont faites vers `/api/woocommerce/products`
- ✅ Le statut HTTP est 200
- ❌ Si vous voyez des erreurs CORS ou 404/500

### 5. Vérifier que les produits existent dans WooCommerce

1. Connectez-vous à votre WordPress
2. Allez dans **Produits** > **Tous les produits**
3. Vérifiez qu'il y a des produits **publiés** (status: "Publié")
4. Testez l'API directement :
   ```
   https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1
   ```

## 🐛 Problèmes Courants

### Problème 1 : Les produits mock s'affichent au lieu des vrais produits

**Cause** : `VITE_IMPEXO_USE_MOCKS` est à `true` ou `VITE_WP_BASE_URL` est vide

**Solution** :
1. Dans Vercel, vérifiez que `VITE_IMPEXO_USE_MOCKS=false`
2. Vérifiez que `VITE_WP_BASE_URL=https://www.impexo.fr`
3. Redéployez le projet

### Problème 2 : Erreur 500 sur le proxy

**Cause** : Variables d'environnement manquantes ou incorrectes

**Solution** :
1. Vérifiez que `WP_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` sont bien configurées
2. Vérifiez les logs Vercel pour voir l'erreur exacte
3. Redéployez après avoir corrigé les variables

### Problème 3 : Erreur CORS

**Cause** : Le proxy ne configure pas correctement les headers CORS

**Solution** :
- Le proxy devrait déjà gérer CORS automatiquement
- Vérifiez que `vercel.json` est bien présent dans le projet

### Problème 4 : Les requêtes ne passent pas par le proxy

**Cause** : `VITE_USE_WC_PROXY` est à `false` ou le proxy n'est pas activé

**Solution** :
1. Vérifiez que `VITE_USE_WC_PROXY=true` dans Vercel
2. Vérifiez que le dossier `/api/woocommerce/[...path].js` existe bien dans votre projet

### Problème 5 : Aucun produit dans WooCommerce

**Cause** : Les produits ne sont pas publiés dans WooCommerce

**Solution** :
1. Connectez-vous à WordPress
2. Publiez des produits avec le statut "Publié"
3. Vérifiez qu'ils sont visibles dans l'API

## 🔧 Script de Test Rapide

Créez un fichier `test-debug.html` dans votre projet et ouvrez-le dans le navigateur :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Debug WooCommerce</title>
</head>
<body>
    <h1>Test de Connexion WooCommerce</h1>
    <div id="results"></div>
    
    <script>
        const domain = window.location.origin;
        
        async function testProxy() {
            const results = document.getElementById('results');
            results.innerHTML = '<p>Test en cours...</p>';
            
            try {
                // Test 1: Proxy
                const proxyUrl = `${domain}/api/woocommerce/products?per_page=1`;
                const proxyRes = await fetch(proxyUrl);
                const proxyData = await proxyRes.json();
                
                results.innerHTML += `
                    <h2>✅ Test Proxy</h2>
                    <p>Status: ${proxyRes.status}</p>
                    <p>Produits: ${Array.isArray(proxyData) ? proxyData.length : 'Erreur'}</p>
                    <pre>${JSON.stringify(proxyData, null, 2)}</pre>
                `;
            } catch (error) {
                results.innerHTML += `
                    <h2>❌ Erreur Proxy</h2>
                    <p>${error.message}</p>
                `;
            }
        }
        
        testProxy();
    </script>
</body>
</html>
```

Déployez ce fichier et visitez `https://votre-domaine.vercel.app/test-debug.html`

## 📞 Prochaines Étapes

1. Vérifiez les variables d'environnement dans Vercel
2. Testez le proxy directement
3. Vérifiez les logs Vercel
4. Vérifiez la console du navigateur
5. Vérifiez que les produits sont publiés dans WooCommerce

---

**Besoin d'aide supplémentaire ?** Partagez :
- Les logs Vercel
- Les erreurs de la console du navigateur
- Le résultat du test du proxy
