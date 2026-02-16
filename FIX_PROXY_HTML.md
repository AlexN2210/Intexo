# 🔧 Solution : Proxy retourne du HTML au lieu de JSON

## 🔴 Problème

Le proxy retourne du HTML (`<!doctype html>`) au lieu de JSON. Cela signifie que Vercel ne trouve pas le fichier API et retourne la page `index.html` à la place.

## ✅ Solutions

### Solution 1 : Vérifier la Structure des Fichiers

Assurez-vous que le fichier API est bien présent :

```
impexo-luxe-e-commerce/
├── api/
│   └── woocommerce/
│       └── [...path].js    ← Ce fichier doit exister
├── vercel.json
└── src/
```

### Solution 2 : Vérifier le Déploiement Vercel

Le dossier `api/` doit être à la **racine du projet déployé**.

Si votre projet est dans un sous-dossier sur Vercel, vous devez configurer le **Root Directory** :

1. Allez dans **Vercel Dashboard > Votre Projet > Settings**
2. Dans **General**, vérifiez **Root Directory**
3. Si votre projet est dans `impexo-luxe-e-commerce/`, configurez :
   - **Root Directory** : `impexo-luxe-e-commerce`

### Solution 3 : Vérifier que le Fichier est Commité

Assurez-vous que le fichier `api/woocommerce/[...path].js` est bien commité dans Git :

```bash
git status
git add api/woocommerce/[...path].js
git commit -m "Add WooCommerce proxy API"
git push
```

### Solution 4 : Vérifier vercel.json

Le fichier `vercel.json` doit être présent et correctement configuré. Vérifiez qu'il contient :

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### Solution 5 : Redéployer

Après avoir vérifié tout ça :

1. **Redéployez** le projet sur Vercel
2. **Attendez** que le déploiement soit terminé
3. **Testez** : `https://votre-domaine.vercel.app/api/woocommerce/products?per_page=1`

## 🧪 Test

Testez directement dans votre navigateur :

```
https://votre-domaine.vercel.app/api/woocommerce/products?per_page=1
```

**Résultats attendus :**
- ✅ **JSON avec produits** : Le proxy fonctionne
- ❌ **HTML (page index.html)** : Le proxy n'est pas trouvé → Vérifiez la structure des fichiers
- ❌ **404 Not Found** : Le proxy n'est pas déployé → Vérifiez le Root Directory
- ❌ **500 Error** : Erreur dans le proxy → Vérifiez les logs Vercel

## 📋 Checklist

- [ ] Le fichier `api/woocommerce/[...path].js` existe dans le projet
- [ ] Le fichier est commité dans Git
- [ ] Le Root Directory est correctement configuré dans Vercel
- [ ] Le projet a été redéployé après avoir ajouté le fichier API
- [ ] Test du proxy : retourne du JSON et non du HTML

---

**Note** : Si le proxy ne fonctionne toujours pas après ces vérifications, vous pouvez temporairement désactiver le proxy en mettant `VITE_USE_WC_PROXY=false` dans Vercel. L'application utilisera alors l'API directe (mais les clés seront visibles dans le code frontend).
