# 🚀 Guide de Déploiement Vercel

Ce guide vous explique comment déployer votre application sur Vercel pour la première fois.

## ⚠️ Erreur DEPLOYMENT_NOT_FOUND

Si vous voyez cette erreur, c'est que le projet n'est pas encore déployé sur Vercel. Suivez ces étapes :

## 📋 Méthode 1 : Déploiement via Vercel CLI (Recommandé)

### Étape 1 : Installer Vercel CLI

```bash
npm i -g vercel
```

### Étape 2 : Se connecter à Vercel

```bash
vercel login
```

### Étape 3 : Naviguer dans le dossier du projet

```bash
cd impexo-luxe-e-commerce
```

### Étape 4 : Déployer

```bash
vercel
```

Répondez aux questions :
- **Set up and deploy?** → `Y`
- **Which scope?** → Choisissez votre compte/organisation
- **Link to existing project?** → `N` (première fois)
- **Project name?** → `impexo-luxe-e-commerce` (ou le nom que vous voulez)
- **Directory?** → `./` (appuyez sur Entrée)
- **Override settings?** → `N` (utilise la config existante)

### Étape 5 : Configurer les variables d'environnement

Après le premier déploiement, configurez les variables :

```bash
vercel env add WP_BASE_URL
# Entrez: https://www.impexo.fr

vercel env add WC_CONSUMER_KEY
# Entrez: ck_374c0ec78039fd4115f44238dae84ac7cb31cd38

vercel env add WC_CONSUMER_SECRET
# Entrez: cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

Pour chaque variable, choisissez :
- **Production** → `Y`
- **Preview** → `Y`
- **Development** → `Y`

### Étape 6 : Redéployer avec les variables

```bash
vercel --prod
```

## 📋 Méthode 2 : Déploiement via Dashboard Vercel

### Étape 1 : Connecter votre repository Git

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre repository GitHub/GitLab/Bitbucket
4. Sélectionnez le repository contenant `impexo-luxe-e-commerce`

### Étape 2 : Configurer le projet

Vercel détecte automatiquement Vite. Vérifiez :
- **Framework Preset:** Vite
- **Root Directory:** `impexo-luxe-e-commerce` (si le projet est dans un sous-dossier)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Étape 3 : Ajouter les variables d'environnement

Avant de déployer, ajoutez les variables :

1. Cliquez sur **"Environment Variables"**
2. Ajoutez :

```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

Pour chaque variable, sélectionnez :
- ✅ Production
- ✅ Preview
- ✅ Development

### Étape 4 : Déployer

Cliquez sur **"Deploy"**

## ✅ Vérification Post-Déploiement

### 1. Test du proxy

Une fois déployé, testez l'URL du proxy :
```
https://votre-projet.vercel.app/api/woocommerce/products?per_page=1
```

Vous devriez voir du JSON avec des produits.

### 2. Test de l'application

Visitez votre URL de déploiement :
```
https://votre-projet.vercel.app
```

Vérifiez :
- ✅ La page d'accueil s'affiche
- ✅ Les produits s'affichent
- ✅ La navigation fonctionne
- ✅ Les pages produit fonctionnent

## 🔧 Configuration Importante

### Structure des fichiers

Assurez-vous que votre structure est :
```
impexo-luxe-e-commerce/
├── api/
│   └── woocommerce/
│       └── [...path].js    ← Proxy API
├── src/
├── vercel.json             ← Configuration Vercel
├── package.json
└── vite.config.ts
```

### Points clés

1. **Root Directory** : Si votre projet est dans `impexo-luxe-e-commerce/`, configurez-le dans Vercel
2. **Build Command** : `npm run build` (déjà configuré)
3. **Output Directory** : `dist` (déjà configuré)
4. **Variables d'environnement** : Obligatoires pour le proxy

## 🐛 Dépannage

### Erreur "DEPLOYMENT_NOT_FOUND"

- Vérifiez que vous avez bien déployé le projet
- Vérifiez que vous êtes sur le bon compte Vercel
- Essayez de redéployer : `vercel --prod`

### Erreur 404 sur les routes

- Vérifiez que `vercel.json` contient la rewrite pour `index.html`
- Vérifiez que le build génère bien le dossier `dist`

### Le proxy ne fonctionne pas

- Vérifiez que les variables d'environnement sont bien configurées
- Vérifiez les logs : `vercel logs`
- Testez directement l'API WooCommerce avec les clés

### Build échoue

- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez les logs de build dans Vercel
- Testez le build localement : `npm run build`

## 📞 Commandes Utiles

```bash
# Déployer en production
vercel --prod

# Déployer en preview
vercel

# Voir les logs
vercel logs

# Voir les variables d'environnement
vercel env ls

# Ouvrir le dashboard
vercel dashboard
```

## 🎯 Prochaines Étapes

Une fois déployé :

1. ✅ Testez le proxy : `/api/woocommerce/products`
2. ✅ Testez l'application complète
3. ✅ Configurez un domaine personnalisé (optionnel)
4. ✅ Configurez les webhooks Git pour déploiement automatique

---

**Besoin d'aide ?** Consultez les logs Vercel ou testez localement avec `vercel dev`.
