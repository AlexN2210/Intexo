# Solution : Erreur 404 sur le proxy Vercel

## Problème

Erreur 404 : `User attempted to access non-existent route: /api/woocommerce/products`

Cela signifie que Vercel ne trouve pas les fichiers API dans le déploiement.

## Causes possibles

### 1. Le Root Directory n'est pas configuré

**Vérification dans Vercel :**
1. Allez sur https://vercel.com
2. Ouvrez le projet `intexo`
3. **Settings** → **General** → **Root Directory**
4. Si votre projet est dans `impexo-luxe-e-commerce/`, configurez :
   - **Root Directory** : `impexo-luxe-e-commerce`
5. **Redéployez** après modification

### 2. Les fichiers ne sont pas commités dans Git

**Vérification :**
```bash
cd impexo-luxe-e-commerce
git status
git ls-files api/
```

**Si les fichiers ne sont pas dans Git :**
```bash
git add api/
git commit -m "Add API routes for WooCommerce proxy"
git push
```

Puis redéployez dans Vercel.

### 3. Le dossier `api/` n'est pas à la racine du projet déployé

Vercel cherche les API Routes dans le dossier `api/` à la **racine du projet déployé**.

Si votre Root Directory est `impexo-luxe-e-commerce`, alors la structure doit être :
```
impexo-luxe-e-commerce/
├── api/                    ← À la racine du Root Directory
│   ├── test.js
│   └── woocommerce/
│       ├── [...path].js
│       └── products.js
├── vercel.json
└── src/
```

### 4. Le build ignore le dossier `api/`

Vérifiez que le dossier `api/` n'est pas dans `.gitignore` ou `.vercelignore` :

```bash
cat .gitignore | grep api
cat .vercelignore 2>/dev/null | grep api || echo "Pas de .vercelignore"
```

## Solutions

### Solution 1 : Vérifier et configurer le Root Directory

1. Dans Vercel : **Settings** → **General** → **Root Directory**
2. Si votre projet est dans `impexo-luxe-e-commerce/`, configurez-le
3. Redéployez

### Solution 2 : Vérifier que les fichiers sont commités

```bash
cd impexo-luxe-e-commerce
git add api/
git status  # Vérifiez que les fichiers sont bien ajoutés
git commit -m "Add API routes"
git push
```

### Solution 3 : Vérifier dans Vercel que les fichiers sont déployés

1. **Deployments** → Cliquez sur le dernier déploiement
2. **Functions** → Vous devriez voir :
   - `/api/test`
   - `/api/woocommerce/products`
   - `/api/woocommerce/[...path]`
3. Si vous ne les voyez pas → Les fichiers ne sont pas déployés

### Solution 4 : Tester avec `vercel dev` en local

Pour tester si les routes fonctionnent en local :

```bash
cd impexo-luxe-e-commerce
npm install -g vercel
vercel dev
```

Puis testez :
- http://localhost:3000/api/test
- http://localhost:3000/api/woocommerce/products?per_page=1

Si ça fonctionne en local mais pas en production → Problème de configuration Vercel

## Checklist

- [ ] Root Directory configuré dans Vercel
- [ ] Fichiers `api/` commités dans Git
- [ ] Dossier `api/` à la racine du Root Directory
- [ ] Dossier `api/` pas dans `.gitignore` ou `.vercelignore`
- [ ] Projet redéployé après modifications
- [ ] Variables d'environnement configurées dans Vercel

## Test rapide

Testez d'abord la route simple :
```
https://intexo.vercel.app/api/test
```

**Si ça fonctionne** → Les API Routes fonctionnent, le problème vient de la route spécifique

**Si ça ne fonctionne pas** → Les API Routes ne sont pas déployées → Vérifiez le Root Directory
