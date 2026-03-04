# Vérifier Stripe (checkout headless)

Sur hébergement mutualisé (o2switch, etc.), la racine WordPress est en général **`/public_html`**. Place **`check-stripe.php`** dans **`/public_html`** (à côté de `wp-config.php`, `wp-load.php`, `store-proxy.php`).

## 1. Vérifier le SDK Stripe PHP

Sur le serveur (o2switch, SSH ou gestionnaire de fichiers) :

- Va à la **racine du site WordPress** (souvent **`/public_html`** — le dossier qui contient `wp-config.php`, `wp-load.php`, `store-proxy.php`).
- Vérifie la présence du dossier **`vendor`** et du fichier **`vendor/autoload.php`**.

Si `vendor` n’existe pas :

```bash
cd /public_html   # ou le chemin de ta racine WordPress
composer require stripe/stripe-php
```

(Sur un hébergeur sans CLI, tu peux installer en local avec `composer require stripe/stripe-php` puis envoyer le dossier `vendor` par FTP.)

- Vérifie que **`vendor/stripe/stripe-php`** existe après l’installation.

---

## 2. Vérifier wp-config.php

Ouvre **`wp-config.php`** et assure-toi d’avoir **avant** la ligne `/* That's all, stop editing! */` :

```php
define( 'STRIPE_SECRET_KEY', 'sk_test_...' );  // ou sk_live_... en prod
```

Optionnel (si `vendor` n’est pas à la racine) :

```php
define( 'STRIPE_VENDOR_AUTOLOAD', '/chemin/absolu/vers/vendor/autoload.php' );
```

Sans `STRIPE_VENDOR_AUTOLOAD`, le script utilise par défaut :  
`dirname(ABSPATH) . '/vendor/autoload.php'`  
(c’est-à-dire le dossier `vendor` au niveau au-dessus de la racine WordPress).

---

## 3. Script de vérification automatique

Un fichier **`check-stripe.php`** est fourni. Copie-le dans **`/public_html`** (racine WordPress, à côté de `store-proxy.php`) :

1. Appelle : **`https://wp.impexo.fr/check-stripe.php`** (dans le navigateur ou en `curl`).
2. La réponse JSON indique :
   - `ok`: true/false
   - `stripe_secret_key`: défini ou non (sans afficher la clé en clair)
   - `stripe_autoload_exists`: le fichier autoload est-il trouvé
   - `stripe_sdk_loaded`: la classe Stripe est-elle chargée
   - `message`: résumé

Exemple de réponse si tout est OK :

```json
{
  "ok": true,
  "stripe_secret_key": "défini (sk_...xxxx)",
  "stripe_autoload": "/home/.../vendor/autoload.php",
  "stripe_autoload_exists": true,
  "stripe_sdk_loaded": true,
  "stripe_sdk_version": "17.0.0",
  "message": "Stripe est prêt pour create-order-stripe."
}
```

Si `ok` est false, corrige selon les champs en erreur puis redéploie / rappelle `check-stripe.php`.

---

## 4. Résumé des prérequis

| Élément | Où | Vérification |
|--------|-----|---------------|
| **STRIPE_SECRET_KEY** | wp-config.php | `define( 'STRIPE_SECRET_KEY', 'sk_...' );` |
| **STRIPE_VENDOR_AUTOLOAD** (optionnel) | wp-config.php | Chemin vers vendor/autoload.php si pas à la racine |
| **vendor/autoload.php** | Racine WP ou chemin défini | Présence du fichier |
| **stripe/stripe-php** | Composer | `vendor/stripe/stripe-php` présent après `composer require stripe/stripe-php` |

Une fois tout vert dans `check-stripe.php`, le checkout headless peut utiliser **create-order-stripe** et **confirm-order**.
