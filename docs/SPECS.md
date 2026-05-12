## Spécifications — Scénarios Gherkin



### Feature: Authentification 

**Scenario:** Une éducatrice accède à l'application avec ses identifiants

```gherkin
Given une éducatrice disposant d'un compte Oriaa
When elle saisit son e-mail et son mot de passe
Then elle est connectée et accède à l'application
```

**Scenario:** Une éducatrice quitte l'application de façon sécurisée

```gherkin
Given une éducatrice connectée à Oriaa
When elle se déconnecte
Then sa session est fermée
And elle ne peut plus accéder aux données sans se reconnecter
```

---

### Feature: Création d'un dossier bénéficiaire 

**Scenario:** Un nouveau bénéficiaire est enregistré dans le système

```gherkin
Given une éducatrice connectée
When elle crée un nouveau dossier bénéficiaire avec les informations requises
Then le dossier est enregistré avec le statut "En attente"
And il est visible dans la liste des bénéficiaires
```
---

### Feature: Recherche d'un bénéficiaire

**Scenario:** L'éducatrice retrouve rapidement un dossier depuis n'importe quelle page

```gherkin
Given une éducatrice connectée à Oriaa avec une trentaine de dossiers actifs
When elle saisit le nom d'un bénéficiaire dans la barre de recherche
Then les dossiers correspondants s'affichent immédiatement
And elle peut accéder au dossier concerné en un seul clic
```

---

### Feature: Création d'une action 

**Scenario:** Une éducatrice enregistre un RDV sur le dossier d'un bénéficiaire

```gherkin
Given une éducatrice sur le dossier d'un bénéficiaire
When elle crée une action de type "RDV" avec une date et un contenu
Then l'action est enregistrée avec la date, l'heure et le nom de l'auteure
And elle apparaît dans l'onglet correspondant du dossier
And elle ne peut plus être modifiée après enregistrement
```

**Scenario:** Une éducatrice enregistre un rapport sur le dossier d'un bénéficiaire

```gherkin
Given une éducatrice sur le dossier d'un bénéficiaire
When elle crée une action de type "Rapport"
Then le rapport est enregistré avec la date, l'heure et le nom de l'auteure
And il apparaît dans l'onglet correspondant du dossier
```

---

### Feature: Historique du dossier

**Scenario:** Une éducatrice consulte tout ce qui s'est passé sur un dossier

```gherkin
Given un dossier bénéficiaire avec plusieurs actions enregistrées
When une éducatrice ouvre la vue Historique du dossier
Then elle voit l'ensemble des événements dans l'ordre chronologique inverse
And chaque événement affiche son type, sa date et son auteur
```

**Scenario:** Un collègue remplaçant reprend un dossier sans perte d'information

```gherkin
Given un bénéficiaire suivi par une éducatrice absente
When un collègue remplaçant ouvre le dossier
Then il accède à l'historique complet des actions menées
And il peut identifier le référent habituel sur la fiche
```

---

### Feature: Changement de statut du parcours

**Scenario:** Un changement de statut est automatiquement tracé dans l'historique

```gherkin
Given un bénéficiaire avec le statut "Accueilli"
When l'éducatrice fait passer son statut à "En accompagnement"
Then le nouveau statut est visible sur la fiche et dans la liste des bénéficiaires
And une entrée est automatiquement créée dans l'historique
And cette entrée contient la date, l'heure et le nom de l'auteure
```

---

### Feature: Gestion des tâches quotidiennes

**Scenario:** L'éducatrice commence sa journée sans ouvrir chaque dossier un par un

```gherkin
Given une éducatrice connectée avec plusieurs tâches en cours sur différents dossiers
When elle ouvre sa vue des tâches
Then elle voit l'ensemble de ses tâches triées par urgence et par deadline
And chaque tâche liée à un bénéficiaire affiche son nom
And un clic sur la tâche l'amène directement au dossier concerné
```

**Scenario:** Un RDV génère une tâche de suivi associée au dossier

```gherkin
Given une éducatrice qui enregistre un RDV dans le dossier d'un bénéficiaire
When elle crée une tâche de suivi liée à ce RDV
Then la tâche apparaît dans sa vue quotidienne
And elle est rattachée au dossier du bénéficiaire concerné
```
---
