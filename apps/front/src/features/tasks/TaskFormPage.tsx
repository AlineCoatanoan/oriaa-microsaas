import { useParams } from 'react-router';
import { BackLink } from '@/components/ui/back-link';
import { DetailQuery } from '@/components/ui/detail-query';
import { TaskForm } from './TaskForm';
import type { TaskDetails } from './types';
import { useTask } from './useTask';

export function TaskFormPage() {
  const { id } = useParams();

  return id ? <EditTask id={Number(id)} /> : <CreateTask />;
}

function CreateTask() {
  return (
    <div className="space-y-6">
      <title>Nouvelle tâche – Oriaa</title>
      <BackLink to="/tasks">Tâches</BackLink>
      <h1>Nouvelle tâche</h1>
      <TaskForm />
    </div>
  );
}

function EditTask({ id }: { id: number }) {
  const query = useTask(id);

  return (
    <DetailQuery query={query} backTo="/tasks" backLabel="Tâches">
      {(task) => <EditTaskForm task={task} />}
    </DetailQuery>
  );
}

function EditTaskForm({ task }: { task: TaskDetails }) {
  return (
    <div className="space-y-6">
      <title>{`Modifier ${task.title} – Oriaa`}</title>
      <BackLink to={`/tasks/${task.id}`}>{task.title}</BackLink>
      <h1>Modifier la tâche</h1>
      {/* Règle métier : une tâche archivée est en lecture seule */}
      {task.isArchived ? (
        <p className="rounded-lg bg-info-soft p-4 text-interaction">
          Cette tâche est archivée : tous ses bénéficiaires sont archivés. Elle
          est en lecture seule.
        </p>
      ) : (
        <TaskForm task={task} />
      )}
    </div>
  );
}
