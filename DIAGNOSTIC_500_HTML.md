# Diagnostic : Erreur 500 avec réponse HTML

## Problème

Le proxy retourne une erreur 500 avec du HTML au lieu de JSON. Le Content-Type indique `application/json` mais le contenu réel est du HTML.

## Causes possibles

### 1. Le domaine ne pointe pas vers Vercel ⚠️ (PROBABLE)

Si `www.impexo.fr` pointe directement vers WordPress au lieu de Vercel, les fonctions serverless ne seront jamais exécutées.

**Vérification :**
- Allez dans votre gestionnaire DNS (où vous avez configuré le domaine)
- Vérifiez où pointe `www.impexo.fr` :
  - ✅ **Vers Vercel** : Les fonctions serverless peuvent être exécutées
  - ❌ **Vers WordPress directement** : Les fonctions serverless ne seront jamais exécutées

**Solution :**
Si le domaine pointe vers WordPress, vous devez :
1. Configurer le domaine dans Vercel → **Settings** → **Domains**
2. Mettre à jour les enregistrements DNS pour pointer vers Vercel
3. Configurer un reverse proxy ou utiliser le domaine Vercel directement

### 2. Variables d'environnement manquantes

Les variables d'environnement ne sont pas disponibles dans Vercel.

**Vérification dans Vercel :**
1. Allez dans **Vercel Dashboard** → **Votre projet** → **Settings** → **Environment Variables**
2. Vérifiez que ces variables existent :
   - `WP_BASE_URL` = `https://wp.impexo.fr` (ou `https://www.impexo.fr`)
   - `WC_CONSUMER_KEY` = `ck_...`
   - `WC_CONSUMER_SECRET` = `cs_...`

**Solution :**
Ajoutez les variables manquantes et redéployez.

### 3. Erreur dans le code du handler

Le handler plante avant de pouvoir retourner une réponse JSON.

**Vérification :**
1. Allez dans **Vercel Dashboard** → **Deployments** → Cliquez sur le dernier déploiement
2. Allez dans l'onglet **Functions**
3. Cherchez `/api/woocommerce/products` ou `/api/woocommerce/[...path]`
4. Cliquez dessus pour voir les logs

**Si vous voyez des logs d'erreur** → Le handler est appelé mais il y a une erreur dans le code
**Si vous ne voyez aucun log** → Le handler n'est pas appelé, problème de routing ou de domaine

## Solutions appliquées

### 1. Gestion d'erreur améliorée

J'ai ajouté un wrapper try-catch global dans les deux handlers pour capturer toutes les erreurs et toujours retourner du JSON.

### 2. Logs de diagnostic

Ajout de logs plus détaillés pour identifier où se produit l'erreur.

## Étapes de diagnostic

### Étape 1 : Vérifier où pointe le domaine

Testez directement dans votre navigateur :
```
https://www.impexo.fr/api/test
```

**Résultats possibles :**
- ✅ **JSON** : Le domaine pointe vers Vercel, les fonctions serverless fonctionnent
- ❌ **HTML (page WordPress)** : Le domaine pointe vers WordPress, les fonctions serverless ne peuvent pas être exécutées
- ❌ **404** : Le domaine pointe vers Vercel mais la route n'est pas trouvée

### Étape 2 : Tester avec le domaine Vercel

Si vous avez un domaine Vercel (ex: `intexo.vercel.app`), testez :
```
https://intexo.vercel.app/api/test
```

**Si cela fonctionne avec le domaine Vercel mais pas avec `www.impexo.fr`** → Le problème vient de la configuration DNS du domaine personnalisé.

### Étape 3 : Vérifier les logs Vercel

1. Allez dans **Vercel Dashboard** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions**
4. Cherchez les fonctions API
5. Cliquez dessus pour voir les logs

**Si vous voyez les logs** `[Proxy WooCommerce Products] ✅ Handler appelé` → Le handler est appelé, vérifiez les erreurs dans les logs
**Si vous ne voyez aucun log** → Le handler n'est pas appelé, problème de routing ou de domaine

## Solution temporaire

En attendant de résoudre le problème du domaine, le code frontend bascule automatiquement vers l'API directe si le proxy retourne du HTML. C'est une solution temporaire mais fonctionnelle.

## Solution définitive

Pour que le proxy fonctionne avec `www.impexo.fr`, vous devez :

1. **Configurer le domaine dans Vercel** :
   - Allez dans **Settings** → **Domains**
   - Ajoutez `www.impexo.fr`
   - Suivez les instructions pour configurer les enregistrements DNS

2. **Mettre à jour les enregistrements DNS** :
   - Configurez un CNAME ou A record pointant vers Vercel
   - Attendez la propagation DNS (peut prendre jusqu'à 48h)

3. **Redéployer** après la configuration du domaine

## Alternative : Utiliser le domaine Vercel

Si vous ne pouvez pas configurer le domaine personnalisé maintenant, vous pouvez utiliser le domaine Vercel directement :

1. Trouvez votre domaine Vercel (ex: `intexo.vercel.app`)
2. Mettez à jour `VITE_WC_PROXY_URL` dans Vercel :
   ```
   VITE_WC_PROXY_URL=https://intexo.vercel.app/api/woocommerce
   ```
3. Redéployez
