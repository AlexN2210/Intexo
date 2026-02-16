# 🔧 Solution : Erreur 401 "vous ne pouvez pas lister les ressources"

## 🔴 Problème

L'erreur `401 — "Désolé, vous ne pouvez pas lister les ressources"` signifie que les clés API WooCommerce n'ont **pas les bonnes permissions**.

## ✅ Solution : Vérifier les Permissions des Clés API

### Étape 1 : Connectez-vous à WordPress

1. Allez sur `https://www.impexo.fr/wp-admin`
2. Connectez-vous avec vos identifiants administrateur

### Étape 2 : Accédez aux Clés API

1. Allez dans **WooCommerce > Réglages > Avancé > REST API**
2. Trouvez la clé API avec la description correspondante à :
   - Clé client : `ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`

### Étape 3 : Vérifiez les Permissions

Les clés API doivent avoir les permissions suivantes :

✅ **Lecture** (Read) - OBLIGATOIRE pour lister les produits  
✅ **Écriture** (Write) - Optionnel, mais recommandé si vous voulez créer des commandes

### Étape 4 : Modifier les Permissions

1. Cliquez sur la clé API
2. Dans la section **Permissions**, sélectionnez :
   - **Lecture/Écriture** (Read/Write) - Recommandé
   - OU au minimum **Lecture** (Read) - Minimum requis

3. Cliquez sur **Enregistrer**

### Étape 5 : Régénérer les Clés (si nécessaire)

Si les permissions ne peuvent pas être modifiées, vous pouvez créer une nouvelle clé API :

1. Dans **WooCommerce > Réglages > Avancé > REST API**
2. Cliquez sur **Ajouter une clé**
3. Description : `Frontend React - Impexo`
4. Utilisateur : Sélectionnez un utilisateur administrateur
5. Permissions : **Lecture/Écriture**
6. Cliquez sur **Générer une clé API**

7. **Copiez les nouvelles clés** et mettez à jour dans Vercel :
   - `WC_CONSUMER_KEY` (la nouvelle clé client)
   - `WC_CONSUMER_SECRET` (le nouveau secret client)

## 🔍 Vérification

Testez directement l'API avec les clés :

```
https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=VOTRE_CLE&consumer_secret=VOTRE_SECRET&per_page=1
```

Si vous voyez du JSON avec des produits → Les permissions sont correctes ✅

## 📋 Checklist

- [ ] Connecté à WordPress en tant qu'administrateur
- [ ] Accès à WooCommerce > Réglages > Avancé > REST API
- [ ] Clé API trouvée avec `ck_374c0ec78039fd4115f44238dae84ac7cb31cd38`
- [ ] Permissions vérifiées (au minimum "Lecture")
- [ ] Permissions modifiées si nécessaire
- [ ] Test de l'API directe réussi
- [ ] Variables mises à jour dans Vercel si nouvelles clés générées
- [ ] Redéploiement effectué

---

**Note** : Si vous ne pouvez pas modifier les permissions de la clé existante, créez une nouvelle clé API avec les bonnes permissions.
