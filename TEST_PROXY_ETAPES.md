# Étapes pour tester et diagnostiquer le proxy

## Étape 1 : Tester la route de test simple

Testez dans votre navigateur :
```
https://intexo.vercel.app/api/test
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "API Route fonctionne correctement",
  ...
}
```

**Si vous obtenez du HTML** → Les API Routes ne fonctionnent pas du tout → Vérifiez le Root Directory dans Vercel

**Si vous obtenez du JSON** → Les API Routes fonctionnent → Passez à l'étape 2

---

## Étape 2 : Tester la route explicite WooCommerce

Testez dans votre navigateur :
```
https://intexo.vercel.app/api/woocommerce/products?per_page=1
```

**Résultat attendu :**
- ✅ **JSON avec produits** : Le proxy fonctionne avec la route explicite
- ❌ **HTML** : Le proxy ne fonctionne toujours pas → Vérifiez les variables d'environnement dans Vercel

---

## Étape 3 : Vérifier les logs Vercel

1. Allez dans **Vercel Dashboard** → **Votre projet** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions**
4. Cherchez `/api/woocommerce/products` ou `/api/test`
5. Cliquez dessus pour voir les logs

**Si vous voyez des logs** → Le handler est appelé, vérifiez les erreurs dans les logs

**Si vous ne voyez aucun log** → Le handler n'est pas appelé → Problème de routing

---

## Étape 4 : Vérifier le Root Directory

Dans Vercel :
1. **Settings** → **General**
2. Vérifiez **Root Directory**
3. Si votre projet est dans un sous-dossier `impexo-luxe-e-commerce/`, configurez-le
4. Redéployez

---

## Solutions selon les résultats

### Si `/api/test` retourne du HTML
→ **Problème de configuration Vercel**
- Vérifiez le Root Directory
- Vérifiez que le dossier `api/` est bien à la racine du projet déployé
- Vérifiez que les fichiers sont bien commités dans Git

### Si `/api/test` fonctionne mais `/api/woocommerce/products` retourne du HTML
→ **Problème avec la route spécifique**
- Vérifiez que le fichier `api/woocommerce/products.js` est bien déployé
- Vérifiez les logs Vercel pour cette fonction

### Si `/api/woocommerce/products` fonctionne mais le catch-all `[...path]` ne fonctionne pas
→ **Problème avec la route catch-all**
- Utilisez des routes explicites pour l'instant
- Ou vérifiez la syntaxe de `[...path].js`

---

## Solution temporaire : Utiliser des routes explicites

Si le catch-all ne fonctionne pas, vous pouvez créer des routes explicites pour chaque endpoint :

- `api/woocommerce/products.js` ✅ (déjà créé)
- `api/woocommerce/products/[id].js` (pour un produit spécifique)
- `api/woocommerce/products/[id]/variations.js` (pour les variations)

Mais c'est moins pratique que le catch-all.
