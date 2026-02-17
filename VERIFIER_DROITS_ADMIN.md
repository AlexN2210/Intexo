# ✅ Vérifier les droits admin des utilisateurs

## Utilisateurs trouvés ✅

- **ID 1** : `7v1nf` (admin@impexo.fr) - Status: 0 ✅
- **ID 2** : `admin_wp` (admin@impexo.fr) - Status: 0 ✅

Les deux utilisateurs existent et sont actifs. Vérifions leurs droits admin.

## Vérification des droits admin

### Pour l'utilisateur 7v1nf (ID 1)

Dans phpMyAdmin :

```sql
SELECT user_id, meta_key, meta_value 
FROM wpqh_usermeta 
WHERE user_id = 1 AND meta_key IN ('wpqh_capabilities', 'wpqh_user_level');
```

### Pour l'utilisateur admin_wp (ID 2)

```sql
SELECT user_id, meta_key, meta_value 
FROM wpqh_usermeta 
WHERE user_id = 2 AND meta_key IN ('wpqh_capabilities', 'wpqh_user_level');
```

**Vérifiez** que vous voyez :
- `wpqh_capabilities` avec `administrator`
- `wpqh_user_level` avec `10`

## Si les droits ne sont pas corrects

### Pour 7v1nf (ID 1)

```sql
UPDATE wpqh_usermeta 
SET meta_value = 'a:1:{s:13:"administrator";b:1;}' 
WHERE user_id = 1 AND meta_key = 'wpqh_capabilities';

UPDATE wpqh_usermeta 
SET meta_value = '10' 
WHERE user_id = 1 AND meta_key = 'wpqh_user_level';
```

### Pour admin_wp (ID 2)

```sql
UPDATE wpqh_usermeta 
SET meta_value = 'a:1:{s:13:"administrator";b:1;}' 
WHERE user_id = 2 AND meta_key = 'wpqh_capabilities';

UPDATE wpqh_usermeta 
SET meta_value = '10' 
WHERE user_id = 2 AND meta_key = 'wpqh_user_level';
```

## Essayer la connexion avec l'email

Parfois WordPress accepte l'email mais pas le nom d'utilisateur.

1. **Allez sur** : `https://wp.impexo.fr/wp-login.php`
2. **Utilisez l'email** : `admin@impexo.fr`
3. **Mot de passe** : `password` (si vous avez utilisé le hash que j'ai fourni)
4. **Essayez de vous connecter**

## Réinitialiser le mot de passe de 7v1nf

Si vous voulez utiliser `7v1nf` :

```sql
UPDATE wpqh_users 
SET user_pass = '$P$B55D6LjfHDkINU5wF.v2BuuzO0/XPk/' 
WHERE user_login = '7v1nf';
```

Puis connectez-vous avec :
- Nom d'utilisateur ou email : `7v1nf` ou `admin@impexo.fr`
- Mot de passe : `password`

## Action immédiate

1. ✅ **Vérifiez les droits admin** des deux utilisateurs avec les requêtes SQL ci-dessus
2. ✅ **Corrigez les droits** si nécessaire
3. ✅ **Réinitialisez le mot de passe** de `7v1nf` si vous voulez l'utiliser
4. ✅ **Essayez de vous connecter** avec l'email `admin@impexo.fr` / `password`
5. ✅ **Essayez aussi** avec `7v1nf` / `password` ou `admin_wp` / `password`

Dites-moi ce que vous voyez pour les droits admin et si la connexion fonctionne maintenant !
