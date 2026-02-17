# Fix Final : Proxy retourne du HTML au lieu de JSON

## Problème identifié

Le proxy API retourne du HTML (page d'accueil) au lieu de JSON avec un status 200. Cela indique que le rewrite dans `vercel.json` intercepte les requêtes API avant qu'elles n'atteignent les handlers serverless.

## Corrections appliquées

### 1. Correction du `vercel.json`

**Avant :**
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api/$1"
  },
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

**Après :**
```json
"rewrites": [
  {
    "source": "/((?!api/).*)",
    "destination": "/index.html"
  }
]
```

Le nouveau rewrite exclut explicitement les routes `/api/` du rewrite vers `/index.html`. Vercel reconnaît automatiquement les fichiers dans `/api/` comme des Serverless Functions, donc pas besoin de rewrite explicite pour elles.

### 2. Ajout de logs de diagnostic

Ajout de logs plus visibles dans `api/woocommerce/products.js` pour confirmer que le handler est appelé.

## Étapes de vérification

### Étape 1 : Redéployer sur Vercel

Après avoir commité les changements, redéployez sur Vercel :
```bash
git add vercel.json api/woocommerce/products.js
git commit -m "Fix: Correction du routage API pour éviter l'interception par le rewrite"
git push
```

### Étape 2 : Tester la route de test

Testez dans votre navigateur :
```
https://www.impexo.fr/api/test
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "API Route fonctionne correctement",
  ...
}
```

**Si vous obtenez du HTML** → Le problème persiste, vérifiez les étapes suivantes.

### Étape 3 : Tester la route WooCommerce

Testez :
```
https://www.impexo.fr/api/woocommerce/products?per_page=1
```

**Résultat attendu :**
```json
[
  {
    "id": ...,
    "name": "...",
    ...
  }
]
```

### Étape 4 : Vérifier les logs Vercel

1. Allez dans **Vercel Dashboard** → **Votre projet** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions**
4. Cherchez `/api/woocommerce/products` ou `/api/test`
5. Cliquez dessus pour voir les logs

**Si vous voyez les logs** `[Proxy WooCommerce Products] ✅ Handler appelé` → Le handler est appelé, vérifiez les erreurs dans les logs.

**Si vous ne voyez aucun log** → Le handler n'est pas appelé, problème de routing.

## Causes possibles si le problème persiste

### 1. Le domaine personnalisé ne pointe pas vers Vercel

Si `www.impexo.fr` pointe directement vers un serveur statique au lieu de Vercel, les fonctions serverless ne seront jamais exécutées.

**Solution :** Vérifiez dans Vercel → **Settings** → **Domains** que `www.impexo.fr` est bien configuré et pointe vers Vercel.

### 2. Le Root Directory n'est pas configuré

Si votre projet est dans un sous-dossier `impexo-luxe-e-commerce/`, Vercel doit savoir où chercher les fichiers.

**Solution :** Dans Vercel → **Settings** → **General** → **Root Directory**, configurez `impexo-luxe-e-commerce` si nécessaire.

### 3. Les fichiers API ne sont pas déployés

Vérifiez que les fichiers dans `/api/` sont bien présents dans le déploiement.

**Solution :** Dans Vercel → **Deployments** → Cliquez sur le dernier → **Functions**, vous devriez voir les fonctions listées.

### 4. Cache du navigateur ou CDN

Le HTML peut être servi depuis un cache.

**Solution :** Testez en navigation privée ou videz le cache.

## Solution de contournement temporaire

Le code frontend bascule automatiquement vers l'API directe si le proxy retourne du HTML. C'est une solution temporaire mais fonctionnelle en attendant que le proxy soit corrigé.

## Prochaines étapes

1. ✅ Redéployer avec les corrections
2. ✅ Tester `/api/test` pour confirmer que les API Routes fonctionnent
3. ✅ Tester `/api/woocommerce/products` pour confirmer que le proxy fonctionne
4. ✅ Vérifier les logs Vercel pour diagnostiquer les erreurs éventuelles
