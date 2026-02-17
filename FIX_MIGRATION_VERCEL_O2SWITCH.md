# 🔧 Solution : Migration Vercel → o2switch - WordPress admin ne fonctionne pas

## Situation

- ✅ Site principal (`https://www.impexo.fr`) fonctionne
- ❌ WordPress admin (`/wp-admin`, `/wp-login.php`) retourne 404
- ✅ Migration de Vercel vers o2switch effectuée hier
- ✅ URLs dans la base de données sont correctes

## Problème identifié

WordPress était probablement configuré pour Vercel et maintenant il est sur o2switch. Il y a probablement un problème de configuration du serveur ou de routing WordPress.

## Solutions

### Solution 1 : Vérifier la configuration du domaine dans o2switch

Le domaine `www.impexo.fr` doit être correctement configuré dans o2switch :

1. **Dans o2switch**, allez dans la gestion des domaines
2. **Vérifiez** que `www.impexo.fr` est bien configuré et pointé vers `/public_html/`
3. **Vérifiez** que le domaine principal est bien `www.impexo.fr` (pas `impexo.fr` sans www)

### Solution 2 : Créer/Corriger le fichier .htaccess via FTP

Le fichier `.htaccess` est crucial pour le routing WordPress :

1. **Connectez-vous via FTP** (FileZilla)
2. **Allez dans `/public_html/`**
3. **Renommez `.htaccess`** → `.htaccess.backup` (s'il existe)
4. **Créez un nouveau fichier `.htaccess`** avec ce contenu :

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

### Solution 3 : Vérifier que mod_rewrite est activé

Dans o2switch, vérifiez que `mod_rewrite` est activé pour Apache. Contactez le support si nécessaire.

### Solution 4 : Réinitialiser les permalinks via SQL

Dans phpMyAdmin, exécutez :

```sql
-- Vérifier la valeur actuelle
SELECT option_name, option_value FROM wpqh_options WHERE option_name = 'permalink_structure';

-- Réinitialiser les permalinks
UPDATE wpqh_options SET option_value = '/%postname%/' WHERE option_name = 'permalink_structure';

-- Vérifier que les règles de réécriture sont activées
UPDATE wpqh_options SET option_value = '1' WHERE option_name = 'rewrite_rules';
```

Puis testez `/wp-login.php`.

### Solution 5 : Vérifier wp-config.php

Assurez-vous que `wp-config.php` contient bien :

```php
define('WP_HOME','https://www.impexo.fr');
define('WP_SITEURL','https://www.impexo.fr');
```

Et que ces lignes sont **AVANT** `/* That's all, stop editing! Happy publishing. */`

### Solution 6 : Contacter le support o2switch

Si rien ne fonctionne, contactez le support o2switch avec ce message :

```
Bonjour,

J'ai migré mon site WordPress de Vercel vers o2switch hier. 
Le domaine est maintenant www.impexo.fr.

PROBLÈME :
- Le site principal (https://www.impexo.fr) fonctionne correctement
- Toutes les pages WordPress admin retournent 404 :
  * /wp-admin → 404
  * /wp-login.php → 404

ACTIONS DÉJÀ EFFECTUÉES :
- Vérifié les URLs dans la base de données (correctes)
- Modifié wp-config.php avec WP_HOME et WP_SITEURL
- Désactivé/réinitialisé les permalinks
- Vérifié que les fichiers WordPress existent

INFORMATIONS :
- Compte : yoge9230
- Dossier : /home/yoge9230/public_html/
- Base de données : yoge9230_wp646

Pouvez-vous vérifier :
1. La configuration Apache pour www.impexo.fr
2. Si mod_rewrite est activé
3. Si le fichier .htaccess est bien pris en compte
4. Si le routing WordPress fonctionne correctement

Merci.
```

## Solution recommandée (ordre de priorité)

1. ✅ **Solution 2** : Créer un nouveau `.htaccess` via FTP (le plus important)
2. ✅ **Solution 4** : Réinitialiser les permalinks via SQL
3. ✅ **Solution 1** : Vérifier la configuration du domaine dans o2switch
4. ✅ **Solution 6** : Contacter le support o2switch si rien ne fonctionne

## Action immédiate

1. ✅ **Connectez-vous via FTP** (FileZilla)
2. ✅ **Allez dans `/public_html/`**
3. ✅ **Renommez `.htaccess`** → `.htaccess.backup` (s'il existe)
4. ✅ **Créez un nouveau `.htaccess`** avec le contenu ci-dessus
5. ✅ **Testez** : `https://www.impexo.fr/wp-login.php`

C'est la solution la plus probable pour résoudre le problème après migration Vercel → o2switch.

Dites-moi si vous avez accès à FTP et si vous pouvez créer le fichier `.htaccess` !
