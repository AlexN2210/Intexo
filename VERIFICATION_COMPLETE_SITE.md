# 🔍 Vérification complète du site

## Tests à effectuer

### Test 1 : Site principal

Testez cette URL dans votre navigateur :

```
https://www.impexo.fr
```

**Que voyez-vous ?**
- ✅ Le site s'affiche normalement ?
- ❌ Page 404 ?
- ❌ Page blanche ?
- ❌ Autre erreur ?

### Test 2 : Page d'accueil avec index.php

Testez :

```
https://www.impexo.fr/index.php
```

**Que voyez-vous ?**

### Test 3 : Vérifier les DNS

Allez sur : https://www.whatsmydns.net/#A/www.impexo.fr

**Vérifiez** que les DNS pointent bien vers o2switch.

### Test 4 : Vérifier le certificat SSL

Testez : https://www.ssllabs.com/ssltest/analyze.html?d=www.impexo.fr

**Vérifiez** que le certificat SSL est valide.

## Questions importantes

1. **Le site principal (`https://www.impexo.fr`) s'affiche-t-il toujours ?**
   - Si NON → Le problème est plus grave (DNS, serveur, etc.)
   - Si OUI → Le problème est spécifique à WordPress

2. **Quand avez-vous changé le domaine ?**
   - Aujourd'hui ?
   - Hier ?
   - Il y a combien de temps ?

3. **Avant le changement de domaine, WordPress fonctionnait-il ?**
   - Sur quel domaine était-il avant ?

## Si TOUT retourne 404

Si même le site principal retourne 404, le problème peut être :

1. **DNS pas encore propagés**
   - Les DNS peuvent prendre jusqu'à 48h pour se propager
   - Vérifiez avec https://www.whatsmydns.net/#A/www.impexo.fr

2. **Configuration du domaine dans o2switch**
   - Le domaine n'est peut-être pas correctement configuré dans o2switch
   - Contactez le support o2switch

3. **Problème de serveur**
   - Le serveur peut avoir un problème
   - Contactez le support o2switch

## Action immédiate

1. ✅ **Testez** : `https://www.impexo.fr`
   - Le site principal s'affiche-t-il ?

2. ✅ **Vérifiez les DNS** : https://www.whatsmydns.net/#A/www.impexo.fr
   - Les DNS pointent-ils vers o2switch ?

3. ✅ **Dites-moi** :
   - Le site principal fonctionne-t-il ?
   - Quand avez-vous changé le domaine ?
   - Sur quel domaine était WordPress avant ?

Avec ces informations, je pourrai mieux vous aider !
