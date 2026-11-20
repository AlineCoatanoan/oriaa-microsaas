import { Eye, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { DataListRow, IconLink, RowLink } from '@/components/ui/data-list';
import type { ActionResult } from '@/components/ui/result-message';
import { TaskDueDate } from './TaskDueDate';
import { TaskFieldSelect } from './TaskFieldSelect';
import type { Task } from './types';

/** Mêmes colonnes pour l'en-tête et les lignes, quand la liste est assez large. */
export const taskColumns =
  '@3xl:grid @3xl:grid-cols-[2fr_1.5fr_1.3fr_9rem_8rem_auto] @3xl:items-center @3xl:gap-4';

/** Titres des colonnes : la deuxième dépend de la liste. */
export function TaskHeaders({ details }: { details: string }) {
  return (
    <>
      <span>Titre</span>
      <span>{details}</span>
      <span>Échéance</span>
      <span>Statut</span>
      <span>Priorité</span>
      <span className="w-[5.5rem]" />
    </>
  );
}

type TaskRowProps = {
  task: Task;
  /** Deuxième colonne : les bénéficiaires ou les responsables. */
  details: ReactNode;
  /** Message à annoncer après un changement de statut ou de priorité. */
  onResult: (result: ActionResult) => void;
};

/** Une tâche dans une liste (page Tâches, onglet de la fiche bénéficiaire). */
export function TaskRow({ task, details, onResult }: TaskRowProps) {
  return (
    <DataListRow
      columns={taskColumns}
      actions={
        <>
          <IconLink
            to={`/tasks/${task.id}`}
            label={`Voir la tâche « ${task.title} »`}
            icon={Eye}
          />
          {/* Une tâche archivée est en lecture seule */}
          {!task.isArchived && (
            <IconLink
              to={`/tasks/${task.id}/edit`}
              label={`Modifier la tâche « ${task.title} »`}
              icon={Pencil}
            />
          )}
        </>
      }
    >
      <RowLink to={`/tasks/${task.id}`} className="block">
        {task.title}
      </RowLink>
      <p className="text-sm text-muted @3xl:text-base @3xl:text-structure">
        {details}
      </p>
      <p className="text-sm @3xl:text-base">
        <span className="text-muted @3xl:sr-only">Échéance : </span>
        <TaskDueDate task={task} />
      </p>
      <div className="flex flex-wrap items-center gap-2 @3xl:contents">
        {/* Au-dessus du lien de la ligne pour rester cliquables */}
        <div className="relative z-10 w-32">
          <TaskFieldSelect
            task={task}
            field="status"
            disabled={task.isArchived}
            onResult={onResult}
          />
        </div>
        <div className="relative z-10 w-28">
          <TaskFieldSelect
            task={task}
            field="priority"
            disabled={task.isArchived}
            onResult={onResult}
          />
        </div>
      </div>
    </DataListRow>
  );
}
