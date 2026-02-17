# ✅ wp-config.php modifié - Prochaines étapes

## État actuel

Vos lignes sont correctement ajoutées :
```php
define('WP_HOME','https://www.impexo.fr');
define('WP_SITEURL','https://www.impexo.fr');
```

Il y a quelques duplications de commentaires, mais ce n'est **pas grave** - les définitions fonctionnent quand même.

## Nettoyage optionnel (pas obligatoire)

Si vous voulez nettoyer les duplications, voici la version propre :

```php
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */

define('WP_HOME','https://www.impexo.fr');
define('WP_SITEURL','https://www.impexo.fr');

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
```

Mais **ce n'est pas nécessaire** - votre fichier fonctionnera tel quel.

## Action immédiate : Tester

1. ✅ **Sauvegardez le fichier** (si vous ne l'avez pas déjà fait)
2. ✅ **Testez** : `https://www.impexo.fr/wp-admin`
3. ✅ **Dites-moi** si vous pouvez maintenant accéder à WordPress admin

## Si ça fonctionne

Une fois que vous avez accès à WordPress admin :

1. **Connectez-vous**
2. **Allez dans Réglages → Général**
3. **Vérifiez que les URLs sont correctes** :
   - Adresse WordPress (URL) : `https://www.impexo.fr`
   - Adresse du site (URL) : `https://www.impexo.fr`
4. **Si elles sont correctes**, vous pouvez **supprimer les deux lignes** de `wp-config.php` :
   ```php
   define('WP_HOME','https://www.impexo.fr');
   define('WP_SITEURL','https://www.impexo.fr');
   ```
   (Ces lignes étaient temporaires pour corriger le problème)

## Prochaines étapes après accès à WordPress admin

Une fois que vous avez accès à WordPress admin, on devra :

1. ✅ **Réactiver WordPress REST API** (pour que `/wp-json/` fonctionne)
2. ✅ **Vérifier WooCommerce REST API** (pour que `/wp-json/wc/v3/products` fonctionne)
3. ✅ **Tester le proxy Vercel** (pour que les produits s'affichent sur votre site)

## Test maintenant

**Testez** : `https://www.impexo.fr/wp-admin`

Dites-moi si vous pouvez maintenant accéder à WordPress admin !
