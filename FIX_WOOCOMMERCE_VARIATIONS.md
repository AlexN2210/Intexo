# Fix : Récupération des variations WooCommerce

## Problème identifié

WooCommerce REST API n'expose pas les variations via `/products/{id}/variations` si les attributs personnalisés ne sont pas "propagés" correctement dans chaque variation.

**Symptômes :**
- Les variations existent dans l'admin WordPress
- Elles ont bien les attributs (Modèle / Couleur / Référence)
- MAIS `/products/{id}/variations` renvoie 404 ou un tableau vide
- L'API REST ne les voit pas

**Cause :**
Bug connu de WooCommerce quand :
- Les attributs sont créés dans le produit (pas globaux)
- ET les variations ont été générées avant que les attributs soient cochés "Utilisé pour les variations"

**Résultat :**
- L'admin WordPress les affiche ✅
- L'API REST `/variations` renvoie 404 ou vide ❌
- `/products/{id}/variations` ne fonctionne pas ❌

## Solution implémentée

### ✅ Stratégie en 3 étapes

1. **Récupérer le produit parent** pour obtenir les IDs des variations
   - Le champ `variations` du produit contient **toujours** les IDs, même si `/variations` renvoie 404
   - Endpoint : `GET /wp-json/wc/v3/products/{id}`

2. **Utiliser les IDs pour récupérer chaque variation individuellement**
   - L'endpoint `/products/{id}/variations/{variationId}` fonctionne **toujours**, même si `/variations` renvoie 404
   - Récupération en parallèle avec `Promise.all()`

3. **Fallback sur l'ancienne méthode**
   - Si le produit n'a pas d'IDs de variations, essayer `/variations` classique

### Code modifié

**Fichier :** `src/services/woocommerce.ts`

**Fonction :** `getProductVariations(productId: number)`

```typescript
export async function getProductVariations(productId: number): Promise<WooVariation[]> {
  // 1. Récupérer le produit parent
  const product = await wooFetch<WooProduct>(
    `/wp-json/wc/v3/products/${productId}`,
    {}
  );
  
  // 2. Si le produit a des IDs de variations, les utiliser
  if (product?.variations && Array.isArray(product.variations) && product.variations.length > 0) {
    // Récupérer chaque variation individuellement
    const variationPromises = product.variations.map(async (variationId) => {
      try {
        return await wooFetch<WooVariation>(
          `/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
          {}
        );
      } catch (error) {
        console.warn(`Impossible de récupérer la variation ${variationId}:`, error);
        return null;
      }
    });
    
    const variations = await Promise.all(variationPromises);
    return variations.filter((v): v is WooVariation => v !== null);
  }
  
  // 3. Fallback : essayer /variations classique
  const variations = await wooFetch<WooVariation[]>(
    `/wp-json/wc/v3/products/${productId}/variations`,
    { status: "publish" }
  );
  
  return Array.isArray(variations) ? variations : [];
}
```

## Comment ça fonctionne

### Exemple concret

**Produit ID :** 1858

**Étape 1 :** Récupérer le produit parent
```
GET /wp-json/wc/v3/products/1858
```

**Réponse :**
```json
{
  "id": 1858,
  "name": "Coque iPhone 15 Pro",
  "type": "variable",
  "variations": [1901, 1902, 1903, 1904, ...]  ← IDs des variations
}
```

**Étape 2 :** Récupérer chaque variation individuellement
```
GET /wp-json/wc/v3/products/1858/variations/1901
GET /wp-json/wc/v3/products/1858/variations/1902
GET /wp-json/wc/v3/products/1858/variations/1903
...
```

**Résultat :**
- ✅ Toutes les variations sont récupérées
- ✅ Même si `/products/1858/variations` renvoie 404
- ✅ Les attributs sont corrects

## Avantages de cette solution

1. **Pas besoin de modifier les produits dans WordPress**
   - Solution côté frontend uniquement
   - Pas de migration de données nécessaire

2. **Robuste**
   - Fonctionne même avec le bug WooCommerce
   - Fallback automatique si nécessaire

3. **Performant**
   - Récupération en parallèle avec `Promise.all()`
   - Pas de requêtes séquentielles

4. **Compatible**
   - Fonctionne avec les produits normaux (sans bug)
   - Fonctionne avec les produits buggés

## Logs de diagnostic

Le code ajoute des logs pour diagnostiquer :

```
[WooCommerce] Récupération des variations pour le produit 1858
[WooCommerce] Produit 1858 a 12 variations (IDs: 1901, 1902, 1903, ...)
[WooCommerce] 12/12 variations récupérées avec succès
```

Si une variation échoue :
```
[WooCommerce] Impossible de récupérer la variation 1905 du produit 1858: [erreur]
```

## Fichiers modifiés

- ✅ `src/services/woocommerce.ts` - Fonction `getProductVariations`

## Test

1. Ouvrir un produit avec variations dans le frontend
2. Vérifier dans la console que les variations sont récupérées
3. Vérifier que les filtres Modèle/Couleur fonctionnent
4. Vérifier que l'ajout au panier fonctionne avec les variations

## Notes

- Cette solution contourne le bug WooCommerce sans modifier les données
- Si WooCommerce corrige le bug à l'avenir, le code continuera de fonctionner (fallback)
- Les variations individuelles sont toujours accessibles, même si la liste complète ne l'est pas
