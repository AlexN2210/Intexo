# Fix : Sélection par série (SKU) pour résoudre les ambiguïtés de variations

## Problème identifié

Le produit "Coque Luxury Transparente – Série iPhone 17" a 8 variations regroupées en deux séries (JOJO1015-24 et JOJO1015-25). Le frontend identifiait chaque variation uniquement par **Modèle + Couleur**, ce qui causait des ambiguïtés :

**Exemple :**
- Variation 1901 : iPhone 17 + Argent + JOJO1015-24
- Variation 1905 : iPhone 17 + Argent + JOJO1015-25

Quand l'utilisateur sélectionnait "iPhone 17 + Argent", le code trouvait **deux variations** et ne savait pas laquelle afficher → Warning "PLUSIEURS VARIATIONS trouvées".

## Solution implémentée

### ✅ Ajout du SKU comme troisième dimension de sélection

**Avant :** Modèle × Couleur (2 dimensions)
**Après :** Modèle × Couleur × Série (3 dimensions)

La série est extraite depuis le **SKU** (référence produit) de chaque variation.

### Modifications apportées

#### 1. Type `WooVariation` mis à jour

**Fichier :** `src/types/woocommerce.ts`

```typescript
export type WooVariation = {
  // ... autres propriétés
  sku?: string; // SKU (référence produit) pour identifier la série
};
```

#### 2. Extraction des séries disponibles

**Fichier :** `src/pages/Product.tsx`

- Fonction `extractSeriesFromSku()` : extrait la série depuis le SKU
- `availableSeries` : liste toutes les séries disponibles depuis les variations
- Fallback : utilise la référence dans les attributs si le SKU n'est pas disponible

#### 3. Filtrage des variations par série

- `filteredVariationsBySeries` : filtre les variations selon la série sélectionnée
- `availableColorsByModel` : utilise les variations filtrées par série
- `matchedVariation` : inclut la série dans le matching

#### 4. Interface utilisateur

- **Sélecteur de série** : affiché uniquement si plusieurs séries sont disponibles (> 1)
- **Affichage de la variation** : inclut maintenant la série dans l'affichage
- **Réinitialisation automatique** : la couleur est réinitialisée si elle n'est plus disponible pour la série sélectionnée

## Fonctionnement

### Exemple concret

**Produit :** Coque Luxury Transparente – Série iPhone 17
**Séries disponibles :** JOJO1015-24, JOJO1015-25

**Sélection utilisateur :**
1. Série : JOJO1015-24
2. Modèle : iPhone 17
3. Couleur : Argent

**Résultat :**
- ✅ Une seule variation trouvée : Variation 1901
- ✅ Plus d'ambiguïté
- ✅ Affichage correct

### Logique de matching

```typescript
const matching = varsToUse.filter((v) => {
  const modelMatch = m && norm(m) === norm(selected.model);
  const colorMatch = c && norm(c) === norm(selected.color);
  
  // Vérification de la série si sélectionnée
  let seriesMatch = true;
  if (selected.series) {
    const sku = v.sku;
    seriesMatch = sku ? extractSeriesFromSku(sku) === selected.series : false;
  }
  
  return modelMatch && colorMatch && seriesMatch;
});
```

## Avantages

1. **Résout les ambiguïtés** : Plus de warning "PLUSIEURS VARIATIONS trouvées"
2. **Pas de modification WooCommerce** : Solution côté frontend uniquement
3. **UX améliorée** : L'utilisateur peut choisir explicitement la série/design
4. **Rétrocompatible** : Fonctionne même si une seule série est disponible (sélecteur masqué)

## Fichiers modifiés

- ✅ `src/types/woocommerce.ts` - Ajout du champ `sku` à `WooVariation`
- ✅ `src/pages/Product.tsx` - Logique de sélection par série complète

## Test

1. Ouvrir un produit avec plusieurs séries (ex: Coque Luxury Transparente)
2. Vérifier que le sélecteur "Série / Design" apparaît
3. Sélectionner une série, un modèle et une couleur
4. Vérifier qu'une seule variation est trouvée (pas de warning)
5. Vérifier que l'affichage inclut la série : "JOJO1015-24 • iPhone 17 • Argent"

## Notes

- Le sélecteur de série n'apparaît que si plusieurs séries sont disponibles
- Si une seule série existe, le comportement reste identique à avant (pas de sélecteur)
- La série est extraite depuis le SKU, avec fallback sur la référence dans les attributs
- La sélection de série peut être passée via l'URL : `?series=JOJO1015-24`
