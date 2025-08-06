# Logs Management API

## Overview
Ces routes permettent d'accéder et de gérer les fichiers de logs de l'application T.W.I.N. Toutes les routes nécessitent une authentification via la clé API admin.

## Authentification

### Clé API Admin
- **Header requis** : `X-API-Key: your-admin-api-key` ou `Authorization: Bearer your-admin-api-key`

## Routes disponibles

### 1. GET /api/logs/logs
Récupère la liste de tous les fichiers de logs disponibles.

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "files": [
      {
        "name": "combined.log",
        "size": 15420,
        "sizeFormatted": "15.06 KB",
        "modified": "2025-08-06T10:30:00.000Z",
        "type": "log"
      },
      {
        "name": "2025-08-06/webhook-test-2025-08-06T12-30-40-375Z.json",
        "size": 2048,
        "sizeFormatted": "2.00 KB",
        "modified": "2025-08-06T12:30:40.000Z",
        "type": "webhook"
      }
    ],
    "total": 15
  }
}
```

### 2. GET /api/logs/logs/stats
Récupère les statistiques des fichiers de logs.

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "totalFiles": 15,
    "totalSize": 245760,
    "totalSizeFormatted": "240.00 KB",
    "byType": {
      "log": {
        "count": 2,
        "size": 45000,
        "sizeFormatted": "43.95 KB"
      },
      "webhook": {
        "count": 13,
        "size": 200760,
        "sizeFormatted": "196.05 KB"
      }
    },
    "recentActivity": [
      {
        "name": "combined.log",
        "modified": "2025-08-06T10:30:00.000Z",
        "size": 15420
      }
    ]
  }
}
```

### 3. GET /api/logs/logs/file/:filename
Récupère le contenu d'un fichier de log spécifique.

**Paramètres de requête :**
- `lines` (number) : Nombre de lignes à récupérer
- `tail` (boolean) : Si true, récupère les dernières lignes
- `filter` (string) : Filtre le contenu par mot-clé

**Exemples :**
```bash
# Récupérer les 50 dernières lignes du log d'erreur
curl -H "X-API-Key: your-admin-api-key" \
  "http://localhost:3000/api/logs/logs/file/error.log?lines=50&tail=true"

# Filtrer le log combiné par mot-clé
curl -H "X-API-Key: your-admin-api-key" \
  "http://localhost:3000/api/logs/logs/file/combined.log?filter=webhook&lines=20"

# Récupérer un fichier webhook spécifique
curl -H "X-API-Key: your-admin-api-key" \
  "http://localhost:3000/api/logs/logs/file/2025-08-06/webhook-test-2025-08-06T12-30-40-375Z.json"
```

### 4. GET /api/logs/logs/errors
Récupère les logs d'erreur récents.

**Paramètres de requête :**
- `lines` (number, défaut: 50) : Nombre de lignes à récupérer

**Exemple :**
```bash
curl -H "X-API-Key: your-admin-api-key" \
  "http://localhost:3000/api/logs/logs/errors?lines=100"
```

### 5. GET /api/logs/logs/combined
Récupère les logs combinés récents.

**Paramètres de requête :**
- `lines` (number, défaut: 100) : Nombre de lignes à récupérer

### 6. GET /api/logs/logs/search
Recherche dans les fichiers de logs.

**Paramètres de requête :**
- `q` (string, requis) : Terme à rechercher
- `file` (string) : Pattern de nom de fichier pour filtrer
- `limit` (number, défaut: 100) : Nombre maximum de résultats
- `case_sensitive` (boolean, défaut: false) : Recherche sensible à la casse

**Exemple :**
```bash
curl -H "X-API-Key: your-admin-api-key" \
  "http://localhost:3000/api/logs/logs/search?q=webhook&file=combined&limit=50"
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "query": "webhook",
    "totalResults": 25,
    "results": [
      {
        "file": "combined.log",
        "line": 42,
        "content": "Webhook request data saved to: 2025-08-06/webhook-test.json",
        "timestamp": "2025-08-06T10:30:00.000Z"
      }
    ]
  }
}
```

### 7. GET /api/logs/logs/webhooks/:date
Récupère les logs de webhooks pour une date spécifique.

**Format de date :** YYYY-MM-DD

**Exemple :**
```bash
curl -H "X-API-Key: your-admin-api-key" \
  "http://localhost:3000/api/logs/logs/webhooks/2025-08-06"
```

### 8. GET /api/logs/logs/webhooks/recent
Récupère les logs de webhooks récents (dernières 24h).

**Paramètres de requête :**
- `limit` (number, défaut: 10) : Nombre maximum de fichiers

### 9. DELETE /api/logs/logs/cleanup
Nettoie les anciens fichiers de logs.

**Paramètres de requête :**
- `days` (number, défaut: 30) : Nombre de jours à conserver

**Exemple :**
```bash
curl -X DELETE -H "X-API-Key: your-admin-api-key" \
  "http://localhost:3000/api/logs/logs/cleanup?days=7"
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Log cleanup completed successfully",
  "data": {
    "deletedCount": 5,
    "deletedSize": 102400,
    "deletedSizeFormatted": "100.00 KB",
    "remainingFiles": 10
  }
}
```

## Types de logs

### 1. Logs système
- **combined.log** : Tous les logs de l'application
- **error.log** : Logs d'erreur uniquement

### 2. Logs de webhooks
- Stockés dans des dossiers par date (YYYY-MM-DD)
- Format JSON avec toutes les informations de la requête
- Nom de fichier : `webhook-test-YYYY-MM-DDTHH-mm-ss-SSSZ.json`

## Sécurité

1. **Authentification requise** : Toutes les routes nécessitent la clé API admin
2. **Protection de chemin** : Impossible d'accéder aux fichiers en dehors du dossier logs
3. **Logging des accès** : Tous les accès aux logs sont enregistrés
4. **Validation des paramètres** : Tous les paramètres sont validés

## Codes d'erreur

- **400** : Paramètres de requête invalides
- **401** : Clé API manquante
- **403** : Clé API invalide ou accès refusé
- **404** : Fichier de log non trouvé
- **500** : Erreur serveur

## Exemple d'utilisation complet

```bash
#!/bin/bash
API_KEY="your-admin-api-key"
BASE_URL="http://localhost:3000/api/logs"

# 1. Voir les statistiques des logs
curl -H "X-API-Key: $API_KEY" "$BASE_URL/logs/stats"

# 2. Rechercher des erreurs récentes
curl -H "X-API-Key: $API_KEY" "$BASE_URL/logs/search?q=error&limit=10"

# 3. Voir les logs de webhooks d'aujourd'hui
TODAY=$(date +%Y-%m-%d)
curl -H "X-API-Key: $API_KEY" "$BASE_URL/logs/webhooks/$TODAY"

# 4. Nettoyer les logs de plus de 7 jours
curl -X DELETE -H "X-API-Key: $API_KEY" "$BASE_URL/logs/cleanup?days=7"

# 5. Voir les dernières erreurs
curl -H "X-API-Key: $API_KEY" "$BASE_URL/logs/errors?lines=20"
```
