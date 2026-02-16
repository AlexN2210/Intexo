# Guide de Structure CSV pour WooCommerce

## Problème identifié

Le CSV actuel mélange plusieurs références (JOJO1015-1, JOJO1015-3, etc.) dans le même produit parent, ce qui crée des variations incorrectes où des coques différentes apparaissent sur la même fiche produit.

## Structure correcte selon les consignes

### Règles principales :
1. **Chaque gamme = UNE fiche produit distincte**
2. **Les références listées sous chaque gamme sont des variantes** à intégrer dans la même fiche
3. **Attribut 1** : Modèle (iPhone 17 / 17 Air / 17 Pro / 17 Pro Max)
4. **Attribut 2** : Couleur
5. **Attribut 3** : Référence (JOJO1015-X) - pour identifier la version du produit

### Structure attendue :

```
Type: variable
SKU: impexo-camera-protection
Name: Coque Protection Caméra Renforcée – Série iPhone 17
Attribute 1 name: Modèle
Attribute 1 value(s): iPhone 17, iPhone 17 Air, iPhone 17 Pro, iPhone 17 Pro Max
Attribute 2 name: Couleur
Attribute 2 value(s): Blanc, Noir, Vert, Rose, Bleu, Rouge, Gris, Violet, Argent, Marron
Attribute 3 name: Référence
Attribute 3 value(s): JOJO1015-1, JOJO1015-3, JOJO1015-5, JOJO1015-9, JOJO1015-10, JOJO1015-13, JOJO1015-19
```

### Variations :

Chaque variation doit avoir :
- **Modèle** : Un seul modèle (ex: iPhone 17)
- **Couleur** : Une seule couleur (ex: Blanc)
- **Référence** : Une seule référence (ex: JOJO1015-1)

**Exemple de variation correcte :**
```
Type: variation
Parent: impexo-camera-protection
SKU: impexo-camera-protection--jojo1015-1--17--blanc
Attribute 1 value(s): iPhone 17
Attribute 2 value(s): Blanc
Attribute 3 value(s): JOJO1015-1
```

## Problème dans le CSV actuel

Le CSV actuel crée des variations avec des combinaisons incorrectes :
- ❌ JOJO1015-1 avec iPhone 17 Blanc
- ❌ JOJO1015-1 avec iPhone 17 Air Noir (même référence, modèles différents)
- ❌ JOJO1015-3 avec iPhone 17 Noir (référence différente, même produit)

**Résultat** : Les variations sont mélangées car chaque référence devrait avoir ses propres combinaisons Modèle + Couleur.

## Solution

Il faut créer **TOUTES les combinaisons possibles** de :
- Modèle × Couleur × Référence

Pour la gamme "CAMERA PROTECTION" :
- 4 modèles (17, 17 Air, 17 Pro, 17 Pro Max)
- 10 couleurs (selon les références disponibles)
- 7 références (JOJO1015-1, 3, 5, 9, 10, 13, 19)

**Total théorique** : 4 × 10 × 7 = 280 variations possibles

**En pratique** : Seules les combinaisons qui existent réellement doivent être créées.

## Prochaines étapes

1. Vérifier quelles combinaisons Modèle + Couleur existent réellement pour chaque référence
2. Générer un CSV avec toutes les combinaisons valides
3. S'assurer que chaque variation a une image correspondante
4. Réimporter dans WooCommerce
