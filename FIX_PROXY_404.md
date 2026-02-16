# 🔧 Solution : Erreur "Unexpected token '<'" - Proxy retourne du HTML

## 🔴 Problème

L'erreur `Unexpected token '<', "<!doctype "... is not valid JSON` signifie que le proxy retourne une page HTML (probablement une 404) au lieu de JSON.

## ✅ Solutions Appliquées

### 1. Fallback automatique
Le code détecte maintenant automatiquement quand le proxy retourne du HTML et bascule vers l'API directe WooCommerce.

### 2. Gestion d'erreur améliorée
- Détection du HTML dans les réponses
- Messages d'erreur plus clairs
- Fallback automatique si le proxy échoue

## 🔍 Vérifications à Faire

### 1. Vérifier que le fichier API existe

Assurez-vous que ce fichier existe bien dans votre projet :
```
impexo-luxe-e-commerce/api/woocommerce/[...path].js
```

### 2. Vérifier le déploiement Vercel

Le fichier doit être dans le dossier racine du projet déployé. Vérifiez :
- Le dossier `api/` est bien présent
- Le fichier `[...path].js` est bien présent
- Le projet est bien redéployé après avoir ajouté le fichier

### 3. Variables d'environnement Vercel

Vérifiez que ces variables sont bien configurées :

**Pour le proxy (backend) :**
```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**Pour le frontend :**
```
VITE_WP_BASE_URL=https://www.impexo.fr
VITE_IMPEXO_USE_MOCKS=false
VITE_USE_WC_PROXY=true
```

## 🚀 Solution Temporaire : Désactiver le Proxy

Si le proxy ne fonctionne toujours pas après vérification, vous pouvez temporairement désactiver le proxy :

Dans Vercel, ajoutez/modifiez :
```
VITE_USE_WC_PROXY=false
```

Cela utilisera l'API directe WooCommerce (les clés seront visibles dans le code frontend, mais ça fonctionnera).

## 📋 Checklist

- [ ] Le fichier `api/woocommerce/[...path].js` existe dans le projet
- [ ] Le projet a été redéployé sur Vercel après avoir ajouté le fichier API
- [ ] Les variables d'environnement sont configurées dans Vercel
- [ ] Test du proxy : `https://votre-domaine.vercel.app/api/woocommerce/products?per_page=1`
- [ ] Si le proxy ne fonctionne pas, le fallback vers l'API directe devrait fonctionner automatiquement

## 🎯 Résultat Attendu

Avec les corrections appliquées :
- ✅ Si le proxy fonctionne : les requêtes passent par le proxy
- ✅ Si le proxy échoue : basculement automatique vers l'API directe
- ✅ L'application ne plantera plus avec l'erreur `.slice is not a function`
- ✅ Le hero et header devraient s'afficher correctement

---

**Note** : Le fallback automatique signifie que même si le proxy ne fonctionne pas, l'application utilisera l'API directe et fonctionnera. Cependant, en production, il est recommandé de faire fonctionner le proxy pour sécuriser les clés API.
