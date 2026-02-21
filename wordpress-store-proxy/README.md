# Proxy Store API pour WordPress (o2switch / Imunify360)

## Pourquoi

- Imunify360 limite les requêtes vers `/wp-json/` (ex. 3 req/s).
- Le front headless déclenche beaucoup d’appels (panier, nonce, add-item, refresh, etc.) → 429, session perdue, panier vide.
- Ce mini-proxy expose un **endpoint custom** non limité. Il n’utilise **aucune requête HTTP** : il appelle l’API WooCommerce en PHP via `rest_get_server()->dispatch()`. Imunify360 ne voit qu’une requête vers `/wp-content/api/store-proxy.php`.

## Installation

1. Sur le serveur WordPress (o2switch), créer le dossier :
   ```
   /wp-content/api/
   ```
2. Y copier `store-proxy.php`.
3. Vérifier que l’URL est accessible :
   ```
   https://wp.impexo.fr/wp-content/api/store-proxy.php?endpoint=cart
   ```
4. Dans le projet frontend, définir la variable d’environnement :
   ```
   VITE_WC_STORE_PROXY_URL=https://wp.impexo.fr/wp-content/api/store-proxy.php
   ```
5. Rebuild le front et redéployer.

## Sécurité

- Les origines CORS autorisées sont : `www.impexo.fr`, `intexo.vercel.app`, `localhost:5173`, `localhost:5174`.
- Pour ajouter une origine : éditer le tableau `$allowed` dans `store-proxy.php`.

## Résultat

- Le front n’appelle plus `/wp-json/` en direct ni le proxy Vercel pour le panier.
- Il appelle uniquement `store-proxy.php?endpoint=...` → une seule “requête publique” par action panier.
- WooCommerce reçoit les appels en interne → pas de rate limit, session et nonce stables, panier qui fonctionne.
