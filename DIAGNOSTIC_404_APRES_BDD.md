# 🔍 Diagnostic : 404 malgré URLs correctes dans la base de données

## État actuel

✅ **Base de données** : Les URLs sont correctes (`https://www.impexo.fr`)
❌ **Accès WordPress** : Toujours 404 sur `/wp-admin` et `/wp-login.php`

## Le problème vient donc d'ailleurs

Puisque les URLs dans la base de données sont correctes, le problème vient probablement de :

1. **Le fichier `.htaccess`** (le plus probable)
2. **Les permalinks WordPress**
3. **Un plugin qui bloque l'accès**
4. **La configuration du serveur o2switch**

## Solutions (dans l'ordre de priorité)

### Solution 1 : Vérifier et corriger .htaccess (RECOMMANDÉ)

Le fichier `.htaccess` peut bloquer l'accès à WordPress :

1. **Dans o2switch**, allez dans `public_html`
2. **Trouvez le fichier `.htaccess`**
3. **Renommez-le temporairement** : `.htaccess.backup`
4. **Créez un nouveau `.htaccess`** avec ce contenu :

```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

5. **Sauvegardez**
6. **Testez** : `https://www.impexo.fr/wp-login.php`

### Solution 2 : Vérifier les permalinks dans la base de données

Vérifiez si les permalinks sont configurés :

Dans phpMyAdmin, exécutez :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name = 'permalink_structure';
```

**Si la valeur est vide ou NULL** :
- Les permalinks ne sont pas configurés
- Cela peut causer des problèmes d'accès

**Pour les configurer**, exécutez :

```sql
UPDATE wpqh_options SET option_value = '/%postname%/' WHERE option_name = 'permalink_structure';
```

Puis testez `/wp-login.php`.

### Solution 3 : Désactiver les plugins via la base de données

Si un plugin cause le problème, désactivons-les temporairement :

Dans phpMyAdmin, exécutez :

```sql
UPDATE wpqh_options SET option_value = 'a:0:{}' WHERE option_name = 'active_plugins';
```

**⚠️ ATTENTION** : Cela désactivera TOUS les plugins. Vous devrez les réactiver manuellement après.

### Solution 4 : Vérifier les fichiers WordPress

Vérifiez que les fichiers WordPress sont intacts :

1. **Dans o2switch**, vérifiez que ces fichiers existent dans `public_html` :
   - `wp-login.php` ← **Important !**
   - `wp-admin/index.php`
   - `index.php`
   - `wp-config.php`

2. **Si `wp-login.php` n'existe pas**, il faut le restaurer depuis une sauvegarde ou réinstaller WordPress.

### Solution 5 : Contacter le support o2switch

Si rien ne fonctionne, contactez le support o2switch :

- **Email** : support@o2switch.fr
- **Téléphone** : 04 44 23 30 40
- **Expliquez** : "Après changement de domaine, `/wp-admin` et `/wp-login.php` retournent 404, mais les URLs dans la base de données sont correctes."

## Test immédiat

**Testez cette URL** : `https://www.impexo.fr/wp-login.php`

**Dites-moi ce que vous obtenez :**
- ✅ Page de connexion WordPress ?
- ❌ Toujours 404 ?
- ❌ Autre erreur ?

## Solution recommandée

1. ✅ **Renommez `.htaccess`** → `.htaccess.backup`
2. ✅ **Créez un nouveau `.htaccess`** avec les règles WordPress de base
3. ✅ **Testez** : `https://www.impexo.fr/wp-login.php`

C'est la solution la plus probable et la plus simple à tester.

## Prochaines étapes

1. ✅ Testez `/wp-login.php` dans votre navigateur
2. ✅ Renommez `.htaccess` temporairement
3. ✅ Testez à nouveau `/wp-login.php`
4. ✅ Dites-moi ce que vous obtenez

Si `.htaccess` était le problème, `/wp-login.php` devrait fonctionner après l'avoir renommé.
