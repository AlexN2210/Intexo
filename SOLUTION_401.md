# 🔧 Solution Complète : Erreur 401 "vous ne pouvez pas lister les ressources"

## 🔴 Problème Principal

L'erreur `401 — "Désolé, vous ne pouvez pas lister les ressources"` signifie que les **clés API WooCommerce n'ont pas les permissions de lecture**.

## ✅ Solution Immédiate : Vérifier les Permissions dans WooCommerce

### Étape 1 : Accéder aux Clés API dans WordPress

1. Connectez-vous à votre WordPress : `https://www.impexo.fr/wp-admin`
2. Allez dans **WooCommerce > Réglages > Avancé > REST API**
3. Cherchez la clé avec la description qui contient votre clé client ou créez-en une nouvelle

### Étape 2 : Vérifier/Modifier les Permissions

Pour chaque clé API, les permissions doivent être :

✅ **Lecture/Écriture** (Read/Write) - **RECOMMANDÉ**  
OU au minimum  
✅ **Lecture** (Read) - **OBLIGATOIRE**

### Étape 3 : Si vous ne pouvez pas modifier les permissions

**Créez une nouvelle clé API** :

1. Dans **WooCommerce > Réglages > Avancé > REST API**
2. Cliquez sur **"Ajouter une clé"**
3. Remplissez :
   - **Description** : `Frontend React - Impexo`
   - **Utilisateur** : Sélectionnez un utilisateur **Administrateur**
   - **Permissions** : **Lecture/Écriture** (ou au minimum **Lecture**)
4. Cliquez sur **"Générer une clé API"**
5. **Copiez immédiatement** :
   - La **Clé client** (Consumer Key)
   - Le **Secret client** (Consumer Secret)

### Étape 4 : Mettre à jour les Variables dans Vercel

1. Allez dans **Vercel Dashboard > Votre Projet > Settings > Environment Variables**
2. Mettez à jour ou ajoutez :

```
WP_BASE_URL=https://www.impexo.fr
WC_CONSUMER_KEY=NOUVELLE_CLE_CLIENT
WC_CONSUMER_SECRET=NOUVEAU_SECRET_CLIENT
```

3. Pour le frontend (si vous utilisez l'API directe en fallback) :

```
VITE_WC_CONSUMER_KEY=NOUVELLE_CLE_CLIENT
VITE_WC_CONSUMER_SECRET=NOUVEAU_SECRET_CLIENT
```

4. **Redéployez** le projet

## 🧪 Test des Permissions

Testez directement l'API avec les nouvelles clés :

```
https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=VOTRE_NOUVELLE_CLE&consumer_secret=VOTRE_NOUVEAU_SECRET&per_page=1
```

**Résultat attendu :**
- ✅ **JSON avec produits** : Les permissions sont correctes
- ❌ **401 Error** : Les permissions ne sont toujours pas correctes → Vérifiez à nouveau dans WooCommerce

## 🔍 Vérifications Supplémentaires

### Vérifier l'Utilisateur Associé

La clé API doit être associée à un utilisateur avec les droits suffisants :

1. Allez dans **Utilisateurs** dans WordPress
2. Vérifiez que l'utilisateur associé à la clé API a le rôle **Administrateur** ou **Éditeur**

### Vérifier que WooCommerce est Actif

1. Allez dans **Extensions** dans WordPress
2. Vérifiez que **WooCommerce** est **activé**

## 📋 Checklist Complète

- [ ] Connecté à WordPress en tant qu'administrateur
- [ ] Accès à WooCommerce > Réglages > Avancé > REST API
- [ ] Clé API trouvée ou nouvelle clé créée
- [ ] Permissions vérifiées : **Lecture** au minimum
- [ ] Utilisateur associé a les droits administrateur
- [ ] Test de l'API directe réussi avec les nouvelles clés
- [ ] Variables mises à jour dans Vercel
- [ ] Projet redéployé sur Vercel
- [ ] Test du site : les produits s'affichent

## 🚨 Solution Temporaire : Désactiver le Proxy

Si vous voulez tester rapidement sans le proxy :

Dans Vercel, ajoutez/modifiez :
```
VITE_USE_WC_PROXY=false
```

Cela utilisera directement l'API WooCommerce (les clés seront visibles dans le code frontend, mais ça fonctionnera pour tester).

---

**Important** : Une fois les permissions corrigées dans WooCommerce, l'erreur 401 devrait disparaître et les produits devraient s'afficher correctement.
