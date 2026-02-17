# 🚨 Problème identifié : Le domaine pointe vers Vercel, pas o2switch !

## Problème

Le message d'erreur `index-QgPOtrOl.js:215` indique que la requête est interceptée par le **frontend React sur Vercel**, pas par WordPress sur o2switch.

**Cela signifie que `www.impexo.fr` pointe vers Vercel (votre frontend React), pas vers o2switch (WordPress) !**

## Solutions

### Solution 1 : Utiliser un sous-domaine pour WordPress (RECOMMANDÉ)

Configurez un sous-domaine pour WordPress :

1. **Dans o2switch**, configurez un sous-domaine :
   - `wp.impexo.fr` → pointe vers `/public_html/`
   - Ou `admin.impexo.fr` → pointe vers `/public_html/`

2. **Dans les DNS**, ajoutez un enregistrement A ou CNAME :
   - `wp.impexo.fr` → IP o2switch
   - Ou `admin.impexo.fr` → IP o2switch

3. **Dans WordPress**, mettez à jour les URLs :
   - Dans phpMyAdmin :
   ```sql
   UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'siteurl';
   UPDATE wpqh_options SET option_value = 'https://wp.impexo.fr' WHERE option_name = 'home';
   ```
   - Dans `wp-config.php` :
   ```php
   define('WP_HOME','https://wp.impexo.fr');
   define('WP_SITEURL','https://wp.impexo.fr');
   ```

4. **Accédez à WordPress admin** via : `https://wp.impexo.fr/wp-admin`

### Solution 2 : Configurer Vercel pour proxy les requêtes WordPress

Configurez Vercel pour rediriger les requêtes WordPress vers o2switch :

1. **Dans votre projet Vercel**, modifiez `vercel.json` pour ajouter des rewrites :

```json
{
  "rewrites": [
    {
      "source": "/wp-admin/:path*",
      "destination": "https://wp.impexo.fr/wp-admin/:path*"
    },
    {
      "source": "/wp-login.php",
      "destination": "https://wp.impexo.fr/wp-login.php"
    },
    {
      "source": "/wp-json/:path*",
      "destination": "https://wp.impexo.fr/wp-json/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Mais cela nécessite que WordPress soit sur un sous-domaine différent.**

### Solution 3 : Changer la configuration DNS

Configurez les DNS différemment :

- `www.impexo.fr` → Vercel (frontend React)
- `wp.impexo.fr` → o2switch (WordPress)
- `api.impexo.fr` → o2switch (pour l'API WooCommerce)

Puis mettez à jour WordPress pour utiliser `wp.impexo.fr`.

## Solution recommandée

**Utilisez un sous-domaine pour WordPress** :

1. ✅ **Configurez `wp.impexo.fr`** dans o2switch et les DNS
2. ✅ **Mettez à jour les URLs WordPress** pour utiliser `wp.impexo.fr`
3. ✅ **Accédez à WordPress admin** via `https://wp.impexo.fr/wp-admin`
4. ✅ **Mettez à jour le proxy Vercel** pour pointer vers `wp.impexo.fr` pour l'API WooCommerce

## Action immédiate

1. ✅ **Vérifiez les DNS** : https://www.whatsmydns.net/#A/www.impexo.fr
   - Vers où pointe `www.impexo.fr` actuellement ?

2. ✅ **Configurez un sous-domaine** `wp.impexo.fr` dans o2switch

3. ✅ **Mettez à jour les URLs WordPress** pour utiliser `wp.impexo.fr`

4. ✅ **Testez** : `https://wp.impexo.fr/wp-admin`

C'est la solution la plus propre et la plus simple !

Dites-moi vers où pointent actuellement les DNS de `www.impexo.fr` !
