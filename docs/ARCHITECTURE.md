# Architecture

## Vue d'ensemble

ORIAA est une application web reposant sur une architecture multicouche avec un frontend React et un backend Express distincts.

Cette séparation permet de découpler totalement l'interface utilisateur de la logique métier. Le frontend consomme une API REST exposée par le backend via des requêtes HTTP.

Cette architecture est proche de celles utilisées en entreprise et facilite la maintenance, les évolutions futures ainsi que le remplacement éventuel de l'interface utilisateur sans modifier le cœur métier.

Le choix d'un backend et d'un frontend séparés constitue également une contrainte du projet de formation.

---

# Patron d'architecture

L'application repose sur une architecture multicouche (Layered Architecture).

Chaque couche possède une responsabilité unique :

- la couche présentation reçoit les requêtes HTTP et renvoie les réponses ;
- la couche métier contient les règles fonctionnelles ;
- la couche d'accès aux données communique avec la base PostgreSQL ;
- la base de données assure la persistance des informations.

Cette organisation améliore la lisibilité du code, facilite les tests et limite les dépendances entre les différentes parties de l'application.

---

# Organisation du backend

## Présentation

La couche présentation est composée des routes Express et des contrôleurs.

Les routes définissent les points d'entrée de l'API REST tandis que les contrôleurs récupèrent les données des requêtes HTTP et appellent les services métier.

Cette couche ne contient aucune logique métier.

## Métier

La logique métier est regroupée dans les services.

Les services appliquent les règles fonctionnelles de l'application (gestion des bénéficiaires, des rendez-vous, des tâches, etc.) et orchestrent les échanges avec les repositories.

Cette séparation facilite les tests unitaires et évite de dupliquer les traitements.

## Accès aux données

L'accès aux données est assuré par Prisma.

Les repositories utilisent Prisma pour effectuer les opérations de lecture, création, modification et suppression dans PostgreSQL.

L'utilisation d'un ORM améliore la lisibilité du code et simplifie les migrations de base de données.

## Données

Les données sont stockées dans une base PostgreSQL.

Ce SGBD a été retenu pour sa robustesse, sa fiabilité et sa bonne gestion des relations entre les différentes entités du domaine métier.

---

# Communication entre les applications

Le frontend React communique avec le backend Express via une API REST.

Les échanges sont réalisés au format JSON grâce à des requêtes HTTP.

Cette séparation permet au backend d'être indépendant de l'interface utilisateur et de pouvoir être réutilisé par d'autres clients si nécessaire.

---

# Sécurité

Plusieurs mécanismes sont mis en place afin de sécuriser l'application.

## Authentification

L'authentification repose sur des JSON Web Tokens (JWT).

Après authentification, un jeton est généré puis transmis au client afin de sécuriser les appels à l'API.

Les mots de passe sont hachés avec bcrypt avant leur stockage en base de données.

## Validation des données

Les données reçues par l'API sont validées avec Joi avant tout traitement.

Cette validation permet de limiter les erreurs et de prévenir certaines attaques liées aux entrées utilisateur.

## Protection de l'API

Helmet est utilisé afin d'ajouter différents en-têtes HTTP de sécurité.

La configuration CORS limite les origines autorisées à communiquer avec l'API.

Les routes protégées utilisent un middleware JWT afin de vérifier l'identité de l'utilisateur et ses droits d'accès.

## Gestion des secrets

Les informations sensibles (clé JWT, identifiants de connexion, paramètres de la base de données, etc.) sont stockées dans des variables d'environnement.

Elles ne sont jamais intégrées directement dans le code source.

Cette approche s'inscrit dans les recommandations de l'ANSSI concernant la protection des secrets applicatifs.

---

# Sobriété numérique

L'application applique plusieurs principes d'éco-conception.

Les données échangées entre le frontend et le backend sont limitées aux informations réellement nécessaires.

Lorsque le volume de données le nécessite, la pagination permet de ne charger qu'une partie des résultats.

Cette approche réduit les transferts réseau et améliore les performances de l'application.

Le découpage de l'application en couches indépendantes facilite également sa maintenance et limite les réécritures importantes au cours de son évolution.

---

# Stack technique

| Élément | Choix | Justification |
|----------|-------|---------------|
| Langage | TypeScript | Typage statique et meilleure maintenabilité |
| Frontend | React (Vite) | Interface moderne et réactive |
| Backend | Express | API REST simple et largement utilisée |
| ORM | Prisma | Typage, migrations et productivité |
| Base de données | PostgreSQL | Robustesse et gestion des relations |
| Authentification | JWT + bcrypt | API stateless et stockage sécurisé des mots de passe |
| Validation | Joi | Validation des entrées utilisateur |
| Sécurité | Helmet + CORS | Protection de l'API |
| Tests | Jest, Supertest, Playwright | Tests unitaires, API et end-to-end |
| CI/CD | GitHub Actions | Automatisation des tests |
| Conteneurisation | Docker | Reproductibilité des environnements |