# Création de commande au checkout (panier local)

Le front envoie le panier (localStorage) à WordPress **uniquement au clic sur "Passer au paiement"**. Aucun appel à la Store API avant ça → pas de 429.

## Installation sur WordPress

1. Copier `custom-checkout-create-order.php` dans `wp-content/mu-plugins/` (créer le dossier s’il n’existe pas).
2. Ou l’inclure depuis le thème, dans `functions.php` :
   ```php
   require_once get_stylesheet_directory() . '/../wordpress-store-proxy/custom-checkout-create-order.php';
   ```
   (en adaptant le chemin selon l’emplacement du fichier).

3. Vérifier que l’endpoint répond :
   ```bash
   curl -X POST https://wp.impexo.fr/wp-json/custom-checkout/v1/create-order \
     -H "Content-Type: application/json" \
     -d '{"items":[{"product_id":123,"variation_id":0,"quantity":1}],"customer":{"billing":{"first_name":"A","last_name":"B","address_1":"1 rue X","city":"Paris","postcode":"75001","country":"FR","email":"a@b.fr"}}}'
   ```

## Stripe

Le script renvoie `payment_url` si le gateway Stripe WooCommerce l’expose (méthode `get_payment_url`). Sinon, il faut brancher votre plugin Stripe (création de session, etc.) dans la callback et remplir `payment_url` avant de retourner la réponse.

## CORS

L’appel vient du front (www.impexo.fr) ou du proxy Vercel. Si vous appelez directement wp.impexo.fr depuis le navigateur, activer CORS sur ce namespace (ou passer par le proxy Vercel `/api/checkout/create-order` qui transmet déjà le body à WordPress).
