# Fix : Proxy avec mauvais domaine

## Problème

Le proxy retourne du HTML au lieu de JSON car il essaie d'accéder à `www.impexo.fr/api/woocommerce` au lieu du proxy Vercel.

## Cause

Le code utilise `window.location.origin` pour construire l'URL du proxy. Si le frontend est sur `www.impexo.fr`, le proxy sera `www.impexo.fr/api/woocommerce`, mais le proxy Vercel est sur `intexo.vercel.app/api/woocommerce`.

## Solution appliquée

**Désactivation du proxy** dans `.env.local` :
```
VITE_USE_WC_PROXY=false
```

Le code bascule automatiquement vers l'API directe WooCommerce qui fonctionne déjà.

## Solutions alternatives

### Option 1 : Utiliser l'API directe (actuel)
- ✅ Fonctionne immédiatement
- ⚠️ Les clés API sont exposées côté client (mais c'est déjà le cas)

### Option 2 : Configurer l'URL complète du proxy Vercel
Dans `.env.local`, ajouter :
```
VITE_WC_PROXY_URL=https://intexo.vercel.app/api/woocommerce
```

Puis modifier `buildWooUrl` pour utiliser l'URL complète si elle commence par `http`.

### Option 3 : Déployer le frontend sur Vercel aussi
Si le frontend est déployé sur Vercel (même domaine que le proxy), le chemin relatif `/api/woocommerce` fonctionnera.

## Prochaine étape

Redémarrer le serveur de développement pour que les changements dans `.env.local` soient pris en compte.
