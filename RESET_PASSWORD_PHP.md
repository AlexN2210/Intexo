# 🔑 Réinitialiser le mot de passe via fichier PHP (méthode fiable)

## Problème

Même après avoir mis à jour les URLs, la connexion ne fonctionne pas.

## Solution : Réinitialiser le mot de passe via fichier PHP

Cette méthode est plus fiable que SQL car elle utilise les fonctions WordPress natives.

### Étape 1 : Créer le fichier reset-password.php

Dans o2switch, créez un fichier `reset-password.php` dans `/public_html/` avec ce contenu :

```php
<?php
// Réinitialiser le mot de passe WordPress
require_once('wp-load.php');

$username = '7v1nf';
$new_password = 'Impexo2024!'; // Changez ce mot de passe

$user = get_user_by('login', $username);

if ($user) {
    wp_set_password($new_password, $user->ID);
    echo "✅ Mot de passe réinitialisé avec succès !<br>";
    echo "Nom d'utilisateur : " . $username . "<br>";
    echo "Nouveau mot de passe : " . $new_password . "<br>";
    echo "<br><a href='https://wp.impexo.fr/wp-login.php'>Aller à la page de connexion</a>";
} else {
    echo "❌ Utilisateur non trouvé : " . $username;
    
    // Afficher tous les utilisateurs disponibles
    $users = get_users();
    echo "<br><br>Utilisateurs disponibles :<br>";
    foreach ($users as $u) {
        echo "- " . $u->user_login . " (" . $u->user_email . ")<br>";
    }
}
?>
```

### Étape 2 : Accéder au fichier

1. **Accédez à** : `https://wp.impexo.fr/reset-password.php`
2. **Vous devriez voir** un message de succès avec le nouveau mot de passe
3. **Notez le mot de passe** affiché

### Étape 3 : Se connecter

1. **Allez sur** : `https://wp.impexo.fr/wp-login.php`
2. **Nom d'utilisateur** : `7v1nf`
3. **Mot de passe** : Le mot de passe que vous avez défini dans le fichier PHP
4. **Cliquez sur "Se connecter"**

### Étape 4 : Supprimer le fichier (IMPORTANT)

**Après avoir réinitialisé le mot de passe**, **supprimez immédiatement** le fichier `reset-password.php` pour des raisons de sécurité.

## Vérifications supplémentaires

### Vérifier que les URLs sont bien mises à jour

Dans phpMyAdmin, vérifiez à nouveau :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
```

**Elles doivent être** : `https://wp.impexo.fr`

### Vérifier wp-config.php

Assurez-vous que `wp-config.php` contient bien :

```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
```

### Vider tous les caches

```sql
DELETE FROM wpqh_options WHERE option_name LIKE '_transient%';
DELETE FROM wpqh_options WHERE option_name LIKE '_site_transient%';
```

## Si le fichier PHP ne fonctionne pas

Si `reset-password.php` retourne une erreur, cela peut indiquer un problème avec WordPress lui-même.

Dans ce cas, vérifiez :
1. **Les fichiers WordPress sont-ils intacts ?**
2. **La base de données est-elle correctement configurée dans wp-config.php ?**
3. **Y a-t-il des erreurs dans les logs o2switch ?**

## Action immédiate

1. ✅ **Créez le fichier `reset-password.php`** dans `/public_html/`
2. ✅ **Accédez à** : `https://wp.impexo.fr/reset-password.php`
3. ✅ **Notez le mot de passe** affiché
4. ✅ **Connectez-vous** avec ce mot de passe
5. ✅ **Supprimez le fichier** `reset-password.php` après utilisation

Dites-moi ce que vous voyez quand vous accédez à `reset-password.php` !
