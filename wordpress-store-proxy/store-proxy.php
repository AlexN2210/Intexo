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
header('Access-Control-Allow-Headers: Content-Type, Accept, Nonce, Cart-Token, Authorization, X-WC-Proxy-Auth');
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
    // Récupérer les identifiants : Authorization est souvent supprimé par Apache sur certains hébergeurs
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($auth_header === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if ($auth_header === '' && !empty($_SERVER['HTTP_X_WC_PROXY_AUTH'])) {
        $auth_header = 'Basic ' . trim($_SERVER['HTTP_X_WC_PROXY_AUTH']);
    }
    // Optionnel : exiger Basic Auth (mêmes clés que Vercel) pour accepter le POST
    $ck = defined('WC_PROXY_CK') ? WC_PROXY_CK : '';
    $cs = defined('WC_PROXY_CS') ? WC_PROXY_CS : '';
    if ($ck !== '' && $cs !== '') {
        $expected = 'Basic ' . base64_encode($ck . ':' . $cs);
        if ($auth_header !== $expected) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentification requise', 'code' => 'rest_forbidden']);
            exit;
        }
    }

    $input = json_decode($body_raw, true) ?: [];
    $items = $input['items'] ?? [];
    $billing = $input['billing_address'] ?? $input['customer']['billing'] ?? [];
    $shipping = $input['shipping_address'] ?? $input['customer']['shipping'] ?? $billing;
    $payment_method = $input['payment_method'] ?? 'stripe';
    $customer_note = $input['customer_note'] ?? '';
    // Ne jamais envoyer payment_data au checkout Store API : Stripe crée le PaymentIntent et renvoie client_secret

    $server = rest_get_server();

    // Transmettre l’auth aux requêtes internes (au cas où le serveur REST l’utilise)
    $request_headers = ['Content-Type' => 'application/json'];
    if ($auth_header !== '') {
        $request_headers['Authorization'] = $auth_header;
    }

    // 1. GET cart pour initialiser la session et récupérer le nonce (requis par la Store API)
    $cart_req = new WP_REST_Request('GET', '/wc/store/v1/cart');
    foreach ($request_headers as $k => $v) {
        $cart_req->set_header($k, $v);
    }
    $cart_response = $server->dispatch($cart_req);
    $nonce = null;
    if ($cart_response instanceof WP_REST_Response) {
        $res_headers = $cart_response->get_headers();
        $nonce = $res_headers['Nonce'] ?? $res_headers['nonce'] ?? null;
    }
    if ($nonce !== null && $nonce !== '') {
        $request_headers['Nonce'] = $nonce;
    } else {
        $request_headers['Nonce'] = wp_create_nonce('wc_store_api');
    }

    // 2. Vider le panier
    $clear_req = new WP_REST_Request('DELETE', '/wc/store/v1/cart/items');
    foreach ($request_headers as $k => $v) {
        $clear_req->set_header($k, $v);
    }
    $server->dispatch($clear_req);

    // 3. Ajouter chaque article
    foreach ($items as $item) {
        $add_req = new WP_REST_Request('POST', '/wc/store/v1/cart/add-item');
        foreach ($request_headers as $k => $v) {
            $add_req->set_header($k, $v);
        }
        $add_req->set_body_params([
            'id' => (int) ($item['product_id'] ?? $item['id'] ?? 0),
            'quantity' => (int) ($item['quantity'] ?? 1),
            ...(!empty($item['variation_id']) ? ['variation_id' => (int) $item['variation_id']] : []),
        ]);
        $server->dispatch($add_req);
    }

    // 4. Checkout Store API (POST /wc/store/v1/checkout) — pas de payment_data pour que Stripe renvoie payment_intent_client_secret
    $checkout_req = new WP_REST_Request('POST', '/wc/store/v1/checkout');
    foreach ($request_headers as $k => $v) {
        $checkout_req->set_header($k, $v);
    }
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

// Endpoint "create-order-stripe" : headless — crée la commande WC + PaymentIntent Stripe, retourne client_secret (pas de Store API / panier)
if ($endpoint === 'create-order-stripe') {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($auth_header === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if ($auth_header === '' && !empty($_SERVER['HTTP_X_WC_PROXY_AUTH'])) {
        $auth_header = 'Basic ' . trim($_SERVER['HTTP_X_WC_PROXY_AUTH']);
    }
    $ck = defined('WC_PROXY_CK') ? WC_PROXY_CK : '';
    $cs = defined('WC_PROXY_CS') ? WC_PROXY_CS : '';
    if ($ck !== '' && $cs !== '') {
        $expected = 'Basic ' . base64_encode($ck . ':' . $cs);
        if ($auth_header !== $expected) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentification requise', 'code' => 'rest_forbidden']);
            exit;
        }
    }

    $input = json_decode($body_raw, true) ?: [];
    $items = $input['items'] ?? [];
    $billing = $input['billing_address'] ?? $input['customer']['billing'] ?? [];
    $shipping = $input['shipping_address'] ?? $input['customer']['shipping'] ?? $billing;
    $customer_note = $input['customer_note'] ?? '';

    if (empty($items) || !function_exists('wc_create_order')) {
        http_response_code(400);
        echo json_encode(['error' => empty($items) ? 'Panier vide' : 'WooCommerce non actif']);
        exit;
    }

    try {
        $order = wc_create_order();

        foreach ($items as $line) {
            $product_id   = (int) ($line['product_id'] ?? $line['id'] ?? 0);
            $variation_id = (int) ($line['variation_id'] ?? 0);
            $quantity     = max(1, (int) ($line['quantity'] ?? 1));
            if ($product_id <= 0) continue;
            $product = wc_get_product($variation_id > 0 ? $variation_id : $product_id);
            if ($product) {
                $order->add_product($product, $quantity);
            }
        }

        $order->set_billing_first_name($billing['first_name'] ?? '');
        $order->set_billing_last_name($billing['last_name'] ?? '');
        $order->set_billing_address_1($billing['address_1'] ?? '');
        $order->set_billing_address_2($billing['address_2'] ?? '');
        $order->set_billing_city($billing['city'] ?? '');
        $order->set_billing_state($billing['state'] ?? '');
        $order->set_billing_postcode($billing['postcode'] ?? '');
        $order->set_billing_country($billing['country'] ?? 'FR');
        $order->set_billing_email($billing['email'] ?? '');
        $order->set_billing_phone($billing['phone'] ?? '');

        $order->set_shipping_first_name($shipping['first_name'] ?? $billing['first_name'] ?? '');
        $order->set_shipping_last_name($shipping['last_name'] ?? $billing['last_name'] ?? '');
        $order->set_shipping_address_1($shipping['address_1'] ?? $billing['address_1'] ?? '');
        $order->set_shipping_address_2($shipping['address_2'] ?? $billing['address_2'] ?? '');
        $order->set_shipping_city($shipping['city'] ?? $billing['city'] ?? '');
        $order->set_shipping_state($shipping['state'] ?? $billing['state'] ?? '');
        $order->set_shipping_postcode($shipping['postcode'] ?? $billing['postcode'] ?? '');
        $order->set_shipping_country($shipping['country'] ?? $billing['country'] ?? 'FR');

        $order->set_payment_method('stripe');
        if ($customer_note !== '') {
            $order->set_customer_note($customer_note);
        }

        $order->calculate_totals();
        $order->save();

        $order_id = $order->get_id();
        $client_secret = '';

        $stripe_key = defined('STRIPE_SECRET_KEY') ? STRIPE_SECRET_KEY : '';
        $autoload   = defined('STRIPE_VENDOR_AUTOLOAD') ? STRIPE_VENDOR_AUTOLOAD : (dirname(ABSPATH) . '/vendor/autoload.php');
        if ($stripe_key !== '' && file_exists($autoload)) {
            try {
                require_once $autoload;
                \Stripe\Stripe::setApiKey($stripe_key);
                $total_cents = (int) round((float) $order->get_total() * 100);
                $currency = strtolower($order->get_currency() ?: 'eur');
                if ($total_cents > 0) {
                    $pi = \Stripe\PaymentIntent::create([
                        'amount'   => $total_cents,
                        'currency' => $currency,
                        'metadata' => ['order_id' => (string) $order_id],
                        'automatic_payment_methods' => ['enabled' => true],
                    ]);
                    $client_secret = $pi->client_secret;
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Stripe PaymentIntent', 'message' => $e->getMessage()]);
                exit;
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Stripe non configuré', 'details' => 'STRIPE_SECRET_KEY et vendor/autoload.php (composer require stripe/stripe-php)']);
            exit;
        }

        http_response_code(200);
        echo wp_json_encode([
            'order_id' => $order_id,
            'order_key' => $order->get_order_key(),
            'status' => $order->get_status(),
            'payment_result' => [
                'payment_intent_client_secret' => $client_secret,
            ],
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur création commande', 'message' => $e->getMessage()]);
        exit;
    }
}

// Endpoint "confirm-order" : après confirmCardPayment succès — vérifie le PaymentIntent et passe la commande en processing
if ($endpoint === 'confirm-order') {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($auth_header === '' && !empty($_SERVER['HTTP_X_WC_PROXY_AUTH'])) {
        $auth_header = 'Basic ' . trim($_SERVER['HTTP_X_WC_PROXY_AUTH']);
    }
    $ck = defined('WC_PROXY_CK') ? WC_PROXY_CK : '';
    $cs = defined('WC_PROXY_CS') ? WC_PROXY_CS : '';
    if ($ck !== '' && $cs !== '') {
        $expected = 'Basic ' . base64_encode($ck . ':' . $cs);
        if ($auth_header !== $expected) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentification requise']);
            exit;
        }
    }

    $input = json_decode($body_raw, true) ?: [];
    $order_id = (int) ($input['order_id'] ?? 0);
    $payment_intent_id = (string) ($input['payment_intent_id'] ?? '');

    if ($order_id <= 0 || $payment_intent_id === '') {
        http_response_code(400);
        echo json_encode(['error' => 'order_id et payment_intent_id requis']);
        exit;
    }

    $stripe_key = defined('STRIPE_SECRET_KEY') ? STRIPE_SECRET_KEY : '';
    $autoload   = defined('STRIPE_VENDOR_AUTOLOAD') ? STRIPE_VENDOR_AUTOLOAD : (dirname(ABSPATH) . '/vendor/autoload.php');
    if ($stripe_key === '' || !file_exists($autoload)) {
        http_response_code(500);
        echo json_encode(['error' => 'Stripe non configuré']);
        exit;
    }

    try {
        require_once $autoload;
        \Stripe\Stripe::setApiKey($stripe_key);
        $pi = \Stripe\PaymentIntent::retrieve($payment_intent_id);
        if ($pi->status !== 'succeeded') {
            http_response_code(400);
            echo json_encode(['error' => 'Paiement non confirmé', 'status' => $pi->status]);
            exit;
        }
        $meta_order_id = (string) ($pi->metadata->order_id ?? '');
        if ($meta_order_id !== (string) $order_id) {
            http_response_code(400);
            echo json_encode(['error' => 'order_id ne correspond pas au PaymentIntent']);
            exit;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Commande introuvable']);
            exit;
        }
        $order->set_status('processing');
        $order->save();

        http_response_code(200);
        echo wp_json_encode(['success' => true, 'order_id' => $order_id, 'status' => 'processing']);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur confirmation', 'message' => $e->getMessage()]);
        exit;
    }
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
