# 🔧 Solution : WordPress REST API retourne 404

## Problème

Les erreurs 404 sur `/wp-json/` et `/wp-json/wc/v3/products` indiquent que **WordPress REST API n'est pas accessible**.

## Causes possibles

### 1. WordPress REST API est désactivée par un plugin

Certains plugins de sécurité désactivent WordPress REST API.

### 2. Règles `.htaccess` bloquent `/wp-json/`

Des règles dans `.htaccess` peuvent bloquer l'accès à l'API.

### 3. Permalinks WordPress ne sont pas configurés

Si les permalinks ne sont pas configurés, l'API peut ne pas fonctionner.

### 4. WooCommerce n'est pas installé/activé

Si WooCommerce n'est pas installé, `/wp-json/wc/v3/` n'existera pas.

## Solutions

### Solution 1 : Vérifier que WooCommerce est installé et activé

1. Connectez-vous à WordPress admin : `https://www.impexo.fr/wp-admin`
2. Allez dans **Plugins** → **Plugins installés**
3. Vérifiez que **WooCommerce** est installé et **activé**

### Solution 2 : Vérifier les plugins de sécurité

Certains plugins de sécurité désactivent WordPress REST API :

**Plugins à vérifier :**
- Wordfence Security
- iThemes Security
- All In One WP Security
- Disable REST API
- Remove REST API

**Solution :**
1. Allez dans **Plugins** → **Plugins installés**
2. Cherchez les plugins de sécurité
3. Désactivez temporairement les plugins de sécurité un par un
4. Testez `/wp-json/` après chaque désactivation
5. Une fois le plugin problématique identifié, configurez-le pour autoriser l'API REST

### Solution 3 : Réactiver WordPress REST API avec du code

Ajoutez ce code dans `functions.php` de votre thème (ou créez un plugin muet) :

```php
<?php
// Réactiver WordPress REST API
add_filter('rest_authentication_errors', function($result) {
    // Si l'utilisateur est déjà authentifié, pas de problème
    if (!empty($result)) {
        return $result;
    }
    
    // Autoriser l'accès à l'API REST pour tous (y compris non authentifiés)
    return true;
}, 20);
```

**Comment ajouter ce code :**
1. Connectez-vous à WordPress admin
2. Allez dans **Apparence** → **Éditeur de thème** → **functions.php**
3. Ajoutez le code à la fin du fichier
4. Cliquez sur **"Mettre à jour le fichier"**

### Solution 4 : Vérifier le fichier `.htaccess`

Le fichier `.htaccess` peut bloquer l'accès à `/wp-json/`.

**Vérification :**
1. Connectez-vous à votre serveur via FTP ou cPanel
2. Ouvrez le fichier `.htaccess` à la racine de WordPress
3. Cherchez des règles qui bloquent `/wp-json/` ou `/wp-json`

**Si vous trouvez des règles qui bloquent `/wp-json/` :**
- Commentez-les (ajoutez `#` au début de la ligne)
- Ou modifiez-les pour autoriser `/wp-json/`

**Exemple de règle problématique :**
```apache
# ❌ Bloque l'API REST
RewriteRule ^wp-json - [F,L]
```

**Solution :**
```apache
# ✅ Autorise l'API REST
# RewriteRule ^wp-json - [F,L]  (commenté)
```

### Solution 5 : Réinitialiser les permalinks WordPress

Parfois, réinitialiser les permalinks peut résoudre le problème :

1. Connectez-vous à WordPress admin
2. Allez dans **Réglages** → **Permaliens**
3. Cliquez sur **"Enregistrer les modifications"** (même sans rien changer)
4. Testez `/wp-json/` à nouveau

### Solution 6 : Vérifier que WordPress REST API est activée

Testez cette URL dans votre navigateur :

```
https://www.impexo.fr/wp-json/wp/v2/
```

**Résultat attendu :** JSON avec les routes disponibles (posts, pages, etc.)

**Si vous obtenez toujours 404 :**
→ WordPress REST API est complètement désactivée. Utilisez la Solution 3 pour la réactiver.

## Diagnostic étape par étape

### Étape 1 : Vérifier WooCommerce

1. Connectez-vous à WordPress admin
2. Vérifiez que WooCommerce est installé et activé
3. Allez dans **WooCommerce** → **Settings** → **Advanced** → **REST API**
4. Vérifiez qu'il y a des clés API créées

### Étape 2 : Tester WordPress REST API de base

Testez : `https://www.impexo.fr/wp-json/wp/v2/`

**Si ça fonctionne :**
→ WordPress REST API fonctionne, mais WooCommerce REST API ne fonctionne pas.

**Si ça ne fonctionne pas :**
→ WordPress REST API est désactivée. Utilisez la Solution 3.

### Étape 3 : Vérifier les plugins

1. Désactivez temporairement tous les plugins de sécurité
2. Testez `/wp-json/` et `/wp-json/wc/v3/products`
3. Si ça fonctionne, réactivez les plugins un par un pour identifier le problème

### Étape 4 : Vérifier `.htaccess`

1. Ouvrez le fichier `.htaccess`
2. Cherchez des règles qui bloquent `/wp-json/`
3. Commentez ou modifiez ces règles

## Test rapide après correction

Après avoir appliqué une solution, testez :

1. **WordPress REST API** : `https://www.impexo.fr/wp-json/wp/v2/`
2. **WooCommerce REST API** : `https://www.impexo.fr/wp-json/wc/v3/products?consumer_key=ck_374c0ec78039fd4115f44238dae84ac7cb31cd38&consumer_secret=cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3&per_page=1`

## Solution recommandée (ordre de priorité)

1. ✅ **Vérifier WooCommerce** (Solution 1)
2. ✅ **Réinitialiser les permalinks** (Solution 5) - Le plus simple
3. ✅ **Vérifier les plugins de sécurité** (Solution 2)
4. ✅ **Réactiver l'API avec du code** (Solution 3) - Si les autres ne fonctionnent pas
5. ✅ **Vérifier `.htaccess`** (Solution 4) - Si vous avez accès au serveur

## Prochaines étapes

1. ✅ Connectez-vous à WordPress admin
2. ✅ Vérifiez que WooCommerce est installé et activé
3. ✅ Réinitialisez les permalinks (Réglages → Permaliens → Enregistrer)
4. ✅ Testez `/wp-json/wp/v2/` dans votre navigateur
5. ✅ Dites-moi ce que vous obtenez

Une fois que WordPress REST API fonctionne, le proxy Vercel devrait fonctionner automatiquement !
