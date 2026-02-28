<?php
/**
 * Traite le paramètre ?cart= envoyé depuis le front (www.impexo.fr).
 * Décode le panier, vide le panier WC, ajoute les articles, puis redirige sans ?cart=.
 *
 * Installation WordPress :
 * - Soit dans functions.php du thème : require_once get_stylesheet_directory() . '/../wordpress-store-proxy/cart-from-url.php';
 * - Soit copier ce fichier dans wp-content/mu-plugins/cart-from-url.php (créer le dossier mu-plugins si besoin)
 * - Soit coller le contenu de la fonction dans functions.php
 *
 * La page utilisée : "Panier" (slug "panier"). On remplit le panier ici, puis l’utilisateur va sur "Validation de la commande".
 */

if (!defined('ABSPATH')) {
    exit;
}

// Slug de la page où appliquer le panier envoyé depuis www.impexo.fr (page "Panier" = slug panier)
const IMPEXO_CHECKOUT_SLUG = 'panier';

add_action('template_redirect', 'impexo_cart_from_url_handler', 5);

function impexo_cart_from_url_handler() {
    $cart_param = isset($_GET['cart']) ? sanitize_text_field(wp_unslash($_GET['cart'])) : '';
    if ($cart_param === '') {
        return;
    }

    // Vérifier qu'on est bien sur la page checkout (éviter d'exécuter sur toutes les pages)
    $slug = get_post_field('post_name', get_queried_object_id());
    $is_checkout_page = ($slug === IMPEXO_CHECKOUT_SLUG);
    if (!$is_checkout_page) {
        // Fallback : vérifier l'URL (au cas où la page utilise un autre template)
        $is_checkout_page = (strpos($_SERVER['REQUEST_URI'], '/' . IMPEXO_CHECKOUT_SLUG . '/') !== false
            || strpos($_SERVER['REQUEST_URI'], '/' . IMPEXO_CHECKOUT_SLUG) === strlen($_SERVER['REQUEST_URI']) - strlen('/' . IMPEXO_CHECKOUT_SLUG));
    }
    if (!$is_checkout_page) {
        return;
    }

    $decoded = base64_decode($cart_param, true);
    if ($decoded === false) {
        return;
    }
    $json = urldecode($decoded);
    $items = json_decode($json, true);
    if (!is_array($items) || empty($items)) {
        return;
    }

    if (!function_exists('WC') || !WC()->cart) {
        return;
    }

    // Une seule exécution par requête (éviter boucle de redirection)
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;

    // Vider le panier actuel puis ajouter les articles venant du front
    WC()->cart->empty_cart();

    foreach ($items as $item) {
        $product_id = isset($item['product_id']) ? absint($item['product_id']) : 0;
        $quantity = isset($item['quantity']) ? absint($item['quantity']) : 1;
        $variation_id = isset($item['variation_id']) ? absint($item['variation_id']) : 0;

        if ($product_id < 1) {
            continue;
        }

        if ($variation_id > 0) {
            WC()->cart->add_to_cart($product_id, $quantity, $variation_id);
        } else {
            WC()->cart->add_to_cart($product_id, $quantity);
        }
    }

    // Rediriger vers la même page sans ?cart= pour avoir une URL propre et éviter de ré-ajouter au rechargement
    $redirect_url = get_permalink(get_queried_object_id());
    if (!$redirect_url) {
        $redirect_url = home_url('/panier/');
    }
    wp_safe_redirect($redirect_url, 302);
    exit;
}
