# Configuration Vercel pour le Proxy WooCommerce

Ce document explique comment configurer le proxy backend WooCommerce sur Vercel.

## 🔐 Variables d'environnement Vercel

Dans le dashboard Vercel, allez dans **Settings > Environment Variables** et ajoutez :

### Variables requises pour le proxy backend :

```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**Important** : 
- Ces variables sont utilisées **uniquement côté serveur** dans les API Routes
- Elles ne sont **jamais exposées** au frontend
- Vous pouvez aussi utiliser les préfixes `VITE_` si vous préférez garder la même convention

### Variables optionnelles pour le frontend :

```
VITE_WP_BASE_URL=https://www.impexo.fr
VITE_IMPEXO_USE_MOCKS=false
VITE_USE_WC_PROXY=true
VITE_WC_PROXY_URL=/api/woocommerce
```

## 📁 Structure des fichiers

```
impexo-luxe-e-commerce/
├── api/
│   └── woocommerce/
│       └── [...path].js          # Proxy API Route Vercel
├── vercel.json                   # Configuration Vercel
└── src/
    └── services/
        └── woocommerce.ts        # Service frontend (utilise le proxy)
```

## 🚀 Fonctionnement

1. **En développement local** :
   - Le proxy fonctionne si vous lancez `vercel dev`
   - Sinon, le code utilise directement l'API WooCommerce (mode direct)

2. **En production sur Vercel** :
   - Toutes les requêtes passent par `/api/woocommerce/*`
   - Le proxy ajoute les clés d'authentification côté serveur
   - Les clés ne sont jamais exposées au frontend

## 🔍 Test du proxy

Pour tester que le proxy fonctionne :

```bash
# En local avec Vercel CLI
vercel dev

# Puis tester :
curl http://localhost:3000/api/woocommerce/products?per_page=1
```

## 📝 Notes importantes

- Le proxy supporte les méthodes GET, POST, PUT, DELETE
- Les headers CORS sont automatiquement configurés
- Les erreurs sont loggées dans les logs Vercel
- Le proxy transmet tous les paramètres de requête à WooCommerce

## 🛠️ Dépannage

### Le proxy ne fonctionne pas

1. Vérifiez que les variables d'environnement sont bien configurées dans Vercel
2. Vérifiez les logs Vercel : `vercel logs`
3. Testez directement l'API WooCommerce pour vérifier que les clés fonctionnent

### Erreur CORS

Le proxy configure automatiquement les headers CORS. Si vous avez encore des erreurs :
- Vérifiez que `vercel.json` est bien présent
- Vérifiez que les routes `/api/*` sont bien configurées

### Mode développement

Si vous voulez désactiver le proxy en développement local, ajoutez dans `.env.local` :
```
VITE_USE_WC_PROXY=false
```
