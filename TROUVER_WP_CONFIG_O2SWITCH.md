# 📁 Où trouver wp-config.php sur o2switch

## Emplacement du fichier

Le fichier `wp-config.php` se trouve dans le dossier `public_html`, à la racine de WordPress.

## Chemin exact

```
/home/yoge9230/public_html/wp-config.php
```

## Étapes pour le trouver

### Via le Gestionnaire de fichiers o2switch

1. **Vous êtes actuellement dans** : `/home/yoge9230/`
2. **Double-cliquez sur** : `public_html`
3. **Vous devriez voir** :
   - `wp-config.php` ← **C'est ce fichier !**
   - `wp-admin/`
   - `wp-content/`
   - `wp-includes/`
   - `index.php`
   - `.htaccess`
   - etc.

### Si vous ne voyez pas wp-config.php

Le fichier peut être masqué ou vous pouvez être dans le mauvais dossier :

1. **Vérifiez que vous êtes dans `public_html`** :
   - Le chemin en haut du gestionnaire de fichiers doit afficher : `/home/yoge9230/public_html/`
   - Vous devriez voir les dossiers `wp-admin`, `wp-content`, `wp-includes`

2. **Activez l'affichage des fichiers cachés** :
   - Dans le gestionnaire de fichiers, cherchez une option comme "Afficher les fichiers cachés" ou "Show hidden files"
   - Le fichier `wp-config.php` n'est normalement pas caché, mais vérifiez quand même

3. **Cherchez le fichier** :
   - Utilisez la fonction de recherche du gestionnaire de fichiers
   - Cherchez : `wp-config`

## Solution alternative : Créer/modifier via FTP

Si vous ne trouvez toujours pas le fichier via le gestionnaire de fichiers :

1. **Connectez-vous via FTP** (FileZilla ou autre) :
   - Hôte : `ftp.o2switch.fr` ou l'adresse FTP fournie
   - Identifiant : votre identifiant o2switch
   - Mot de passe : votre mot de passe o2switch
   - Port : 21

2. **Naviguez jusqu'à** : `/public_html/`

3. **Trouvez `wp-config.php`**

4. **Téléchargez-le** pour le modifier localement, ou **éditez-le directement**

## Solution alternative : Modifier via phpMyAdmin

Si vous ne trouvez pas le fichier, vous pouvez modifier les URLs directement dans la base de données :

1. **Dans o2switch**, allez dans **phpMyAdmin**

2. **Sélectionnez votre base de données WordPress**

3. **Allez dans l'onglet "SQL"**

4. **Exécutez ces requêtes** :

```sql
UPDATE wp_options SET option_value = 'https://www.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'https://www.impexo.fr' WHERE option_name = 'home';
```

5. **Cliquez sur "Exécuter"**

6. **Essayez `/wp-admin`**

## Vérification

Pour vérifier que vous êtes au bon endroit, vous devriez voir ces fichiers/dossiers dans `public_html` :

- ✅ `wp-config.php` (ou `wp-config-sample.php`)
- ✅ `index.php`
- ✅ `.htaccess`
- ✅ `wp-admin/` (dossier)
- ✅ `wp-content/` (dossier)
- ✅ `wp-includes/` (dossier)
- ✅ `xmlrpc.php`
- ✅ `license.txt`
- ✅ `readme.html`

Si vous voyez ces éléments, vous êtes au bon endroit !

## Action immédiate

1. ✅ **Double-cliquez sur `public_html`** dans le gestionnaire de fichiers
2. ✅ **Cherchez `wp-config.php`** dans la liste des fichiers
3. ✅ **Si vous le trouvez** : Cliquez dessus pour l'éditer
4. ✅ **Si vous ne le trouvez pas** : Utilisez phpMyAdmin pour modifier les URLs directement

Dites-moi ce que vous voyez dans `public_html` !
