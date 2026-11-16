import { createBrowserRouter, type RouteObject } from 'react-router';
import { ErrorPage } from '@/app/ErrorPage';
import { NotFoundPage } from '@/app/NotFoundPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/ui/loading-state';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAdmin } from '@/features/auth/RequireAdmin';
import { RequireAuth } from '@/features/auth/RequireAuth';

// Même page pour la création et la modification
const lazyBeneficiaryFormPage = () =>
  import('@/features/beneficiaries/BeneficiaryFormPage').then(
    ({ BeneficiaryFormPage }) => ({ Component: BeneficiaryFormPage }),
  );

/*
 * Éco-conception : chaque page métier est chargée à la demande (option lazy).
 * Son code n'est téléchargé qu'à sa première visite, au lieu d'être livré
 * avec toute l'application. Restent dans le fichier principal : la connexion,
 * la structure commune (layout, contrôle d'accès) et les pages d'erreur.
 */
export const routes: RouteObject[] = [
  {
    // Erreur imprévue dans une page : affiche ErrorPage au lieu d'un écran blanc
    errorElement: <ErrorPage />,
    // Affiché au premier chargement, le temps de télécharger la page demandée
    hydrateFallbackElement: <LoadingState className="min-h-dvh" />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: '/',
                lazy: () =>
                  import('@/features/home/HomePage').then(({ HomePage }) => ({
                    Component: HomePage,
                  })),
              },
              {
                path: '/beneficiaries',
                lazy: () =>
                  import('@/features/beneficiaries/BeneficiariesPage').then(
                    ({ BeneficiariesPage }) => ({
                      Component: BeneficiariesPage,
                    }),
                  ),
              },
              {
                path: '/beneficiaries/new',
                lazy: lazyBeneficiaryFormPage,
              },
              {
                path: '/beneficiaries/:id',
                lazy: () =>
                  import('@/features/beneficiaries/BeneficiaryPage').then(
                    ({ BeneficiaryPage }) => ({ Component: BeneficiaryPage }),
                  ),
              },
              {
                path: '/beneficiaries/:id/edit',
                lazy: lazyBeneficiaryFormPage,
              },
              {
                path: '/tasks',
                lazy: () =>
                  import('@/features/tasks/TasksPage').then(
                    ({ TasksPage }) => ({ Component: TasksPage }),
                  ),
              },
              {
                path: '/tasks/:id',
                lazy: () =>
                  import('@/features/tasks/TaskPage').then(({ TaskPage }) => ({
                    Component: TaskPage,
                  })),
              },
              {
                path: '/planning',
                lazy: () =>
                  import('@/features/planning/PlanningPage').then(
                    ({ PlanningPage }) => ({ Component: PlanningPage }),
                  ),
              },
              {
                path: '/profile',
                lazy: () =>
                  import('@/features/profile/ProfilePage').then(
                    ({ ProfilePage }) => ({ Component: ProfilePage }),
                  ),
              },
              {
                element: <RequireAdmin />,
                children: [
                  {
                    path: '/users',
                    lazy: () =>
                      import('@/features/users/UsersPage').then(
                        ({ UsersPage }) => ({ Component: UsersPage }),
                      ),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
