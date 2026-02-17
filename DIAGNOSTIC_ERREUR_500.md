# Diagnostic : Erreur 500 du Proxy WooCommerce

## Problème

Le proxy retourne une erreur 500 avec le message "A server error has occurred". Les variables d'environnement sont configurées dans Vercel.

## Corrections appliquées

### 1. Gestion d'erreur améliorée
- ✅ Meilleure gestion des erreurs WooCommerce (400+)
- ✅ Formatage des réponses d'erreur pour être cohérent
- ✅ Retour de `data: []` même en cas d'erreur pour éviter les erreurs côté frontend

### 2. Logs de diagnostic améliorés
- ✅ Logs détaillés des variables d'environnement
- ✅ Logs de l'URL construite (sans les secrets)
- ✅ Logs des erreurs avec stack trace
- ✅ Vérification de la validité de l'URL

### 3. Vérifications ajoutées
- ✅ Vérification que l'URL construite est valide
- ✅ Vérification que le hostname et le protocol sont corrects

## Étapes de diagnostic

### Étape 1 : Vérifier les logs Vercel

1. Allez dans **Vercel Dashboard** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions**
4. Cherchez `/api/woocommerce/products`
5. Cliquez dessus pour voir les logs détaillés

**Recherchez ces logs :**
- `[Proxy WooCommerce Products] ✅ Handler appelé` → Le handler est appelé
- `[Proxy WooCommerce Products] Variables d'environnement:` → Vérifiez que les variables sont présentes
- `[Proxy WooCommerce Products] URL WooCommerce construite:` → Vérifiez que l'URL est correcte
- `[Proxy WooCommerce Products] ❌` → Toute erreur sera loggée ici

### Étape 2 : Vérifier l'URL WordPress

Dans les logs, vérifiez la valeur de `WP_BASE_URL`. Elle doit être :
- `https://wp.impexo.fr` (si WordPress est sur un sous-domaine)
- `https://www.impexo.fr` (si WordPress est sur le même domaine)

**Test direct de l'API WooCommerce :**
```
https://wp.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_...&consumer_secret=cs_...&per_page=1
```

Remplacez `ck_...` et `cs_...` par vos vraies clés API.

**Si cette URL fonctionne** → Le problème vient du proxy
**Si cette URL ne fonctionne pas** → Le problème vient de WooCommerce ou des clés API

### Étape 3 : Vérifier les variables d'environnement

Dans Vercel → **Settings** → **Environment Variables**, vérifiez :

1. **WP_BASE_URL** :
   - Doit être l'URL complète de votre WordPress (avec `https://`)
   - Exemple : `https://wp.impexo.fr` ou `https://www.impexo.fr`
   - ⚠️ **Sans slash final**

2. **WC_CONSUMER_KEY** :
   - Doit commencer par `ck_`
   - Exemple : `ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`

3. **WC_CONSUMER_SECRET** :
   - Doit commencer par `cs_`
   - Exemple : `cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3`

### Étape 4 : Tester avec curl

Testez directement le proxy depuis votre terminal :

```bash
curl "https://www.impexo.fr/api/woocommerce/products?per_page=1"
```

**Résultats possibles :**
- ✅ **JSON avec produits** → Le proxy fonctionne
- ❌ **JSON avec erreur** → Vérifiez les logs Vercel pour voir l'erreur exacte
- ❌ **HTML** → Le proxy n'est pas trouvé (problème de routing)

## Causes probables

### 1. URL WordPress incorrecte

Si `WP_BASE_URL` pointe vers `https://www.impexo.fr` mais que WordPress est sur `https://wp.impexo.fr`, le proxy essaiera de contacter la mauvaise URL.

**Solution :** Mettez à jour `WP_BASE_URL` dans Vercel avec la bonne URL.

### 2. Clés API invalides ou expirées

Les clés API WooCommerce peuvent être invalides ou expirées.

**Solution :** 
1. Allez dans WordPress → **WooCommerce** → **Paramètres** → **Avancé** → **REST API**
2. Vérifiez que les clés API existent et sont actives
3. Régénérez-les si nécessaire
4. Mettez à jour les variables dans Vercel

### 3. WooCommerce REST API désactivée

La REST API WooCommerce peut être désactivée.

**Solution :**
1. Allez dans WordPress → **WooCommerce** → **Paramètres** → **Avancé** → **REST API**
2. Vérifiez que l'API est activée
3. Testez directement : `https://wp.impexo.fr/wp-json/wc/v3/`

### 4. Problème de réseau/firewall

Un firewall ou une restriction réseau peut bloquer les requêtes depuis Vercel.

**Solution :** Vérifiez les logs Vercel pour voir si la requête atteint WooCommerce.

## Prochaines étapes

1. ✅ Redéployez avec les améliorations
2. ✅ Consultez les logs Vercel pour voir les détails de l'erreur
3. ✅ Vérifiez que `WP_BASE_URL` pointe vers la bonne URL WordPress
4. ✅ Testez directement l'API WooCommerce avec curl
5. ✅ Vérifiez que les clés API sont valides

## Fichiers modifiés

- ✅ `api/woocommerce/products.js` - Gestion d'erreur améliorée et logs détaillés
