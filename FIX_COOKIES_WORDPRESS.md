# 🍪 Résoudre le problème de cookies WordPress

## Problème

WordPress dit que les cookies sont bloqués, mais c'est probablement un problème de configuration WordPress plutôt qu'un problème de navigateur.

## Solutions

### Solution 1 : Vérifier les URLs WordPress

Assurez-vous que les URLs sont correctement configurées :

Dans phpMyAdmin :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
```

**Elles doivent être** : `https://wp.impexo.fr`

Si elles ne le sont pas :

```sql
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
```

### Solution 2 : Vérifier wp-config.php

Assurez-vous que `wp-config.php` contient bien :

```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
```

### Solution 3 : Ajouter la configuration des cookies dans wp-config.php

Ajoutez ces lignes dans `wp-config.php` **AVANT** `/* That's all, stop editing! Happy publishing. */` :

```php
define('COOKIE_DOMAIN', 'wp.impexo.fr');
define('COOKIEPATH', '/');
define('SITECOOKIEPATH', '/');
```

### Solution 4 : Vider le cache et les cookies

1. **Videz le cache WordPress** :
   ```sql
   DELETE FROM wpqh_options WHERE option_name LIKE '_transient%';
   DELETE FROM wpqh_options WHERE option_name LIKE '_site_transient%';
   ```

2. **Videz les cookies du navigateur** :
   - Ouvrez les outils de développement (F12)
   - Allez dans l'onglet "Application" ou "Stockage"
   - Supprimez tous les cookies pour `wp.impexo.fr`
   - Ou utilisez la navigation privée

### Solution 5 : Vérifier le certificat SSL

Assurez-vous que le certificat SSL est valide pour `wp.impexo.fr`.

Testez : https://www.ssllabs.com/ssltest/analyze.html?d=wp.impexo.fr

### Solution 6 : Essayer en navigation privée

Parfois les extensions de navigateur bloquent les cookies. Essayez en navigation privée :

1. **Ouvrez une fenêtre de navigation privée** (Ctrl+Shift+N)
2. **Allez sur** : `https://wp.impexo.fr/wp-login.php`
3. **Essayez de vous connecter**

## Solution recommandée (ordre de priorité)

1. ✅ **Vérifier les URLs** dans la base de données
2. ✅ **Ajouter la configuration des cookies** dans `wp-config.php`
3. ✅ **Vider le cache WordPress**
4. ✅ **Essayer en navigation privée**

## Action immédiate

1. ✅ **Dans phpMyAdmin**, vérifiez les URLs :
   ```sql
   SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
   ```

2. ✅ **Dans wp-config.php**, ajoutez ces lignes :
   ```php
   define('COOKIE_DOMAIN', 'wp.impexo.fr');
   define('COOKIEPATH', '/');
   define('SITECOOKIEPATH', '/');
   ```

3. ✅ **Videz le cache WordPress** :
   ```sql
   DELETE FROM wpqh_options WHERE option_name LIKE '_transient%';
   ```

4. ✅ **Essayez en navigation privée** : `https://wp.impexo.fr/wp-login.php`

5. ✅ **Essayez de vous connecter** avec :
   - Nom d'utilisateur : `7v1nf` (ou `admin_new` si vous l'avez créé)
   - Mot de passe : `password`

Dites-moi ce que vous obtenez après avoir ajouté la configuration des cookies !
