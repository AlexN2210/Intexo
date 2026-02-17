# 🔍 Diagnostic final : Problème de connexion WordPress

## Vérifications à faire

### Vérification 1 : Le nouvel utilisateur existe-t-il ?

Dans phpMyAdmin :

```sql
SELECT ID, user_login, user_email, user_status FROM wpqh_users WHERE user_login = 'admin_wp';
```

**Dites-moi ce que vous voyez.**

### Vérification 2 : Les meta capabilities sont-elles correctes ?

```sql
SELECT user_id, meta_key, meta_value 
FROM wpqh_usermeta 
WHERE user_id = (SELECT ID FROM wpqh_users WHERE user_login = 'admin_wp');
```

**Vérifiez** que vous voyez `wpqh_capabilities` avec `administrator`.

### Vérification 3 : Essayer avec l'email au lieu du nom d'utilisateur

Sur la page de connexion `https://wp.impexo.fr/wp-login.php` :

1. **Essayez de vous connecter avec l'email** : `admin@impexo.fr`
2. **Mot de passe** : `password`
3. **Cliquez sur "Se connecter"**

### Vérification 4 : Vérifier le préfixe de table

Dans `wp-config.php`, vérifiez que le préfixe est bien `wpqh_` :

```php
$table_prefix = 'wpqh_';
```

### Vérification 5 : Vérifier la base de données

Dans `wp-config.php`, vérifiez :

```php
define( 'DB_NAME', 'yoge9230_wp646' );
define( 'DB_USER', 'yoge9230_wp646' );
define( 'DB_PASSWORD', '[91M(9p0jS' );
define( 'DB_HOST', 'localhost' );
```

## Solution alternative : Utiliser l'email pour se connecter

Parfois WordPress accepte l'email mais pas le nom d'utilisateur.

1. **Allez sur** : `https://wp.impexo.fr/wp-login.php`
2. **Utilisez l'email** : `admin@impexo.fr` (au lieu du nom d'utilisateur)
3. **Mot de passe** : `password`
4. **Essayez de vous connecter**

## Solution alternative : Vérifier tous les utilisateurs

Pour voir tous les utilisateurs disponibles :

```sql
SELECT ID, user_login, user_email, user_status FROM wpqh_users;
```

**Dites-moi quels utilisateurs vous voyez.**

## Solution alternative : Réinitialiser via email WordPress

Si WordPress a la fonctionnalité "Mot de passe oublié" :

1. **Allez sur** : `https://wp.impexo.fr/wp-login.php`
2. **Cliquez sur "Mot de passe oublié ?"**
3. **Entrez l'email** : `admin@impexo.fr`
4. **Vérifiez votre email** pour le lien de réinitialisation

## Action immédiate

1. ✅ **Vérifiez que `admin_wp` existe** dans la base de données
2. ✅ **Essayez de vous connecter avec l'email** : `admin@impexo.fr` / `password`
3. ✅ **Listez tous les utilisateurs** pour voir ce qui est disponible
4. ✅ **Essayez "Mot de passe oublié"** si disponible

Dites-moi :
- Est-ce que `admin_wp` existe dans la base de données ?
- Quels utilisateurs voyez-vous dans la liste ?
- Est-ce que la connexion avec l'email fonctionne ?

Avec ces informations, je pourrai identifier le problème exact !
