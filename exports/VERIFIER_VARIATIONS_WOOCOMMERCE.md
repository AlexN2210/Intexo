# Guide de vérification des variations dans WooCommerce

## Problème

Les images sont mélangées entre différents produits. Cela peut venir de :
1. **Variations mal associées** aux produits parents dans WooCommerce
2. **Frontend qui ne filtre pas correctement** les variations

## Vérification dans WooCommerce

### Étape 1 : Vérifier qu'un produit a les bonnes variations

1. Allez dans **Produits > Tous les produits** dans WordPress
2. Ouvrez un produit variable (ex: "Coque Protection Caméra Renforcée")
3. Allez dans l'onglet **Variations**
4. Vérifiez que **toutes les variations affichées** appartiennent bien à ce produit

**Signes de problème** :
- Des variations avec des références qui ne sont pas dans la liste des références du produit parent
- Des variations avec des images qui ne correspondent pas au type de produit

### Étape 2 : Vérifier les IDs de variations

1. Dans l'onglet **Variations**, notez les **IDs** des variations affichées
2. Comparez avec la liste dans le champ **Référence** du produit parent
3. Chaque variation doit avoir une référence qui correspond à une référence listée dans le produit parent

### Étape 3 : Vérifier via l'API REST

Testez l'API directement :

```bash
# Remplacer YOUR_SITE_URL et les clés API
curl "https://www.impexo.fr/wp-json/wc/v3/products?slug=coque-protection-camera-renforcee-serie-iphone-17" \
  -u "ck_...:cs_..."
```

Puis récupérez les variations :

```bash
# Remplacer PRODUCT_ID par l'ID du produit
curl "https://www.impexo.fr/wp-json/wc/v3/products/PRODUCT_ID/variations" \
  -u "ck_...:cs_..."
```

Vérifiez que :
- Les variations retournées ont des références qui correspondent au produit parent
- Les images des variations correspondent aux bonnes combinaisons Modèle + Couleur

## Vérification dans le frontend

### Console du navigateur

1. Ouvrez la console (F12)
2. Allez sur une page produit
3. Regardez les logs qui commencent par `[Product X]`

Vous devriez voir :
- `🔍 Analyse de X variations reçues` : nombre de variations reçues de l'API
- `✅ Toutes les variations sont valides` ou `⚠️ X variations filtrées` : variations filtrées
- `📊 Construction de la carte Modèle → Couleurs` : construction de la carte des couleurs disponibles
- `⚠️ PLUSIEURS VARIATIONS trouvées` : si plusieurs variations correspondent à la même combinaison

### Signes de problème dans les logs

1. **"X variations filtrées"** : Des variations sont filtrées car elles n'appartiennent pas au produit
   - **Solution** : Vérifier dans WooCommerce que les variations sont bien associées au produit parent

2. **"PLUSIEURS VARIATIONS trouvées"** : Plusieurs variations correspondent à la même combinaison Modèle + Couleur
   - **Solution** : Vérifier le CSV pour s'assurer qu'il n'y a pas de doublons

3. **"AUCUNE variation trouvée"** : Aucune variation ne correspond à la sélection
   - **Solution** : Vérifier que les attributs des variations correspondent aux attributs du produit parent

## Solutions possibles

### Solution 1 : Réimporter le CSV

Si les variations sont mal associées dans WooCommerce :

1. **Supprimer** tous les produits existants
2. **Réimporter** le CSV corrigé (`woocommerce_import_corrige_final.csv`)
3. **Vérifier** que les variations sont bien associées

### Solution 2 : Corriger manuellement dans WooCommerce

1. Ouvrez chaque produit variable
2. Allez dans l'onglet **Variations**
3. **Supprimez** les variations qui n'appartiennent pas à ce produit
4. **Ajoutez** les variations manquantes

### Solution 3 : Vérifier le mapping des attributs

Dans WooCommerce, vérifiez que :
- Les attributs des variations correspondent aux attributs du produit parent
- Les noms d'attributs sont exactement les mêmes (Modèle, Couleur, Référence)
- Les valeurs d'attributs correspondent (pas de différences de casse ou d'accents)

## Test rapide

Pour tester rapidement si le problème vient de WooCommerce ou du frontend :

1. Ouvrez la console du navigateur
2. Allez sur une page produit
3. Regardez les logs `[Product X]`
4. Notez combien de variations sont reçues vs combien sont attendues
5. Notez si des variations sont filtrées

Si des variations sont filtrées, le problème vient de WooCommerce (variations mal associées).
Si aucune variation n'est filtrée mais que les images sont mélangées, le problème vient du frontend.
