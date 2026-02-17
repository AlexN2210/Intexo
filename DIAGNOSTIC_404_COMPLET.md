# 🔍 Diagnostic complet : 404 sur toutes les pages WordPress

## Problème

- ❌ `/wp-admin` → 404
- ❌ `/wp-login.php` → 404
- ✅ Le site principal (`https://www.impexo.fr`) fonctionne

## Diagnostic

Puisque le site principal fonctionne mais pas les pages WordPress, le problème vient probablement du **routing WordPress** ou de la **configuration du serveur**.

## Tests à effectuer

### Test 1 : Vérifier que le site principal fonctionne toujours

Testez : `https://www.impexo.fr`

**Résultat attendu** : Le site s'affiche normalement

### Test 2 : Tester index.php directement

Testez : `https://www.impexo.fr/index.php`

**Résultats possibles** :
- ✅ Page WordPress s'affiche → Le problème vient du routing
- ❌ 404 aussi → Problème plus grave

### Test 3 : Tester avec query string

Testez : `https://www.impexo.fr/?p=1` ou `https://www.impexo.fr/index.php?p=1`

**Si ça fonctionne** : Le problème vient des permalinks/routing

## Solutions

### Solution 1 : Vérifier les permalinks dans la base de données

Dans phpMyAdmin, exécutez :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name = 'permalink_structure';
```

**Si la valeur est vide** :

```sql
UPDATE wpqh_options SET option_value = '/%postname%/' WHERE option_name = 'permalink_structure';
```

Puis testez `/wp-login.php`.

### Solution 2 : Désactiver les permalinks (temporairement)

Dans phpMyAdmin, exécutez :

```sql
UPDATE wpqh_options SET option_value = '' WHERE option_name = 'permalink_structure';
```

Puis testez : `https://www.impexo.fr/wp-login.php`

**Si ça fonctionne** : Le problème vient des permalinks. Il faudra recréer le fichier `.htaccess`.

### Solution 3 : Vérifier la configuration du serveur o2switch

Le problème peut venir de la configuration Apache/Nginx d'o2switch après le changement de domaine.

**Contactez le support o2switch** :
- Email : support@o2switch.fr
- Téléphone : 04 44 23 30 40
- Expliquez : "Après changement de domaine vers www.impexo.fr, toutes les pages WordPress (/wp-admin, /wp-login.php) retournent 404, mais le site principal fonctionne. Les URLs dans la base de données sont correctes."

### Solution 4 : Vérifier via FTP et créer .htaccess

1. **Connectez-vous via FTP**
2. **Allez dans `/public_html/`**
3. **Renommez `.htaccess`** → `.htaccess.backup` (s'il existe)
4. **Créez un nouveau `.htaccess`** avec :

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

5. **Testez** : `https://www.impexo.fr/wp-login.php`

### Solution 5 : Vérifier les fichiers WordPress

Vérifiez que les fichiers existent bien :

1. **Via FTP**, vérifiez que ces fichiers existent dans `/public_html/` :
   - `wp-login.php` ✅ (on l'a vu dans la liste)
   - `wp-admin/index.php`
   - `index.php`

2. **Si un fichier manque**, il faut le restaurer depuis une sauvegarde

## Solution recommandée (ordre de priorité)

1. ✅ **Test 2** : Tester `https://www.impexo.fr/index.php`
2. ✅ **Solution 2** : Désactiver les permalinks temporairement
3. ✅ **Solution 4** : Créer un nouveau `.htaccess` via FTP
4. ✅ **Solution 3** : Contacter le support o2switch si rien ne fonctionne

## Action immédiate

1. ✅ **Testez** : `https://www.impexo.fr/index.php`
   - Que voyez-vous ?

2. ✅ **Dans phpMyAdmin**, exécutez :
   ```sql
   UPDATE wpqh_options SET option_value = '' WHERE option_name = 'permalink_structure';
   ```

3. ✅ **Testez** : `https://www.impexo.fr/wp-login.php`
   - Est-ce que ça fonctionne maintenant ?

4. ✅ **Si ça fonctionne**, recréez le fichier `.htaccess` via FTP avec les règles WordPress de base

## Si rien ne fonctionne

Si aucune solution ne fonctionne, le problème vient probablement de la **configuration du serveur o2switch** après le changement de domaine.

**Contactez le support o2switch** avec ces informations :
- Le site principal fonctionne
- Toutes les pages WordPress retournent 404
- Les URLs dans la base de données sont correctes (`https://www.impexo.fr`)
- Vous avez essayé de désactiver les permalinks et de recréer `.htaccess`

Dites-moi ce que vous obtenez pour `/index.php` et après avoir désactivé les permalinks !
