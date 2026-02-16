# Diagnostic : Images mélangées entre produits

## Problème identifié

Les images affichées ne correspondent pas aux bonnes catégories de produits.

## Analyse du CSV

Le script `verifier_images_variations.py` a détecté que :
- ✅ Chaque variation a une image unique dans le CSV
- ⚠️ Les images ont des noms spécifiques au modèle (ex: `JOJO1015-24AIR.JPG` pour iPhone 17 Air)
- ⚠️ Mais la référence dans l'attribut est la référence de base (ex: `JOJO1015-24`)

**C'est normal** : les images sont spécifiques à chaque combinaison Modèle + Couleur, mais partagent la même référence de base.

## Causes possibles

### 1. WooCommerce a mélangé les images lors de l'import

**Symptôme** : Les variations ont les bonnes références, mais les images ne correspondent pas.

**Solution** :
1. Vérifier dans WooCommerce que chaque variation a la bonne image
2. Si les images sont mélangées, les corriger manuellement dans WooCommerce
3. Ou réimporter le CSV après avoir vérifié que les images sont accessibles

### 2. Les images ne sont pas accessibles

**Symptôme** : WooCommerce ne peut pas télécharger les images depuis les URLs du CSV.

**Solution** :
1. Vérifier que les URLs d'images dans le CSV sont accessibles
2. Vérifier que les images existent sur le serveur
3. Corriger les URLs si nécessaire

### 3. Le frontend sélectionne la mauvaise variation

**Symptôme** : Les logs montrent que plusieurs variations correspondent à la même combinaison Modèle + Couleur.

**Solution** :
- Le code frontend a été amélioré pour mieux filtrer les variations
- Les logs de débogage permettent de voir quelle variation est sélectionnée

## Vérification dans WooCommerce

1. Allez dans **Produits > Tous les produits**
2. Ouvrez un produit variable (ex: "Coque Luxury Transparente")
3. Allez dans l'onglet **Variations**
4. Pour chaque variation, vérifiez que :
   - La référence correspond à l'attribut "Référence"
   - L'image correspond à la combinaison Modèle + Couleur
   - L'image n'est pas mélangée avec une autre variation

## Vérification dans le frontend

Ouvrez la console du navigateur (F12) et regardez les logs :

```
[Product X] ✅ Image sélectionnée pour iPhone 17 + Argent:
  → Image: JOJO1015-24-scaled.jpg
  → Référence: JOJO1015-24
  → Modèle: iPhone 17, Couleur: Argent
```

Si vous voyez des avertissements `⚠️ INCOHERENCE DETECTEE`, cela signifie que l'image ne correspond pas à la référence attendue.

## Solutions

### Solution 1 : Vérifier et corriger dans WooCommerce

1. Ouvrez chaque produit variable dans WooCommerce
2. Vérifiez que chaque variation a la bonne image
3. Corrigez manuellement si nécessaire

### Solution 2 : Réimporter le CSV

1. Supprimez tous les produits existants
2. Vérifiez que toutes les images sont accessibles
3. Réimportez le CSV corrigé

### Solution 3 : Vérifier les URLs d'images

Le script `verifier_images_variations.py` peut être modifié pour vérifier que toutes les URLs d'images sont accessibles.

## Prochaines étapes

1. Vérifier dans WooCommerce que les variations ont les bonnes images
2. Regarder les logs de la console pour voir quelle image est sélectionnée
3. Si les images sont mélangées dans WooCommerce, les corriger manuellement ou réimporter
