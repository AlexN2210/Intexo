# Problème : Variations mélangées dans le CSV

## Diagnostic

Le problème vient du fait que le CSV crée **plusieurs variations avec la même combinaison Modèle + Couleur** mais avec des **références différentes**.

### Exemple du problème :

Pour le produit "CAMERA PROTECTION", le CSV crée :
- Variation 1 : JOJO1015-1 + iPhone 17 + Blanc
- Variation 2 : JOJO1015-3 + iPhone 17 + Noir  
- Variation 3 : JOJO1015-5 + iPhone 17 + Argent
- etc.

**Mais** si plusieurs références ont la même combinaison Modèle + Couleur, alors :
- JOJO1015-1 + iPhone 17 + Noir
- JOJO1015-3 + iPhone 17 + Noir  ← **CONFLIT !**

Quand l'utilisateur sélectionne "iPhone 17" + "Noir", le système retourne plusieurs variations, ce qui cause le mélange.

## Solution recommandée

### Option 1 : S'assurer qu'une combinaison Modèle + Couleur n'existe qu'UNE SEULE FOIS

Chaque combinaison Modèle + Couleur doit être unique dans le CSV. Si plusieurs références ont la même combinaison, choisir une seule référence principale.

### Option 2 : Ajouter un sélecteur de référence dans l'interface

Si plusieurs références partagent la même combinaison Modèle + Couleur, ajouter un troisième sélecteur pour la référence.

### Option 3 : Créer des produits séparés par référence

Si les références sont vraiment différentes (designs différents), créer des produits séparés au lieu de variations.

## Vérification du CSV actuel

Pour vérifier s'il y a des conflits dans le CSV actuel :

1. Extraire toutes les combinaisons Modèle + Couleur pour chaque produit parent
2. Identifier les doublons
3. Corriger en gardant une seule variation par combinaison

## Action immédiate

Le code frontend a été amélioré pour mieux filtrer les variations, mais le problème principal vient du CSV. Il faut :

1. **Vérifier le CSV** pour s'assurer qu'il n'y a pas de doublons Modèle + Couleur
2. **Réimporter dans WooCommerce** avec un CSV corrigé
3. **Tester** que chaque combinaison Modèle + Couleur retourne une seule variation

## Note importante

Selon les consignes :
- Chaque gamme = UNE fiche produit
- Les références sont des variantes dans la même fiche
- Attribut 1 : Modèle
- Attribut 2 : Couleur

**Mais** si plusieurs références ont exactement la même combinaison Modèle + Couleur, il faut soit :
- Choisir une seule référence principale
- Ajouter la référence comme attribut de sélection dans l'interface
- Créer des produits séparés
