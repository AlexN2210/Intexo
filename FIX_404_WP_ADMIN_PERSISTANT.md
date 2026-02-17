# 🔧 Solution : 404 persistant sur /wp-admin

## Problème

Même après avoir ajouté les lignes dans `wp-config.php`, vous obtenez toujours :
```
404 Error: User attempted to access non-existent route: /wp-admin
```

## Causes possibles

### 1. Le fichier wp-config.php n'a pas été sauvegardé correctement

### 2. Problème avec le fichier .htaccess

### 3. Problème avec les permalinks WordPress

### 4. Problème de cache

## Solutions (dans l'ordre)

### Solution 1 : Vérifier que wp-config.php est bien sauvegardé

1. **Dans o2switch**, ouvrez à nouveau `wp-config.php`
2. **Vérifiez** que les lignes sont toujours là :
   ```php
   define('WP_HOME','https://www.impexo.fr');
   define('WP_SITEURL','https://www.impexo.fr');
   ```
3. **Si elles ne sont pas là**, ajoutez-les à nouveau et **sauvegardez explicitement**

### Solution 2 : Vérifier et corriger .htaccess

Le fichier `.htaccess` peut causer des problèmes :

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
6. **Testez** : `https://www.impexo.fr/wp-admin`

### Solution 3 : Modifier directement via phpMyAdmin

Si les modifications de `wp-config.php` ne fonctionnent pas, modifions directement dans la base de données :

1. **Dans o2switch**, allez dans **phpMyAdmin**
2. **Sélectionnez votre base de données** : `yoge9230_wp646`
3. **Allez dans l'onglet "SQL"**
4. **Exécutez ces requêtes** (remplacez `wpqh_` par votre préfixe si différent) :

```sql
UPDATE wpqh_options SET option_value = 'https://www.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wpqh_options SET option_value = 'https://www.impexo.fr' WHERE option_name = 'home';
```

5. **Cliquez sur "Exécuter"**
6. **Testez** : `https://www.impexo.fr/wp-admin`

### Solution 4 : Vérifier les permalinks

1. **Essayez d'accéder directement à** : `https://www.impexo.fr/wp-login.php`
2. **Si ça fonctionne**, connectez-vous
3. **Allez dans Réglages → Permaliens**
4. **Cliquez sur "Enregistrer les modifications"** (même sans rien changer)
5. **Testez** : `https://www.impexo.fr/wp-admin`

### Solution 5 : Vider le cache

1. **Videz le cache de votre navigateur** (Ctrl+Shift+Delete)
2. **Essayez en navigation privée**
3. **Essayez avec un autre navigateur**
4. **Testez** : `https://www.impexo.fr/wp-admin`

### Solution 6 : Accès direct via wp-login.php

Essayez d'accéder directement à la page de connexion :

```
https://www.impexo.fr/wp-login.php
```

**Si ça fonctionne** :
- Connectez-vous
- Une fois connecté, vous serez redirigé vers `/wp-admin` automatiquement

## Diagnostic étape par étape

### Étape 1 : Tester wp-login.php directement

Testez : `https://www.impexo.fr/wp-login.php`

**Résultats possibles :**
- ✅ **Page de connexion s'affiche** → Le problème est avec `/wp-admin` spécifiquement
- ❌ **404 aussi** → Le problème est plus général (WordPress ou serveur)

### Étape 2 : Vérifier .htaccess

1. Renommez `.htaccess` → `.htaccess.backup`
2. Testez `/wp-admin` et `/wp-login.php`
3. Si ça fonctionne, recréez `.htaccess` avec les règles WordPress de base

### Étape 3 : Modifier via phpMyAdmin

Si `wp-config.php` ne fonctionne pas, utilisez phpMyAdmin pour modifier directement les URLs dans la base de données.

## Solution recommandée (ordre de priorité)

1. ✅ **Solution 6** : Essayer `/wp-login.php` directement (le plus simple)
2. ✅ **Solution 2** : Vérifier `.htaccess` (si Solution 6 ne fonctionne pas)
3. ✅ **Solution 3** : Modifier via phpMyAdmin (si les autres ne fonctionnent pas)

## Test immédiat

**Testez cette URL** : `https://www.impexo.fr/wp-login.php`

**Dites-moi ce que vous obtenez :**
- ✅ Page de connexion WordPress ?
- ❌ Toujours 404 ?
- ❌ Autre erreur ?

## Si wp-login.php fonctionne

Si vous pouvez accéder à `/wp-login.php` et vous connecter :

1. **Connectez-vous**
2. **Vous serez automatiquement redirigé vers `/wp-admin`** après connexion
3. **Une fois dans WordPress admin**, allez dans **Réglages → Général**
4. **Vérifiez et corrigez les URLs** si nécessaire

Dites-moi ce que vous obtenez pour `/wp-login.php` !
