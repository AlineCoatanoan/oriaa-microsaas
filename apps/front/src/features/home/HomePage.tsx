import { CalendarDays, CircleAlert, Flag } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/useSession';
import { useAppointments } from '@/features/planning/useAppointments';
import { useTasks } from '@/features/tasks/useTasks';
import { dayRange, toDateKey } from '@/lib/dates';
import { countTaskAlerts, selectTodayTasks } from './home-tasks';
import { StatCard } from './StatCard';
import { TodayAppointments } from './TodayAppointments';
import { TodayTasks } from './TodayTasks';

export function HomePage() {
  const user = useCurrentUser();
  const today = new Date();
  const appointmentsQuery = useAppointments({
    ...dayRange(today),
    userId: user.id,
  });
  const tasksQuery = useTasks({ assigneeId: user.id });

  const tasks = tasksQuery.data ?? [];
  const todayTasks = selectTodayTasks(tasks, toDateKey(today));
  const alerts = tasksQuery.data ? countTaskAlerts(tasks) : undefined;

  return (
    <div className="space-y-6">
      <title>Accueil – Oriaa</title>

      <div className="space-y-1">
        <h1>Bonjour {user.firstName}</h1>
        <p className="text-muted">
          Voici un aperçu de votre activité aujourd'hui.
        </p>
      </div>

      <section aria-label="Indicateurs du jour">
        <ul className="grid grid-cols-3 gap-3 md:gap-6">
          <li>
            <StatCard
              to="/planning"
              icon={CalendarDays}
              value={appointmentsQuery.data?.length}
              label="RDV aujourd'hui"
              tone="info"
            />
          </li>
          <li>
            <StatCard
              to="/tasks"
              icon={CircleAlert}
              value={alerts?.overdue}
              label="Tâches en retard"
              tone="danger"
            />
          </li>
          <li>
            <StatCard
              to="/tasks"
              icon={Flag}
              value={alerts?.urgent}
              label="Tâches prioritaires"
              tone="warning"
            />
          </li>
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <TodayAppointments query={appointmentsQuery} />
        <TodayTasks tasks={todayTasks} query={tasksQuery} />
      </div>
    </div>
  );
}
