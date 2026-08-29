# User stories — Oriaa

> Format : **En tant que** [rôle], **je veux** [action], **afin de** [bénéfice].
> Rôles du système : **Utilisateur** (role = user) et **Administrateur** (role = admin).

---

## Authentification

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur / admin | me connecter | accéder à mes données de manière sécurisée |
| Utilisateur / admin | me déconnecter | sécuriser l'accès quand je quitte mon poste |
| Utilisateur / admin | changer mon mot de passe | sécuriser mon compte |

---

## Gestion des comptes

| En tant que | Je veux | Afin de |
|---|---|---|
| Administrateur | créer un compte utilisateur | donner l'accès à l'application à un nouveau collègue |
| Administrateur | archiver un compte utilisateur | retirer l'accès d'un collègue sans perdre l'historique de ses actions |
| Administrateur | modifier un compte utilisateur | changer sa fonction ou son rôle |
| Administrateur | supprimer un compte utilisateur | retirer définitivement un compte |

*(Rappel : hormis la gestion des comptes utilisateurs et la suppression d'un bénéficiaire, l'Administrateur a exactement les mêmes droits qu'un Utilisateur)*

---

## Bénéficiaires

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | créer une fiche bénéficiaire | démarrer un suivi social |
| Utilisateur | consulter une fiche bénéficiaire | accéder rapidement aux informations d'un suivi |
| Utilisateur | modifier une fiche bénéficiaire | mettre à jour sa situation |
| Utilisateur | archiver une fiche bénéficiaire | retirer un dossier du suivi actif |
| Utilisateur | réactiver une fiche bénéficiaire | reprendre un suivi précédemment archivé |
| Utilisateur | rechercher/filtrer les fiches bénéficiaires | retrouver rapidement un dossier |
| Utilisateur | agir sur une fiche même si je ne suis pas le référent | assurer la continuité de service en cas d'absence d'un collègue |
| Administrateur | supprimer une fiche bénéficiaire | retirer définitivement un dossier |

---

## Tâches

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | créer une tâche | suivre une action à réaliser |
| Utilisateur | lier une tâche à un ou plusieurs bénéficiaires | organiser une action collective (ex : atelier cuisine) |
| Utilisateur | lier une tâche à un RDV et/ou une note | garder le contexte de pourquoi la tâche existe |
| Utilisateur | modifier une tâche | adapter une action en cours |
| Utilisateur | supprimer une tâche | la retirer définitivement une fois traitée ou en cas d'erreur |
| Utilisateur | consulter mes tâches du jour / urgentes | organiser mon travail quotidien |
| Utilisateur | filtrer les tâches | prioriser mes actions |

---

## Notes (Démarches)

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | créer une note concernant un bénéficiaire | tracer une observation ou un échange |
| Utilisateur | lier une note à un RDV | garder le contexte de l'échange |
| Utilisateur | lier une note à un bilan (ou non) | rattacher une observation à une évaluation existante |
| Utilisateur | lier une note à une ou plusieurs tâches | transformer une observation en action à réaliser |
| Utilisateur | modifier une note | corriger ou compléter une observation |
| Utilisateur | supprimer une note | corriger une erreur de saisie |

---

## Documents

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | joindre un document à une fiche bénéficiaire | centraliser les pièces utiles au suivi |
| Utilisateur | classer un document par catégorie (médical, emploi, logement, admin, bilans...) | m'y retrouver rapidement |
| Utilisateur | supprimer un document | retirer une pièce obsolète ou erronée |

---

## Planning / Rendez-vous

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | planifier un RDV pour moi-même | organiser une intervention |
| Utilisateur | planifier un RDV pour un(e) collègue | coordonner les interventions de l'équipe |
| Utilisateur | consulter le planning de l'équipe | coordonner les interventions |
| Utilisateur | lier un RDV à un bénéficiaire | garder le contexte de l'intervention |
| Utilisateur | modifier un RDV | adapter un horaire ou un lieu |
| Utilisateur | supprimer un RDV | corriger une erreur de saisie |

---

## Historique

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | consulter l'historique chronologique complet d'un bénéficiaire (RDV, notes, bilans, documents, tâches) | avoir une vue d'ensemble rapide du suivi |
| Utilisateur | filtrer l'historique par type d'action | retrouver rapidement un type d'événement précis |

---

**Tableau de bord**

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | voir mes RDV du jour et mes tâches du jour/urgentes en arrivant sur l'application | démarrer ma journée efficacement |

---

**Règles de cohérence (cascade)**

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | que l'archivage d'un bénéficiaire archive automatiquement notes, documents, tâches (si tous ses bénéficiaires liés sont archivés) | ne pas avoir à archiver chaque élément manuellement et garder un dossier cohérent |

---

**Hors scope de ce document**

- **Statistiques sur le dashboard Administrateur** : évoqué mais volontairement pas détaillé ici, c'est une fonctionnalité à part entière à cadrer séparément (V2 probable).