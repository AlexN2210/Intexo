# Diagnostic : Proxy Vercel ne fonctionne pas

## Problème

Le proxy retourne du HTML au lieu de JSON, même avec toutes les variables configurées.

## Causes possibles

### 1. Le fichier API n'est pas déployé

Vérifiez dans Vercel :
- **Deployments** → Cliquez sur le dernier déploiement
- **Functions** → Cherchez `/api/woocommerce/[...path]`
- Si vous ne voyez **pas** cette fonction, le fichier n'est pas déployé

### 2. Le Root Directory n'est pas configuré

Si votre projet est dans un sous-dossier :
- **Settings** → **General** → **Root Directory**
- Configurez : `impexo-luxe-e-commerce` (si c'est le cas)

### 3. Le fichier n'est pas commité

Vérifiez que le fichier est bien dans Git :
```bash
git status
git ls-files api/woocommerce/[...path].js
```

### 4. La route catch-all n'est pas reconnue

Vercel peut avoir des problèmes avec `[...path].js`. 

## Tests à effectuer

### Test 1 : Route de test simple

J'ai créé `api/test.js` pour tester si les API Routes fonctionnent.

Testez dans votre navigateur :
```
https://intexo.vercel.app/api/test
```

**Résultats attendus :**
- ✅ **JSON** : Les API Routes fonctionnent → Le problème vient de la route catch-all
- ❌ **HTML** : Les API Routes ne fonctionnent pas → Problème de configuration Vercel

### Test 2 : Vérifier les logs Vercel

1. Allez dans **Vercel Dashboard** → **Votre projet** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions**
4. Cherchez `/api/woocommerce/[...path]`
5. Cliquez dessus pour voir les logs

**Si vous voyez des logs** `[Proxy WooCommerce] Requête reçue:` → Le handler est appelé mais il y a un problème dans le code

**Si vous ne voyez aucun log** → Le handler n'est pas appelé, problème de routing

## Solutions

### Solution 1 : Vérifier le Root Directory

Dans Vercel :
1. **Settings** → **General**
2. Vérifiez **Root Directory**
3. Si votre projet est dans `impexo-luxe-e-commerce/`, configurez-le
4. Redéployez

### Solution 2 : Créer une route explicite pour tester

Créez `api/woocommerce/products.js` pour tester une route simple :

```javascript
export default async function handler(req, res) {
  const wpBaseUrl = process.env.WP_BASE_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;
  
  if (!wpBaseUrl || !consumerKey || !consumerSecret) {
    return res.status(500).json({ error: 'Configuration manquante' });
  }
  
  const url = new URL('/wp-json/wc/v3/products', wpBaseUrl);
  url.searchParams.set('consumer_key', consumerKey);
  url.searchParams.set('consumer_secret', consumerSecret);
  url.searchParams.set('per_page', '1');
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  return res.status(200).json(data);
}
```

Testez : `https://intexo.vercel.app/api/woocommerce/products`

### Solution 3 : Vérifier que le fichier est bien dans le repo

```bash
cd impexo-luxe-e-commerce
git add api/woocommerce/[...path].js
git commit -m "Fix: Add WooCommerce proxy"
git push
```

Puis redéployez dans Vercel.

## Prochaines étapes

1. Testez `/api/test` pour voir si les API Routes fonctionnent
2. Vérifiez les logs Vercel pour voir si le handler est appelé
3. Vérifiez le Root Directory dans Vercel
4. Vérifiez que le fichier est bien commité et déployé
