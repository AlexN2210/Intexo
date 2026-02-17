# 🔍 Diagnostic : .htaccess est correct mais 404 persiste

## État actuel

✅ **Fichier `.htaccess`** : Correct, contient les règles WordPress de base
✅ **Site principal** : Fonctionne (`https://www.impexo.fr`)
✅ **URLs base de données** : Correctes (`https://www.impexo.fr`)
❌ **WordPress admin** : Toujours 404 (`/wp-admin`, `/wp-login.php`)

## Le problème vient d'ailleurs

Puisque `.htaccess` est correct, le problème peut venir de :

1. **Configuration du serveur o2switch** (mod_rewrite non activé)
2. **Fichiers WordPress manquants ou corrompus**
3. **Plugin qui bloque l'accès**
4. **Configuration du domaine dans o2switch**

## Solutions

### Solution 1 : Vérifier que mod_rewrite est activé

Le module Apache `mod_rewrite` doit être activé pour que `.htaccess` fonctionne.

**Contactez le support o2switch** et demandez-leur de vérifier que `mod_rewrite` est activé pour votre compte.

### Solution 2 : Vérifier les fichiers WordPress

Vérifiez que ces fichiers existent bien dans `/public_html/` :

- ✅ `wp-login.php` (on l'a vu dans la liste)
- ✅ `wp-admin/index.php`
- ✅ `index.php`

**Si un fichier manque**, il faut le restaurer depuis une sauvegarde ou réinstaller WordPress.

### Solution 3 : Désactiver tous les plugins via SQL

Un plugin peut bloquer l'accès. Désactivons-les temporairement :

Dans phpMyAdmin, exécutez :

```sql
UPDATE wpqh_options SET option_value = 'a:0:{}' WHERE option_name = 'active_plugins';
```

Puis testez `/wp-login.php`.

**⚠️ ATTENTION** : Cela désactivera TOUS les plugins. Vous devrez les réactiver manuellement après.

### Solution 4 : Vérifier la configuration du domaine dans o2switch

Le domaine `www.impexo.fr` doit être correctement configuré :

1. **Dans o2switch**, vérifiez la configuration du domaine
2. **Assurez-vous** que le domaine pointe bien vers `/public_html/`
3. **Vérifiez** qu'il n'y a pas de redirections ou de configurations spéciales

### Solution 5 : Tester avec un fichier PHP simple

Créez un fichier de test pour vérifier que PHP fonctionne :

1. **Créez un fichier** `test.php` dans `/public_html/` avec ce contenu :

```php
<?php
phpinfo();
?>
```

2. **Testez** : `https://www.impexo.fr/test.php`

**Si ça fonctionne** : PHP fonctionne, le problème vient de WordPress.
**Si ça ne fonctionne pas** : Problème de configuration PHP/serveur.

### Solution 6 : Contacter le support o2switch

Puisque `.htaccess` est correct mais que le problème persiste, contactez le support :

```
Bonjour,

J'ai migré mon site WordPress de Vercel vers o2switch hier.
Le domaine est maintenant www.impexo.fr.

PROBLÈME :
- Le site principal (https://www.impexo.fr) fonctionne correctement
- Toutes les pages WordPress admin retournent 404 :
  * /wp-admin → 404
  * /wp-login.php → 404

VÉRIFICATIONS EFFECTUÉES :
- ✅ Fichier .htaccess existe et est correct
- ✅ URLs dans la base de données sont correctes
- ✅ Fichiers WordPress existent (wp-login.php, wp-admin/, etc.)
- ✅ Permalinks désactivés/réinitialisés

INFORMATIONS :
- Compte : yoge9230
- Dossier : /home/yoge9230/public_html/
- Base de données : yoge9230_wp646

Pouvez-vous vérifier :
1. Si mod_rewrite est activé pour mon compte
2. La configuration Apache pour www.impexo.fr
3. Si le routing WordPress fonctionne correctement
4. S'il y a des restrictions ou configurations spéciales qui bloquent l'accès

Merci.
```

## Solution recommandée (ordre de priorité)

1. ✅ **Solution 5** : Tester avec `test.php` pour vérifier PHP
2. ✅ **Solution 3** : Désactiver les plugins temporairement
3. ✅ **Solution 1** : Vérifier mod_rewrite avec le support
4. ✅ **Solution 6** : Contacter le support o2switch si rien ne fonctionne

## Action immédiate

1. ✅ **Créez un fichier `test.php`** dans `/public_html/` avec `<?php phpinfo(); ?>`
2. ✅ **Testez** : `https://www.impexo.fr/test.php`
3. ✅ **Dans phpMyAdmin**, désactivez les plugins temporairement
4. ✅ **Testez** : `https://www.impexo.fr/wp-login.php`
5. ✅ **Dites-moi** ce que vous obtenez

Ces tests permettront d'identifier si le problème vient de PHP, des plugins, ou de la configuration serveur.
