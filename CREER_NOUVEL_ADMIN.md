# ✅ Créer un nouvel utilisateur admin

## URLs vérifiées ✅

Les URLs WordPress sont correctes : `https://wp.impexo.fr`

## Solution : Créer un nouvel utilisateur admin

Puisque l'utilisateur `7v1nf` n'est pas reconnu malgré les URLs correctes, créons un nouvel utilisateur admin.

### Dans phpMyAdmin

Exécutez ces requêtes **une par une** :

#### Étape 1 : Créer l'utilisateur

```sql
INSERT INTO wpqh_users (user_login, user_pass, user_nicename, user_email, user_status, user_registered, display_name)
VALUES ('admin_wp', '$P$B55D6LjfHDkINU5wF.v2BuuzO0/XPk/', 'admin_wp', 'admin@impexo.fr', 0, NOW(), 'Admin WP');
```

#### Étape 2 : Récupérer l'ID et donner les droits admin

```sql
SET @user_id = (SELECT ID FROM wpqh_users WHERE user_login = 'admin_wp');

INSERT INTO wpqh_usermeta (user_id, meta_key, meta_value)
VALUES 
(@user_id, 'wpqh_capabilities', 'a:1:{s:13:"administrator";b:1;}'),
(@user_id, 'wpqh_user_level', '10');
```

### Connexion

Une fois l'utilisateur créé :

1. **Allez sur** : `https://wp.impexo.fr/wp-login.php`
2. **Nom d'utilisateur** : `admin_wp`
3. **Mot de passe** : `password`
4. **Cliquez sur "Se connecter"**

## Si ça ne fonctionne toujours pas

Si même le nouvel utilisateur ne fonctionne pas, il y a peut-être un problème plus profond avec WordPress.

Dans ce cas :

1. **Videz tous les caches** :
   ```sql
   DELETE FROM wpqh_options WHERE option_name LIKE '_transient%';
   DELETE FROM wpqh_options WHERE option_name LIKE '_site_transient%';
   ```

2. **Vérifiez wp-config.php** contient bien :
   ```php
   define('WP_HOME','https://wp.impexo.fr');
   define('WP_SITEURL','https://wp.impexo.fr');
   define('COOKIE_DOMAIN', 'wp.impexo.fr');
   define('COOKIEPATH', '/');
   define('SITECOOKIEPATH', '/');
   ```

3. **Essayez en navigation privée** pour éviter les problèmes de cache/cookies du navigateur

## Action immédiate

1. ✅ **Créez le nouvel utilisateur** `admin_wp` avec les requêtes SQL ci-dessus
2. ✅ **Videz le cache WordPress** :
   ```sql
   DELETE FROM wpqh_options WHERE option_name LIKE '_transient%';
   ```
3. ✅ **Essayez de vous connecter** avec `admin_wp` / `password` en navigation privée
4. ✅ **Dites-moi** si ça fonctionne

Une fois connecté, vous pourrez réactiver WordPress REST API et faire fonctionner le proxy Vercel !
