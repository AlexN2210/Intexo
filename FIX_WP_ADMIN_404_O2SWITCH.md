# 🔧 Solution : Erreur 404 sur /wp-admin avec o2switch

## Problème

- ✅ Le site fonctionne : `https://www.impexo.fr`
- ❌ Erreur 404 sur `/wp-admin`
- ✅ Accès à o2switch

## Solutions pour o2switch

### Solution 1 : Mettre à jour l'URL WordPress dans wp-config.php (RECOMMANDÉ)

1. **Connectez-vous à o2switch** :
   - Allez sur https://www.o2switch.fr
   - Connectez-vous à votre compte
   - Allez dans **"Gestionnaire de fichiers"** ou **"File Manager"**

2. **Ouvrez le fichier `wp-config.php`** :
   - Naviguez jusqu'à la racine de votre site WordPress
   - Trouvez le fichier `wp-config.php`
   - Cliquez dessus pour l'éditer

3. **Ajoutez ces lignes** **AVANT** la ligne `/* C'est tout, ne touchez pas à ce qui suit ! */` :

```php
define('WP_HOME','https://www.impexo.fr');
define('WP_SITEURL','https://www.impexo.fr');
```

4. **Sauvegardez le fichier**

5. **Essayez d'accéder à `/wp-admin`**

6. **Une fois connecté** :
   - Allez dans **Réglages** → **Général**
   - Vérifiez que les URLs sont correctes :
     - Adresse WordPress (URL) : `https://www.impexo.fr`
     - Adresse du site (URL) : `https://www.impexo.fr`
   - Si elles sont incorrectes, corrigez-les et enregistrez

7. **Supprimez les lignes ajoutées dans `wp-config.php`** (une fois que tout fonctionne)

### Solution 2 : Mettre à jour l'URL via phpMyAdmin (o2switch)

1. **Connectez-vous à o2switch**
2. **Allez dans phpMyAdmin** :
   - Cherchez **"phpMyAdmin"** dans le panneau de contrôle
   - Ou allez directement sur : `https://votre-compte.o2switch.fr/phpmyadmin`

3. **Sélectionnez votre base de données WordPress**

4. **Allez dans l'onglet "SQL"**

5. **Exécutez ces requêtes** (remplacez `wp_` par votre préfixe si différent) :

```sql
UPDATE wp_options SET option_value = 'https://www.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'https://www.impexo.fr' WHERE option_name = 'home';
```

6. **Cliquez sur "Exécuter"**

7. **Essayez d'accéder à `/wp-admin`**

### Solution 3 : Vérifier le fichier .htaccess

Le fichier `.htaccess` peut avoir des règles qui causent le problème :

1. **Dans le gestionnaire de fichiers o2switch**, trouvez le fichier `.htaccess` à la racine

2. **Renommez-le temporairement** : `.htaccess.backup`

3. **Essayez d'accéder à `/wp-admin`**

4. **Si ça fonctionne** :
   - Recréez un nouveau `.htaccess` avec les règles WordPress de base :

```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

### Solution 4 : Réinitialiser les permalinks via FTP

1. **Connectez-vous via FTP** (FileZilla ou autre) :
   - Hôte : `ftp.o2switch.fr` ou l'adresse FTP fournie par o2switch
   - Identifiant et mot de passe : ceux de votre compte o2switch

2. **Allez dans le dossier de votre site WordPress**

3. **Renommez `.htaccess`** → `.htaccess.backup`

4. **Essayez `/wp-admin`**

5. **Si ça fonctionne**, recréez `.htaccess` avec les règles WordPress de base

## Solution recommandée (ordre de priorité)

1. ✅ **Solution 1** : Ajouter les définitions dans `wp-config.php` (le plus simple)
2. ✅ **Solution 2** : Mettre à jour via phpMyAdmin (si Solution 1 ne fonctionne pas)
3. ✅ **Solution 3** : Vérifier `.htaccess` (si les autres ne fonctionnent pas)

## Étapes détaillées pour o2switch

### Via le Gestionnaire de fichiers o2switch

1. **Connectez-vous** : https://www.o2switch.fr
2. **Allez dans "Gestionnaire de fichiers"** ou **"File Manager"**
3. **Naviguez jusqu'à la racine de WordPress** (généralement `public_html` ou `www`)
4. **Trouvez `wp-config.php`**
5. **Cliquez dessus** → **"Éditer"**
6. **Ajoutez les lignes** (voir Solution 1)
7. **Sauvegardez**

### Via phpMyAdmin o2switch

1. **Connectez-vous** : https://www.o2switch.fr
2. **Cherchez "phpMyAdmin"** dans le panneau
3. **Connectez-vous** avec vos identifiants
4. **Sélectionnez la base de données** (généralement commence par le nom d'utilisateur)
5. **Allez dans l'onglet SQL**
6. **Exécutez les requêtes** (voir Solution 2)

## Test après correction

Après avoir appliqué une solution :

1. **Testez** : `https://www.impexo.fr/wp-admin`
2. **Si ça fonctionne** :
   - Connectez-vous
   - Allez dans **Réglages** → **Général**
   - Vérifiez que les URLs sont correctes
   - Supprimez les lignes de `wp-config.php` si vous les avez ajoutées

## Si rien ne fonctionne

Si aucune solution ne fonctionne :

1. **Contactez le support o2switch** :
   - Email : support@o2switch.fr
   - Téléphone : 04 44 23 30 40
   - Expliquez que vous avez changé de domaine et que `/wp-admin` retourne 404

2. **Vérifiez les logs d'erreur** :
   - Dans le panneau o2switch, cherchez **"Logs"** ou **"Error Logs"**
   - Regardez les erreurs récentes

## Prochaines étapes

1. ✅ Connectez-vous à o2switch
2. ✅ Ouvrez `wp-config.php` via le gestionnaire de fichiers
3. ✅ Ajoutez les lignes `define('WP_HOME',...)` et `define('WP_SITEURL',...)`
4. ✅ Sauvegardez
5. ✅ Testez `/wp-admin`
6. ✅ Dites-moi si ça fonctionne !

Une fois que vous aurez accès à WordPress admin, on pourra réactiver WordPress REST API et faire fonctionner le proxy.
