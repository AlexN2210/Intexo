# 🔧 Résoudre le problème de sous-domaine existant

## Problème

Une entrée DNS existe déjà pour `wp.impexo.fr.yoge9230.odns.fr`. Il faut soit la supprimer, soit la modifier.

## Solutions

### Solution 1 : Supprimer l'ancienne entrée DNS

1. **Dans o2switch**, allez dans la gestion des DNS ou des sous-domaines
2. **Cherchez** l'entrée existante pour `wp.impexo.fr` ou `wp.impexo.fr.yoge9230.odns.fr`
3. **Supprimez-la**
4. **Recréez le sous-domaine** `wp.impexo.fr` avec la racine `/public_html`

### Solution 2 : Modifier l'entrée existante

1. **Dans o2switch**, cherchez l'entrée existante pour `wp.impexo.fr`
2. **Modifiez-la** pour pointer vers `/public_html`
3. **Sauvegardez**

### Solution 3 : Utiliser un autre nom de sous-domaine

Si vous ne pouvez pas supprimer/modifier l'ancienne entrée, utilisez un autre nom :

- `admin.impexo.fr`
- `wordpress.impexo.fr`
- `wpadmin.impexo.fr`

Puis suivez les mêmes étapes avec ce nouveau nom.

## Étapes après résolution

Une fois que le sous-domaine est correctement configuré :

1. ✅ **Vérifiez** que la racine pointe vers `/public_html`
2. ✅ **Configurez les DNS** chez votre registrar pour `wp.impexo.fr`
3. ✅ **Attendez la propagation DNS**
4. ✅ **Mettez à jour les URLs WordPress**

## Action immédiate

1. ✅ **Dans o2switch**, cherchez et supprimez/modifiez l'entrée existante pour `wp.impexo.fr`
2. ✅ **Recréez le sous-domaine** avec la racine `/public_html`
3. ✅ **Ou utilisez un autre nom** comme `admin.impexo.fr`

Dites-moi ce que vous choisissez et je vous guiderai pour la suite !
