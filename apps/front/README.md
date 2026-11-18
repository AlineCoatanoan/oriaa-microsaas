# Oriaa – front

Interface web d'Oriaa : React 19, TypeScript, Vite, Tailwind CSS 4, React Router et TanStack Query.

## Commandes

À lancer depuis la racine du dépôt :

| Commande                    | Rôle                                                            |
| --------------------------- | --------------------------------------------------------------- |
| `pnpm dev:front`            | Serveur de développement (l'API doit tourner : `pnpm dev:back`) |
| `pnpm test:front`           | Tests (Vitest + Testing Library)                                |
| `pnpm --filter front build` | Build de production dans `dist/`                                |
| `pnpm lint`                 | ESLint sur tout le dépôt                                        |

En développement, les appels à `/api` sont transmis au back (`http://localhost:3000`) : même origine, donc le cookie de session est accepté.

## Organisation de `src/`

| Dossier               | Contenu                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `app/`                | Routeur, client TanStack Query, pages d'erreur et 404                                                |
| `components/ui/`      | Composants d'interface réutilisables (boutons, champs, cartes…)                                      |
| `components/layout/`  | Structure commune : en-tête, menu, mise en page                                                      |
| `features/<domaine>/` | Une fonctionnalité par dossier (bénéficiaires, tâches…) : pages, composants, hooks de données, types |
| `lib/`                | Utilitaires sans interface : appels API, dates, formatage, recherche                                 |
| `test/`               | Configuration des tests                                                                              |

## Conventions

- Composants en PascalCase, hooks en `useX`, utilitaires en kebab-case ; les composants de `components/ui/` sont en kebab-case (convention shadcn/ui)
- Les tests sont à côté du fichier testé (`X.test.tsx`)
- Les pages métier sont chargées à la demande (`lazy` dans `app/router.tsx`)
- Les filtres des listes sont gardés dans l'URL
