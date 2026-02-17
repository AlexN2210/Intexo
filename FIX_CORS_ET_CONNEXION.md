# 🔧 Résoudre les erreurs CORS et se connecter

## Erreurs CORS observées

Les erreurs CORS indiquent que WordPress essaie de charger des scripts depuis `system.odns.fr` au lieu de `wp.impexo.fr`. C'est un problème de configuration, mais **cela ne devrait pas empêcher le script de réinitialiser le mot de passe**.

## Vérification

### Question importante

Quand vous accédez à `https://wp.impexo.fr/reset-password.php`, **que voyez-vous exactement** ?

- ✅ Un message de succès avec le mot de passe ?
- ❌ Une page blanche ?
- ❌ Une erreur PHP ?
- ❌ Autre chose ?

**Les erreurs CORS dans la console ne devraient pas empêcher le script de fonctionner.**

## Si le script a fonctionné

Si vous voyez le message de succès avec le mot de passe :

1. **Notez le mot de passe** affiché
2. **Allez sur** : `https://wp.impexo.fr/wp-login.php`
3. **Connectez-vous** avec :
   - Nom d'utilisateur : `7v1nf`
   - Mot de passe : Celui affiché par le script
4. **Supprimez le fichier** `reset-password.php` après connexion

## Si le script n'a pas fonctionné

Si vous ne voyez pas le message de succès, essayons une version simplifiée du script :

### Version simplifiée de reset-password.php

```php
<?php
define('WP_USE_THEMES', false);
require_once('wp-load.php');

$username = '7v1nf';
$new_password = 'Impexo2024!';

$user = get_user_by('login', $username);

if ($user) {
    wp_set_password($new_password, $user->ID);
    echo "SUCCESS: Password reset for " . $username . " to: " . $new_password;
} else {
    echo "ERROR: User not found: " . $username;
    $all_users = get_users();
    echo "\n\nAvailable users:\n";
    foreach ($all_users as $u) {
        echo "- " . $u->user_login . "\n";
    }
}
?>
```

## Résoudre les erreurs CORS (après connexion)

Une fois connecté, vous pourrez résoudre les erreurs CORS en vérifiant la configuration WordPress. Mais d'abord, concentrons-nous sur la connexion.

## Action immédiate

1. ✅ **Dites-moi ce que vous voyez** sur `https://wp.impexo.fr/reset-password.php`
2. ✅ **Si vous voyez le message de succès**, notez le mot de passe et connectez-vous
3. ✅ **Si vous ne voyez rien**, essayez la version simplifiée du script ci-dessus

Les erreurs CORS sont un problème secondaire qu'on résoudra après avoir réussi à se connecter.

Dites-moi ce que vous voyez exactement sur la page `reset-password.php` !
