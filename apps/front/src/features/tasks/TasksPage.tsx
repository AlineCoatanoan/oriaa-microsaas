import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataList } from '@/components/ui/data-list';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import { Pagination } from '@/components/ui/pagination';
import { QueryState } from '@/components/ui/query-state';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  PersonFilterSelect,
  SavedPersonFilter,
} from '@/features/filter-preference/PersonFilter';
import { usePersonFilter } from '@/features/filter-preference/usePersonFilter';
import { formatBeneficiaries, plural } from '@/lib/format';
import { paginate } from '@/lib/paginate';
import { uniquePeople } from '@/lib/people';
import { useNavigationMessage } from '@/lib/useNavigationMessage';
import { useUpdateSearchParam } from '@/lib/useUpdateSearchParam';
import { cn } from '@/lib/utils';
import {
  filterTasks,
  isCompleted,
  sortByDueDate,
  sortByLastUpdate,
} from './filter-tasks';
import { TaskHeaders, TaskRow, taskColumns } from './TaskRow';
import { useTasks } from './useTasks';

type View = 'todo' | 'done';

const PAGE_SIZE = 10;

const viewOptions: { value: View; label: string }[] = [
  { value: 'todo', label: 'À faire' },
  { value: 'done', label: 'Terminées' },
];

export function TasksPage() {
  // Une seule requête : la vue, la recherche et les filtres sont appliqués ici
  const query = useTasks();
  const tasks = query.data ?? [];

  // Filtres gardés dans l'URL : ils sont conservés au retour depuis une fiche
  const [searchParams] = useSearchParams();
  const updateParam = useUpdateSearchParam();
  const view: View = searchParams.get('view') === 'done' ? 'done' : 'todo';
  const search = searchParams.get('search') ?? '';
  // Message laissé par la fiche (ex. : après une suppression)
  const navigationMessage = useNavigationMessage();
  const [result, setResult] = useState<ActionResult | undefined>(
    navigationMessage
      ? { message: navigationMessage, isError: false }
      : undefined,
  );
  // Seuls les responsables d'au moins une tâche sont proposés
  const assigneeFilter = usePersonFilter({
    listing: 'tasks',
    param: 'assignee',
    people: uniquePeople(tasks.flatMap(({ assignees }) => assignees)),
    mineLabel: 'Mes tâches',
  });

  const assigneeTasks = filterTasks(tasks, {
    search: '',
    assigneeId: assigneeFilter.selectedId,
  });
  const openTasks = assigneeTasks.filter((task) => !isCompleted(task));
  const counters = [
    {
      label: () => 'en retard',
      count: openTasks.filter((task) => task.isOverdue).length,
      dot: 'bg-danger',
    },
    {
      label: (count: number) => plural(count, 'urgente'),
      count: openTasks.filter((task) => task.isUrgent).length,
      dot: 'bg-warning',
    },
    {
      label: () => 'à faire',
      count: openTasks.length,
      dot: 'bg-interaction',
    },
  ];

  const viewTasks = filterTasks(
    view === 'done' ? assigneeTasks.filter(isCompleted) : openTasks,
    { search },
  );
  const sorted =
    view === 'done' ? sortByLastUpdate(viewTasks) : sortByDueDate(viewTasks);
  const {
    items: pageTasks,
    page,
    pageCount,
  } = paginate(sorted, Number(searchParams.get('page')) || 1, PAGE_SIZE);

  const viewLabel =
    view === 'done' ? plural(sorted.length, 'terminée') : 'à faire';
  const status = `${sorted.length} ${plural(sorted.length, 'tâche')} ${viewLabel}`;

  return (
    <div className="space-y-6">
      <title>Tâches – Oriaa</title>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <h1>Tâches</h1>
        {!query.isPending && !query.error && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-muted">
            {counters.map(({ label, count, dot }) => (
              <li key={dot} className="flex items-center gap-2">
                <span
                  className={cn('size-2 rounded-full', dot)}
                  aria-hidden="true"
                />
                {count} {label(count)}
              </li>
            ))}
          </ul>
        )}
        <ButtonLink to="/tasks/new" className="sm:ml-auto">
          <Plus className="size-4" aria-hidden="true" />
          Ajouter une tâche
        </ButtonLink>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            label="Rechercher une tâche"
            placeholder="Titre…"
            value={search}
            onChange={(event) => updateParam('search', event.target.value)}
            className="sm:w-64"
          />
          <div className="sm:w-60">
            <PersonFilterSelect
              filter={assigneeFilter}
              label="Filtrer par responsable"
              allLabel="Tous les responsables"
            />
          </div>
          <div className="sm:ml-auto">
            <SegmentedControl
              label="Tâches affichées"
              options={viewOptions}
              value={view}
              onChange={(value) =>
                updateParam('view', value === 'done' ? value : '')
              }
            />
          </div>
        </div>
        <SavedPersonFilter filter={assigneeFilter} />
      </div>

      {/* Retour du changement de statut : la tâche peut quitter la vue affichée */}
      <ResultMessage result={result} />

      <Card className="p-0 md:p-0">
        <QueryState
          query={query}
          isPending={query.isPending || assigneeFilter.isPending}
        >
          <DataList
            status={status}
            page={page}
            pageCount={pageCount}
            isEmpty={pageTasks.length === 0}
            emptyMessage="Aucune tâche ne correspond à ces critères."
            columns={taskColumns}
            headers={<TaskHeaders details="Bénéficiaire" />}
          >
            {pageTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                details={formatBeneficiaries(task.beneficiaries)}
                onResult={setResult}
              />
            ))}
          </DataList>
        </QueryState>
      </Card>

      <Pagination
        page={page}
        pageCount={pageCount}
        onChange={(value) => updateParam('page', String(value))}
      />
    </div>
  );
}
