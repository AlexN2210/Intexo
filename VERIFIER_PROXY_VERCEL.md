# Vérification : Configuration du proxy Vercel

## Modifications apportées

### 1. Code frontend (`src/services/woocommerce.ts`)
- ✅ Modifié pour accepter une URL complète du proxy (commençant par `http://` ou `https://`)
- ✅ Si l'URL est complète, elle est utilisée directement
- ✅ Sinon, utilise `window.location.origin` pour un chemin relatif

### 2. Configuration (`.env.local`)
- ✅ `VITE_USE_WC_PROXY=true` : Proxy activé
- ✅ `VITE_WC_PROXY_URL=https://intexo.vercel.app/api/woocommerce` : URL complète du proxy Vercel

## Vérifications nécessaires dans Vercel

### Variables d'environnement dans Vercel

Assurez-vous que les variables suivantes sont configurées dans le dashboard Vercel pour le projet `intexo` :

1. **WP_BASE_URL** (ou VITE_WP_BASE_URL) : `https://www.impexo.fr`
2. **WC_CONSUMER_KEY** (ou VITE_WC_CONSUMER_KEY) : `ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`
3. **WC_CONSUMER_SECRET** (ou VITE_WC_CONSUMER_SECRET) : `cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3`

**Important** : Dans Vercel, les variables d'environnement pour les Serverless Functions ne doivent **PAS** avoir le préfixe `VITE_`. Utilisez `WP_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` (sans `VITE_`).

### Comment vérifier dans Vercel

1. Allez sur https://vercel.com
2. Ouvrez le projet `intexo`
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que ces variables sont présentes :
   - `WP_BASE_URL` = `https://www.impexo.fr`
   - `WC_CONSUMER_KEY` = `ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`
   - `WC_CONSUMER_SECRET` = `cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3`
5. Assurez-vous qu'elles sont disponibles pour **Production**, **Preview** et **Development**

### Redéploiement

Après avoir ajouté/modifié les variables d'environnement dans Vercel :
1. Redéployez le projet (ou attendez le prochain déploiement)
2. Les variables seront disponibles pour le proxy

## Test

Une fois les variables configurées dans Vercel, testez :
1. Redémarrez le serveur de développement : `npm run dev`
2. Ouvrez la console du navigateur
3. Vérifiez que les requêtes vont vers `https://intexo.vercel.app/api/woocommerce/...`
4. Vérifiez qu'il n'y a plus d'erreur "Proxy retourne du HTML"

## Si le proxy ne fonctionne toujours pas

1. Vérifiez les logs Vercel pour voir si le handler est appelé
2. Vérifiez que les variables d'environnement sont bien configurées
3. Vérifiez que le fichier `api/woocommerce/[...path].js` est bien déployé
