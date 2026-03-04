# Installer Stripe en 4 étapes (très simple)

Le site cherche un fichier nommé **init.php** qui fait partie du SDK Stripe. Ce fichier n’est pas sur ton serveur. Il faut le télécharger puis le mettre au bon endroit.

---

## Étape 1 : Télécharger le SDK Stripe

1. Ouvre ton navigateur.
2. Va sur : **https://github.com/stripe/stripe-php/releases**
3. Descends un peu : tu vois une liste de versions (v17.0.0, v18.0.0, etc.).
4. Clique sur la **dernière version stable** (pas celle avec "beta").
5. Sur la page de la version, clique sur **"Source code (zip)"** pour télécharger un fichier .zip.

Tu as maintenant un fichier du type : **stripe-php-17.0.0.zip** (le numéro peut changer).

---

## Étape 2 : Ouvrir le ZIP sur ton ordinateur

1. Ouvre le fichier .zip que tu viens de télécharger (double-clic).
2. Tu vois un **dossier** (ex. `stripe-php-17.0.0`).
3. Ouvre ce dossier.
4. À l’intérieur tu dois voir :
   - un fichier **init.php**
   - un dossier **lib**
   - éventuellement d’autres dossiers (Apps, etc.)

C’est tout ce qu’il y a **à l’intérieur** de ce dossier qui doit finir sur le serveur.

---

## Étape 3 : Mettre ces fichiers sur ton hébergement (o2switch)

Tu dois te connecter à ton hébergement (FTP ou "Gestionnaire de fichiers" dans le panneau o2switch).

1. Va dans le dossier de ton site WordPress. En général c’est : **public_html**
2. Ouvre le dossier **vendor** (s’il n’existe pas, crée-le).
3. Dans **vendor**, crée un dossier nommé exactement : **stripe-php-master**
4. Ouvre le dossier **stripe-php-master** (il est vide pour l’instant).
5. **Copie tout le contenu** du dossier que tu as ouvert dans l’étape 2 (init.php, lib, etc.) **et colle-le dans** stripe-php-master.

**Résultat à obtenir :**

- Sur le serveur, le chemin doit être :  
  **public_html / vendor / stripe-php-master / init.php**

Donc :
- **public_html** = dossier racine du site
- **vendor** = dossier dedans
- **stripe-php-master** = dossier dedans
- **init.php** = fichier directement dans stripe-php-master (pas dans un sous-dossier)

**Erreur à éviter :**  
Ne pas mettre le dossier "stripe-php-17.0.0" entier. Il faut mettre **ce qu’il y a dedans** (init.php, lib, etc.) dans **stripe-php-master**.

---

## Étape 4 : Vérifier que ça marche

1. Ouvre dans ton navigateur : **https://wp.impexo.fr/check-stripe.php**
2. Tu dois voir du JSON avec : **"ok": true** et **"stripe_sdk_loaded": true**

Si c’est le cas, c’est bon. Tu peux supprimer **stripe-paths-check.php** et **install-stripe-autoload.php** du serveur (sécurité).

---

## En résumé (une phrase)

**Télécharge le ZIP Stripe PHP sur GitHub → ouvre le ZIP → copie tout le contenu du dossier extrait dans public_html/vendor/stripe-php-master/ sur ton serveur.**
