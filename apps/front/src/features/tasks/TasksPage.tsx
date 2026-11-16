import { Eye } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  PersonFilterSelect,
  SavedPersonFilter,
} from '@/features/filter-preference/PersonFilter';
import { usePersonFilter } from '@/features/filter-preference/usePersonFilter';
import { getErrorMessage } from '@/lib/api';
import { formatBeneficiaries } from '@/lib/format';
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
import { TaskDueDate } from './TaskDueDate';
import { TaskFieldSelect } from './TaskFieldSelect';
import { useTasks } from './useTasks';

type View = 'todo' | 'done';

const PAGE_SIZE = 10;

const viewOptions: { value: View; label: string }[] = [
  { value: 'todo', label: 'À faire' },
  { value: 'done', label: 'Terminées' },
];

// Mêmes colonnes pour l'en-tête et les lignes, à partir de la tablette
const columns =
  'md:grid md:grid-cols-[2fr_1.5fr_1.3fr_9rem_8rem_auto] md:items-center md:gap-4';

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
      label: (count: number) => (count > 1 ? 'urgentes' : 'urgente'),
      count: openTasks.filter((task) => task.isUrgent).length,
      dot: 'bg-danger',
    },
    {
      label: () => 'en retard',
      count: openTasks.filter((task) => task.isOverdue).length,
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
              onChange={(value) => updateParam('assignee', value)}
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
        {query.isPending || assigneeFilter.isPending ? (
          <LoadingState />
        ) : query.error ? (
          <ErrorState
            message={getErrorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        ) : (
          <>
            <p className="px-4 pt-4 text-sm text-muted md:px-6">
              {sorted.length} tâche{sorted.length > 1 && 's'}{' '}
              {view === 'done' ? 'terminée' : 'à faire'}
              {sorted.length > 1 && view === 'done' && 's'}
              {pageCount > 1 && ` · page ${page} sur ${pageCount}`}
            </p>

            {pageTasks.length === 0 ? (
              <p className="px-4 py-8 text-center text-muted md:px-6">
                Aucune tâche ne correspond à ces critères.
              </p>
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className={`${columns} mt-2 hidden border-b border-border px-6 pb-2 text-xs font-semibold tracking-wide text-muted uppercase`}
                >
                  <span>Titre</span>
                  <span>Bénéficiaire</span>
                  <span>Échéance</span>
                  <span>Statut</span>
                  <span>Priorité</span>
                  <span className="w-11" />
                </div>
                <ul className="divide-y divide-border">
                  {pageTasks.map((task) => (
                    <li
                      key={task.id}
                      className={`${columns} relative grid grid-cols-[1fr_auto] gap-x-2 gap-y-2 px-4 py-3 hover:bg-page md:px-6`}
                    >
                      <div className="min-w-0 space-y-2 md:contents md:space-y-0">
                        {/* Le lien couvre toute la ligne grâce à after:inset-0 */}
                        <Link
                          to={`/tasks/${task.id}`}
                          className="block font-medium after:absolute after:inset-0 hover:underline"
                        >
                          {task.title}
                        </Link>
                        <p className="text-sm text-muted md:text-base md:text-structure">
                          {formatBeneficiaries(task.beneficiaries)}
                        </p>
                        <p className="text-sm md:text-base">
                          <span className="text-muted md:sr-only">
                            Échéance :{' '}
                          </span>
                          <TaskDueDate task={task} />
                        </p>
                        <div className="flex flex-wrap items-center gap-2 md:contents">
                          {/* Au-dessus du lien de la ligne pour rester cliquables */}
                          <div className="relative z-10 w-32">
                            <TaskFieldSelect
                              task={task}
                              field="status"
                              onResult={setResult}
                            />
                          </div>
                          <div className="relative z-10 w-28">
                            <TaskFieldSelect
                              task={task}
                              field="priority"
                              onResult={setResult}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start md:items-center">
                        <Link
                          to={`/tasks/${task.id}`}
                          aria-label={`Voir la tâche « ${task.title} »`}
                          className="relative z-10 flex size-11 items-center justify-center rounded-lg text-interaction hover:bg-page"
                        >
                          <Eye className="size-5" aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </Card>

      <Pagination
        page={page}
        pageCount={pageCount}
        onChange={(value) => updateParam('page', String(value))}
      />
    </div>
  );
}
