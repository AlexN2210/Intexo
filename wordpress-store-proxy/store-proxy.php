<?php
/**
 * Mini-proxy Store API WooCommerce - Version optimisée
 * Appel direct via rest_get_server()->dispatch() - ZÉRO requête HTTP interne
 *
 * À placer : /wp-content/api/store-proxy.php
 */

// CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://www.impexo.fr', 'https://impexo.fr', 'http://localhost:5173', 'http://localhost:5174'];
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed, true) ? $origin : 'https://www.impexo.fr'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Nonce, Cart-Token');
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

// Endpoint demandé
$endpoint = trim($_GET['endpoint'] ?? '', '/');
if ($endpoint === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing ?endpoint=cart']);
    exit;
}

// Construire la requête REST interne (aucune requête HTTP)
$route = '/wc/store/v1/' . $endpoint;
$method = $_SERVER['REQUEST_METHOD'];
$body_raw = file_get_contents('php://input');

$request = new WP_REST_Request($method, $route);

// Headers entrants → paramètres REST
if (!empty($_SERVER['HTTP_NONCE'])) {
    $request->set_header('Nonce', $_SERVER['HTTP_NONCE']);
}
if (!empty($_SERVER['HTTP_CART_TOKEN'])) {
    $request->set_header('Cart-Token', $_SERVER['HTTP_CART_TOKEN']);
}
if (!empty($_SERVER['HTTP_COOKIE'])) {
    $request->set_header('Cookie', $_SERVER['HTTP_COOKIE']);
}

// Body JSON
if (!empty($body_raw)) {
    $body_data = json_decode($body_raw, true);
    if (is_array($body_data)) {
        $request->set_body_params($body_data);
        $request->set_body($body_raw);
    }
}

// Query params (ex: ?endpoint=cart&per_page=10 → per_page transmis)
$query_params = $_GET;
unset($query_params['endpoint']);
if (!empty($query_params)) {
    $request->set_query_params($query_params);
}

// Exécuter via le serveur REST WordPress - AUCUNE requête HTTP
$server = rest_get_server();
$response = $server->dispatch($request);
$data = $server->response_to_data($response, false);
$status = $response->get_status();

// Transmettre les headers de réponse (Nonce, Cart-Token, Set-Cookie pour la session)
$res_headers = $response->get_headers();
if (!empty($res_headers['Nonce'])) {
    header('Nonce: ' . $res_headers['Nonce']);
}
if (!empty($res_headers['Cart-Token'])) {
    header('Cart-Token: ' . $res_headers['Cart-Token']);
}
// Set-Cookie : get_headers() sur WP_REST_Response ne retourne pas les cookies PHP natifs
foreach (headers_list() as $h) {
    if (stripos($h, 'Set-Cookie:') === 0) {
        header($h, false);
    }
}

http_response_code($status);
echo wp_json_encode($data);
