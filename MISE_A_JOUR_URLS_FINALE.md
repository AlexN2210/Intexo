# ✅ Mise à jour finale des URLs WordPress

## Problème identifié

Les URLs WordPress sont encore `https://www.impexo.fr` au lieu de `https://wp.impexo.fr`.

C'est pour ça que WordPress ne reconnaît pas l'utilisateur - il essaie de se connecter avec les mauvaises URLs.

## Solution : Mettre à jour les URLs

### Dans phpMyAdmin

Exécutez ces requêtes pour mettre à jour les URLs :

```sql
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
```

### Dans wp-config.php

Assurez-vous que `wp-config.php` contient bien :

```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
```

Et que ces lignes sont **AVANT** `/* That's all, stop editing! Happy publishing. */`

## Après la mise à jour

1. ✅ **Videz le cache du navigateur** (Ctrl+Shift+Delete)
2. ✅ **Testez** : `https://wp.impexo.fr/wp-login.php`
3. ✅ **Essayez de vous connecter** avec :
   - Nom d'utilisateur : `7v1nf`
   - Mot de passe : Celui que vous avez défini

## Si ça ne fonctionne toujours pas

Après avoir mis à jour les URLs, videz aussi le cache WordPress :

```sql
DELETE FROM wpqh_options WHERE option_name LIKE '_transient%';
DELETE FROM wpqh_options WHERE option_name LIKE '_site_transient%';
```

## Action immédiate

1. ✅ **Dans phpMyAdmin**, exécutez :
   ```sql
   UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
   UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
   ```

2. ✅ **Vérifiez wp-config.php** et mettez à jour les lignes `define('WP_HOME',...)` et `define('WP_SITEURL',...)`

3. ✅ **Videz le cache du navigateur**

4. ✅ **Testez** : `https://wp.impexo.fr/wp-login.php`

5. ✅ **Essayez de vous connecter** avec `7v1nf`

Dites-moi si ça fonctionne après avoir mis à jour les URLs !
