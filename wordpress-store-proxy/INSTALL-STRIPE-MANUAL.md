# Installer le SDK Stripe PHP à la main (sans Composer sur le serveur)

Si **stripe-paths-check.php** indique qu’aucun `init.php` n’est trouvé, le SDK n’est pas présent. Suis ces étapes.

---

## 1. Télécharger le SDK

1. Ouvre : **https://github.com/stripe/stripe-php/releases**
2. Choisis la **dernière version stable** (ex. **v17.0.0** ou plus récent, pas les "beta").
3. Télécharge le **ZIP** (bouton "Source code (zip)").

---

## 2. Extraire sur ton PC

- Ouvre le ZIP : tu obtiens un dossier du type **`stripe-php-17.0.0`** (le nom peut varier).
- À l’intérieur tu dois avoir au minimum :
  - **`init.php`** (à la racine du dossier)
  - **`lib/`** (dossier avec les classes PHP)

---

## 3. Envoyer sur le serveur (FTP / gestionnaire de fichiers o2switch)

Tu dois obtenir **exactement** une de ces structures :

### Option A (recommandée)

- Sur le serveur, va dans : **`public_html/vendor/`**
- Crée le dossier **`stripe-php-master`** (s’il n’existe pas).
- Envoie **tout le contenu** du dossier extrait (init.php, lib/, etc.) **dans**  
  **`public_html/vendor/stripe-php-master/`**

Résultat attendu :

```
public_html/
  vendor/
    autoload.php          ← déjà en place
    stripe-php-master/
      init.php            ← doit exister
      lib/
      ...
```

### Option B

- À la racine de **`public_html`** (à côté du dossier `vendor/`), crée le dossier **`stripe-php-master`**.
- Envoie tout le contenu du ZIP dans **`public_html/stripe-php-master/`**

Résultat attendu :

```
public_html/
  vendor/
    autoload.php
  stripe-php-master/
    init.php
    lib/
    ...
```

---

## 4. Vérifier

1. Ouvre : **https://wp.impexo.fr/stripe-paths-check.php**  
   Au moins un chemin doit passer à **true** (ex. `vendor/stripe-php-master/init.php` ou `public_html/stripe-php-master/init.php`).

2. Puis ouvre : **https://wp.impexo.fr/check-stripe.php**  
   Tu dois avoir **`ok: true`** et **`stripe_sdk_loaded: true`**.

---

## 5. Erreur fréquente

❌ **Ne pas** mettre le dossier nommé `stripe-php-17.0.0` tel quel dans `vendor/`.  
✅ Mettre **le contenu** de ce dossier dans **`vendor/stripe-php-master/`** pour que le fichier final soit :

**`public_html/vendor/stripe-php-master/init.php`**

---

## 6. Sécurité

Une fois que **check-stripe.php** affiche `ok: true`, supprime du serveur :

- `stripe-paths-check.php`
- `install-stripe-autoload.php` (si tu l’as utilisé)
