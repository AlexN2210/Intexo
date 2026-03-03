# Vérification wp-config.php (store-proxy / checkout)

## Checklist

- [ ] **WC_PROXY_CK** et **WC_PROXY_CS** sont définis (avant `That's all, stop editing!`).
- [ ] Les valeurs sont **strictement identiques** à celles sur Vercel :
  - `WC_PROXY_CK` = `WC_CONSUMER_KEY` (Vercel)
  - `WC_PROXY_CS` = `WC_CONSUMER_SECRET` (Vercel)
- [ ] Pas d’espace en trop avant/après les clés (copier-coller depuis WooCommerce ou Vercel).
- [ ] Clés WooCommerce avec permissions **Lecture/Écriture** (WooCommerce → Réglages → Avancé → REST API).

## Si tu as encore un 401

1. Vérifier sur Vercel que `WC_CONSUMER_KEY` et `WC_CONSUMER_SECRET` sont bien renseignés (Production).
2. Redéployer le projet Vercel après toute modification des variables d’environnement.
3. Vérifier que `store-proxy.php` sur le serveur est à jour (prise en charge de l’en-tête **X-WC-Proxy-Auth** si Apache supprime `Authorization`).
4. Optionnel : ajouter dans `.htaccess` à la racine du site :
   ```apache
   SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
   ```
