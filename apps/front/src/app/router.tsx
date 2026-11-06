import { createBrowserRouter, type RouteObject } from 'react-router';
import { ErrorPage } from '@/app/ErrorPage';
import { NotFoundPage } from '@/app/NotFoundPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAdmin } from '@/features/auth/RequireAdmin';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { BeneficiariesPage } from '@/features/beneficiaries/BeneficiariesPage';
import { BeneficiaryPage } from '@/features/beneficiaries/BeneficiaryPage';
import { HomePage } from '@/features/home/HomePage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { PlanningPage } from '@/features/planning/PlanningPage';
import { TaskPage } from '@/features/tasks/TaskPage';
import { TasksPage } from '@/features/tasks/TasksPage';
import { UsersPage } from '@/features/users/UsersPage';

export const routes: RouteObject[] = [
  {
    // Erreur imprévue dans une page : affiche ErrorPage au lieu d'un écran blanc
    errorElement: <ErrorPage />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/', element: <HomePage /> },
              { path: '/beneficiaries', element: <BeneficiariesPage /> },
              { path: '/beneficiaries/:id', element: <BeneficiaryPage /> },
              { path: '/tasks', element: <TasksPage /> },
              { path: '/tasks/:id', element: <TaskPage /> },
              { path: '/planning', element: <PlanningPage /> },
              { path: '/profile', element: <ProfilePage /> },
              {
                element: <RequireAdmin />,
                children: [{ path: '/users', element: <UsersPage /> }],
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
