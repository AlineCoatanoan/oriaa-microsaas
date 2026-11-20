import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { DataList } from '@/components/ui/data-list';
import { QueryState } from '@/components/ui/query-state';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { Beneficiary } from '@/features/beneficiaries/types';
import { PersonName } from '@/features/users/PersonName';
import { plural } from '@/lib/format';
import { isCompleted, sortByDueDate, sortByLastUpdate } from './filter-tasks';
import { TaskHeaders, TaskRow, taskColumns } from './TaskRow';
import { useTasks } from './useTasks';

type View = 'todo' | 'done';

const viewOptions: { value: View; label: string }[] = [
  { value: 'todo', label: 'À faire' },
  { value: 'done', label: 'Terminées' },
];

/** Onglet « Tâches » de la fiche : toutes les tâches du bénéficiaire. */
export function BeneficiaryTasks({
  beneficiary,
}: {
  beneficiary: Beneficiary;
}) {
  // Avec beneficiaryId, l'API renvoie aussi les tâches archivées
  const query = useTasks({ beneficiaryId: beneficiary.id });
  const [view, setView] = useState<View>('todo');
  const [result, setResult] = useState<ActionResult>();

  const tasks = query.data ?? [];
  const sorted =
    view === 'done'
      ? sortByLastUpdate(tasks.filter(isCompleted))
      : sortByDueDate(tasks.filter((task) => !isCompleted(task)));
  const viewLabel =
    view === 'done' ? plural(sorted.length, 'terminée') : 'à faire';
  const status = `${sorted.length} ${plural(sorted.length, 'tâche')} ${viewLabel}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6">
        <SegmentedControl
          label="Tâches affichées"
          options={viewOptions}
          value={view}
          onChange={setView}
        />
        {/* Un dossier archivé est en lecture seule */}
        {!beneficiary.archivedAt && (
          <ButtonLink
            variant="outline"
            to={`/tasks/new?beneficiaryId=${beneficiary.id}`}
          >
            <Plus className="size-4" aria-hidden="true" />
            Ajouter une tâche
          </ButtonLink>
        )}
      </div>

      <div className={result && 'px-4 md:px-6'}>
        <ResultMessage result={result} />
      </div>

      <QueryState query={query}>
        <DataList
          status={status}
          page={1}
          pageCount={1}
          isEmpty={sorted.length === 0}
          emptyMessage={
            view === 'done'
              ? 'Aucune tâche terminée.'
              : 'Aucune tâche à faire pour ce bénéficiaire.'
          }
          columns={taskColumns}
          headers={<TaskHeaders details="Responsables" />}
        >
          {sorted.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onResult={setResult}
              details={
                <>
                  <span className="@3xl:sr-only">
                    {plural(task.assignees.length, 'Responsable')} :{' '}
                  </span>
                  {task.assignees.map((person, index) => (
                    <span key={person.id}>
                      {index > 0 && ', '}
                      <PersonName person={person} />
                    </span>
                  ))}
                </>
              }
            />
          ))}
        </DataList>
      </QueryState>
    </div>
  );
}
