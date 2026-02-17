# 🔍 Vérifier le fichier .htaccess principal

## Fichier à vérifier

Le fichier principal est : `/public_html/.htaccess`

C'est celui-ci qui contrôle le routage WordPress et peut causer le problème de 404.

## Étapes

### Étape 1 : Ouvrir le fichier .htaccess

1. **Dans o2switch**, double-cliquez sur `/public_html/.htaccess`
2. **Ouvrez-le** pour voir son contenu
3. **Copiez tout le contenu** et envoyez-le-moi

### Étape 2 : Vérifier le contenu

Le fichier `.htaccess` devrait contenir quelque chose comme :

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

**Si vous voyez des règles qui bloquent `/wp-admin` ou `/wp-login.php`**, c'est probablement la cause du problème.

## Solutions selon le contenu

### Si le fichier contient des règles qui bloquent wp-admin

Cherchez des lignes comme :
- `RewriteRule ^wp-admin` ou `RewriteRule wp-admin`
- `RewriteRule ^wp-login` ou `RewriteRule wp-login`
- Des règles qui bloquent certaines URLs

**Solution** : Commentez ou supprimez ces règles.

### Si le fichier est vide ou corrompu

**Solution** : Remplacez-le par les règles WordPress de base (voir ci-dessus).

### Si le fichier semble correct

**Solution** : Renommez-le temporairement pour tester :
1. Renommez `.htaccess` → `.htaccess.backup`
2. Testez : `https://www.impexo.fr/wp-login.php`
3. Si ça fonctionne, recréez un nouveau `.htaccess` avec les règles WordPress de base

## Action immédiate

1. ✅ **Ouvrez** `/public_html/.htaccess`
2. ✅ **Copiez tout le contenu** et envoyez-le-moi
3. ✅ **Ou** renommez-le temporairement (`.htaccess.backup`) et testez `/wp-login.php`

Avec le contenu du fichier, je pourrai identifier exactement ce qui bloque l'accès.
