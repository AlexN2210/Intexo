# 🔧 Résoudre les problèmes de connexion WordPress

## Problèmes identifiés

1. ✅ `wp.impexo.fr` fonctionne
2. ❌ Les identifiants WordPress ne fonctionnent pas
3. ❌ Connexion admin o2switch retourne 404

## Solutions

### Solution 1 : Vérifier que les URLs WordPress sont mises à jour

Assurez-vous que les URLs WordPress pointent bien vers `wp.impexo.fr` :

#### Dans phpMyAdmin :

Vérifiez les valeurs actuelles :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
```

Si elles ne sont pas `https://wp.impexo.fr`, mettez-les à jour :

```sql
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
```

#### Dans wp-config.php :

Vérifiez que les lignes sont :

```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
```

### Solution 2 : Réinitialiser le mot de passe WordPress

Si vous ne vous souvenez plus du mot de passe ou s'il ne fonctionne pas :

#### Option A : Via phpMyAdmin (recommandé)

1. **Dans phpMyAdmin**, exécutez cette requête pour réinitialiser le mot de passe admin :

```sql
UPDATE wpqh_users SET user_pass = MD5('nouveau_mot_de_passe') WHERE user_login = 'admin';
```

**Remplacez** :
- `admin` par votre nom d'utilisateur WordPress
- `nouveau_mot_de_passe` par le mot de passe que vous voulez

2. **Connectez-vous** avec ce nouveau mot de passe

#### Option B : Créer un nouvel utilisateur admin

Si vous ne connaissez pas le nom d'utilisateur :

1. **Dans phpMyAdmin**, exécutez cette requête pour créer un nouvel admin :

```sql
INSERT INTO wpqh_users (user_login, user_pass, user_nicename, user_email, user_status, user_registered)
VALUES ('nouveau_admin', MD5('mot_de_passe'), 'nouveau_admin', 'votre@email.com', 0, NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO wpqh_usermeta (user_id, meta_key, meta_value)
VALUES (@user_id, 'wpqh_capabilities', 'a:1:{s:13:"administrator";b:1;}'),
       (@user_id, 'wpqh_user_level', '10');
```

**Remplacez** :
- `nouveau_admin` par le nom d'utilisateur que vous voulez
- `mot_de_passe` par le mot de passe que vous voulez
- `votre@email.com` par votre email

2. **Connectez-vous** avec ces nouveaux identifiants

### Solution 3 : Vérifier le problème de connexion admin o2switch

Le problème de connexion admin o2switch (404) est séparé du problème WordPress.

**Pour accéder à WordPress admin**, vous devez utiliser :
- `https://wp.impexo.fr/wp-admin` ✅

**Pas** via le panneau o2switch, mais directement via l'URL WordPress.

### Solution 4 : Vérifier que wp-login.php fonctionne

Testez directement :

```
https://wp.impexo.fr/wp-login.php
```

**Si ça fonctionne** : Vous devriez voir la page de connexion WordPress.

**Si ça ne fonctionne pas** : Il y a encore un problème de configuration.

## Action immédiate

1. ✅ **Vérifiez les URLs WordPress** dans phpMyAdmin
2. ✅ **Mettez-les à jour** si nécessaire vers `https://wp.impexo.fr`
3. ✅ **Réinitialisez le mot de passe** via phpMyAdmin si nécessaire
4. ✅ **Testez** : `https://wp.impexo.fr/wp-login.php`
5. ✅ **Connectez-vous** avec les identifiants WordPress

## Pour la connexion admin o2switch

La connexion admin o2switch est séparée. Pour WordPress, utilisez directement :
- `https://wp.impexo.fr/wp-admin` ✅

Dites-moi :
1. Est-ce que `https://wp.impexo.fr/wp-login.php` s'affiche ?
2. Quels identifiants essayez-vous d'utiliser ?
3. Quel message d'erreur obtenez-vous exactement ?

Je vous aiderai à réinitialiser le mot de passe si nécessaire !
