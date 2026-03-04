# Installation manuelle du SDK Stripe (sans Composer)

## Sur ton serveur (public_html)

### 1. Créer la structure

Dans **public_html**, crée les dossiers :

```
public_html/vendor/
public_html/vendor/stripe/
public_html/vendor/stripe/stripe-php/
```

### 2. Télécharger le SDK Stripe

- Va sur : **https://github.com/stripe/stripe-php/releases**
- Télécharge le **ZIP** de la dernière version (ex. `stripe-php-17.0.0.zip`)
- Ouvre le ZIP : tu as un dossier du type `stripe-php-17.0.0` avec dedans `init.php`, `lib/`, etc.

### 3. Copier le contenu du SDK

- Copie **tout le contenu** du dossier `stripe-php-17.0.0` (init.php, lib/, etc.)  
- Dans **public_html/vendor/stripe/stripe-php/**

Résultat : le fichier **public_html/vendor/stripe/stripe-php/init.php** doit exister.

### 4. Copier autoload.php

- Copie le fichier **autoload.php** (celui dans ce dossier)  
- Dans **public_html/vendor/autoload.php**

### 5. Vérifier

Ouvre **https://wp.impexo.fr/check-stripe.php** : tu dois avoir `"ok": true`.

---

Récap : tu crées les dossiers à la main, tu télécharges le ZIP Stripe, tu extrais dans `vendor/stripe/stripe-php/`, tu copies `autoload.php` dans `vendor/`.
