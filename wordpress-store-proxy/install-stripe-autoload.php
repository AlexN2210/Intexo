<?php
/**
 * Script à exécuter UNE SEULE FOIS dans le navigateur pour créer vendor/autoload.php.
 *
 * 1. Copie ce fichier dans public_html (à côté de check-stripe.php)
 * 2. Ouvre : https://wp.impexo.fr/install-stripe-autoload.php
 * 3. Le script crée public_html/vendor/autoload.php
 * 4. SUPPRIME ce fichier après (sécurité)
 */

header('Content-Type: text/plain; charset=utf-8');

// Toujours cibler le dossier qui contient wp-load.php (racine WordPress = public_html)
$base = __DIR__;
while ($base !== '' && $base !== '/' && !file_exists($base . '/wp-load.php')) {
    $base = dirname($base);
}
if (!file_exists($base . '/wp-load.php')) {
    $base = __DIR__;
    if (basename($base) === 'vendor') {
        $base = dirname($base);
    }
}
$vendor_dir = $base . '/vendor';
$autoload_file = $vendor_dir . '/autoload.php';

$content = <<<'PHP'
<?php
$paths = [
    __DIR__ . '/stripe/stripe-php/init.php',
    __DIR__ . '/stripe/stripe-php-master/init.php',
    __DIR__ . '/stripe-php-master/init.php',
    __DIR__ . '/stripe-php/init.php',
    __DIR__ . '/../stripe-php-master/init.php',
    __DIR__ . '/../stripe/stripe-php-master/init.php',
];
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
    throw new RuntimeException('Stripe SDK non trouvé. Mettre init.php dans vendor/stripe/stripe-php-master/ ou vendor/stripe-php-master/');
}
PHP;

if (!is_dir($vendor_dir)) {
    if (!@mkdir($vendor_dir, 0755, true)) {
        echo "ERREUR : impossible de créer le dossier vendor/\n";
        echo "Crée-le à la main dans le gestionnaire de fichiers (public_html/vendor/).\n";
        exit;
    }
    echo "Dossier vendor/ créé.\n";
}

if (file_put_contents($autoload_file, $content) === false) {
    echo "ERREUR : impossible d'écrire vendor/autoload.php\n";
    echo "Vérifie les droits du dossier vendor/ (chmod 755).\n";
    exit;
}

echo "Racine WordPress détectée : " . $base . "\n";
echo "OK : " . $autoload_file . " a été créé.\n\n";
echo "Prochaine étape :\n";
echo "- Si tu n'as pas encore stripe/stripe-php-master dans vendor/, déplace-le :\n";
echo "  public_html/vendor/stripe/stripe-php-master/ doit contenir init.php, lib/, etc.\n\n";
echo "- Ouvre https://wp.impexo.fr/check-stripe.php pour vérifier (ok: true).\n\n";
echo "IMPORTANT : supprime ce fichier install-stripe-autoload.php du serveur maintenant (sécurité).\n";
