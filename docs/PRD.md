# PRD - Oriaa
**Outil de suivi des bénéficiaires · Structures d'hébergement · Secteur précarité**

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

## 2. La cible : Le persona

*Agathe : Éducatrice spécialisée en CHRS (hébergement diffus)*

Agathe travaille dans une structure d’hébergement en diffus. Elle accompagne environ 15 à 30 personnes selon les périodes, avec des situations très hétérogènes : ruptures de parcours, insertion, santé mentale, démarches administratives, accès au logement, etc.

Son travail se partage entre :

- des visites à domicile dans différents logements diffus
- des entretiens au bureau
- des réunions d’équipe pluridisciplinaire
- des échanges partenaires (CAF, CMP, bailleurs, associations…)
- et beaucoup d’écrits professionnels

**Son quotidien réel**

Agathe n’a jamais une journée “linéaire”.

Elle commence souvent sa journée avec :

- des urgences imprévues (appel d’un bénéficiaire, mail d’un partenaire, urgence en hébergement...)
- des informations arrivées la veille au soir
- des changements de planning

Elle passe sa journée à :

- changer de contexte en permanence (bureau → terrain → bureau)
- gérer des interruptions fréquentes
- reconstituer mentalement “où en est chaque situation”

Et elle termine souvent sa journée avec :

- des notes à écrire rapidement avant d’oublier
- des tâches à reporter
- une fatigue cognitive liée à la dispersion des informations

**Sa vraie problématique** 

- dispersion des informations entre plusieurs supports (papier, e-mails, fichiers, outils différents)
- difficulté à retrouver rapidement une information précise
- multiplication des points de saisie pour une même information
- charge mentale liée au suivi simultané de plusieurs situations
- nécessité de reconstituer mentalement l’historique d’une situation avant chaque interaction
- perte de continuité possible en cas d’absence ou de changement de référent

**Ses contraintes terrain** 

- interruptions fréquentes dans le travail quotidien
- déplacements réguliers hors du bureau
- nécessité de travailler parfois dans l’urgence
- temps limité pour la rédaction des écrits professionnels
- forte dépendance à la transmission d’informations entre collègues
- gestion simultanée de nombreux dossiers actifs

---

## 3. La proposition de valeur

**Oriaa** du latin *oriri* (naître, apparaître) et *origo* (point de départ) est une application web interne qui centralise le suivi des bénéficiaires d'une structure d'hébergement en un seul endroit : fiche individuelle, statuts de parcours, documents joints, et gestion des tâches quotidiennes liées aux dossiers.

Il ne s'agit pas d'un produit destiné à être commercialisé, mais d'un **projet pédagogique** démontrant une démarche de conception logicielle complète. Oriaa ne remplace pas les logiciels institutionnels (SI-SIAO, etc.), il comble le vide opérationnel du quotidien.

---

## 4. La fonctionnalité principale : Module suivi bénéficiaire

La V1 se concentre sur **une fonctionnalité principale :** Permettre à un travailleur social de suivre, prioriser et tracer les actions liées aux personnes accompagnées sans perte d’information.

Une interface centralisée permettant à un travailleur social de visualiser toutes ses tâches en cours, triées par urgence et échéance, avec accès direct au dossier bénéficiaire associé.

**Gestion des bénéficiaires (socle métier)**

C’est la base indispensable du système.

Création / modification / archivage d’un bénéficiaire
Fiche bénéficiaire centralisée
Vue synthétique de la situation
Notes de suivi (RDV + tâches associées)

Sans ça, aucun suivi n’est possible.

**Module Tâches (cœur fonctionnel du produit)**

### C’est le module central de la V1.

Création de tâches
Tâches liées ou non liées à un bénéficiaire
Priorisation (urgence / échéance)
Vue quotidienne des tâches de l’utilisateur (comportement par défaut : affichage des tâches de l’utilisateur connecté)
Accès direct au dossier bénéficiaire depuis une tâche
Possibilité de générer une tâche depuis une action ou un RDV
Système de filtrage des tâches (par bénéficiaire, statut, échéance, collègues)

**--> V1 Bis : Gestion des rendez-vous/planning (activité terrain)**

Permet de créer les tâches lors du RDV.
Il pourrait s'agir d'une fonctionnalité à part entière. Fonctionnalité simplifiée dans un premier temps.

L'idéal : 
Création de rendez-vous (bureau / domicile / partenaire)
Association à un bénéficiaire
Association à un véhicule de service
Vue planning (paramètres par défaut : affichage du planning de l’utilisateur connecté)
Possibilité de générer des tâches depuis un RDV
Système de filtrage du planning (par bénéficiaire, collègues)

---

## 5. Métriques de succès

- Temps d’accès à une fiche bénéficiaire : inférieur à 10 secondes depuis n’importe quelle page
- Temps moyen de création d’une tâche ou d’un rendez-vous : inférieur à 2 minutes
- Taux d’utilisateurs actifs ayant créé au moins une tâche sur une période donnée (hebdomadaire)

---

## 6. Hors périmètre 

### V2 (évolutions fonctionnelles)

Les éléments suivants sont identifiés mais explicitement exclus de la V1. Ils constituent des fonctionnalités secondaires documentées, envisageables en V2.

- **Répertoire partenaires :** centralisation des contacts externes utilisés dans le cadre de l’accompagnement (CAF, CMP, bailleurs, associations…).

- **Exports et reporting :** génération de documents au format PDF ou CSV (dossiers bénéficiaires, listes de tâches, synthèses d’activité).

- **Notifications et rappels :** système d’alertes pour les échéances de tâches et rendez-vous.

- **Gestion des rôles utilisateurs :** introduction de profils différenciés (travailleur social, coordinateur, administration) avec des vues adaptées (personnelles ou globales).

- **Application mobile :** évolution vers une application dédiée pour faciliter l’usage terrain, notamment lors des visites à domicile.

- **Tableau de bord direction :** vue globale de l’activité (statistiques) (bénéficiaires, tâches, rendez-vous) destinée aux profils d’encadrement.


### V3 (évolution vers un outil de gestion complète d’établissement)

- **Gestion des fonds éducatifs :** Suivi des participations financières des bénéficiaires, suivi des dépenses associés (fournitures, aide alimentaires...), gestion des justificatifs.
- **Gestion RH :** Suivi des heures travaillées, déclaration des heures supp, gestion des demandes de congés...
- **Gestion avancées des hébergements:** Gestion du parc hébergement, Suivi des entrées, sorties, travaux à prévoir, ménages à prévoir, adresses... 
- **Gestion véhicules de service :** Accessible en tant que coordinateur et admin. Entretien véhicule. 

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

- L'application étant conçue pour traiter des données de personnes vulnérables, les choix d'architecture respectent les principes RGPD dès la V1 même si les données utilisées en démo sont entièrement fictives.
- Développement solo, réalisé lors de la formation et sur temps libre (35h par semaine en entreprise = impossibilité de dévlopper Oriaa) la disponibilité effective est limitée et variable.
- V1 entièrement fonctionnelle et déployée pour la soutenance.

---


