# Fix: Proxy retourne du HTML au lieu de JSON

## Problème

Le proxy Vercel (`/api/woocommerce/[...path]`) retourne du HTML au lieu de JSON, même avec un status 200.

## Cause probable

Vercel ne reconnaît pas correctement la route catch-all `[...path].js` ou les rewrites dans `vercel.json` interceptent les requêtes API avant qu'elles n'atteignent le handler.

## Solutions appliquées

1. **Ajout de logs de débogage** dans le handler API pour voir si le code est exécuté
2. **Simplification des rewrites** dans `vercel.json` - suppression du rewrite explicite pour `/api/woocommerce/` car Vercel devrait automatiquement servir les fichiers dans `/api/`

## Vérification

Pour vérifier si le handler est appelé :

1. Allez dans le dashboard Vercel
2. Ouvrez les logs de la fonction serverless
3. Cherchez les logs qui commencent par `[Proxy WooCommerce]`

Si vous ne voyez **aucun log**, cela signifie que le handler n'est pas exécuté et que Vercel sert directement le HTML.

## Solutions alternatives

### Solution 1 : Vérifier que le fichier est bien déployé

Assurez-vous que le fichier `api/woocommerce/[...path].js` est bien présent dans le déploiement Vercel.

### Solution 2 : Utiliser une route explicite au lieu d'un catch-all

Si le catch-all ne fonctionne pas, vous pouvez créer des routes explicites :

- `api/woocommerce/products.js`
- `api/woocommerce/products/[id].js`
- etc.

### Solution 3 : Vérifier les variables d'environnement

Assurez-vous que les variables d'environnement sont bien configurées dans Vercel :
- `VITE_WP_BASE_URL` ou `WP_BASE_URL`
- `VITE_WC_CONSUMER_KEY` ou `WC_CONSUMER_KEY`
- `VITE_WC_CONSUMER_SECRET` ou `WC_CONSUMER_SECRET`

### Solution 4 : Utiliser l'API directe (fallback déjà implémenté)

Le code frontend bascule automatiquement vers l'API directe si le proxy retourne du HTML. C'est une solution temporaire mais fonctionnelle.

## Prochaines étapes

1. Vérifier les logs Vercel pour voir si le handler est appelé
2. Si le handler n'est pas appelé, vérifier la structure du projet et le déploiement
3. Si le handler est appelé mais retourne du HTML, vérifier la réponse de WooCommerce
