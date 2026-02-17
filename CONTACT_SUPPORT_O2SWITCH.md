# 📞 Contacter le support o2switch - Problème 404 WordPress

## Résumé du problème

Après changement de domaine vers `www.impexo.fr`, toutes les pages WordPress retournent 404, mais le site principal fonctionne.

## Informations à donner au support

### Problème
- ✅ Le site principal (`https://www.impexo.fr`) fonctionne et s'affiche correctement
- ❌ Toutes les pages WordPress retournent 404 :
  - `/wp-admin` → 404
  - `/wp-login.php` → 404
  - `/index.php` → 404
- ✅ Les URLs dans la base de données WordPress sont correctes (`https://www.impexo.fr`)
- ✅ Les fichiers WordPress existent bien sur le serveur

### Actions déjà effectuées
1. ✅ Vérifié les URLs dans la base de données (`siteurl` et `home` = `https://www.impexo.fr`)
2. ✅ Ajouté `define('WP_HOME',...)` et `define('WP_SITEURL',...)` dans `wp-config.php`
3. ✅ Désactivé les permalinks dans la base de données
4. ✅ Vérifié que les fichiers WordPress existent (`wp-login.php`, `wp-admin/`, etc.)

### Informations techniques
- **Domaine** : `www.impexo.fr`
- **Hébergement** : o2switch
- **Base de données** : `yoge9230_wp646`
- **Préfixe des tables** : `wpqh_`
- **Dossier WordPress** : `/home/yoge9230/public_html/`

### Message à envoyer au support

```
Bonjour,

J'ai un problème après avoir changé le domaine de mon site WordPress vers www.impexo.fr.

PROBLÈME :
- Le site principal (https://www.impexo.fr) fonctionne et s'affiche correctement
- Toutes les pages WordPress retournent 404 :
  * /wp-admin → 404
  * /wp-login.php → 404
  * /index.php → 404

ACTIONS DÉJÀ EFFECTUÉES :
- Vérifié les URLs dans la base de données (siteurl et home = https://www.impexo.fr)
- Ajouté define('WP_HOME',...) dans wp-config.php
- Désactivé les permalinks dans la base de données
- Vérifié que les fichiers WordPress existent bien sur le serveur

INFORMATIONS TECHNIQUES :
- Domaine : www.impexo.fr
- Compte : yoge9230
- Dossier WordPress : /home/yoge9230/public_html/
- Base de données : yoge9230_wp646

Pouvez-vous vérifier :
1. La configuration Apache/Nginx pour le domaine www.impexo.fr
2. Si les règles de réécriture (mod_rewrite) sont activées
3. Si le fichier .htaccess est bien pris en compte
4. Si le routing WordPress fonctionne correctement

Merci pour votre aide.
```

## Coordonnées du support o2switch

- **Email** : support@o2switch.fr
- **Téléphone** : 04 44 23 30 40
- **Horaires** : Du lundi au vendredi, 9h-18h

## En attendant la réponse du support

### Vérifications supplémentaires que vous pouvez faire

1. **Vérifier les DNS**
   - Assurez-vous que les DNS pointent bien vers o2switch
   - Vérifiez avec : https://www.whatsmydns.net/#A/www.impexo.fr

2. **Vérifier le certificat SSL**
   - Le certificat SSL est-il bien configuré pour `www.impexo.fr` ?
   - Testez : https://www.ssllabs.com/ssltest/analyze.html?d=www.impexo.fr

3. **Vérifier les logs d'erreur**
   - Dans o2switch, allez dans les logs d'erreur
   - Cherchez les erreurs récentes liées à WordPress

## Solution alternative : Restaurer depuis une sauvegarde

Si vous avez une sauvegarde d'avant le changement de domaine :

1. **Restaurez la sauvegarde**
2. **Changez le domaine progressivement** :
   - D'abord dans WordPress admin
   - Puis dans la base de données
   - Enfin dans la configuration DNS

## Prochaines étapes

1. ✅ **Contactez le support o2switch** avec le message ci-dessus
2. ✅ **En attendant**, vérifiez les DNS et le certificat SSL
3. ✅ **Si vous avez une sauvegarde**, envisagez de restaurer et refaire le changement de domaine progressivement

Le support o2switch devrait pouvoir identifier rapidement le problème de configuration serveur.
