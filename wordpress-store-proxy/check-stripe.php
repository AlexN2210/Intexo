<?php
/**
 * Vérification Stripe pour le checkout headless.
 * À placer à la racine WordPress (ex. /public_html sur o2switch), à côté de store-proxy.php et wp-config.php.
 *
 * Appel : https://wp.impexo.fr/check-stripe.php
 * Retourne un JSON indiquant si le SDK et les clés sont OK (sans afficher les clés).
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache');

$wp_load = __DIR__ . '/wp-load.php';
if (!file_exists($wp_load)) {
    echo json_encode([
        'ok' => false,
        'error' => 'wp-load.php introuvable',
        'stripe_secret_key' => 'non défini',
        'stripe_autoload' => '-',
        'stripe_sdk_loaded' => false,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

require_once $wp_load;

$stripe_key = defined('STRIPE_SECRET_KEY') ? STRIPE_SECRET_KEY : '';
$autoload_path = defined('STRIPE_VENDOR_AUTOLOAD') ? STRIPE_VENDOR_AUTOLOAD : (dirname(ABSPATH) . '/vendor/autoload.php');
$autoload_path_alt = ABSPATH . 'vendor/autoload.php';
$autoload_path_same_dir = __DIR__ . '/vendor/autoload.php';
if ($autoload_path === '' || !file_exists($autoload_path)) {
    if (file_exists($autoload_path_same_dir)) {
        $autoload_path = $autoload_path_same_dir;
    } elseif (file_exists($autoload_path_alt)) {
        $autoload_path = $autoload_path_alt;
    }
}
$autoload_exists = $autoload_path !== '' && file_exists($autoload_path);
$sdk_loaded = false;
$sdk_version = null;
$sdk_error = null;

if ($autoload_exists) {
    try {
        require_once $autoload_path;
        $sdk_loaded = class_exists('\Stripe\Stripe');
        if ($sdk_loaded && defined('\Stripe\Stripe::VERSION')) {
            $sdk_version = \Stripe\Stripe::VERSION;
        }
    } catch (Throwable $e) {
        $sdk_loaded = false;
        $sdk_error = $e->getMessage();
    }
}

$ok = ($stripe_key !== '' && strlen($stripe_key) > 10) && $autoload_exists && $sdk_loaded;

echo json_encode([
    'ok' => $ok,
    'stripe_secret_key' => $stripe_key !== '' ? 'défini (sk_...' . substr($stripe_key, -4) . ')' : 'non défini',
    'stripe_autoload' => $autoload_path,
    'stripe_autoload_exists' => $autoload_exists,
    'stripe_sdk_loaded' => $sdk_loaded,
    'stripe_sdk_version' => $sdk_version,
    'stripe_sdk_error' => $sdk_error,
    'ou_placer_autoload' => 'Dans le MÊME dossier que check-stripe.php : ' . $autoload_path_same_dir,
    'ce_chemin_existe' => file_exists($autoload_path_same_dir),
    'message' => $ok
        ? 'Stripe est prêt pour create-order-stripe.'
        : ($sdk_error ? 'SDK Stripe : ' . $sdk_error : ($autoload_exists ? 'Vérifier STRIPE_SECRET_KEY.' : 'Mettre vendor/autoload.php dans le même dossier que check-stripe.php (voir ou_placer_autoload).')),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
