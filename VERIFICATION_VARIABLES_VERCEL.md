# Vérification des variables d'environnement Vercel

## Variables configurées dans Vercel

D'après votre configuration, vous avez :

✅ **VITE_IMPEXO_USE_MOCKS** - Pour activer/désactiver les mocks  
✅ **VITE_USE_WC_PROXY** - Pour activer/désactiver le proxy  
✅ **WP_BASE_URL** - URL de base WordPress (sans préfixe VITE_)  
✅ **WC_CONSUMER_KEY** - Clé API WooCommerce (sans préfixe VITE_)  
✅ **WC_CONSUMER_SECRET** - Secret API WooCommerce (sans préfixe VITE_)  

## Vérifications

### 1. Valeurs des variables

Assurez-vous que les valeurs sont correctes :

- **VITE_IMPEXO_USE_MOCKS** : `false` (pour utiliser les vraies données)
- **VITE_USE_WC_PROXY** : `true` (pour utiliser le proxy)
- **WP_BASE_URL** : `https://www.impexo.fr`
- **WC_CONSUMER_KEY** : `ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`
- **WC_CONSUMER_SECRET** : `cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3`

### 2. Variable manquante

⚠️ **Il manque une variable importante** :

**VITE_WC_PROXY_URL** : `https://intexo.vercel.app/api/woocommerce`

Cette variable est nécessaire pour que le frontend sache où se trouve le proxy.

### 3. Code du proxy

Le proxy (`api/woocommerce/[...path].js`) utilise :
- `process.env.VITE_WP_BASE_URL || process.env.WP_BASE_URL` ✅
- `process.env.VITE_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY` ✅
- `process.env.VITE_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET` ✅

Donc les variables sans préfixe `VITE_` fonctionneront bien.

## Action requise

Ajoutez dans Vercel :

**VITE_WC_PROXY_URL** = `https://intexo.vercel.app/api/woocommerce`

Cette variable est nécessaire pour que le frontend sache où envoyer les requêtes proxy.

## Après avoir ajouté la variable

1. Redéployez le projet dans Vercel
2. Redémarrez le serveur de développement local : `npm run dev`
3. Testez dans le navigateur - les requêtes devraient aller vers `https://intexo.vercel.app/api/woocommerce/...`

## Vérification dans les logs

Une fois redéployé, vérifiez les logs Vercel pour voir si le proxy est appelé :
- Allez dans **Deployments** → Cliquez sur le dernier déploiement → **Functions** → `/api/woocommerce/[...path]`
- Vous devriez voir les logs `[Proxy WooCommerce] Requête reçue:` si le proxy est appelé
