# Console Interactive T.W.I.N

Documentation complète de la console utilitaire fournie par `src/console.js`.

---
## 1. Objectif
La console permet d'appeler rapidement les fonctions utilitaires (environnement, logs, Jira, data) et d'instancier / manipuler certaines classes **sans démarrer le serveur Express**. Elle est idéale pour :
- Tester des helpers isolément
- Inspecter les exports disponibles
- Lire des logs
- Expérimenter des méthodes de classes Jira (Issue, Comment, Interface, …)

---
## 2. Lancement
Plusieurs façons :
- Via npm : `npm run console` (si le script existe)
- Directement : `node src/console.js`
- Option dans le serveur (si implémenté) : `node src/server.js --console`

Prompt affiché : `TWIN>`

Quitter : `exit` ou `quit` (Ctrl+C deux fois fonctionne aussi mais moins propre).

---
## 3. Modules & Registre
Modules chargés au démarrage (si disponibles) :
- `env` → `utils/envManager.js`
- `logs` → `utils/logManager.js`
- `jira` → `utils/jiraManager.js`
- `data` → `utils/dataManager.js` (optionnel; ignoré silencieusement si absent)

Chaque module est parcouru et ses fonctions exportées peuvent être appelées via `module.fonction`.

---
## 4. Vue d’ensemble des Commandes
| Commande | Description | Exemple rapide |
|----------|-------------|----------------|
| `help` | Affiche l'aide | `help` |
| `list` | Liste les modules & leurs fonctions exportées | `list` |
| `list <Nom>` | Cherche une entité (classe / fonction / objet) dans tous les modules et détaille ses méthodes | `list JiraInterface` |
| `new <Classe> [nom] {json}` | Crée une instance d'une classe supportée (JiraIssue, JiraComment, JiraInterface, etc.) | `new JiraIssue` |
| `objs` / `instances` | Liste les instances en mémoire | `instances` |
| `call <instance>.<methode> [args...]` | Appelle une méthode sur une instance existante | `call issue1.toJSON` |
| `del <instance>` | Supprime une instance | `del issue1` |
| `<module>.<fonction> [args...]` | Appelle directement une fonction exportée | `env.getEnvVar "PORT"` |
| `exit` / `quit` | Ferme la console | `quit` |

---
## 5. Détails des Commandes
### 5.1 `list`
Sans argument : affiche pour chaque module la liste des fonctions (`typeof === 'function'`).

Avec un argument :
```
list JiraIssue
```
Affiche :
- Méthodes d'instance (prototype) si c'est une classe
- Méthodes statiques éventuelles
- Propriétés si c'est un objet

### 5.2 Appel direct `module.fonction`
Format : `nomModule.nomFonction arg1 arg2 ...`
- Chaque argument est tenté avec `JSON.parse()`.
- Si l'analyse JSON échoue : traité comme chaîne (quotes externes supprimées si présentes).

Exemples :
```
env.getEnvVar "PORT"
env.updateEnvVars {"LOG_LEVEL":"debug"}
logs.getLogFiles
logs.readLogFile "combined.log" {"lines":10,"tail":true}
```

Astuce : Pour passer une chaîne contenant des espaces → l'entourer de guillemets :
```
jira.someFunction "Résumé avec espaces"
```

### 5.3 Création d'instances `new`
Format générique :
```
new <Classe> [nomInstance] {jsonOptionnel}
```
Règles :
- Si `nomInstance` omis, un nom auto est généré : `classname1`, `classname2`, … (le suffixe `interface` est retiré du préfixe).
- Le JSON (si présent) est fusionné avec un *payload* par défaut pour certaines classes Jira.

#### 5.3.1 Cas particuliers Jira
`JiraIssue` payload par défaut :
```json
{
  "key": "TMP-1",
  "id": "<timestamp>",
  "fields": {
    "issuetype": {"name": "Task"},
    "status": {"name": "New"},
    "summary": "Temp issue",
    "description": "Temp desc",
    "project": {"name": "TempProj"}
  }
}
```

`JiraComment` payload par défaut :
```json
{
  "id": "<timestamp>",
  "body": "Temp body",
  "author": "Temp",
  "created": "<ISO date>"
}
```

`JiraInterface` a une logique de parsing spéciale : syntaxes acceptées :
```
new JiraInterface SECTION
new JiraInterface {"section":"SECTION"}
new JiraInterface nomCustom SECTION
new JiraInterface nomCustom {"section":"SECTION"}
```
Le champ reconnu peut aussi être `project` ou `key` dans le JSON. Le nom est auto-généré si omis (`jira1`, `jira2`, ...).

#### 5.3.2 Exemples
```
new JiraIssue
new JiraIssue myIssue {"fields":{"summary":"Essai"}}
new JiraComment
new JiraComment c1 {"body":"Hello"}
new JiraInterface CORE
new JiraInterface {"section":"BACKLOG"}
new JiraInterface coreA CORE
```

### 5.4 Manipulation d'instances
Lister :
```
instances
```
Ou :
```
objs
```

Appeler une méthode :
```
call myIssue.toJSON
call myIssue.getStatus
call jira1.fetchIssues {"jql":"project = DEMO"}
```

Supprimer :
```
del myIssue
```

### 5.5 Appel implicite de méthode de classe
Si vous tapez `JiraIssue.someMethod` et que :
- `someMethod` est **méthode d'instance** (prototype)
- Aucune instance n'existe
La console tente de créer une *instance temporaire* avec un payload par défaut pour exécuter la méthode. Si l'instanciation échoue → erreur demandant d'utiliser `new`.

### 5.6 Gestion des arguments
Algorithme :
1. Découpage sur les espaces (`split(/\s+/)`).
2. Chaque token → tentative `JSON.parse(token)`.
3. Si succès → valeur JSON ; sinon chaîne avec guillemets externes retirés.

Conséquences :
- Les objets JSON doivent être *monotokens* (pas d'espaces internes) ou alors vous ne pouvez pas les saisir directement multi‑lignes.
- Utiliser des clés/valeurs sans espaces pour simplifier.

Exemples valides :
```
{"lines":10,"tail":true}
"SIMPLE"
"Texte avec espaces"
```

Exemple problématique (sera mal découpé) :
```
{"summary": "Issue avec espace"}
```
Solution : retirer les espaces inutiles ou écrire :
```
{"summary":"Issue avec espace"}
```

---
## 6. Résultats & Affichage
- Les résultats non `undefined` sont affichés via `util.inspect` profondeur 5, avec couleurs ANSI.
- En absence de retour : affiche "Aucune sortie.".
- Les erreurs sont préfixées par `Erreur:` (en rouge).

---
## 7. Gestion des erreurs fréquentes
| Message | Cause | Correction |
|---------|-------|-----------|
| `Fonction inconnue: module.fonction` | Export absent ou faute de frappe | Vérifier `list` |
| `Module ou classe inconnu: X` | Préfixe inexistant | Vérifier modules |
| `Méthode 'xyz' introuvable sur Classe` | Nom incorrect ou non fonction | Consulter `list Classe` |
| `JSON invalide` | JSON mal formé | Utiliser un validateur / retirer espaces |
| `Impossible d'instancier automatiquement` | Constructeur exige arguments complexes | Créer avec `new` et JSON adapté |
| `Classe inconnue` | Nom absent des exports modules | Exporter correctement la classe |

---
## 8. Étendre la Console
Pour ajouter un nouveau module utilitaire :
1. Créer `src/utils/monModule.js` exportant un objet ou des fonctions.
2. Modifier `src/console.js` :
```js
const monModule = require('./utils/monModule');
// ...
const registry = { env, logs, jira, data, monModule };
```
3. Relancer la console puis `list`.

Pour exposer une classe : `module.exports = { MaClasse }` ou l'intégrer dans un objet exporté.

---
## 9. Bonnes Pratiques
- Préparer vos objets JSON sans espaces superflus pour faciliter la saisie.
- Nommer explicitement les instances importantes (`new JiraIssue issueLogin {...}`).
- Supprimer les instances obsolètes avec `del` pour éviter la confusion.
- Tester d'abord les fonctions pures avant d'orchestrer plusieurs appels.

---
## 10. Exemples Complets
### 10.1 Lecture de logs
```
logs.getLogFiles
logs.readLogFile "combined.log" {"lines":20,"tail":true}
```

### 10.2 Manipulation d'environnement
```
env.getEnvVar "PORT"
env.updateEnvVars {"LOG_LEVEL":"debug","NEW_FLAG":"1"}
env.getEnvVar "LOG_LEVEL"
```

### 10.3 Travail avec des issues Jira (simulation)
```
new JiraIssue issueA {"fields":{"summary":"Test A"}}
call issueA.getStatus
call issueA.toJSON
```

### 10.4 Interface Jira
```
new JiraInterface CORE
instances
call jira1.fetchIssues {"jql":"project = CORE ORDER BY created DESC"}
```

### 10.5 Commentaire Jira
```
new JiraComment c1 {"body":"Premier commentaire"}
call c1.toJSON
```

### 10.6 Méthode d'instance via instanciation implicite
```
JiraIssue.toJSON
```
(Si possible selon l'implémentation interne.)

---
## 11. Limitations Connues
- Pas de support multi‑lignes / copier-coller JSON formaté.
- Pas d'historique persistant entre deux lancements.
- Instanciation automatique basique (payloads figés pour JiraIssue/JiraComment).
- Pas de complétion interactive.

---
## 12. Dépannage Rapide
| Problème | Action |
|----------|--------|
| Rien ne s'affiche | Vérifier que la fonction ne retourne rien |
| Couleurs illisibles | Changer de terminal / thème |
| Crash immédiat | Lancer avec `node src/console.js` directement pour voir la stack |
| Impossible d'appeler une méthode | Vérifier l'instance avec `instances` ou utiliser `list <Classe>` |

---
## 13. FAQ
**Q: Comment passer un tableau ?**
A: `env.someFn [1,2,3]` (un seul token JSON valide).

**Q: Puis-je chaîner des appels ?**
A: Non, une ligne = un appel.

**Q: Comment voir toutes les méthodes d'une classe ?**
A: `list NomDeClasse`.

**Q: Puis-je éditer une instance existante ?**
A: Utilisez une méthode prévue (ex: `update...`). Sinon recréez.

---
## 14. Résumé Essentiel
1. Lancer : `node src/console.js`
2. Inspecter : `list`
3. Créer : `new JiraIssue` / `new JiraInterface CORE`
4. Appeler : `call issue1.toJSON`
5. Fonctions directes : `logs.getLogFiles`
6. Quitter : `quit`

---
Bon usage de la console T.W.I.N !
