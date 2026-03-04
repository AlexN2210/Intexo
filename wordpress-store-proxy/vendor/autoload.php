<?php
/**
 * Chargement manuel du SDK Stripe (sans Composer).
 * À placer dans public_html/vendor/autoload.php
 * Cherche init.php dans des chemins fixes puis dans tout dossier vendor/* nommé stripe-php*.
 */
$paths = [
    __DIR__ . '/stripe/stripe-php/init.php',
    __DIR__ . '/stripe/stripe-php-master/init.php',
    __DIR__ . '/stripe-php-master/init.php',
    __DIR__ . '/stripe-php/init.php',
    __DIR__ . '/../stripe-php-master/init.php',
    __DIR__ . '/../stripe/stripe-php-master/init.php',
];

// En plus : tout dossier dans vendor/ dont le nom commence par "stripe-php" (ex. stripe-php-17.0.0)
if (is_dir(__DIR__)) {
    foreach (new DirectoryIterator(__DIR__) as $f) {
        if ($f->isDir() && !$f->isDot() && strpos($f->getFilename(), 'stripe-php') === 0) {
            $p = $f->getPathname() . '/init.php';
            if (file_exists($p)) {
                $paths[] = $p;
            }
        }
    }
}

$stripe_init = null;
foreach ($paths as $p) {
    if (file_exists($p)) {
        $stripe_init = $p;
        break;
    }
}
if ($stripe_init) {
    require_once $stripe_init;
} else {
    throw new RuntimeException('Stripe SDK non trouvé. Mettre init.php dans vendor/stripe-php-master/ ou vendor/stripe-php-17.0.0/ etc. (télécharger depuis https://github.com/stripe/stripe-php/releases)');
}
