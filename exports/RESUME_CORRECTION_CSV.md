# Résumé de la correction du CSV

## Problème identifié

Le CSV original contenait **13 conflits** où plusieurs références différentes partageaient la même combinaison **Modèle + Couleur** pour le même produit parent.

### Exemples de conflits détectés :

1. **impexo-camera-protection** :
   - iPhone 17 Air + Noir → 2 variations (JOJO1015-1, JOJO1015-5)
   - iPhone 17 Pro Max + Rose → 2 variations (JOJO1015-1, JOJO1015-5)
   - iPhone 17 + Noir → 4 variations (JOJO1015-3, JOJO1015-9, JOJO1015-10, JOJO1015-13)
   - iPhone 17 Air + Bleu → 2 variations (JOJO1015-3, JOJO1015-10)
   - iPhone 17 Pro + Rouge → 2 variations (JOJO1015-3, JOJO1015-19)
   - iPhone 17 Pro + Bleu → 2 variations (JOJO1015-5, JOJO1015-9)
   - iPhone 17 Pro Max + Violet → 2 variations (JOJO1015-10, JOJO1015-19)

2. **impexo-transparent** :
   - iPhone 17 + Transparent → 2 variations (JOJO1015-2, JOJO1015-4)

3. **impexo-luxury-transparent** :
   - iPhone 17 + Argent → 2 variations (JOJO1015-24, JOJO1015-25)

4. **impexo-magnetic** :
   - iPhone 17 + Noir → 2 variations (JOJO1015-6, JOJO1015-11)

5. **impexo-pc-tpu** :
   - iPhone 17 + Noir → 2 variations (JOJO1015-7, JOJO1015-8, JOJO1015-14, JOJO1015-17)
   - iPhone 17 Pro + Rose → 2 variations (JOJO1015-7, JOJO1015-14, JOJO1015-17, JOJO1015-20)
   - iPhone 17 Pro Max + Violet → 2 variations (JOJO1015-7, JOJO1015-8, JOJO1015-17, JOJO1015-20)

## Solution appliquée

Pour chaque conflit, **seule la première variation** (dans l'ordre du CSV) a été conservée. Les autres variations en conflit ont été supprimées.

### Résultats :

- **CSV original** : 98 variations
- **CSV corrigé** : 79 variations
- **Variations supprimées** : 19

## Fichiers générés

1. **`woocommerce_import_corrige.csv`** : CSV corrigé sans conflits
2. **`fix_csv_conflicts.py`** : Script Python pour détecter et corriger les conflits

## Prochaines étapes

1. **Vérifier le CSV corrigé** manuellement pour s'assurer que les bonnes références ont été conservées
2. **Réimporter dans WooCommerce** en utilisant `woocommerce_import_corrige.csv`
3. **Tester** que chaque combinaison Modèle + Couleur retourne une seule variation

## Note importante

Si certaines références supprimées doivent être conservées (par exemple, si elles ont des prix ou des matériaux différents), il faudra :

1. Modifier le script pour choisir la référence à conserver selon des critères spécifiques (prix, matériau, etc.)
2. OU créer des produits séparés pour les références qui sont vraiment différentes
3. OU ajouter un sélecteur de référence dans l'interface frontend

## Utilisation du script

Pour régénérer le CSV corrigé :

```bash
cd exports
python fix_csv_conflicts.py
```

Le script analysera `woocommerce_import.csv` et créera `woocommerce_import_corrige.csv`.
