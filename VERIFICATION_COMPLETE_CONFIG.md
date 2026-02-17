# 🔍 Vérification complète de la configuration WordPress

## Problème

WordPress ne reconnaît toujours pas l'utilisateur `7v1nf`, même après avoir mis à jour les URLs.

## Vérifications complètes

### Vérification 1 : URLs dans la base de données

Dans phpMyAdmin, exécutez :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
```

**Dites-moi exactement quelles valeurs vous voyez.**

### Vérification 2 : Utilisateur existe-t-il vraiment ?

Dans phpMyAdmin :

```sql
SELECT ID, user_login, user_email, user_status FROM wpqh_users WHERE user_login = '7v1nf';
```

**Vérifiez** :
- Que l'utilisateur existe
- Que `user_status` est `0` (actif)

### Vérification 3 : Préfixe de table correct ?

Vérifiez que le préfixe dans `wp-config.php` est bien `wpqh_` :

```php
$table_prefix = 'wpqh_';
```

### Vérification 4 : Base de données correcte ?

Vérifiez que `wp-config.php` utilise la bonne base de données :

```php
define( 'DB_NAME', 'yoge9230_wp646' );
define( 'DB_USER', 'yoge9230_wp646' );
define( 'DB_PASSWORD', '[91M(9p0jS' );
define( 'DB_HOST', 'localhost' );
```

### Vérification 5 : wp-config.php complet

Assurez-vous que `wp-config.php` contient bien toutes ces lignes **AVANT** `/* That's all, stop editing! Happy publishing. */` :

```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
define('COOKIE_DOMAIN', 'wp.impexo.fr');
define('COOKIEPATH', '/');
define('SITECOOKIEPATH', '/');
```

## Solution : Créer un nouvel utilisateur admin

Si les vérifications montrent que tout est correct mais que ça ne fonctionne toujours pas, créons un nouvel utilisateur admin :

Dans phpMyAdmin :

```sql
-- Vérifier d'abord quels utilisateurs existent
SELECT ID, user_login, user_email FROM wpqh_users;

-- Créer un nouvel utilisateur admin
INSERT INTO wpqh_users (user_login, user_pass, user_nicename, user_email, user_status, user_registered, display_name)
VALUES ('admin_wp', '$P$B55D6LjfHDkINU5wF.v2BuuzO0/XPk/', 'admin_wp', 'admin@impexo.fr', 0, NOW(), 'Admin WP');

-- Récupérer l'ID
SET @user_id = LAST_INSERT_ID();

-- Donner les droits admin
INSERT INTO wpqh_usermeta (user_id, meta_key, meta_value)
VALUES 
(@user_id, 'wpqh_capabilities', 'a:1:{s:13:"administrator";b:1;}'),
(@user_id, 'wpqh_user_level', '10');
```

Puis connectez-vous avec :
- Nom d'utilisateur : `admin_wp`
- Mot de passe : `password`

## Action immédiate

1. ✅ **Vérifiez les URLs** dans la base de données et dites-moi ce que vous voyez
2. ✅ **Vérifiez l'utilisateur** `7v1nf` existe-t-il vraiment ?
3. ✅ **Vérifiez wp-config.php** contient-il toutes les lignes nécessaires ?
4. ✅ **Créez un nouvel utilisateur** `admin_wp` avec la requête SQL ci-dessus
5. ✅ **Testez la connexion** avec `admin_wp` / `password`

Dites-moi les résultats de ces vérifications !
