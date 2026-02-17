# 🔧 Modifier le fichier .htaccess existant

## Problème

Le fichier `.htaccess` existe déjà, donc on ne peut pas le créer. Il faut le modifier ou le remplacer.

## Solutions

### Solution 1 : Ouvrir et modifier le fichier existant

1. **Dans le gestionnaire de fichiers o2switch**, trouvez le fichier `.htaccess`
2. **Cliquez dessus** pour l'ouvrir/éditer
3. **Remplacez tout le contenu** par :

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

4. **Sauvegardez**
5. **Testez** : `https://www.impexo.fr/wp-login.php`

### Solution 2 : Renommer puis créer un nouveau

1. **Renommez** `.htaccess` → `.htaccess.backup`
2. **Créez un nouveau fichier** `.htaccess` avec le contenu ci-dessus
3. **Sauvegardez**
4. **Testez** : `https://www.impexo.fr/wp-login.php`

### Solution 3 : Supprimer puis créer

1. **Supprimez** le fichier `.htaccess` existant
2. **Créez un nouveau fichier** `.htaccess` avec le contenu ci-dessus
3. **Sauvegardez**
4. **Testez** : `https://www.impexo.fr/wp-login.php`

## Comment trouver le fichier .htaccess

Le fichier `.htaccess` est un fichier caché (commence par un point). Dans le gestionnaire de fichiers :

1. **Cherchez une option** "Afficher les fichiers cachés" ou "Show hidden files"
2. **Activez-la**
3. **Le fichier `.htaccess` devrait apparaître** dans la liste

## Action immédiate

1. ✅ **Activez l'affichage des fichiers cachés** dans le gestionnaire de fichiers
2. ✅ **Trouvez le fichier `.htaccess`**
3. ✅ **Ouvrez-le** pour voir son contenu actuel
4. ✅ **Remplacez tout le contenu** par le contenu WordPress ci-dessus
5. ✅ **Sauvegardez**
6. ✅ **Testez** : `https://www.impexo.fr/wp-login.php`

## Si vous ne voyez pas le fichier .htaccess

Si vous ne voyez toujours pas le fichier même après avoir activé l'affichage des fichiers cachés :

1. **Essayez de le renommer directement** en tapant `.htaccess.backup` dans le gestionnaire
2. **Ou supprimez-le** si vous pouvez
3. **Puis créez un nouveau** `.htaccess`

Dites-moi ce que vous voyez quand vous ouvrez le fichier `.htaccess` existant !
