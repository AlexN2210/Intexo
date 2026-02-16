# ✅ Vérification Variables d'Environnement Vercel

## 🔴 PROBLÈME IDENTIFIÉ

Le code vérifie : `if (env.useMocks || !env.wpBaseUrl)`

Cela signifie que si `VITE_WP_BASE_URL` est **vide** ou si `VITE_IMPEXO_USE_MOCKS` est `true`, les produits mock seront utilisés au lieu des vrais produits.

## ✅ SOLUTION : Variables à Configurer dans Vercel

Allez dans **Vercel Dashboard > Votre Projet > Settings > Environment Variables**

### Variables OBLIGATOIRES (pour le proxy backend) :

```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**Pour chaque variable, sélectionnez :**
- ✅ Production
- ✅ Preview  
- ✅ Development

### Variables OBLIGATOIRES (pour le frontend) :

```
VITE_WP_BASE_URL=https://www.impexo.fr
VITE_IMPEXO_USE_MOCKS=false
VITE_USE_WC_PROXY=true
```

**⚠️ IMPORTANT :**
- `VITE_IMPEXO_USE_MOCKS` doit être exactement `false` (pas `true`, pas vide)
- `VITE_WP_BASE_URL` doit être exactement `https://www.impexo.fr` (pas vide)
- `VITE_USE_WC_PROXY` doit être `true` (ou laissez vide, c'est la valeur par défaut)

## 🔄 Après avoir configuré les variables

1. **Redéployez** votre projet dans Vercel
   - Allez dans "Deployments"
   - Cliquez sur les 3 points du dernier déploiement
   - Cliquez sur "Redeploy"

2. **Attendez** que le déploiement soit terminé

3. **Testez** votre site

## 🧪 Test Rapide

Testez directement le proxy :
```
https://votre-domaine.vercel.app/api/woocommerce/products?per_page=1
```

Si vous voyez du JSON avec des produits, le proxy fonctionne ✅

## 📋 Checklist Complète

- [ ] `WP_BASE_URL` configuré dans Vercel
- [ ] `WC_CONSUMER_KEY` configuré dans Vercel
- [ ] `WC_CONSUMER_SECRET` configuré dans Vercel
- [ ] `VITE_WP_BASE_URL` configuré dans Vercel (OBLIGATOIRE pour le frontend)
- [ ] `VITE_IMPEXO_USE_MOCKS=false` configuré dans Vercel (OBLIGATOIRE)
- [ ] `VITE_USE_WC_PROXY=true` configuré dans Vercel (ou laissé vide)
- [ ] Projet redéployé après configuration
- [ ] Test du proxy réussi

## 🐛 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs Vercel** :
   - Allez dans "Deployments" > Dernier déploiement > "Functions" ou "Logs"
   - Cherchez les erreurs

2. **Vérifiez la console du navigateur** :
   - Ouvrez votre site
   - F12 > Console
   - Cherchez les erreurs

3. **Vérifiez que les produits existent dans WooCommerce** :
   - Connectez-vous à WordPress
   - Produits > Tous les produits
   - Vérifiez qu'il y a des produits **publiés**

---

**Le problème le plus courant** : `VITE_WP_BASE_URL` n'est pas configuré dans Vercel, donc `env.wpBaseUrl` est vide et les produits mock sont utilisés.
