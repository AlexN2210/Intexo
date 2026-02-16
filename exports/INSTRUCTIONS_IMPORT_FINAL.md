# Instructions d'import WooCommerce - CSV Final

## Fichier à utiliser

**`woocommerce_import_corrige_final.csv`**

Ce fichier contient :
- ✅ Tous les conflits résolus (une seule variation par combinaison Modèle + Couleur)
- ✅ Toutes les URLs d'images corrigées (www.impexo.fr au lieu de TON-DOMAINE.TLD)
- ✅ 8 produits parents (variables)
- ✅ 79 variations (sans conflits)

## Mapping des colonnes dans WooCommerce

Lors de l'import, utilisez ce mapping :

| Colonne CSV | Mapper à | Notes |
|------------|---------|-------|
| **Type** | `Type` | variable ou variation |
| **SKU** | `UGS` | Identifiant unique |
| **Name** | `Nom` | Nom du produit |
| **Parent** | `Parent` | SKU du parent (pour variations) |
| **Published** | `Publié` | 1 = publié |
| **Regular price** | `Tarif régulier` | Prix en euros |
| **Attribute 1 name** | `Nom de l'attribut` | "Modèle" |
| **Attribute 1 value(s)** | `Valeur(s) de l'attribut` | Liste des modèles |
| **Attribute 1 visible** | `Visibilité de l'attribut` | 1 = visible |
| **Attribute 1 global** | `Est-ce un attribut global ?` | **0** (attribut personnalisé) |
| **Attribute 2 name** | `Nom de l'attribut` | "Couleur" |
| **Attribute 2 value(s)** | `Valeur(s) de l'attribut` | Liste des couleurs |
| **Attribute 2 visible** | `Visibilité de l'attribut` | 1 = visible |
| **Attribute 2 global** | `Est-ce un attribut global ?` | **0** (attribut personnalisé) |
| **Attribute 3 name** | `Nom de l'attribut` | "Référence" |
| **Attribute 3 value(s)** | `Valeur(s) de l'attribut` | Liste des références |
| **Attribute 3 visible** | `Visibilité de l'attribut` | 1 = visible |
| **Attribute 3 global** | `Est-ce un attribut global ?` | **0** (attribut personnalisé) |
| **Short description** | `Description courte` | Texte court |
| **Description** | `Description` | Description complète |
| **Images** | `Images` | URL de l'image |
| **material** | `Ne pas importer` | Colonne non utilisée |

## Points importants

### 1. Attributs globaux = 0
**IMPORTANT** : Pour tous les attributs (1, 2, 3), le champ "Est-ce un attribut global ?" doit être mappé à **0** (attribut personnalisé), pas à une taxonomie globale.

### 2. Vérification des images
Les URLs sont maintenant au format :
```
https://www.impexo.fr/wp-content/uploads/impexo/JOJO1015-1P.JPG
```

**Assurez-vous que** :
- Les fichiers images existent bien sur votre serveur WordPress
- Le chemin `/wp-content/uploads/impexo/` existe
- Les fichiers ont les bons noms (JOJO1015-1P.JPG, etc.)

### 3. Si les images ne sont pas encore uploadées

**Option A** : Uploader les images d'abord
1. Allez dans WordPress > Médias
2. Créez le dossier `impexo` dans `wp-content/uploads/`
3. Uploadez toutes les images
4. Puis importez le CSV

**Option B** : Modifier le CSV pour ne pas importer les images maintenant
1. Ouvrez le CSV dans Excel/LibreOffice
2. Supprimez ou videz la colonne "Images" pour les produits parents
3. Importez le CSV
4. Ajoutez les images manuellement après l'import

## Étapes d'import

1. **Téléversez** `woocommerce_import_corrige_final.csv` dans WooCommerce
2. **Mappez** les colonnes selon le tableau ci-dessus
3. **Vérifiez** que "Est-ce un attribut global ?" = **0** pour tous les attributs
4. **Lancez** l'importation
5. **Vérifiez** les produits importés dans Produits > Tous les produits

## Après l'import

1. **Vérifiez les produits** :
   - Ouvrez chaque produit variable
   - Vérifiez que toutes les variations sont présentes
   - Vérifiez qu'il n'y a pas de doublons Modèle + Couleur

2. **Vérifiez les images** :
   - Si les images ne s'affichent pas, vérifiez que les fichiers existent sur le serveur
   - Les URLs doivent pointer vers des fichiers accessibles

3. **Testez le frontend** :
   - Allez sur votre site React
   - Sélectionnez un modèle et une couleur
   - Vérifiez qu'une seule variation s'affiche (pas de mélange)

## Résolution de problèmes

### Erreur "URL fournie n'est pas valide"
- Vérifiez que les fichiers images existent sur le serveur
- Vérifiez que le chemin est correct : `/wp-content/uploads/impexo/`
- Vérifiez que les noms de fichiers correspondent exactement

### Variations manquantes
- Vérifiez que le champ "Parent" correspond exactement au SKU du produit parent
- Vérifiez que les attributs des variations correspondent aux attributs du parent

### Combinaisons encore mélangées
- Assurez-vous d'utiliser `woocommerce_import_corrige_final.csv` (pas l'ancien fichier)
- Vérifiez qu'il n'y a pas de doublons dans le CSV
