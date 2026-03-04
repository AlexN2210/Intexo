<?php
/**
 * Diagnostic : quels chemins vers init.php existent sur le serveur ?
 * À placer dans public_html, ouvrir : https://wp.impexo.fr/stripe-paths-check.php
 * Supprimer après usage (sécurité).
 */
header('Content-Type: application/json; charset=utf-8');

$vendor_dir = __DIR__ . '/vendor';
$paths = [
    'vendor/stripe/stripe-php/init.php'           => $vendor_dir . '/stripe/stripe-php/init.php',
    'vendor/stripe/stripe-php-master/init.php'    => $vendor_dir . '/stripe/stripe-php-master/init.php',
    'vendor/stripe-php-master/init.php'           => $vendor_dir . '/stripe-php-master/init.php',
    'vendor/stripe-php/init.php'                  => $vendor_dir . '/stripe-php/init.php',
    'public_html/stripe-php-master/init.php'      => __DIR__ . '/stripe-php-master/init.php',
    'public_html/stripe/stripe-php-master/init.php' => __DIR__ . '/stripe/stripe-php-master/init.php',
];

// Lister les dossiers dans vendor/ pour voir ce qui existe
$dossiers_vendor = [];
if (is_dir($vendor_dir)) {
    foreach (new DirectoryIterator($vendor_dir) as $f) {
        if ($f->isDir() && !$f->isDot()) {
            $name = $f->getFilename();
            $init = $f->getPathname() . '/init.php';
            $dossiers_vendor[$name] = file_exists($init) ? 'init.php OK' : (is_dir($f->getPathname() . '/lib') ? 'pas init.php ici' : 'autre');
        }
    }
}

$result = [];
foreach ($paths as $label => $full_path) {
    $result[$label] = file_exists($full_path);
}

$first_ok = null;
foreach ($paths as $label => $full_path) {
    if (file_exists($full_path)) {
        $first_ok = $label;
        break;
    }
}
if (!$first_ok && is_dir($vendor_dir)) {
    foreach (new DirectoryIterator($vendor_dir) as $f) {
        if ($f->isDir() && !$f->isDot() && strpos($f->getFilename(), 'stripe-php') === 0) {
            $p = $f->getPathname() . '/init.php';
            if (file_exists($p)) {
                $first_ok = 'vendor/' . $f->getFilename() . '/init.php';
                break;
            }
        }
    }
}

echo json_encode([
    'paths_checked' => $result,
    'dossiers_dans_vendor' => $dossiers_vendor,
    'init_trouve' => $first_ok,
    'instruction' => $first_ok
        ? 'init.php trouvé. Remplace vendor/autoload.php sur le serveur par la nouvelle version (voir projet), puis recharge check-stripe.php.'
        : 'Aucun init.php trouvé. Mets init.php + lib/ dans public_html/vendor/stripe-php-master/ (ou dans un dossier stripe-php-17.0.0 dans vendor/).',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
