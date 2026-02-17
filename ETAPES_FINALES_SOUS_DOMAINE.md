# ✅ Étapes finales : Configurer wp.impexo.fr pour WordPress

## État actuel

✅ Sous-domaine `wp.impexo.fr` créé dans o2switch
✅ Racine du document : `/public_html` ✅

## Prochaines étapes

### Étape 1 : Configurer les DNS

Dans votre gestionnaire DNS (chez votre registrar de domaine, où vous avez acheté `impexo.fr`) :

1. **Ajoutez un enregistrement DNS** :
   - **Type** : A ou CNAME
   - **Nom** : `wp`
   - **Valeur** : 
     - Si A : L'IP du serveur o2switch (contactez le support o2switch pour l'obtenir)
     - Si CNAME : `yoge9230.odns.fr` ou l'adresse fournie par o2switch
   - **TTL** : 3600 (ou par défaut)

2. **Sauvegardez** les modifications DNS

### Étape 2 : Attendre la propagation DNS

Les DNS peuvent prendre quelques minutes à quelques heures pour se propager.

**Vérifiez la propagation** : https://www.whatsmydns.net/#A/wp.impexo.fr

Une fois que les DNS pointent vers o2switch, vous pourrez accéder à `wp.impexo.fr`.

### Étape 3 : Mettre à jour les URLs WordPress

Une fois que `wp.impexo.fr` est accessible (après propagation DNS), mettez à jour WordPress :

#### Dans phpMyAdmin :

```sql
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
```

#### Dans wp-config.php :

Modifiez les lignes que vous avez ajoutées :

```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
```

### Étape 4 : Mettre à jour les variables Vercel

Dans **Vercel** → **Settings** → **Environment Variables**, mettez à jour :

- `WP_BASE_URL` (sans VITE_) : `https://wp.impexo.fr`
- `VITE_WP_BASE_URL` : `https://wp.impexo.fr`

Puis **redéployez** le projet Vercel.

### Étape 5 : Tester

Une fois les DNS propagés et les URLs mises à jour :

1. **Testez WordPress admin** : `https://wp.impexo.fr/wp-admin`
2. **Connectez-vous** à WordPress
3. **Testez l'API WooCommerce** : `https://wp.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1`
4. **Testez le proxy Vercel** : `https://www.impexo.fr/api/woocommerce/products?per_page=1`

## Structure finale

- `www.impexo.fr` → Vercel (frontend React) ✅
- `wp.impexo.fr` → o2switch (WordPress/WooCommerce) ✅
- Le proxy Vercel (`/api/woocommerce`) appelle `wp.impexo.fr` pour l'API WooCommerce ✅

## Action immédiate

1. ✅ **Configurez les DNS** pour `wp.impexo.fr` chez votre registrar
2. ✅ **Attendez la propagation DNS** (vérifiez avec whatsmydns.net)
3. ✅ **Mettez à jour les URLs WordPress** dans la base de données et `wp-config.php`
4. ✅ **Mettez à jour les variables Vercel**
5. ✅ **Testez** : `https://wp.impexo.fr/wp-admin`

## Pour trouver l'IP o2switch

Si vous avez besoin de l'IP pour l'enregistrement A :

1. **Contactez le support o2switch** : support@o2switch.fr
2. **Ou** cherchez dans votre panneau o2switch les informations DNS/serveur

Dites-moi quand vous avez configuré les DNS et je vous aiderai à mettre à jour les URLs WordPress !
