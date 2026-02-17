# 🔑 Solution alternative : Réinitialiser le mot de passe

## Problème

Le fichier `reset-password.php` retourne 404, probablement parce que WordPress intercepte toutes les requêtes via `.htaccess`.

## Solutions alternatives

### Solution 1 : Utiliser wp-cli (si disponible)

Si wp-cli est disponible sur o2switch, connectez-vous via SSH et exécutez :

```bash
cd /home/yoge9230/public_html
wp user update 7v1nf --user_pass='Impexo2024!'
```

### Solution 2 : Créer le fichier dans un sous-dossier

Créez le fichier dans un sous-dossier qui n'est pas intercepté par WordPress :

1. **Créez un dossier** `reset` dans `/public_html/`
2. **Créez le fichier** `/public_html/reset/password.php` avec :

```php
<?php
define('WP_USE_THEMES', false);
require_once('../wp-load.php');

$username = '7v1nf';
$new_password = 'Impexo2024!';

$user = get_user_by('login', $username);

if ($user) {
    wp_set_password($new_password, $user->ID);
    echo "SUCCESS: Password reset for " . $username . " to: " . $new_password;
    echo "<br><a href='https://wp.impexo.fr/wp-login.php'>Go to login</a>";
} else {
    echo "ERROR: User not found";
}
?>
```

3. **Accédez à** : `https://wp.impexo.fr/reset/password.php`

### Solution 3 : Utiliser directement SQL avec le hash WordPress moderne

WordPress moderne n'utilise plus MD5. Utilisons le hash WordPress correct :

Dans phpMyAdmin, exécutez :

```sql
UPDATE wpqh_users 
SET user_pass = '$P$B55D6LjfHDkINU5wF.v2BuuzO0/XPk/' 
WHERE user_login = '7v1nf';
```

**Ce hash correspond au mot de passe** : `password`

Puis connectez-vous avec :
- Nom d'utilisateur : `7v1nf`
- Mot de passe : `password`

### Solution 4 : Créer un utilisateur admin complètement nouveau

Si rien ne fonctionne, créons un nouvel utilisateur admin :

Dans phpMyAdmin :

```sql
-- Créer un nouvel utilisateur
INSERT INTO wpqh_users (user_login, user_pass, user_nicename, user_email, user_status, user_registered, display_name)
VALUES ('admin_new', '$P$B55D6LjfHDkINU5wF.v2BuuzO0/XPk/', 'admin_new', 'admin@impexo.fr', 0, NOW(), 'Admin New');

-- Récupérer l'ID du nouvel utilisateur
SET @user_id = LAST_INSERT_ID();

-- Donner les droits administrateur
INSERT INTO wpqh_usermeta (user_id, meta_key, meta_value)
VALUES 
(@user_id, 'wpqh_capabilities', 'a:1:{s:13:"administrator";b:1;}'),
(@user_id, 'wpqh_user_level', '10');
```

Puis connectez-vous avec :
- Nom d'utilisateur : `admin_new`
- Mot de passe : `password`

## Solution recommandée

**Essayez d'abord la Solution 3** (SQL avec hash WordPress) car c'est la plus simple et la plus fiable.

## Action immédiate

1. ✅ **Dans phpMyAdmin**, exécutez :
   ```sql
   UPDATE wpqh_users 
   SET user_pass = '$P$B55D6LjfHDkINU5wF.v2BuuzO0/XPk/' 
   WHERE user_login = '7v1nf';
   ```

2. ✅ **Testez la connexion** : `https://wp.impexo.fr/wp-login.php`
   - Nom d'utilisateur : `7v1nf`
   - Mot de passe : `password`

3. ✅ **Si ça ne fonctionne pas**, essayez la Solution 4 pour créer un nouvel utilisateur

Dites-moi ce que vous obtenez !
