# 🔍 Diagnostic : HTML persistant au lieu de JSON

## Problème

Même après avoir ajouté les variables, WooCommerce retourne toujours du HTML au lieu de JSON.

## Étapes de diagnostic

### Étape 1 : Vérifier que les variables sont bien ajoutées

Dans Vercel → Settings → Environment Variables, vérifiez que vous avez **EXACTEMENT** ces 7 variables :

**Pour le proxy backend (sans VITE_) :**
1. `WP_BASE_URL=https://www.impexo.fr`
2. `WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`
3. `WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3`

**Pour le frontend (avec VITE_) :**
4. `VITE_WP_BASE_URL=https://www.impexo.fr`
5. `VITE_IMPEXO_USE_MOCKS=false`
6. `VITE_USE_WC_PROXY=true`
7. `VITE_WC_PROXY_URL=https://www.impexo.fr/api/woocommerce`

### Étape 2 : Vérifier que le projet a été redéployé

Après avoir ajouté les variables, **vous devez redéployer** le projet :
- Soit faites un nouveau commit/push
- Soit allez dans Vercel → Deployments → "Redeploy"

### Étape 3 : Tester l'API WooCommerce DIRECTEMENT (sans proxy)

Testez cette URL directement dans votre navigateur :

```
https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1&status=publish
```

**Résultats possibles :**

#### ✅ Si vous obtenez du JSON avec des produits
→ L'API WooCommerce fonctionne. Le problème vient du proxy ou de la configuration Vercel.

#### ❌ Si vous obtenez du HTML
→ L'API WooCommerce ne fonctionne pas directement. Causes possibles :
- WooCommerce REST API n'est pas activée
- Les clés API sont invalides
- L'URL WordPress est incorrecte

#### ❌ Si vous obtenez une erreur 404
→ L'endpoint `/wp-json/wc/v3/products` n'existe pas. Vérifiez que WooCommerce est installé et activé.

#### ❌ Si vous obtenez une erreur 401
→ Les clés API sont invalides. Régénérez-les dans WooCommerce.

### Étape 4 : Vérifier les logs Vercel

1. Allez dans **Vercel** → **Votre projet** → **Deployments**
2. Cliquez sur le **dernier déploiement**
3. Allez dans l'onglet **Functions** ou **Logs**
4. Cherchez `/api/woocommerce/products` ou `/api/woocommerce/[...path]`
5. Cliquez dessus pour voir les logs

**Cherchez ces messages dans les logs :**

```
[Proxy WooCommerce] URL WooCommerce: https://www.impexo.fr/wp-json/wc/v3/products?...
```

Vérifiez que :
- L'URL est correcte (commence par `https://www.impexo.fr/wp-json/wc/v3/`)
- Les clés API sont présentes dans l'URL (même si masquées dans les logs)
- Le status code de la réponse WooCommerce

### Étape 5 : Vérifier que WordPress REST API fonctionne

Testez cette URL dans votre navigateur :

```
https://www.impexo.fr/wp-json/
```

**Résultat attendu :** JSON avec les routes disponibles, incluant `/wc/v3/`

**Si vous obtenez du HTML ou une erreur 404 :**
→ WordPress REST API n'est pas activée ou l'URL est incorrecte.

## Solutions selon le diagnostic

### Solution 1 : Si l'API directe fonctionne mais pas le proxy

**Cause** : Les variables d'environnement dans Vercel ne sont pas correctes ou le projet n'a pas été redéployé.

**Solution** :
1. Vérifiez que `WP_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` sont bien configurées **SANS** préfixe `VITE_`
2. Vérifiez que les valeurs sont correctes (pas d'espaces, pas de caractères spéciaux)
3. **Redéployez** le projet après modification
4. Vérifiez les logs Vercel pour voir l'URL exacte appelée

### Solution 2 : Si l'API directe retourne aussi du HTML

**Cause** : WooCommerce REST API n'est pas activée ou les clés sont invalides.

**Solution** :
1. Connectez-vous à WordPress admin : `https://www.impexo.fr/wp-admin`
2. Allez dans **WooCommerce** → **Settings** → **Advanced** → **REST API**
3. Vérifiez que les clés API existent et sont actives
4. Si nécessaire, créez de nouvelles clés API
5. Mettez à jour les variables dans Vercel avec les nouvelles clés

### Solution 3 : Si WordPress REST API ne fonctionne pas

**Cause** : WordPress REST API est désactivée ou bloquée.

**Solution** :
1. Vérifiez les plugins de sécurité WordPress qui pourraient bloquer l'API
2. Vérifiez le fichier `.htaccess` pour des règles qui bloquent `/wp-json/`
3. Testez avec un plugin comme "REST API - Enable/Disable" pour réactiver l'API

## Test rapide : Vérifier la configuration

Créez un fichier `test-api-direct.html` et ouvrez-le dans votre navigateur :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test API WooCommerce Directe</title>
</head>
<body>
    <h1>Test API WooCommerce Directe</h1>
    <button onclick="testAPI()">Tester l'API</button>
    <pre id="result"></pre>
    
    <script>
        async function testAPI() {
            const resultEl = document.getElementById('result');
            resultEl.textContent = 'Test en cours...';
            
            const url = 'https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1&status=publish';
            
            try {
                const response = await fetch(url);
                const contentType = response.headers.get('content-type') || '';
                const isJson = contentType.includes('application/json');
                
                let data;
                if (isJson) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    data = {
                        error: 'Réponse non-JSON',
                        contentType,
                        preview: text.substring(0, 500),
                        isHtml: text.includes('<!doctype') || text.includes('<html')
                    };
                }
                
                resultEl.textContent = `Status: ${response.status}\nContent-Type: ${contentType}\n\n` + JSON.stringify(data, null, 2);
            } catch (error) {
                resultEl.textContent = 'Erreur: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

## Prochaines étapes

1. ✅ Testez l'API WooCommerce directement (sans proxy)
2. ✅ Vérifiez les logs Vercel pour voir l'URL exacte appelée
3. ✅ Vérifiez que WordPress REST API fonctionne : `https://www.impexo.fr/wp-json/`
4. ✅ Dites-moi ce que vous obtenez à chaque étape

Ces informations m'aideront à identifier la cause exacte du problème.
