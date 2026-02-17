# 📡 Connexion FTP o2switch

## Informations de connexion FTP pour o2switch

### Option 1 : Utiliser votre domaine (recommandé)

Dans FileZilla, utilisez ces paramètres :

- **Hôte** : `ftp.impexo.fr` ou `www.impexo.fr`
- **Identifiant** : Votre identifiant o2switch (probablement `yoge9230`)
- **Mot de passe** : Votre mot de passe o2switch
- **Port** : `21`
- **Type d'encodage** : `UTF-8` (si disponible)

### Option 2 : Utiliser l'adresse IP du serveur

Si l'option 1 ne fonctionne pas :

1. **Dans o2switch**, allez dans votre panneau de contrôle
2. **Cherchez les informations FTP** dans la section "FTP" ou "Accès FTP"
3. **Utilisez l'adresse FTP fournie** (peut être une IP ou une adresse spécifique)

### Option 3 : Trouver l'adresse FTP dans o2switch

1. **Connectez-vous à o2switch** : https://www.o2switch.fr
2. **Allez dans votre panneau de contrôle**
3. **Cherchez** :
   - Section "FTP"
   - Section "Accès FTP"
   - Section "Fichiers"
   - Section "Gestionnaire de fichiers"

4. **Vous devriez voir** :
   - L'adresse du serveur FTP
   - Votre identifiant FTP
   - Le port FTP (généralement 21)

## Alternative : Utiliser le gestionnaire de fichiers o2switch

Si FTP ne fonctionne pas, utilisez le gestionnaire de fichiers intégré :

1. **Connectez-vous à o2switch**
2. **Allez dans "Gestionnaire de fichiers"** ou **"File Manager"**
3. **Naviguez jusqu'à `/public_html/`**
4. **Créez un nouveau fichier** nommé `.htaccess`
5. **Ajoutez le contenu** :

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

6. **Sauvegardez**

## Solution recommandée

**Utilisez le gestionnaire de fichiers o2switch** plutôt que FTP :

1. ✅ **Connectez-vous à o2switch**
2. ✅ **Allez dans "Gestionnaire de fichiers"**
3. ✅ **Créez le fichier `.htaccess`** dans `/public_html/`
4. ✅ **Ajoutez le contenu WordPress**
5. ✅ **Sauvegardez**

C'est plus simple et plus rapide que FTP !

## Si vous ne trouvez pas l'adresse FTP

**Contactez le support o2switch** et demandez-leur :
- L'adresse du serveur FTP
- Votre identifiant FTP
- Le port FTP

Ou utilisez directement le gestionnaire de fichiers intégré à o2switch.
