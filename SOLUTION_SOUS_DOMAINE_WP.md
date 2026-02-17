# ✅ Solution : Configurer un sous-domaine pour WordPress

## Situation actuelle

- ✅ `www.impexo.fr` → Vercel (frontend React) ✅ CORRECT
- ❌ WordPress sur o2switch n'est pas accessible car `www.impexo.fr` pointe vers Vercel

## Solution : Sous-domaine pour WordPress

Configurez un sous-domaine `wp.impexo.fr` qui pointera vers o2switch pour WordPress.

## Étapes détaillées

### Étape 1 : Configurer le sous-domaine dans o2switch

1. **Connectez-vous à o2switch**
2. **Allez dans la gestion des domaines/sous-domaines**
3. **Créez un sous-domaine** : `wp.impexo.fr`
4. **Pointez-le vers** : `/public_html/` (le même dossier que WordPress)

### Étape 2 : Configurer les DNS

Dans votre gestionnaire DNS (chez votre registrar de domaine) :

1. **Ajoutez un enregistrement A** ou **CNAME** :
   - **Type** : A (ou CNAME)
   - **Nom** : `wp`
   - **Valeur** : IP o2switch (ou CNAME vers le domaine principal o2switch)
   - **TTL** : 3600 (ou par défaut)

**Pour trouver l'IP o2switch** :
- Contactez le support o2switch
- Ou cherchez dans votre panneau o2switch les informations DNS

### Étape 3 : Mettre à jour les URLs WordPress

Une fois le sous-domaine configuré et les DNS propagés (peut prendre quelques minutes à quelques heures) :

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

### Étape 4 : Mettre à jour le proxy Vercel

Dans Vercel, mettez à jour les variables d'environnement :

- `WP_BASE_URL` (sans VITE_) : `https://wp.impexo.fr`
- `VITE_WP_BASE_URL` : `https://wp.impexo.fr`
- `VITE_WC_PROXY_URL` : `https://www.impexo.fr/api/woocommerce` (reste sur www.impexo.fr car le proxy est sur Vercel)

### Étape 5 : Mettre à jour le proxy Vercel pour pointer vers wp.impexo.fr

Dans `api/woocommerce/[...path].js` et `api/woocommerce/products.js`, le proxy utilisera automatiquement `WP_BASE_URL` qui pointera maintenant vers `wp.impexo.fr`.

## Structure finale

- `www.impexo.fr` → Vercel (frontend React) ✅
- `wp.impexo.fr` → o2switch (WordPress/WooCommerce) ✅
- Le proxy Vercel (`/api/woocommerce`) appelle `wp.impexo.fr` pour l'API WooCommerce ✅

## Test après configuration

Une fois le sous-domaine configuré et les DNS propagés :

1. **Testez** : `https://wp.impexo.fr/wp-admin`
2. **Connectez-vous** à WordPress admin
3. **Testez l'API WooCommerce** : `https://wp.impexo.fr/wp-json/wc/v3/products?consumer_key=...&consumer_secret=...&per_page=1`
4. **Testez le proxy Vercel** : `https://www.impexo.fr/api/woocommerce/products?per_page=1`

## Action immédiate

1. ✅ **Configurez le sous-domaine `wp.impexo.fr`** dans o2switch
2. ✅ **Ajoutez l'enregistrement DNS** pour `wp.impexo.fr`
3. ✅ **Attendez la propagation DNS** (quelques minutes à quelques heures)
4. ✅ **Mettez à jour les URLs WordPress** dans la base de données et `wp-config.php`
5. ✅ **Testez** : `https://wp.impexo.fr/wp-admin`

## Vérification DNS

Après avoir configuré le sous-domaine, vérifiez la propagation :

https://www.whatsmydns.net/#A/wp.impexo.fr

Une fois que les DNS pointent vers o2switch, WordPress sera accessible !

Dites-moi quand vous avez configuré le sous-domaine et je vous aiderai à mettre à jour les URLs WordPress.
