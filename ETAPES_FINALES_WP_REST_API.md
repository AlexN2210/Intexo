# ✅ Étapes finales : Réactiver WordPress REST API et configurer le proxy

## État actuel

✅ Connexion WordPress admin réussie !
✅ Sous-domaine `wp.impexo.fr` configuré
✅ URLs WordPress correctes

## Prochaines étapes

### Étape 1 : Réactiver WordPress REST API

Dans WordPress admin (`https://wp.impexo.fr/wp-admin`) :

1. **Allez dans Réglages → Permaliens**
2. **Cliquez sur "Enregistrer les modifications"** (même sans rien changer)
3. Cela réinitialise les permalinks et réactive l'API REST

### Étape 2 : Vérifier WooCommerce REST API

1. **Dans WordPress admin**, allez dans **WooCommerce → Settings → Advanced → REST API**
2. **Vérifiez** que les clés API existent :
   - Consumer Key : `ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`
   - Consumer Secret : `cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3`
3. **Si elles n'existent pas**, créez de nouvelles clés API

### Étape 3 : Tester WordPress REST API

Testez dans votre navigateur :

```
https://wp.impexo.fr/wp-json/
```

**Résultat attendu** : JSON avec les routes disponibles, incluant `/wc/v3/`

### Étape 4 : Tester WooCommerce REST API

Testez :

```
https://wp.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1&status=publish
```

**Résultat attendu** : JSON avec des produits

### Étape 5 : Mettre à jour les variables Vercel

Dans **Vercel** → **Settings** → **Environment Variables**, mettez à jour :

**Variables pour le proxy backend (sans VITE_) :**
- `WP_BASE_URL` : `https://wp.impexo.fr` ✅

**Variables pour le frontend (avec VITE_) :**
- `VITE_WP_BASE_URL` : `https://wp.impexo.fr` ✅
- `VITE_WC_PROXY_URL` : `https://www.impexo.fr/api/woocommerce` (reste sur www.impexo.fr car le proxy est sur Vercel)

**Les autres variables restent inchangées :**
- `WC_CONSUMER_KEY` (sans VITE_)
- `WC_CONSUMER_SECRET` (sans VITE_)
- `VITE_IMPEXO_USE_MOCKS` : `false`
- `VITE_USE_WC_PROXY` : `true`

### Étape 6 : Redéployer Vercel

Après avoir mis à jour les variables, **redéployez** le projet Vercel.

### Étape 7 : Tester le proxy Vercel

Testez :

```
https://www.impexo.fr/api/woocommerce/products?per_page=1
```

**Résultat attendu** : JSON avec des produits (le proxy appelle `wp.impexo.fr`)

### Étape 8 : Tester le site frontend

1. **Allez sur** : `https://www.impexo.fr`
2. **Vérifiez** que les produits s'affichent correctement
3. **Vérifiez** que vous pouvez cliquer sur les produits

## Structure finale

- `www.impexo.fr` → Vercel (frontend React) ✅
- `wp.impexo.fr` → o2switch (WordPress/WooCommerce) ✅
- Proxy Vercel (`/api/woocommerce`) → appelle `wp.impexo.fr` pour l'API WooCommerce ✅

## Checklist finale

- [ ] Réinitialiser les permalinks WordPress
- [ ] Vérifier WooCommerce REST API
- [ ] Tester `/wp-json/`
- [ ] Tester `/wp-json/wc/v3/products`
- [ ] Mettre à jour les variables Vercel
- [ ] Redéployer Vercel
- [ ] Tester le proxy Vercel
- [ ] Tester le site frontend

## Problèmes possibles

### Si `/wp-json/` retourne 404

- Vérifiez que les permalinks sont réinitialisés
- Vérifiez qu'aucun plugin ne bloque l'API REST
- Vérifiez le fichier `.htaccess`

### Si `/wp-json/wc/v3/products` retourne 404

- Vérifiez que WooCommerce est installé et activé
- Vérifiez que les clés API sont correctes
- Vérifiez que les produits sont publiés

### Si le proxy Vercel ne fonctionne pas

- Vérifiez que `WP_BASE_URL` est bien `https://wp.impexo.fr` dans Vercel
- Vérifiez les logs Vercel pour voir les erreurs
- Vérifiez que le projet a été redéployé après modification des variables

Dites-moi où vous en êtes et je vous aiderai pour la suite !
