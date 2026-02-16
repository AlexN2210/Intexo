# ✅ Checklist de Déploiement WordPress Headless

Suivez cette checklist pour finaliser la configuration.

## 🔧 Configuration Vercel (OBLIGATOIRE)

### 1. Variables d'environnement dans Vercel

Allez dans **Vercel Dashboard > Votre Projet > Settings > Environment Variables**

Ajoutez pour **Production**, **Preview** et **Development** :

```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38
WC_CONSUMER_SECRET=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3
```

**Optionnel** (pour le frontend) :
```
VITE_WP_BASE_URL=https://www.impexo.fr
VITE_IMPEXO_USE_MOCKS=false
VITE_USE_WC_PROXY=true
```

- [ ] Variables ajoutées dans Vercel

## 🧪 Tests Locaux

### 2. Test avec Vercel CLI

```bash
cd impexo-luxe-e-commerce
npm run dev:vercel
# ou directement: vercel dev
```

Puis testez : http://localhost:3000/api/woocommerce/products?per_page=1

- [ ] Proxy fonctionne en local avec `vercel dev`
- [ ] Les produits s'affichent dans l'application

### 3. Test direct (sans proxy)

Si vous préférez tester avec `npm run dev` :

```bash
npm run dev
```

Modifiez temporairement `.env.local` :
```env
VITE_USE_WC_PROXY=false
```

- [ ] Application fonctionne avec `npm run dev` (mode direct)

## 🚀 Déploiement

### 4. Déployer sur Vercel

**Option A : Via CLI**
```bash
vercel
```

**Option B : Via Git**
- Connectez votre repo GitHub/GitLab à Vercel
- Vercel déploiera automatiquement à chaque push

- [ ] Application déployée sur Vercel

### 5. Vérification Post-Déploiement

1. **Test du proxy** :
   ```
   https://votre-domaine.vercel.app/api/woocommerce/products?per_page=1
   ```
   Devrait retourner du JSON avec des produits.

2. **Test de l'application** :
   - Visitez votre site déployé
   - Vérifiez la page d'accueil
   - Vérifiez la page boutique
   - Vérifiez une page produit
   - Testez la recherche

- [ ] Proxy fonctionne en production
- [ ] Page d'accueil affiche les produits
- [ ] Page boutique fonctionne
- [ ] Pages produit fonctionnent
- [ ] Recherche fonctionne

## 🔍 Vérifications WordPress

### 6. Configuration WordPress/WooCommerce

- [ ] WooCommerce est installé et activé
- [ ] API REST WooCommerce est accessible
- [ ] Clés API sont valides et ont les bonnes permissions
- [ ] CORS est configuré (si nécessaire)

## 📊 Résultat Final

Une fois toutes les étapes complétées :

✅ Les produits sont récupérés depuis WooCommerce  
✅ Les clés API sont protégées côté serveur  
✅ L'application fonctionne en production  
✅ Le mode headless est opérationnel  

## 🆘 En Cas de Problème

1. **Vérifiez les logs Vercel** : `vercel logs`
2. **Vérifiez les variables d'environnement** dans le dashboard
3. **Testez l'API WooCommerce directement** avec les clés
4. **Vérifiez la console du navigateur** pour les erreurs frontend

---

**Prochaine étape** : Une fois tout vérifié, votre application est prête pour la production ! 🎉
