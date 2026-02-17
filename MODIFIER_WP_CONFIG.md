# 📝 Comment modifier wp-config.php pour corriger les URLs

## Emplacement exact pour ajouter les lignes

Ajoutez ces deux lignes **AVANT** la ligne `/* That's all, stop editing! Happy publishing. */`

## Code à ajouter

Dans votre fichier `wp-config.php`, trouvez cette section :

```php
/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */
```

**Ajoutez ces deux lignes entre ces deux commentaires :**

```php
/* Add any custom values between this line and the "stop editing" line. */

define('WP_HOME','https://www.impexo.fr');
define('WP_SITEURL','https://www.impexo.fr');

/* That's all, stop editing! Happy publishing. */
```

## Fichier complet (section modifiée)

Voici à quoi devrait ressembler la fin de votre fichier après modification :

```php
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */

define('WP_HOME','https://www.impexo.fr');
define('WP_SITEURL','https://www.impexo.fr');

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
```

## Étapes à suivre

1. **Dans le gestionnaire de fichiers o2switch**, ouvrez `wp-config.php`
2. **Trouvez la ligne** : `/* Add any custom values between this line and the "stop editing" line. */`
3. **Ajoutez ces deux lignes juste après** :
   ```php
   define('WP_HOME','https://www.impexo.fr');
   define('WP_SITEURL','https://www.impexo.fr');
   ```
4. **Sauvegardez le fichier**
5. **Testez** : `https://www.impexo.fr/wp-admin`

## Important

- ✅ Ajoutez les lignes **AVANT** `/* That's all, stop editing! Happy publishing. */`
- ✅ Utilisez exactement ces lignes (avec les guillemets simples)
- ✅ Assurez-vous que l'URL est `https://www.impexo.fr` (avec le `www`)

## Après avoir modifié

1. **Sauvegardez le fichier**
2. **Essayez d'accéder à** : `https://www.impexo.fr/wp-admin`
3. **Si ça fonctionne** :
   - Connectez-vous
   - Allez dans **Réglages** → **Général**
   - Vérifiez que les URLs sont correctes
   - **Supprimez les deux lignes** de `wp-config.php` une fois que tout fonctionne

## Si ça ne fonctionne pas

Si après avoir ajouté ces lignes, `/wp-admin` ne fonctionne toujours pas :

1. **Vérifiez que vous avez bien sauvegardé** le fichier
2. **Videz le cache de votre navigateur** (Ctrl+F5)
3. **Essayez en navigation privée**
4. **Utilisez phpMyAdmin** pour modifier directement les URLs dans la base de données

Dites-moi si ça fonctionne après avoir ajouté ces lignes !
