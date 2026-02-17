# 🔍 Trouver le fichier .htaccess (fichier caché)

## Problème

Le fichier `.htaccess` n'apparaît pas dans la liste car c'est un **fichier caché** (commence par un point).

## Solutions

### Solution 1 : Activer l'affichage des fichiers cachés

Dans le gestionnaire de fichiers o2switch :

1. **Cherchez une option** comme :
   - "Afficher les fichiers cachés"
   - "Show hidden files"
   - "Afficher les fichiers commençant par un point"
   - Un bouton avec des points `...` ou `•••`

2. **Activez cette option**

3. **Le fichier `.htaccess` devrait maintenant apparaître** dans la liste

### Solution 2 : Créer/Modifier via le terminal SSH (si disponible)

Si vous avez accès SSH :

1. **Connectez-vous via SSH** à votre compte o2switch
2. **Allez dans le dossier** :
   ```bash
   cd public_html
   ```
3. **Listez les fichiers cachés** :
   ```bash
   ls -la | grep htaccess
   ```
4. **Éditez le fichier** :
   ```bash
   nano .htaccess
   ```
   ou
   ```bash
   vi .htaccess
   ```

### Solution 3 : Créer un nouveau .htaccess

Si le fichier n'existe pas ou si vous ne le trouvez pas :

1. **Dans le gestionnaire de fichiers**, créez un nouveau fichier
2. **Nommez-le** : `.htaccess` (avec le point au début)
3. **Ajoutez ce contenu** :

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

### Solution 4 : Renommer via FTP

Si le gestionnaire de fichiers ne fonctionne pas :

1. **Connectez-vous via FTP** (FileZilla ou autre)
2. **Allez dans `/public_html/`**
3. **Vous devriez voir `.htaccess`** (les clients FTP affichent généralement les fichiers cachés)
4. **Renommez-le** : `.htaccess.backup`
5. **Créez un nouveau `.htaccess`** avec le contenu ci-dessus

## Test rapide : Vérifier si wp-login.php fonctionne

Avant de modifier `.htaccess`, testons si le problème vient vraiment de là :

1. **Testez** : `https://www.impexo.fr/wp-login.php`
2. **Dites-moi ce que vous obtenez** :
   - Page de connexion WordPress ?
   - Erreur 404 ?
   - Autre erreur ?

## Solution recommandée

1. ✅ **Cherchez l'option "Afficher les fichiers cachés"** dans le gestionnaire de fichiers
2. ✅ **Si vous trouvez `.htaccess`**, renommez-le → `.htaccess.backup`
3. ✅ **Créez un nouveau `.htaccess`** avec le contenu WordPress de base
4. ✅ **Testez** : `https://www.impexo.fr/wp-login.php`

## Alternative : Utiliser FTP

Si le gestionnaire de fichiers o2switch ne permet pas d'afficher les fichiers cachés :

1. **Téléchargez FileZilla** (gratuit) : https://filezilla-project.org/
2. **Connectez-vous** avec vos identifiants FTP o2switch
3. **Naviguez jusqu'à `/public_html/`**
4. **Vous verrez `.htaccess`** dans la liste
5. **Renommez-le** ou **modifiez-le**

## Action immédiate

1. ✅ **Testez d'abord** : `https://www.impexo.fr/wp-login.php`
   - Que voyez-vous ?

2. ✅ **Cherchez l'option "Afficher les fichiers cachés"** dans le gestionnaire de fichiers

3. ✅ **Ou utilisez FTP** pour accéder au fichier `.htaccess`

Dites-moi ce que vous obtenez pour `/wp-login.php` et si vous arrivez à trouver le fichier `.htaccess` !
