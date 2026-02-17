# 🔧 Résoudre : Utilisateur non reconnu par WordPress

## Problème

WordPress dit que l'utilisateur `7v1nf` n'est pas inscrit, alors qu'il existe dans la base de données.

## Causes possibles

1. **Les URLs WordPress ne sont pas correctement configurées**
2. **Le préfixe de table est incorrect**
3. **WordPress utilise une autre base de données**

## Solutions

### Solution 1 : Vérifier les URLs WordPress

Dans phpMyAdmin, vérifiez les URLs :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
```

**Elles doivent être** : `https://wp.impexo.fr`

Si elles ne le sont pas, mettez-les à jour :

```sql
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
```

### Solution 2 : Vérifier le préfixe de table

Dans `wp-config.php`, vérifiez le préfixe :

```php
$table_prefix = 'wpqh_';
```

Assurez-vous que c'est bien `wpqh_` (comme dans vos requêtes SQL).

### Solution 3 : Vérifier que l'utilisateur existe vraiment

Dans phpMyAdmin, vérifiez :

```sql
SELECT user_login, user_email, user_status FROM wpqh_users WHERE user_login = '7v1nf';
```

**Vérifiez** :
- Que l'utilisateur existe
- Que `user_status` est `0` (actif)

Si `user_status` n'est pas `0`, activez-le :

```sql
UPDATE wpqh_users SET user_status = 0 WHERE user_login = '7v1nf';
```

### Solution 4 : Vérifier les meta capabilities

Vérifiez que l'utilisateur a bien les droits admin :

```sql
SELECT user_id, meta_key, meta_value FROM wpqh_usermeta WHERE user_id = (SELECT ID FROM wpqh_users WHERE user_login = '7v1nf');
```

Vous devriez voir `wpqh_capabilities` avec `administrator`.

### Solution 5 : Vider le cache WordPress

Parfois WordPress cache les utilisateurs. Videz le cache :

Dans phpMyAdmin :

```sql
DELETE FROM wpqh_options WHERE option_name LIKE '_transient%';
DELETE FROM wpqh_options WHERE option_name LIKE '_site_transient%';
```

### Solution 6 : Vérifier wp-config.php

Assurez-vous que `wp-config.php` contient bien :

```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
```

Et que ces lignes sont **AVANT** `/* That's all, stop editing! Happy publishing. */`

## Solution recommandée (ordre de priorité)

1. ✅ **Vérifier les URLs** dans la base de données
2. ✅ **Vérifier le statut de l'utilisateur** (`user_status = 0`)
3. ✅ **Vider le cache WordPress**
4. ✅ **Vérifier wp-config.php**

## Action immédiate

1. ✅ **Dans phpMyAdmin**, exécutez :
   ```sql
   SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
   ```
   - Quelles sont les valeurs ?

2. ✅ **Vérifiez l'utilisateur** :
   ```sql
   SELECT user_login, user_email, user_status FROM wpqh_users WHERE user_login = '7v1nf';
   ```
   - Quel est le `user_status` ?

3. ✅ **Videz le cache** :
   ```sql
   DELETE FROM wpqh_options WHERE option_name LIKE '_transient%';
   DELETE FROM wpqh_options WHERE option_name LIKE '_site_transient%';
   ```

4. ✅ **Testez à nouveau** : `https://wp.impexo.fr/wp-login.php`

Dites-moi ce que vous voyez dans les résultats de ces requêtes !
