<?php
/**
 * Endpoint custom WooCommerce — remplace le proxy store-proxy + wp-json/wc/v3 pour les produits.
 * À placer à la racine WordPress (à côté de wp-load.php).
 * Pas d’appel à /wp-json/ → pas de 429 Imunify360.
 *
 * GET woo-api.php?action=products&per_page=24&page=1&orderby=date&order=desc&search=...&status=publish
 * GET woo-api.php?action=product-by-slug&slug=xxx&status=publish
 * GET woo-api.php?action=variations&product_id=123&per_page=100&status=publish
 */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://www.impexo.fr', 'https://impexo.fr', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed, true) ? $origin : 'https://www.impexo.fr'));
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$wp_load = dirname(__FILE__) . '/wp-load.php';
if (!file_exists($wp_load)) {
    http_response_code(500);
    echo json_encode(['error' => 'WordPress not found']);
    exit;
}
require_once $wp_load;

if (!function_exists('wc_get_products')) {
    http_response_code(500);
    echo json_encode(['error' => 'WooCommerce not active']);
    exit;
}

$action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : '';

function impexo_product_to_array($product) {
    if (!is_object($product) || !method_exists($product, 'get_id')) {
        return null;
    }
    $images = [];
    $img_id = $product->get_image_id();
    if ($img_id) {
        $src = wp_get_attachment_image_url($img_id, 'woocommerce_single');
        if (!$src) $src = wp_get_attachment_image_url($img_id, 'full');
        $images[] = [
            'id' => $img_id,
            'src' => $src ?: '',
            'alt' => get_post_meta($img_id, '_wp_attachment_image_alt', true) ?: '',
            'name' => get_the_title($img_id),
        ];
    }
    foreach ($product->get_gallery_image_ids() ?: [] as $gid) {
        $src = wp_get_attachment_image_url($gid, 'woocommerce_thumbnail');
        if (!$src) $src = wp_get_attachment_image_url($gid, 'full');
        $images[] = [
            'id' => $gid,
            'src' => $src ?: '',
            'alt' => get_post_meta($gid, '_wp_attachment_image_alt', true) ?: '',
            'name' => get_the_title($gid),
        ];
    }
    $attributes = [];
    foreach ($product->get_attributes() ?: [] as $attr) {
        $attributes[] = [
            'id' => $attr->get_id(),
            'name' => $attr->get_name(),
            'slug' => $attr->get_name(),
            'visible' => $attr->get_visible(),
            'variation' => $attr->get_variation(),
            'options' => $attr->get_options() ?: [],
        ];
    }
    $cat_ids = $product->get_category_ids();
    $categories = [];
    foreach ($cat_ids as $cid) {
        $term = get_term($cid, 'product_cat');
        if ($term && !is_wp_error($term)) {
            $categories[] = ['id' => (int) $term->term_id, 'name' => $term->name, 'slug' => $term->slug];
        }
    }
    $variations = [];
    if ($product->is_type('variable')) {
        $variations = $product->get_children();
    }
    return [
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'slug' => $product->get_slug(),
        'type' => $product->get_type(),
        'description' => $product->get_description(),
        'short_description' => $product->get_short_description(),
        'price' => $product->get_price(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'on_sale' => $product->is_on_sale(),
        'images' => $images,
        'attributes' => $attributes,
        'variations' => $variations,
        'categories' => $categories,
        'stock_status' => $product->get_stock_status(),
    ];
}

function impexo_variation_to_array($variation) {
    if (!is_object($variation) || !method_exists($variation, 'get_id')) {
        return null;
    }
    $img = null;
    $img_id = $variation->get_image_id();
    if ($img_id) {
        $src = wp_get_attachment_image_url($img_id, 'woocommerce_single');
        if (!$src) $src = wp_get_attachment_image_url($img_id, 'full');
        $img = [
            'id' => $img_id,
            'src' => $src ?: '',
            'alt' => get_post_meta($img_id, '_wp_attachment_image_alt', true) ?: '',
            'name' => get_the_title($img_id),
        ];
    }
    $attrs = [];
    foreach ($variation->get_attributes() ?: [] as $name => $val) {
        $attrs[] = [
            'id' => 0,
            'name' => $name,
            'option' => $val,
        ];
    }
    return [
        'id' => $variation->get_id(),
        'price' => $variation->get_price(),
        'regular_price' => $variation->get_regular_price(),
        'sale_price' => $variation->get_sale_price(),
        'on_sale' => $variation->is_on_sale(),
        'image' => $img,
        'attributes' => $attrs,
        'stock_status' => $variation->get_stock_status(),
        'sku' => $variation->get_sku(),
    ];
}

if ($action === 'products') {
    $args = [
        'status' => isset($_GET['status']) ? sanitize_text_field($_GET['status']) : 'publish',
        'limit' => isset($_GET['per_page']) ? max(1, min(100, (int) $_GET['per_page'])) : 24,
        'page' => isset($_GET['page']) ? max(1, (int) $_GET['page']) : 1,
        'orderby' => isset($_GET['orderby']) ? sanitize_text_field($_GET['orderby']) : 'date',
        'order' => isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'asc' : 'desc',
    ];
    if (!empty($_GET['search'])) {
        $args['s'] = sanitize_text_field($_GET['search']);
    }
    if (isset($_GET['featured']) && $_GET['featured'] === 'true') {
        $args['featured'] = true;
    }
    $products = wc_get_products($args);
    $out = [];
    foreach ($products as $p) {
        $a = impexo_product_to_array($p);
        if ($a) $out[] = $a;
    }
    echo wp_json_encode($out);
    exit;
}

if ($action === 'product-by-slug') {
    $slug = isset($_GET['slug']) ? sanitize_text_field($_GET['slug']) : '';
    if ($slug === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing slug']);
        exit;
    }
    $products = wc_get_products(['slug' => $slug, 'status' => isset($_GET['status']) ? sanitize_text_field($_GET['status']) : 'publish', 'limit' => 1]);
    $product = $products[0] ?? null;
    if (!$product) {
        echo wp_json_encode([]);
        exit;
    }
    $a = impexo_product_to_array($product);
    echo wp_json_encode($a ? [$a] : []);
    exit;
}

if ($action === 'variations') {
    $product_id = isset($_GET['product_id']) ? (int) $_GET['product_id'] : 0;
    if ($product_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or invalid product_id']);
        exit;
    }
    $product = wc_get_product($product_id);
    if (!$product || !$product->is_type('variable')) {
        echo wp_json_encode([]);
        exit;
    }
    $per_page = isset($_GET['per_page']) ? max(1, min(100, (int) $_GET['per_page'])) : 100;
    $children = array_slice($product->get_children(), 0, $per_page);
    $out = [];
    foreach ($children as $var_id) {
        $v = wc_get_product($var_id);
        if ($v) {
            $a = impexo_variation_to_array($v);
            if ($a) $out[] = $a;
        }
    }
    echo wp_json_encode($out);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action. Use action=products|product-by-slug|variations']);
