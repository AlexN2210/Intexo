# 🔍 Vérifier les options WordPress dans la base de données

## Problème

Les requêtes SQL ont retourné "0 ligne affectée", ce qui signifie que :
- Soit les valeurs sont déjà correctes
- Soit les noms des options sont différents
- Soit il y a un problème avec la requête

## Vérification

### Étape 1 : Vérifier les valeurs actuelles

Dans phpMyAdmin, exécutez cette requête pour voir les valeurs actuelles :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
```

**Cela vous montrera :**
- Les noms exacts des options
- Les valeurs actuelles

### Étape 2 : Vérifier toutes les options qui contiennent "url"

Exécutez cette requête pour voir toutes les options liées aux URLs :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name LIKE '%url%' OR option_name LIKE '%URL%';
```

### Étape 3 : Si les valeurs sont déjà correctes

Si les valeurs sont déjà `https://www.impexo.fr`, alors le problème vient d'ailleurs :
- Problème avec `.htaccess`
- Problème avec les permalinks
- Problème avec un plugin
- Problème avec la configuration du serveur

## Solutions alternatives

### Solution 1 : Vérifier .htaccess

1. Dans o2switch, allez dans `public_html`
2. Renommez `.htaccess` → `.htaccess.backup`
3. Testez : `https://www.impexo.fr/wp-login.php`

### Solution 2 : Vérifier les permalinks via SQL

Si les permalinks ne sont pas configurés, cela peut causer des problèmes :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name = 'permalink_structure';
```

Si la valeur est vide, configurez-la :

```sql
UPDATE wpqh_options SET option_value = '/%postname%/' WHERE option_name = 'permalink_structure';
```

### Solution 3 : Vérifier si WordPress est installé dans un sous-dossier

Vérifiez s'il y a une option qui indique un sous-dossier :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name LIKE '%path%' OR option_name LIKE '%PATH%';
```

## Action immédiate

1. **Dans phpMyAdmin**, exécutez cette requête :

```sql
SELECT option_name, option_value FROM wpqh_options WHERE option_name IN ('siteurl', 'home');
```

2. **Dites-moi ce que vous voyez** :
   - Quelles sont les valeurs actuelles ?
   - Sont-elles déjà `https://www.impexo.fr` ?

3. **Testez aussi** : `https://www.impexo.fr/wp-login.php`
   - Est-ce que la page de connexion s'affiche ?

## Si les valeurs sont déjà correctes

Si les valeurs dans la base de données sont déjà `https://www.impexo.fr`, alors le problème vient probablement de :

1. **Le fichier `.htaccess`** → Renommez-le temporairement
2. **Les permalinks** → Réinitialisez-les
3. **Un plugin** → Désactivez-les temporairement
4. **La configuration du serveur** → Contactez o2switch

## Prochaines étapes

1. ✅ Exécutez la requête pour voir les valeurs actuelles
2. ✅ Testez `/wp-login.php`
3. ✅ Dites-moi ce que vous obtenez

Avec ces informations, je pourrai identifier la cause exacte du problème.
