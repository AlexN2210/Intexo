# 🚨 Solution : Plus d'accès à WordPress Admin

## Problème

Vous ne pouvez plus accéder à `https://www.impexo.fr/wp-admin` après le changement de domaine.

## Causes possibles

### 1. Problème de DNS / Configuration WordPress après changement de domaine

WordPress peut avoir l'ancien domaine enregistré dans la base de données.

### 2. Problème de .htaccess

Le fichier `.htaccess` peut avoir des règles qui bloquent l'accès.

### 3. Problème de plugins

Un plugin peut causer un conflit après le changement de domaine.

### 4. Problème de certificat SSL

Le certificat SSL peut ne pas être correctement configuré.

## Solutions (dans l'ordre de priorité)

### Solution 1 : Vérifier l'URL d'accès

Essayez différentes URLs :

1. `https://www.impexo.fr/wp-admin`
2. `https://impexo.fr/wp-admin` (sans www)
3. `http://www.impexo.fr/wp-admin` (sans SSL)
4. `http://impexo.fr/wp-admin` (sans www et sans SSL)

**Si une de ces URLs fonctionne :**
→ Le problème vient de la configuration SSL ou DNS.

### Solution 2 : Mettre à jour l'URL WordPress dans la base de données

Si vous avez accès à la base de données (via phpMyAdmin ou cPanel) :

**Option A : Via phpMyAdmin**

1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base de données WordPress
3. Allez dans l'onglet **SQL**
4. Exécutez ces requêtes :

```sql
UPDATE wp_options SET option_value = 'https://www.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'https://www.impexo.fr' WHERE option_name = 'home';
```

**Remplacez `wp_` par votre préfixe de table si différent.**

**Option B : Via wp-config.php (méthode temporaire)**

1. Connectez-vous à votre serveur via FTP ou cPanel
2. Ouvrez le fichier `wp-config.php` à la racine de WordPress
3. Ajoutez ces lignes **AVANT** `/* C'est tout, ne touchez pas à ce qui suit ! */` :

```php
define('WP_HOME','https://www.impexo.fr');
define('WP_SITEURL','https://www.impexo.fr');
```

4. Sauvegardez le fichier
5. Essayez d'accéder à `/wp-admin`
6. Une fois connecté, allez dans **Réglages** → **Général** et vérifiez que les URLs sont correctes
7. **Supprimez** ces lignes de `wp-config.php` après avoir corrigé dans l'interface WordPress

### Solution 3 : Renommer le fichier .htaccess

Le fichier `.htaccess` peut causer des problèmes :

1. Connectez-vous à votre serveur via FTP ou cPanel
2. Renommez le fichier `.htaccess` en `.htaccess.backup`
3. Essayez d'accéder à `/wp-admin`
4. Si ça fonctionne, le problème vient de `.htaccess`
5. Recréez un nouveau `.htaccess` avec les règles WordPress de base :

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

### Solution 4 : Désactiver les plugins via FTP

Si un plugin cause le problème :

1. Connectez-vous à votre serveur via FTP ou cPanel
2. Allez dans `/wp-content/plugins/`
3. Renommez le dossier des plugins problématiques (surtout les plugins de sécurité) :
   - `wordfence` → `wordfence.disabled`
   - `ithemes-security` → `ithemes-security.disabled`
   - `all-in-one-wp-security` → `all-in-one-wp-security.disabled`
4. Essayez d'accéder à `/wp-admin`
5. Si ça fonctionne, réactivez les plugins un par un pour identifier le problème

### Solution 5 : Vérifier les fichiers WordPress

Vérifiez que les fichiers WordPress sont intacts :

1. Téléchargez une nouvelle copie de WordPress (même version)
2. Remplacez les fichiers suivants (sauf `wp-content` et `wp-config.php`) :
   - `/wp-admin/`
   - `/wp-includes/`
   - Fichiers à la racine (`index.php`, `wp-load.php`, etc.)

### Solution 6 : Vérifier les permissions de fichiers

Les permissions de fichiers peuvent causer des problèmes :

1. Via FTP ou cPanel, vérifiez les permissions :
   - **Dossiers** : `755`
   - **Fichiers** : `644`
   - **wp-config.php** : `600` ou `644`

### Solution 7 : Vérifier les logs d'erreur

Consultez les logs d'erreur pour identifier le problème :

1. Via cPanel → **Error Logs**
2. Ou via FTP : `/wp-content/debug.log` (si le debug est activé)
3. Cherchez les erreurs récentes

## Diagnostic étape par étape

### Étape 1 : Tester différentes URLs

Testez toutes ces URLs dans votre navigateur :
- `https://www.impexo.fr/wp-admin`
- `https://impexo.fr/wp-admin`
- `http://www.impexo.fr/wp-admin`
- `http://impexo.fr/wp-admin`

**Quelle erreur obtenez-vous ?**
- Page blanche
- Erreur 404
- Erreur 500
- Redirection infinie
- Page d'erreur du serveur

### Étape 2 : Vérifier l'accès au site principal

Testez : `https://www.impexo.fr`

**Le site principal fonctionne-t-il ?**
- ✅ Oui → Le problème est spécifique à `/wp-admin`
- ❌ Non → Le problème est plus général (DNS, serveur, etc.)

### Étape 3 : Vérifier les logs d'erreur

Consultez les logs pour voir l'erreur exacte.

### Étape 4 : Accès à la base de données

Avez-vous accès à la base de données ?
- ✅ Oui → Utilisez la Solution 2 pour mettre à jour les URLs
- ❌ Non → Contactez votre hébergeur

### Étape 5 : Accès FTP/cPanel

Avez-vous accès FTP ou cPanel ?
- ✅ Oui → Utilisez les Solutions 2, 3, 4
- ❌ Non → Contactez votre hébergeur

## Solution rapide (si vous avez accès FTP/cPanel)

1. **Renommez `.htaccess`** → `.htaccess.backup`
2. **Ajoutez dans `wp-config.php`** :
   ```php
   define('WP_HOME','https://www.impexo.fr');
   define('WP_SITEURL','https://www.impexo.fr');
   ```
3. **Essayez `/wp-admin`**
4. Si ça fonctionne :
   - Vérifiez les URLs dans **Réglages** → **Général**
   - Supprimez les lignes de `wp-config.php`
   - Recréez `.htaccess` avec les règles WordPress de base

## Informations nécessaires pour diagnostic

Pour mieux vous aider, dites-moi :

1. **Quelle erreur obtenez-vous exactement ?**
   - Page blanche ?
   - Erreur 404 ?
   - Erreur 500 ?
   - Redirection infinie ?
   - Autre ?

2. **Le site principal fonctionne-t-il ?**
   - `https://www.impexo.fr` s'affiche-t-il ?

3. **Avez-vous accès à :**
   - FTP ?
   - cPanel ?
   - phpMyAdmin ?
   - Base de données ?

4. **Quand le problème a-t-il commencé ?**
   - Après le changement de domaine ?
   - Après une modification ?
   - Soudainement ?

## Prochaines étapes

1. ✅ Testez les différentes URLs (`/wp-admin` avec et sans www, avec et sans SSL)
2. ✅ Vérifiez si le site principal fonctionne (`https://www.impexo.fr`)
3. ✅ Consultez les logs d'erreur
4. ✅ Dites-moi quelle erreur exacte vous obtenez et quels accès vous avez

Avec ces informations, je pourrai vous donner une solution plus précise !
