# Corrections appliquées pour l'erreur 500 avec HTML

## Problème identifié

Le proxy retourne une erreur 500 avec du HTML au lieu de JSON. Cela indique que :
1. Le handler est peut-être appelé (erreur 500 au lieu de 200)
2. Mais une erreur se produit avant qu'il ne puisse retourner du JSON
3. Vercel retourne alors une page d'erreur HTML

## Corrections appliquées

### 1. Gestion d'erreur améliorée dans `api/woocommerce/products.js`

- ✅ Ajout d'un wrapper try-catch global autour de tout le handler
- ✅ Gestion OPTIONS pour CORS
- ✅ Logs de diagnostic plus détaillés
- ✅ Toujours retourner du JSON même en cas d'erreur

### 2. Gestion d'erreur améliorée dans `api/woocommerce/[...path].js`

- ✅ Ajout d'un wrapper try-catch global autour de tout le handler
- ✅ Gestion OPTIONS pour CORS
- ✅ Logs de diagnostic plus détaillés
- ✅ Toujours retourner du JSON même en cas d'erreur

### 3. Correction du `vercel.json`

- ✅ Exclusion des routes `/api/` du rewrite vers `/index.html`
- ✅ Les routes API sont maintenant correctement routées vers les Serverless Functions

## Prochaines étapes

### 1. Redéployer sur Vercel

```bash
git add vercel.json api/woocommerce/products.js api/woocommerce/[...path].js
git commit -m "Fix: Amélioration de la gestion d'erreur et correction du routage API"
git push
```

### 2. Vérifier où pointe le domaine

Le problème principal peut être que `www.impexo.fr` ne pointe pas vers Vercel mais vers WordPress directement.

**Test :**
```
https://www.impexo.fr/api/test
```

**Si vous obtenez du HTML** → Le domaine ne pointe pas vers Vercel
**Si vous obtenez du JSON** → Le domaine pointe vers Vercel, le problème vient d'ailleurs

### 3. Vérifier les logs Vercel

1. Allez dans **Vercel Dashboard** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions**
4. Cherchez `/api/woocommerce/products`
5. Cliquez dessus pour voir les logs

**Si vous voyez les logs** → Le handler est appelé, vérifiez les erreurs
**Si vous ne voyez aucun log** → Le handler n'est pas appelé, problème de domaine/routing

### 4. Vérifier les variables d'environnement

Dans Vercel → **Settings** → **Environment Variables**, vérifiez :
- `WP_BASE_URL` = `https://wp.impexo.fr` (ou l'URL de votre WordPress)
- `WC_CONSUMER_KEY` = `ck_...`
- `WC_CONSUMER_SECRET` = `cs_...`

## Cause probable

Le problème le plus probable est que **`www.impexo.fr` ne pointe pas vers Vercel** mais vers WordPress directement. Dans ce cas :

1. Les fonctions serverless ne peuvent pas être exécutées
2. WordPress retourne sa page HTML par défaut
3. C'est pourquoi vous recevez du HTML au lieu de JSON

## Solutions

### Solution 1 : Configurer le domaine dans Vercel (Recommandé)

1. Allez dans **Vercel** → **Settings** → **Domains**
2. Ajoutez `www.impexo.fr`
3. Suivez les instructions pour configurer les enregistrements DNS
4. Attendez la propagation DNS
5. Redéployez

### Solution 2 : Utiliser le domaine Vercel temporairement

En attendant de configurer le domaine personnalisé :

1. Trouvez votre domaine Vercel (ex: `intexo.vercel.app`)
2. Mettez à jour `VITE_WC_PROXY_URL` dans Vercel :
   ```
   VITE_WC_PROXY_URL=https://intexo.vercel.app/api/woocommerce
   ```
3. Redéployez

### Solution 3 : Utiliser l'API directe (Déjà implémenté)

Le code frontend bascule automatiquement vers l'API directe si le proxy retourne du HTML. C'est une solution temporaire mais fonctionnelle.

## Fichiers modifiés

- ✅ `vercel.json` - Correction du routage
- ✅ `api/woocommerce/products.js` - Gestion d'erreur améliorée
- ✅ `api/woocommerce/[...path].js` - Gestion d'erreur améliorée

## Documents de référence

- `DIAGNOSTIC_500_HTML.md` - Guide de diagnostic détaillé
- `FIX_PROXY_HTML_FINAL.md` - Guide de résolution du problème HTML
