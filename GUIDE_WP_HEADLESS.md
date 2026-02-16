# Guide Complet : Configuration WordPress Headless

Ce guide vous explique comment finaliser la configuration pour que votre application fonctionne en mode WordPress headless avec WooCommerce.

## 📋 État Actuel

✅ **Déjà configuré :**
- Proxy backend Vercel (`/api/woocommerce/[...path].js`)
- Service frontend modifié pour utiliser le proxy
- Variables d'environnement locales configurées
- Configuration Vercel (`vercel.json`)

## 🚀 Étapes pour Finaliser

### Étape 1 : Configuration Vercel (Production)

Dans le **dashboard Vercel** de votre projet :

1. Allez dans **Settings > Environment Variables**
2. Ajoutez ces variables pour **Production**, **Preview** et **Development** :

```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**Optionnel** (pour le frontend) :
```
VITE_WP_BASE_URL=https://www.impexo.fr
VITE_IMPEXO_USE_MOCKS=false
VITE_USE_WC_PROXY=true
```

### Étape 2 : Test en Local

#### Option A : Utiliser Vercel CLI (Recommandé)

```bash
# Installer Vercel CLI si ce n'est pas déjà fait
npm i -g vercel

# Dans le dossier du projet
cd impexo-luxe-e-commerce

# Lancer le serveur de développement Vercel
vercel dev
```

Le proxy fonctionnera correctement avec `vercel dev`.

#### Option B : Mode Direct (Sans Proxy)

Si vous voulez tester avec `npm run dev`, modifiez temporairement `.env.local` :

```env
VITE_USE_WC_PROXY=false
```

⚠️ **Attention** : En mode direct, les clés API seront visibles dans le code frontend (uniquement pour le développement local).

### Étape 3 : Vérifier la Configuration WordPress

Assurez-vous que votre WordPress/WooCommerce est bien configuré :

1. **WooCommerce installé et activé** ✅ (déjà vérifié)
2. **API REST activée** ✅ (déjà vérifié)
3. **Clés API valides** ✅ (déjà vérifiées)
4. **CORS configuré** (si nécessaire)

Pour configurer CORS sur WordPress, ajoutez dans votre `functions.php` ou via un plugin :

```php
// Autoriser les requêtes depuis votre domaine Vercel
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
        return $value;
    });
}, 15);
```

### Étape 4 : Déployer sur Vercel

```bash
# Si vous n'avez pas encore déployé
vercel

# Ou connectez votre repo GitHub/GitLab et Vercel déploiera automatiquement
```

### Étape 5 : Tester en Production

Une fois déployé, testez :

1. **Test du proxy** :
   ```
   https://votre-domaine.vercel.app/api/woocommerce/products?per_page=1
   ```
   Devrait retourner un produit JSON.

2. **Test de l'application** :
   - Visitez votre site déployé
   - Vérifiez que les produits s'affichent
   - Testez la navigation, les pages produit, etc.

## 🔍 Dépannage

### Le proxy ne fonctionne pas en local

**Solution** : Utilisez `vercel dev` au lieu de `npm run dev`

### Erreur 500 sur le proxy

**Vérifiez** :
1. Les variables d'environnement sont bien configurées dans Vercel
2. Les clés API sont correctes
3. WooCommerce est accessible à `https://www.impexo.fr/wp-json/wc/v3/`

**Logs Vercel** :
```bash
vercel logs
```

### Erreur CORS

Le proxy configure automatiquement les headers CORS. Si vous avez encore des erreurs :
- Vérifiez que `vercel.json` est bien présent
- Vérifiez la configuration CORS côté WordPress (voir Étape 3)

### Les produits ne s'affichent pas

1. Vérifiez que `VITE_IMPEXO_USE_MOCKS=false` en production
2. Vérifiez que `VITE_USE_WC_PROXY=true` en production
3. Ouvrez la console du navigateur pour voir les erreurs
4. Vérifiez les logs Vercel

## 📊 Flux de Données

```
Frontend React
    ↓
/api/woocommerce/* (Proxy Vercel)
    ↓
Ajoute les clés API côté serveur
    ↓
https://www.impexo.fr/wp-json/wc/v3/*
    ↓
Retourne les données à l'application
```

## ✅ Checklist Finale

- [ ] Variables d'environnement configurées dans Vercel
- [ ] Application déployée sur Vercel
- [ ] Test du proxy réussi (`/api/woocommerce/products`)
- [ ] Produits s'affichent sur le site
- [ ] Navigation fonctionne
- [ ] Pages produit fonctionnent
- [ ] Panier fonctionne (si implémenté)

## 🎯 Résultat Attendu

Une fois tout configuré, votre application :
- ✅ Récupère les produits depuis WooCommerce
- ✅ Protège les clés API côté serveur
- ✅ Fonctionne en production sur Vercel
- ✅ Est prête pour la mise en production

---

**Besoin d'aide ?** Consultez les logs Vercel ou vérifiez la configuration étape par étape.
