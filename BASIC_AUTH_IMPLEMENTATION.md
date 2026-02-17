# Implémentation Basic Auth pour WooCommerce API

## Modifications appliquées

### ✅ Frontend (`src/services/woocommerce.ts`)

**Avant :** Les credentials étaient envoyés dans l'URL via query parameters :
```
https://wp.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_...&consumer_secret=cs_...
```

**Après :** Les credentials sont envoyés via Basic Auth dans les headers :
```
Authorization: Basic base64(consumer_key:consumer_secret)
```

**Code modifié :**
- `buildWooUrl()` : Suppression de l'ajout des credentials dans l'URL
- `wooFetch()` : Ajout de l'en-tête `Authorization: Basic ${credentials}` pour l'API directe

### ✅ Proxy Backend (`api/woocommerce/products.js` et `api/woocommerce/[...path].js`)

**Avant :** Les credentials étaient ajoutés dans l'URL via query parameters :
```javascript
url.searchParams.set('consumer_key', consumerKey);
url.searchParams.set('consumer_secret', consumerSecret);
```

**Après :** Les credentials sont envoyés via Basic Auth dans les headers :
```javascript
const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
headers['Authorization'] = `Basic ${credentials}`;
```

## Avantages de Basic Auth

1. **Sécurité améliorée** : Les credentials ne sont plus visibles dans l'URL (logs, historique navigateur, etc.)
2. **Conformité aux standards** : Basic Auth est la méthode recommandée pour l'authentification HTTP
3. **Meilleure pratique** : Les credentials sont dans les headers, pas dans l'URL

## Format Basic Auth

```
Authorization: Basic base64(consumer_key:consumer_secret)
```

**Exemple :**
- `consumer_key`: `ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`
- `consumer_secret`: `cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3`
- **Encodage** : `base64("ck_374c0ec78039fd4115f44238dae84ac7cb31cd38:cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3")`
- **Header** : `Authorization: Basic Y2tfMzc0YzBlYzc4MDM5ZmQ0MTE1ZjQ0MjM4ZGFlODRhYzdjYjMxY2QzODpjc184MGQyNDk1NmY5NGY0OGI3NzJkMDY1YzUxNDllN2FiMGNmMzc2YTM=`

## Vérification

### Frontend

Pour vérifier que le frontend envoie bien Basic Auth :

1. Ouvrez les **DevTools** → **Network**
2. Faites une requête vers l'API WooCommerce
3. Cliquez sur la requête
4. Allez dans l'onglet **Headers**
5. Vérifiez la présence de :
   ```
   Authorization: Basic Y2tf...
   ```

### Proxy Backend

Pour vérifier que le proxy utilise Basic Auth :

1. Consultez les logs Vercel
2. Recherchez : `[Proxy WooCommerce] Authentification: Basic Auth (credentials masquées)`
3. Les credentials ne doivent plus apparaître dans les URLs loggées

## Compatibilité

WooCommerce REST API supporte les deux méthodes :
- ✅ **Basic Auth** (recommandé) : `Authorization: Basic base64(ck:cs)`
- ✅ **Query Parameters** (déprécié) : `?consumer_key=ck_...&consumer_secret=cs_...`

Les deux méthodes fonctionnent, mais Basic Auth est plus sécurisée et conforme aux standards HTTP.

## Fichiers modifiés

- ✅ `src/services/woocommerce.ts` - Ajout de Basic Auth pour l'API directe
- ✅ `api/woocommerce/products.js` - Remplacement des query params par Basic Auth
- ✅ `api/woocommerce/[...path].js` - Remplacement des query params par Basic Auth

## Prochaines étapes

1. ✅ Redéployer sur Vercel
2. ✅ Tester les requêtes API
3. ✅ Vérifier dans les DevTools que Basic Auth est utilisé
4. ✅ Consulter les logs Vercel pour confirmer l'utilisation de Basic Auth
