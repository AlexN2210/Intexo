# 🔧 Corriger le sous-domaine wp.impexo.fr

## Problème

Le sous-domaine `wp.impexo.fr` pointe vers `/` (racine) au lieu de `/public_html/` où se trouve WordPress.

## Solution

### Étape 1 : Modifier la racine du document

Dans o2switch, modifiez le sous-domaine `wp.impexo.fr` :

1. **Cliquez sur "Modifier"** à côté de `wp.impexo.fr`
2. **Changez "Racine du document"** de `/` vers `/public_html`
3. **Sauvegardez**

### Étape 2 : Configurer les DNS

Dans votre gestionnaire DNS (chez votre registrar de domaine) :

1. **Ajoutez un enregistrement A** ou **CNAME** :
   - **Type** : A (ou CNAME)
   - **Nom** : `wp`
   - **Valeur** : L'IP o2switch ou le domaine `yoge9230.odns.fr`
   - **TTL** : 3600 (ou par défaut)

**Note** : Je vois que vous avez `yoge9230.odns.fr` comme domaine. Vous pouvez utiliser un CNAME qui pointe vers ce domaine.

### Étape 3 : Attendre la propagation DNS

Les DNS peuvent prendre quelques minutes à quelques heures pour se propager.

Vérifiez la propagation : https://www.whatsmydns.net/#A/wp.impexo.fr

### Étape 4 : Mettre à jour les URLs WordPress

Une fois que les DNS pointent vers o2switch et que vous pouvez accéder à `wp.impexo.fr`, mettez à jour WordPress :

#### Dans phpMyAdmin :

```sql
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
```

#### Dans wp-config.php :

Modifiez les lignes :

```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
```

### Étape 5 : Mettre à jour Vercel

Dans Vercel → Settings → Environment Variables :

- `WP_BASE_URL` (sans VITE_) : `https://wp.impexo.fr`
- `VITE_WP_BASE_URL` : `https://wp.impexo.fr`

Puis redéployez le projet.

## Action immédiate

1. ✅ **Modifiez le sous-domaine** dans o2switch pour pointer vers `/public_html`
2. ✅ **Configurez les DNS** pour `wp.impexo.fr`
3. ✅ **Attendez la propagation DNS** (vérifiez avec whatsmydns.net)
4. ✅ **Mettez à jour les URLs WordPress** dans la base de données et `wp-config.php`
5. ✅ **Testez** : `https://wp.impexo.fr/wp-admin`

Dites-moi quand vous avez modifié la racine du document et configuré les DNS !
