# 🔑 Réinitialiser le mot de passe WordPress pour 7v1nf

## Utilisateur identifié

- **Nom d'utilisateur** : `7v1nf`
- **Email** : `admin@impexo.fr`

## Solution : Réinitialiser le mot de passe

### Dans phpMyAdmin

Exécutez cette requête pour réinitialiser le mot de passe :

```sql
UPDATE wpqh_users SET user_pass = MD5('VotreNouveauMotDePasse123') WHERE user_login = '7v1nf';
```

**Remplacez** `VotreNouveauMotDePasse123` par le mot de passe que vous voulez utiliser.

### Exemple avec un mot de passe spécifique

Si vous voulez utiliser `Impexo2024!` comme mot de passe :

```sql
UPDATE wpqh_users SET user_pass = MD5('Impexo2024!') WHERE user_login = '7v1nf';
```

### Vérification

Après avoir exécuté la requête, vous devriez voir :
```
1 ligne affectée.
```

## Connexion

Une fois le mot de passe réinitialisé :

1. **Allez sur** : `https://wp.impexo.fr/wp-login.php`
2. **Nom d'utilisateur** : `7v1nf`
3. **Mot de passe** : Le mot de passe que vous avez défini dans la requête SQL
4. **Cliquez sur "Se connecter"**

## Si MD5 ne fonctionne pas

WordPress moderne utilise un système de hachage plus sécurisé. Si MD5 ne fonctionne pas, utilisez cette méthode :

### Option : Utiliser wp_hash_password

Créez un fichier PHP temporaire dans `/public_html/` nommé `reset-password.php` :

```php
<?php
require_once('wp-load.php');

$user = get_user_by('login', '7v1nf');
if ($user) {
    wp_set_password('VotreNouveauMotDePasse123', $user->ID);
    echo "Mot de passe réinitialisé avec succès !";
} else {
    echo "Utilisateur non trouvé.";
}
?>
```

1. **Créez ce fichier** dans `/public_html/`
2. **Accédez à** : `https://wp.impexo.fr/reset-password.php`
3. **Supprimez le fichier** après utilisation pour des raisons de sécurité

## Action immédiate

1. ✅ **Dans phpMyAdmin**, exécutez :
   ```sql
   UPDATE wpqh_users SET user_pass = MD5('VotreNouveauMotDePasse123') WHERE user_login = '7v1nf';
   ```
   (Remplacez le mot de passe)

2. ✅ **Testez la connexion** : `https://wp.impexo.fr/wp-login.php`
   - Nom d'utilisateur : `7v1nf`
   - Mot de passe : Celui que vous avez défini

3. ✅ **Si ça ne fonctionne pas**, utilisez la méthode avec `reset-password.php`

Dites-moi quel mot de passe vous voulez utiliser et je vous donnerai la requête SQL exacte !
