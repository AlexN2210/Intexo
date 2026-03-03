<?php
/**
 * À copier dans wp-config.php (sur le serveur wp.impexo.fr),
 * AVANT la ligne "That's all, stop editing!"
 *
 * Ces constantes doivent avoir exactement les MÊMES valeurs que sur Vercel :
 *   WC_PROXY_CK  = WC_CONSUMER_KEY (Vercel)
 *   WC_PROXY_CS  = WC_CONSUMER_SECRET (Vercel)
 *
 * Clés WooCommerce : WooCommerce → Réglages → Avancé → REST API
 * (compte admin, permissions Lecture/Écriture pour créer des commandes)
 */

// Clés pour store-proxy.php (checkout-full + API v3)
define( 'WC_PROXY_CK', 'ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' );
define( 'WC_PROXY_CS', 'cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' );
