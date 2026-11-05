import { createBrowserRouter, type RouteObject } from 'react-router';
import { NotFoundPage } from '@/app/NotFoundPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAdmin } from '@/features/auth/RequireAdmin';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { BeneficiariesPage } from '@/features/beneficiaries/BeneficiariesPage';
import { BeneficiaryPage } from '@/features/beneficiaries/BeneficiaryPage';
import { HomePage } from '@/features/home/HomePage';
import { PlanningPage } from '@/features/planning/PlanningPage';
import { TasksPage } from '@/features/tasks/TasksPage';
import { UsersPage } from '@/features/users/UsersPage';

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/beneficiaries', element: <BeneficiariesPage /> },
      { path: '/beneficiaries/:id', element: <BeneficiaryPage /> },
      { path: '/tasks', element: <TasksPage /> },
      { path: '/planning', element: <PlanningPage /> },
      {
        element: <RequireAdmin />,
        children: [{ path: '/users', element: <UsersPage /> }],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
