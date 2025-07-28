# T.W.I.N - Ticket Workflow Integration Network

## 📋 Présentation du Projet

**T.W.I.N** est une refonte complète de l'ancien projet JIR.A, conçu pour synchroniser de manière fiable et bidirectionnelle deux instances Jira distinctes (interne et externe). Le système permet aux équipes de développement de maintenir une cohérence entre leurs outils internes et les plateformes externes tout en gardant le contrôle sur les informations partagées.

### Contexte d'utilisation
- **Utilisateurs** : Équipes de développement en entreprise
- **Déploiement** : Une instance T.W.I.N par équipe de développement
- **Volume** : ~20 tickets/jour par équipe en moyenne
- **Architecture** : Basé sur des webhooks Jira avec containérisation Docker

## 🎯 Fonctionnalités par Priorité

### 🔴 Fonctionnalités Principales (Critiques)

#### 1. Synchronisation des Issues (Bidirectionnelle)
- **Externe → Interne** : Synchronisation automatique complète
  - Reformatage du titre : `ID | TYPE | Titre original`
  - Mapping des statuts via étiquettes
  - Conservation de toutes les métadonnées
- **Interne → Externe** : Synchronisation sur commande
  - Tag `!sync` pour changer le statut
  - Respect du mapping des statuts configuré

#### 2. Système Anti Ping-Pong Robuste
- Tracking des modifications en base de données
- Tables de correspondance entre les instances
- Détection et prévention des boucles infinies
- Logs détaillés des actions pour audit

#### 3. Gestion des Correspondances
- Base de données robuste (PostgreSQL/MySQL)
- Table de mapping des tickets entre instances
- Table de correspondance des statuts personnalisable
- Historique des synchronisations

### 🟡 Fonctionnalités Secondaires (Importantes)

#### 1. Synchronisation des Commentaires
- **Phase 1** : Externe → Interne uniquement
- **Phase 2** : Bidirectionnelle avec tag `!send [commentaire]`
- Préservation de l'autheur et timestamp
- Filtrage des commentaires système

#### 2. Système de Monitoring Avancé
- Logs en base de données (plus de fichiers .log)
- Bot Teams "Cardinal" pour alertes critiques
- Dashboard des synchronisations (optionnel)
- Métriques de performance

#### 3. Gestion d'Erreurs Améliorée
- Système de retry automatique
- Queue de synchronisation pour les échecs
- Notifications Teams pour erreurs critiques
- Rapports d'erreurs détaillés

### 🟢 Fonctionnalités Tertiaires (Nice to Have)

#### 1. Synchronisation des Pièces Jointes
- Support des fichiers entre instances
- Gestion des permissions et sécurité
- Limitation de taille configurable

#### 2. Interface Web de Monitoring
- Vue des tickets synchronisés
- Historique des événements
- Configuration des mappings
- Statistiques d'usage

#### 3. Configuration Avancée
- Interface de configuration des mappings
- Règles de filtrage personnalisées
- Gestion multi-équipes depuis une interface

## 🛠 Technologies Recommandées

### JavaScript / Express
**Avantages :**
- Excellente gestion des webhooks et APIs REST
- Écosystème riche pour Jira (bibliothèques tierces)
- TypeScript pour la robustesse et maintenabilité
- Performance élevée pour les tâches I/O intensives
- Communauté active et documentation

**Stack suggérée :**
- **Runtime** : Node.js 18+ avec TypeScript
- **Framework** : Express.js ou Fastify
- **Base de données** : PostgreSQL avec Prisma ORM
- **Conteneurisation** : Docker + Docker Compose
- **Tests** : Jest + Supertest
- **Logs** : Winston avec rotation

**Recommandation : Node.js/TypeScript** pour sa simplicité de développement et son adéquation parfaite avec les webhooks.

## 🏗 Architecture Technique

### Composants Principaux
1. **Webhook Receiver** : Réception des événements Jira
2. **Sync Engine** : Logique de synchronisation et anti ping-pong
3. **Database Layer** : Gestion des correspondances et logs
4. **Notification Service** : Intégration Teams "Cardinal"
5. **Configuration Manager** : Gestion des mappings et règles

### Base de Données (PostgreSQL)
```sql
-- Tables principales
- tickets_mapping (id_interne, id_externe, date_creation, derniere_sync)
- sync_logs (timestamp, action, source, destination, status, details)
- status_mapping (status_externe, etiquette_interne)
- configuration (cle, valeur, description)
```

### Sécurité
- **Problème identifié** : Jira ne permet pas de tokens sur les webhooks
- **Solutions** :
  - Validation par IP source (whitelist)
  - Signature HMAC si possible côté Jira
  - Endpoint dédié avec URL complexe
  - Rate limiting pour éviter les abus

## 📊 Présentation Utilisateur

### Phase 1 : API Pure (MVP)
- Interface webhook uniquement
- Logs accessibles via fichiers ou DB
- Configuration par fichiers de config

### Phase 2 : Interface Web (Optionnelle)
- Dashboard de monitoring en temps réel
- Vue des tickets synchronisés
- Configuration des mappings via interface
- Historique des synchronisations

### Notifications
- **Teams Bot "Cardinal"** : Alertes pour erreurs critiques
- **Logs structurés** : Pour debugging et audit
- **Métriques** : Compteurs de sync réussies/échouées

## 🚀 Plan de Migration

### Étape 1 : Fondations (2-3 semaines)
- Setup du projet TypeScript + Express
- Configuration PostgreSQL et schéma DB
- Implémentation du système anti ping-pong
- Tests unitaires de base

### Étape 2 : Synchronisation Core (2-3 semaines)
- Implémentation sync issues bidirectionnelle
- Système de mapping des statuts
- Gestion d'erreurs et retry
- Tests d'intégration

### Étape 3 : Monitoring & Notifications (1-2 semaines)
- Intégration Teams "Cardinal"
- Logs en base de données
- Métriques et dashboard basique

### Étape 4 : Fonctionnalités Avancées (2-3 semaines)
- Synchronisation commentaires
- Interface web (optionnelle)
- Pièces jointes (si demandé)

## 🎯 Critères de Succès

### Fonctionnel
- ✅ Zéro boucle de ping-pong observée
- ✅ 99% de fiabilité de synchronisation
- ✅ Temps de réponse < 2s pour les webhooks
- ✅ Support 50+ tickets/jour par instance

### Technique
- ✅ Tests automatisés avec couverture > 80%
- ✅ Monitoring et alertes opérationnelles
- ✅ Documentation technique complète
- ✅ Déploiement Docker simplifié

## 📝 Notes Importantes

- **Contrainte Docker** : Obligatoire pour la production
- **Système de tags actuel** : Conserver `!sync` et `!send [commentaire]`
- **Sécurité** : Prévoir des mesures compensatoires pour l'absence d'auth sur webhooks Jira
- **Scalabilité** : Architecture pensée pour supporter plusieurs équipes simultanément

---

**Prochaines étapes** : Validation de cette fiche, choix définitif de la stack technique, et démarrage du développement du MVP.