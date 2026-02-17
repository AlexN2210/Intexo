# 🔧 Solution : Changement de domaine (Vercel → www.impexo.fr)

## Problème

Vous avez changé le domaine de `intexo.vercel.app` vers `www.impexo.fr`. Le proxy ne fonctionne plus car il essaie toujours d'appeler l'ancien domaine.

## Solution

### Étape 1 : Mettre à jour les variables d'environnement dans Vercel

Dans **Vercel** → **Settings** → **Environment Variables**, mettez à jour :

**Variable à modifier :**
```
VITE_WC_PROXY_URL=https://www.impexo.fr/api/woocommerce
```

**Ancienne valeur (à remplacer) :**
```
VITE_WC_PROXY_URL=https://intexo.vercel.app/api/woocommerce  ❌
```

### Étape 2 : Vérifier que le domaine personnalisé est configuré dans Vercel

1. Allez dans **Vercel** → **Votre projet** → **Settings** → **Domains**
2. Vérifiez que `www.impexo.fr` est bien configuré
3. Vérifiez que le domaine pointe vers votre projet Vercel

### Étape 3 : Vérifier que les API Routes fonctionnent sur le nouveau domaine

Testez cette URL dans votre navigateur :
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

Si vous obtenez ce résultat, les API Routes fonctionnent sur le nouveau domaine.

### Étape 4 : Tester le proxy WooCommerce

Testez cette URL :
```
https://www.impexo.fr/api/woocommerce/products?per_page=1
```

**Résultats attendus :**
- ✅ **JSON avec produits** : Le proxy fonctionne sur le nouveau domaine
- ❌ **404** : Le domaine n'est pas correctement configuré dans Vercel
- ❌ **HTML** : Vérifiez les variables d'environnement (voir ci-dessous)

### Étape 5 : Redéployer le projet

Après avoir mis à jour les variables d'environnement dans Vercel :
1. **Redéployez** le projet (ou faites un nouveau commit/push)
2. Attendez que le déploiement soit terminé
3. Testez à nouveau le proxy

## Variables d'environnement complètes à vérifier dans Vercel

Assurez-vous d'avoir **TOUTES** ces variables configurées :

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
VITE_WC_PROXY_URL=https://www.impexo.fr/api/woocommerce
```

## Important : Configuration du domaine dans Vercel

Si vous utilisez un domaine personnalisé (`www.impexo.fr`), assurez-vous que :

1. ✅ Le domaine est ajouté dans **Vercel** → **Settings** → **Domains**
2. ✅ Les DNS pointent vers Vercel (vérifiez avec votre hébergeur de domaine)
3. ✅ Le certificat SSL est actif (Vercel le génère automatiquement)

## Test rapide

1. Testez `/api/test` : `https://www.impexo.fr/api/test`
2. Testez le proxy : `https://www.impexo.fr/api/woocommerce/products?per_page=1`
3. Vérifiez la console du navigateur sur `https://www.impexo.fr` pour voir les requêtes

## Problèmes courants

### Problème 1 : 404 sur `/api/test`

**Cause** : Le domaine n'est pas correctement configuré dans Vercel ou les DNS ne pointent pas vers Vercel.

**Solution** : Vérifiez la configuration du domaine dans Vercel et les DNS.

### Problème 2 : Le proxy retourne toujours du HTML

**Cause** : Les variables d'environnement ne sont pas mises à jour ou le projet n'a pas été redéployé.

**Solution** : 
1. Vérifiez que `VITE_WC_PROXY_URL=https://www.impexo.fr/api/woocommerce` dans Vercel
2. Redéployez le projet

### Problème 3 : CORS errors

**Cause** : Le frontend essaie d'appeler un domaine différent.

**Solution** : Assurez-vous que `VITE_WC_PROXY_URL` pointe vers le même domaine que le frontend (`www.impexo.fr`).

## Prochaines étapes

1. ✅ Mettez à jour `VITE_WC_PROXY_URL` dans Vercel vers `https://www.impexo.fr/api/woocommerce`
2. ✅ Vérifiez que le domaine est bien configuré dans Vercel
3. ✅ Testez `/api/test` pour vérifier que les API Routes fonctionnent
4. ✅ Redéployez le projet
5. ✅ Testez le proxy : `https://www.impexo.fr/api/woocommerce/products?per_page=1`

Dites-moi ce que vous obtenez après ces étapes !
