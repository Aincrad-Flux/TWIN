# Configuration Management API

## Overview
Ces routes permettent de gérer la configuration et les variables d'environnement de l'application T.W.I.N. Toutes les routes nécessitent une authentification via une clé API admin.

## Authentification

### Clé API Admin
- **Variable d'environnement** : `ADMIN_API_KEY`
- **Header requis** : `X-API-Key` ou `Authorization: Bearer <api-key>`
- **Protection** : Cette clé ne peut pas être récupérée ou modifiée via l'API

### Exemple d'authentification
```bash
curl -H "X-API-Key: your-admin-api-key" http://localhost:3000/api/config/config
```

## Routes disponibles

### 1. GET /api/config/config
Récupère la configuration complète de l'application.

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "env": "development",
    "port": "3000",
    "version": "1.0.0",
    "logLevel": "info",
    "dbHost": "localhost",
    "dbPort": "5432",
    "dbName": "twin_db"
  }
}
```

### 2. GET /api/config/environment
Récupère toutes les variables d'environnement (sauf les variables protégées).

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "NODE_ENV": "development",
    "PORT": "3000",
    "LOG_LEVEL": "info",
    "DB_HOST": "localhost",
    "DB_PORT": "5432",
    "DB_NAME": "twin_db",
    "DB_USER": "twin_user",
    "DB_PASSWORD": "twin_password"
  }
}
```

### 3. GET /api/config/environment/:key
Récupère une variable d'environnement spécifique.

**Exemple :**
```bash
curl -H "X-API-Key: your-admin-api-key" http://localhost:3000/api/config/environment/NODE_ENV
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "key": "NODE_ENV",
    "value": "development"
  }
}
```

### 4. PUT /api/config/environment
Met à jour plusieurs variables d'environnement.

**Corps de la requête :**
```json
{
  "NODE_ENV": "production",
  "LOG_LEVEL": "warn",
  "PORT": "8080"
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Environment variables updated successfully",
  "data": {
    "updated": ["NODE_ENV", "LOG_LEVEL", "PORT"],
    "total": 15
  }
}
```

### 5. PUT /api/config/environment/:key
Met à jour une variable d'environnement spécifique.

**Corps de la requête :**
```json
{
  "value": "production"
}
```

**Exemple :**
```bash
curl -X PUT \
  -H "X-API-Key: your-admin-api-key" \
  -H "Content-Type: application/json" \
  -d '{"value":"production"}' \
  http://localhost:3000/api/config/environment/NODE_ENV
```

### 6. DELETE /api/config/environment/:key
Supprime une variable d'environnement.

**Exemple :**
```bash
curl -X DELETE \
  -H "X-API-Key: your-admin-api-key" \
  http://localhost:3000/api/config/environment/TEMP_VAR
```

### 7. GET /api/config/protected-variables
Liste les variables protégées qui ne peuvent pas être modifiées via l'API.

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "protectedVariables": ["ADMIN_API_KEY"],
    "message": "These variables cannot be retrieved or modified via API"
  }
}
```

## Variables protégées

Les variables suivantes sont protégées et ne peuvent pas être récupérées ou modifiées via l'API :
- `ADMIN_API_KEY` : Clé API pour l'authentification admin

## Codes d'erreur

- **401** : Clé API manquante
- **403** : Clé API invalide
- **404** : Variable d'environnement non trouvée
- **400** : Données de requête invalides
- **500** : Erreur serveur

## Sécurité

1. **Logging** : Toutes les actions sont loggées avec l'IP de l'utilisateur
2. **Protection** : La clé API admin ne peut pas être récupérée via l'API
3. **Validation** : Toutes les entrées sont validées
4. **Persistance** : Les modifications sont sauvegardées dans le fichier .env

## Exemple d'utilisation complet

```bash
# 1. Récupérer la configuration actuelle
curl -H "X-API-Key: admin-secure-key-2025" \
  http://localhost:3000/api/config/config

# 2. Modifier plusieurs variables
curl -X PUT \
  -H "X-API-Key: admin-secure-key-2025" \
  -H "Content-Type: application/json" \
  -d '{"LOG_LEVEL":"debug","PORT":"3001"}' \
  http://localhost:3000/api/config/environment

# 3. Vérifier les changements
curl -H "X-API-Key: admin-secure-key-2025" \
  http://localhost:3000/api/config/environment
```
