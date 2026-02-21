<?php
/**
 * Endpoint REST WordPress : créer une commande WooCommerce depuis le panier front (localStorage).
 * À installer : copier dans wp-content/mu-plugins/ ou appeler depuis le thème (functions.php).
 *
 * POST /wp-json/custom-checkout/v1/create-order
 * Body: {
 *   "items": [ { "product_id": 1972, "variation_id": 0, "quantity": 1 }, ... ],
 *   "customer": { "billing": { "first_name", "last_name", "address_1", "city", "postcode", "country", "email", ... }, "shipping": { ... } },
 *   "payment_method": "stripe",
 *   "customer_note": ""
 * }
 * Réponse: { "order_id": 123, "order_key": "...", "payment_url": "https://checkout.stripe.com/..." }
 */

add_action('rest_api_init', function () {
    register_rest_route('custom-checkout/v1', '/create-order', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'args'                => [
            'items'          => [
                'required' => true,
                'type'     => 'array',
                'items'    => [
                    'type'       => 'object',
                    'properties' => [
                        'product_id'   => [ 'type' => 'integer', 'required' => true ],
                        'variation_id' => [ 'type' => 'integer', 'default' => 0 ],
                        'quantity'     => [ 'type' => 'integer', 'default' => 1 ],
                    ],
                ],
            ],
            'customer'        => [
                'required' => true,
                'type'     => 'object',
                'properties' => [
                    'billing'  => [ 'type' => 'object' ],
                    'shipping' => [ 'type' => 'object' ],
                ],
            ],
            'payment_method'  => [ 'type' => 'string' ],
            'customer_note'   => [ 'type' => 'string' ],
        ],
        'callback'            => 'impexo_create_order_from_cart',
    ]);
});

function impexo_create_order_from_cart(WP_REST_Request $request) {
    if (!function_exists('wc_create_order')) {
        return new WP_REST_Response([ 'error' => 'WooCommerce non actif' ], 500);
    }

    $body = $request->get_json_params();
    $items   = $body['items'] ?? [];
    $customer = $body['customer'] ?? [];
    $billing  = $customer['billing'] ?? [];
    $shipping = $customer['shipping'] ?? $billing;
    $payment_method = $body['payment_method'] ?? 'stripe';
    $customer_note  = $body['customer_note'] ?? '';

    if (empty($items)) {
        return new WP_REST_Response([ 'error' => 'Panier vide' ], 400);
    }

    try {
        $order = wc_create_order();

        foreach ($items as $line) {
            $product_id   = (int) ($line['product_id'] ?? 0);
            $variation_id = (int) ($line['variation_id'] ?? 0);
            $quantity     = max(1, (int) ($line['quantity'] ?? 1));
            if ($product_id <= 0) continue;

            if ($variation_id > 0) {
                $order->add_product(wc_get_product($variation_id), $quantity);
            } else {
                $order->add_product(wc_get_product($product_id), $quantity);
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

        $order->set_payment_method($payment_method);
        if ($customer_note !== '') {
            $order->set_customer_note($customer_note);
        }

        $order->calculate_totals();
        $order->save();

        $order_id   = $order->get_id();
        $order_key  = $order->get_order_key();
        $payment_url = '';

        // Stripe : si vous utilisez WooCommerce Stripe Gateway, récupérer l'URL de paiement
        if ($payment_method === 'stripe' && function_exists('WC')) {
            $gateways = WC()->payment_gateways()->get_available_payment_gateways();
            if (!empty($gateways['stripe'])) {
                $gateway = $gateways['stripe'];
                if (is_callable([ $gateway, 'get_payment_url' ])) {
                    $payment_url = $gateway->get_payment_url($order);
                }
                // Sinon : créer une session Stripe côté serveur et retourner l’URL (à brancher selon votre plugin Stripe)
            }
        }

        return new WP_REST_Response([
            'order_id'    => $order_id,
            'order_key'   => $order_key,
            'payment_url' => $payment_url,
            'status'      => $order->get_status(),
        ], 200);
    } catch (Exception $e) {
        return new WP_REST_Response([
            'error'   => 'Erreur création commande',
            'message' => $e->getMessage(),
        ], 500);
    }
}
