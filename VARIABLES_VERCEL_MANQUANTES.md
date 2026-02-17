# ⚠️ Variables d'environnement manquantes dans Vercel

## Variables actuellement présentes ✅

- `VITE_IMPEXO_USE_MOCKS`
- `VITE_USE_WC_PROXY`
- `WP_BASE_URL` (sans préfixe VITE_ - correct pour le proxy)
- `WC_CONSUMER_KEY` (sans préfixe VITE_ - correct pour le proxy)
- `WC_CONSUMER_SECRET` (sans préfixe VITE_ - correct pour le proxy)

## Variables MANQUANTES ❌

### 1. `VITE_WP_BASE_URL` (CRITIQUE)

**Valeur à ajouter :**
```
VITE_WP_BASE_URL=https://www.impexo.fr
```

**Pourquoi c'est important :** Le frontend a besoin de cette variable pour savoir où se trouve WordPress, même si le proxy est utilisé.

### 2. `VITE_WC_PROXY_URL` (CRITIQUE - C'est la cause du problème !)

**Valeur à ajouter :**
```
VITE_WC_PROXY_URL=https://www.impexo.fr/api/woocommerce
```

**Pourquoi c'est important :** C'est cette variable qui indique au frontend où se trouve le proxy. Sans elle, le frontend ne sait pas où appeler le proxy, surtout après le changement de domaine.

## Comment ajouter les variables dans Vercel

1. Allez dans **Vercel** → **Votre projet** → **Settings** → **Environment Variables**
2. Cliquez sur **"Add New"**
3. Ajoutez chaque variable une par une :

### Variable 1 : VITE_WP_BASE_URL
- **Key** : `VITE_WP_BASE_URL`
- **Value** : `https://www.impexo.fr`
- **Environment** : Sélectionnez **"All Environments"** (Production, Preview, Development)

### Variable 2 : VITE_WC_PROXY_URL
- **Key** : `VITE_WC_PROXY_URL`
- **Value** : `https://www.impexo.fr/api/woocommerce`
- **Environment** : Sélectionnez **"All Environments"** (Production, Preview, Development)

## Liste complète des variables nécessaires

Après avoir ajouté les variables manquantes, vous devriez avoir **7 variables** au total :

### Pour le proxy backend (sans préfixe VITE_) :
1. `WP_BASE_URL=https://www.impexo.fr` ✅ (déjà présente)
2. `WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38` ✅ (déjà présente)
3. `WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3` ✅ (déjà présente)

### Pour le frontend (avec préfixe VITE_) :
4. `VITE_WP_BASE_URL=https://www.impexo.fr` ❌ **À AJOUTER**
5. `VITE_IMPEXO_USE_MOCKS=false` ✅ (déjà présente)
6. `VITE_USE_WC_PROXY=true` ✅ (déjà présente)
7. `VITE_WC_PROXY_URL=https://www.impexo.fr/api/woocommerce` ❌ **À AJOUTER**

## Après avoir ajouté les variables

1. ✅ Ajoutez `VITE_WP_BASE_URL` et `VITE_WC_PROXY_URL` dans Vercel
2. ✅ **Redéployez** le projet (ou faites un nouveau commit/push)
3. ✅ Testez le proxy : `https://www.impexo.fr/api/woocommerce/products?per_page=1`

## Pourquoi ces variables sont nécessaires

- **`VITE_WP_BASE_URL`** : Le frontend en a besoin pour certaines opérations et comme fallback si le proxy échoue
- **`VITE_WC_PROXY_URL`** : **C'est la variable la plus importante !** Elle indique au frontend où se trouve le proxy. Sans elle, le frontend ne sait pas où appeler le proxy, surtout après le changement de domaine de `intexo.vercel.app` vers `www.impexo.fr`.

## Test rapide après ajout

Une fois les variables ajoutées et le projet redéployé, testez :

1. **Test du proxy** : `https://www.impexo.fr/api/woocommerce/products?per_page=1`
2. **Test du site** : Ouvrez `https://www.impexo.fr` et vérifiez que les produits s'affichent

Dites-moi quand vous avez ajouté les variables et je vous aiderai à tester !
