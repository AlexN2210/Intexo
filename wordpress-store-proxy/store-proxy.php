<?php
/**
 * Mini-proxy WooCommerce - Store API (wc/store/v1) + REST API (wc/v3)
 * Store API : rest_get_server()->dispatch() - ZÉRO requête HTTP interne
 * v3 : wp_remote_request vers wp-json (une requête interne, même serveur)
 *
 * À placer à la racine WordPress (à côté de wp-load.php)
 * Clés API v3 : définir WC_PROXY_CK et WC_PROXY_CS dans wp-config.php
 */

// CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://www.impexo.fr', 'https://impexo.fr', 'http://localhost:5173', 'http://localhost:5174'];
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed, true) ? $origin : 'https://www.impexo.fr'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Nonce, Cart-Token, Authorization');
header('Access-Control-Expose-Headers: Nonce, Cart-Token, Set-Cookie');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Charger WordPress
$wp_load = dirname(__FILE__) . '/wp-load.php';
if (!file_exists($wp_load)) {
    http_response_code(500);
    echo json_encode(['error' => 'WordPress not found']);
    exit;
}
require_once $wp_load;

$api = isset($_GET['api']) ? $_GET['api'] : 'store/v1';
$endpoint = trim($_GET['endpoint'] ?? '', '/');
if ($endpoint === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing ?endpoint=...']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$body_raw = file_get_contents('php://input');

// Endpoint "checkout-full" : tout en une seule exécution PHP (même session)
if ($endpoint === 'checkout-full') {
    $input = json_decode($body_raw, true) ?: [];
    $items = $input['items'] ?? [];
    $billing = $input['billing_address'] ?? $input['customer']['billing'] ?? [];
    $shipping = $input['shipping_address'] ?? $input['customer']['shipping'] ?? $billing;
    $payment_method = $input['payment_method'] ?? 'woocommerce_payments';
    $customer_note = $input['customer_note'] ?? '';

    $server = rest_get_server();

    // 1. GET cart pour initialiser la session
    $cart_req = new WP_REST_Request('GET', '/wc/store/v1/cart');
    $server->dispatch($cart_req);

    // 2. Vider le panier
    $clear_req = new WP_REST_Request('DELETE', '/wc/store/v1/cart/items');
    $server->dispatch($clear_req);

    // 3. Ajouter chaque article
    foreach ($items as $item) {
        $add_req = new WP_REST_Request('POST', '/wc/store/v1/cart/add-item');
        $add_req->set_body_params([
            'id' => (int) ($item['product_id'] ?? $item['id'] ?? 0),
            'quantity' => (int) ($item['quantity'] ?? 1),
            ...(!empty($item['variation_id']) ? ['variation_id' => (int) $item['variation_id']] : []),
        ]);
        $server->dispatch($add_req);
    }

    // 4. Checkout
    $checkout_req = new WP_REST_Request('POST', '/wc/store/v1/checkout');
    $checkout_req->set_body_params([
        'billing_address' => $billing,
        'shipping_address' => $shipping,
        'payment_method' => $payment_method,
        'customer_note' => $customer_note,
    ]);
    $response = $server->dispatch($checkout_req);
    $data = $server->response_to_data($response, false);
    http_response_code($response->get_status());
    echo wp_json_encode($data);
    exit;
}

// Query params à transmettre (hors endpoint et api)
$query_params = $_GET;
unset($query_params['endpoint'], $query_params['api']);
$query_string = !empty($query_params) ? '?' . http_build_query($query_params) : '';

if ($api === 'v3') {
    // API REST classique (wc/v3) avec Basic Auth - une requête interne
    $url = get_site_url(null, 'wp-json/wc/v3/' . $endpoint . $query_string, 'https');
    $headers = [
        'Content-Type'  => 'application/json',
        'Accept'        => 'application/json',
    ];
    $ck = defined('WC_PROXY_CK') ? WC_PROXY_CK : '';
    $cs = defined('WC_PROXY_CS') ? WC_PROXY_CS : '';
    if ($ck !== '' && $cs !== '') {
        $headers['Authorization'] = 'Basic ' . base64_encode($ck . ':' . $cs);
    }
    $args = [
        'method'    => $method,
        'headers'   => $headers,
        'body'      => $body_raw,
        'timeout'   => 15,
    ];
    $response = wp_remote_request($url, $args);
    $status = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    http_response_code((int) $status);
    echo $body;
    exit;
}

// Store API (défaut) : dispatch direct, zéro requête HTTP
$route = '/wc/store/v1/' . $endpoint;
$request = new WP_REST_Request($method, $route);

if (!empty($_SERVER['HTTP_NONCE'])) {
    $request->set_header('Nonce', $_SERVER['HTTP_NONCE']);
}
if (!empty($_SERVER['HTTP_CART_TOKEN'])) {
    $request->set_header('Cart-Token', $_SERVER['HTTP_CART_TOKEN']);
}
if (!empty($_SERVER['HTTP_COOKIE'])) {
    $request->set_header('Cookie', $_SERVER['HTTP_COOKIE']);
}

if (!empty($body_raw)) {
    $body_data = json_decode($body_raw, true);
    if (is_array($body_data)) {
        $request->set_body_params($body_data);
        $request->set_body($body_raw);
    }
}
if (!empty($query_params)) {
    $request->set_query_params($query_params);
}

$server = rest_get_server();
$response = $server->dispatch($request);
$data = $server->response_to_data($response, false);
$status = $response->get_status();

$res_headers = $response->get_headers();
if (!empty($res_headers['Nonce'])) {
    header('Nonce: ' . $res_headers['Nonce']);
}
if (!empty($res_headers['Cart-Token'])) {
    header('Cart-Token: ' . $res_headers['Cart-Token']);
}
foreach (headers_list() as $h) {
    if (stripos($h, 'Set-Cookie:') === 0) {
        header($h, false);
    }
}

http_response_code($status);
echo wp_json_encode($data);
