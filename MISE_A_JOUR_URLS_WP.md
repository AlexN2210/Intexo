# ✅ Mise à jour des URLs WordPress pour wp.impexo.fr

## État actuel

✅ Sous-domaine `wp.impexo.fr` créé dans o2switch
✅ DNS configuré : `wp.impexo.fr` → CNAME → `yoge9230.odns.fr`
⏳ Propagation DNS en cours...

## Prochaines étapes

### Étape 1 : Vérifier la propagation DNS

Attendez quelques minutes, puis vérifiez :

https://www.whatsmydns.net/#A/wp.impexo.fr

Une fois que les DNS pointent vers o2switch, vous pourrez accéder à `wp.impexo.fr`.

### Étape 2 : Mettre à jour les URLs WordPress

Une fois que `wp.impexo.fr` est accessible (testez dans votre navigateur), mettez à jour WordPress :

#### Dans phpMyAdmin :

Exécutez ces requêtes :

```sql
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
```

#### Dans wp-config.php :

Modifiez les lignes que vous avez ajoutées précédemment :

**Trouvez ces lignes :**
```php
define('WP_HOME','https://www.impexo.fr');
define('WP_SITEURL','https://www.impexo.fr');
```

**Remplacez-les par :**
```php
define('WP_HOME','https://wp.impexo.fr');
define('WP_SITEURL','https://wp.impexo.fr');
```

### Étape 3 : Mettre à jour les variables Vercel

Dans **Vercel** → **Settings** → **Environment Variables**, mettez à jour :

**Variables pour le proxy backend (sans VITE_) :**
- `WP_BASE_URL` : `https://wp.impexo.fr`

**Variables pour le frontend (avec VITE_) :**
- `VITE_WP_BASE_URL` : `https://wp.impexo.fr`

**Les autres variables restent inchangées :**
- `WC_CONSUMER_KEY` (sans VITE_)
- `WC_CONSUMER_SECRET` (sans VITE_)
- `VITE_IMPEXO_USE_MOCKS` : `false`
- `VITE_USE_WC_PROXY` : `true`
- `VITE_WC_PROXY_URL` : `https://www.impexo.fr/api/woocommerce`

Puis **redéployez** le projet Vercel.

### Étape 4 : Tester

Une fois les DNS propagés et les URLs mises à jour :

1. **Testez WordPress admin** : `https://wp.impexo.fr/wp-admin`
   - Vous devriez voir la page de connexion WordPress ✅

2. **Connectez-vous** à WordPress admin

3. **Testez l'API WooCommerce directement** :
   ```
   https://wp.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1
   ```
   - Vous devriez voir du JSON avec des produits ✅

4. **Testez le proxy Vercel** :
   ```
   https://www.impexo.fr/api/woocommerce/products?per_page=1
   ```
   - Le proxy devrait appeler `wp.impexo.fr` et retourner les produits ✅

5. **Testez le site frontend** : `https://www.impexo.fr`
   - Les produits devraient s'afficher ✅

## Structure finale

- `www.impexo.fr` → Vercel (frontend React) ✅
- `wp.impexo.fr` → o2switch (WordPress/WooCommerce) ✅
- Proxy Vercel (`/api/woocommerce`) → appelle `wp.impexo.fr` pour l'API WooCommerce ✅

## Action immédiate

1. ✅ **Attendez quelques minutes** pour la propagation DNS
2. ✅ **Vérifiez** : https://www.whatsmydns.net/#A/wp.impexo.fr
3. ✅ **Testez** : `https://wp.impexo.fr` (devrait afficher WordPress)
4. ✅ **Mettez à jour les URLs WordPress** dans phpMyAdmin et `wp-config.php`
5. ✅ **Mettez à jour les variables Vercel**
6. ✅ **Redéployez** le projet Vercel
7. ✅ **Testez** : `https://wp.impexo.fr/wp-admin`

Dites-moi quand les DNS sont propagés et je vous aiderai à tester !
