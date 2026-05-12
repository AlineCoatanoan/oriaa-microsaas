# PRD — Oriaa
**Outil de suivi des bénéficiaires · Structures d'hébergement · Secteur précarité**

> Version 1.0 · Mai 2026 · Projet pédagogique CDA · Aline Coatanoan

---

## 1. Le problème

Le secteur social regroupe de nombreux domaines (précarité, hébergement, protection de l'enfance, handicap, addictologie…). Au cours de dix années d'exercice en tant qu'éducatrice spécialisée, j'ai constaté que de nombreuses structures travaillent encore avec des outils limités ou des procédures majoritairement papier, ce qui complexifie le suivi et la coordination des accompagnements.

Sur les deux dernières années de cette expérience, j'ai utilisé un logiciel d'accompagnement qui a permis d'améliorer la gestion des dossiers et de réduire l'usage du papier. Cet outil ne répondait toutefois pas à l'ensemble des besoins métiers, notamment en termes de flexibilité et d'adaptation aux spécificités de chaque structure.

**Conséquences concrètes :**

- Les informations d'un bénéficiaire sont éparpillées entre cahier papier, e-mails, fichiers Excel et logiciel interne.
- Retrouver un élément précis lors d'un appel ou d'une réunion prend plusieurs minutes.
- En cas d'absence ou de remplacement, la transmission est laborieuse et partielle : la continuité de l'accompagnement est fragilisée.
- Les pièces jointes (attestations, courriers) sont disséminées dans les e-mails ou déposées n'importe comment sur le PC et deviennent introuvables au moment voulu.
- Avec une trentaine de dossiers actifs, il est impossible de garder en tête les tâches en cours pour chaque bénéficiaire : l'éduc doit ouvrir chaque dossier un par un pour retrouver ce qui est urgent, ce qui est en attente, ce qui a une deadline proche.

---

## 2. La cible

**Sophie — Éducatrice spécialisée en CHRS**

Elle gère une vingtaine de dossiers actifs simultanément. Elle n'a pas de temps à perdre en saisie : l'outil doit être rapide et sans friction. Elle travaille majoritairement sur ordinateur, parfois sur téléphone lors de visites à domicile.

> Ce que Sophie veut : accéder en quelques secondes au dossier et à l'historique complet d'un bénéficiaire, savoir où en est son parcours, laisser une trace fiable de chaque action sans que ça lui coûte plus de deux minutes et commencer chaque journée avec une vue claire de ce qu'elle a à faire, sans devoir ouvrir trente dossiers.

---

## 3. La proposition de valeur

**Oriaa** — du latin *oriri* (naître, apparaître) et *origo* (point de départ) — est une application web interne qui centralise le suivi des bénéficiaires d'une structure d'hébergement en un seul endroit : fiche individuelle, statuts de parcours, documents joints, et gestion des tâches quotidiennes liées aux dossiers.

Il ne s'agit pas d'un produit destiné à être commercialisé, mais d'un **projet pédagogique** démontrant une démarche de conception logicielle complète. Oriaa ne remplace pas les logiciels institutionnels (SI-SIAO, etc.), il comble le vide opérationnel du quotidien.

---

## 4. La fonctionnalité principale — Module suivi bénéficiaire

La V1 se concentre sur **un seul module** : Vue des tâches quotidiennes liées aux bénéficiaires.

Une interface centralisée permettant à un travailleur social de visualiser toutes ses tâches en cours, triées par urgence et échéance, avec accès direct au dossier bénéficiaire associé.

| Fonctionnalité | Priorité | Sprint |
|---|---|---|
| Authentification (connexion / session) | **MUST** | 1 |
| Gestion des bénéficiaires — CRUD + archivage | **MUST** | 1 |
| Statuts et étapes du parcours | **MUST** | 1 |
| Fiche individuelle bénéficiaire | **MUST** | 2 |
| Gestion des tâches quotidiennes | **MUST** | 2 |
| Recherche et filtres | **MUST** | 2 |
| Documents joints | **MUST** | 3 |
| Tableau de bord / statistiques | **SHOULD** | 4 |

**Détail des comportements clés :**

- **Fiche bénéficiaire :** organisée en onglets thématiques (RDV, Démarches, Tâches, Documents…) complétés d'une vue Historique : timeline chronologique qui agrège l'ensemble des événements du dossier, quel que soit leur type. Chaque entrée est horodatée, attribuée à son auteur et immuable : intégrité de la traçabilité garantie.
- **Tâches quotidiennes :** l'éduc dispose d'une vue personnelle de toutes ses tâches, triées par urgence et deadline, avec le nom du bénéficiaire concerné en lien direct vers son dossier. Une tâche peut aussi être générale (non liée à un bénéficiaire). Un RDV enregistré dans le journal peut générer une tâche associée. C'est le pendant numérique du cahier papier : sauf qu'il parle aux dossiers.
- **Statuts :** `En attente → Accueilli → En accompagnement → En transition → Sorti → Archivé`. Chaque changement déclenche automatiquement une entrée dans le journal.
- **Recherche :** résultats en temps réel par nom, statut, date ou référent, depuis n'importe quelle page.
- **Documents :** upload (PDF, JPG, PNG, DOCX · max 10 Mo), nommage automatique avec date et auteur, téléchargement en un clic.

**Stack technique :**

- Front : React (SPA) · Tailwind CSS · shadcn/ui
- Back : Express.js · Prisma ORM · PostgreSQL · JWT
- Tests & infra : Jest · Playwright · Docker · GitHub Actions

---

## 5. Métriques de succès

| Métrique | Cible |
|---|---|
| Accès à une fiche bénéficiaire | < 10 secondes depuis n'importe où dans l'app |
| Chargement d'une page | < 2 s sur connexion standard |
| Couverture de tests | > 80 % sur les fonctionnalités critiques |

---

## 6. Hors périmètre — Version 1

Les éléments suivants sont identifiés mais explicitement exclus de la V1. Ils constituent des fonctionnalités secondaires documentées, envisageables en V2.

- **Planning / calendrier :** les interventions sont tracées.
- **Annuaire partenaires :** les infos partenariales peuvent être mentionnées.
- **Exports PDF / CSV** 
- **Notifications et rappels automatiques** 
- **Gestion de rôles multiples :** un seul niveau d'accès en V1. Différenciation admin / manager / travailleur envisagée en V2.
- **Application mobile native :** la V1 est une SPA web responsive, utilisable sur téléphone. Une app mobile dédiée est identifiée comme l'évolution naturelle en V2 : le besoin terrain est réel, notamment pour les visites à domicile.
- **Multi-structures :** architecture mono-structure en V1.

---

## 7. Hypothèses et risques

**Hypothèses posées :**

- Un seul niveau d'accès est suffisant pour la V1.
- Les utilisateurs disposent d'un navigateur moderne et d'une connexion stable.
- Les données de démo seront entièrement inventées.

**Risques identifiés :**

| Risque | Probabilité | Mitigation |
|---|---|---|
| **Retard de conception (MCD/MLD mal posé)** : une modélisation bancale en amont provoque des blocages en développement et oblige à tout reprendre. C'est le risque le plus structurant du projet. | Forte | Consacrer le temps nécessaire aux phases 1 et 2 avant d'écrire la moindre ligne de code. Faire valider le MCD par le formateur avant de commencer le développement. |
| **Retard technique global** : développement solo, auth JWT, gestion de fichiers : plusieurs fonctionnalités sont plus complexes qu'elles n'y paraissent. | Forte | Si retard avéré : déclasser des MUST en SHOULD plutôt que de livrer quelque chose de bancal. Mieux vaut moins de fonctionnalités qui tournent vraiment. |
| **Scope creep** : tendance à vouloir ajouter des fonctionnalités dès qu'une idée émerge, que ce soit au démarrage d'un sprint ou en plein milieu. | Forte | Toute nouvelle idée est notée dans un backlog V2 et ne rentre pas dans la V1. Le périmètre est figé après la phase de conception. |
| **Problème d'infrastructure le jour de la démo** : serveur distant indisponible ou instable lors de la soutenance. | Faible | L'application sera dockerisée et pourra être lancée en local depuis l'ordinateur personnel en moins de 5 minutes. |

**Contraintes non négociables :**

- L'application étant conçue pour traiter des données de personnes vulnérables, les choix d'architecture respectent les principes RGPD dès la V1 (privacy by design) même si les données utilisées en démo sont entièrement fictives.
- Développement solo, réalisé lors de la formation et sur temps libre (35h par semaine en entreprise = impossibilité de dévlopper Oriaa) la disponibilité effective est limitée et variable.
- V1 entièrement fonctionnelle et déployée pour la soutenance.

---

## 8. Cas d'utilisation & user stories 

**Use Case principal — La journée de Sophie**
Sophie commence sa journée sur Oriaa. Elle ouvre sa vue tâches : elle voit immédiatement ce qui est urgent, ce qui a une deadline aujourd'hui, avec le nom du bénéficiaire concerné. Elle clique sur une tâche → elle est directement dans le dossier. Elle termine un RDV, ajoute une entrée dans le journal, crée une nouvelle tâche de suivi. Deux minutes, zéro friction, rien d'oublié.

---

> **US-01** · En tant que travailleur social, je veux retrouver la fiche d'un bénéficiaire en quelques secondes afin de ne pas perdre de temps lors d'un entretien.
> — *Critères : recherche temps réel depuis toutes les pages, fiche en 1 clic.*

> **US-02** · En tant que travailleur social, je veux enregistrer une note après chaque entretien afin de conserver un historique fiable et daté.
> — *Critères : entrée horodatée + auteur automatiques, immuable après enregistrement.*

> **US-03** · En tant que travailleur social, je veux voir toutes mes tâches du jour en un coup d'œil, triées par urgence, avec le bénéficiaire concerné, afin de ne pas avoir à ouvrir chaque dossier pour savoir quoi faire.
> — *Critères : vue tâches accessible depuis la page d'accueil, tri par urgence/deadline, lien direct vers le dossier bénéficiaire, possibilité de tâche générale sans bénéficiaire associé.*

> **US-04** · En tant que travailleur social, je veux mettre à jour le statut d'un bénéficiaire afin de savoir en un coup d'œil où en est son accompagnement.
> — *Critères : statut visible sur la fiche et la liste, changement tracé automatiquement dans le journal.*

> **US-05** · En tant que travailleur social, je veux joindre des documents au dossier afin de ne plus chercher les pièces dans mes e-mails.
> — *Critères : upload depuis la fiche, document nommé + daté + auteur automatiques.*

---
