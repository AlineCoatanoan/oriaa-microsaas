import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QueryState } from '@/components/ui/query-state';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  PersonFilterSelect,
  SavedPersonFilter,
} from '@/features/filter-preference/PersonFilter';
import { usePersonFilter } from '@/features/filter-preference/usePersonFilter';
import { useAssignableUsers } from '@/features/users/useAssignableUsers';
import { getErrorMessage } from '@/lib/api';
import {
  addDays,
  formatTime,
  fromDateKey,
  startOfWeek,
  toDateKey,
} from '@/lib/dates';
import { useUpdateSearchParam } from '@/lib/useUpdateSearchParam';
import { AppointmentDialog } from './AppointmentDialog';
import { AppointmentFormDialog } from './AppointmentFormDialog';
import { DeleteAppointmentDialog } from './DeleteAppointmentDialog';
import { colorOf } from './person-colors';
import { PlanningGrid } from './PlanningGrid';
import { visibleDays } from './planning-grid';
import type { Appointment } from './types';
import { useAppointment } from './useAppointment';
import { useAppointments } from './useAppointments';
import { useMoveAppointment } from './useMoveAppointment';

type View = 'week' | 'day';

const viewOptions: { value: View; label: string }[] = [
  { value: 'week', label: 'Semaine' },
  { value: 'day', label: 'Jour' },
];

const dayMonth = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
});
const dayMonthYear = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const fullDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

// Préférence propre à ce navigateur : afficher ou non samedi et dimanche
const WEEKEND_KEY = 'oriaa:planning:show-weekend';

function readShowWeekend() {
  try {
    return localStorage.getItem(WEEKEND_KEY) !== 'false';
  } catch {
    return true;
  }
}

function saveShowWeekend(value: boolean) {
  try {
    localStorage.setItem(WEEKEND_KEY, String(value));
  } catch {
    // Stockage indisponible (navigation privée…) : le choix vaut pour la visite
  }
}

/** Début proposé par « Nouveau rendez-vous » : l'heure suivante aujourd'hui, 9h un autre jour. */
function defaultStartOn(day: Date) {
  const start = new Date(day);
  const now = new Date();
  if (toDateKey(day) === toDateKey(now) && now.getHours() >= 8) {
    start.setHours(now.getHours() + 1, 0, 0, 0);
  } else {
    start.setHours(9, 0, 0, 0);
  }
  return start;
}

/**
 * Fenêtre ouverte à la place du détail : créer, modifier ou supprimer.
 * « deleted » : le rendez-vous vient d'être supprimé, aucune fenêtre ne s'ouvre.
 */
type FormMode = 'create' | 'edit' | 'delete' | 'deleted';

/** Date affichée : celle de l'URL si elle est valide, sinon aujourd'hui. */
function readDate(dateKey: string | null) {
  const date = dateKey ? fromDateKey(dateKey) : new Date(NaN);
  if (!Number.isNaN(date.getTime())) return date;
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function PlanningPage() {
  const { users } = useAssignableUsers();
  const [searchParams] = useSearchParams();
  const updateParam = useUpdateSearchParam();
  const [showWeekend, setShowWeekend] = useState(readShowWeekend);
  // Sur téléphone, la vue jour par défaut : une semaine n'y tient pas
  const [defaultView] = useState<View>(() =>
    window.matchMedia('(min-width: 768px)').matches ? 'week' : 'day',
  );

  const viewParam = searchParams.get('view');
  const view: View =
    viewParam === 'week' || viewParam === 'day' ? viewParam : defaultView;
  const date = readDate(searchParams.get('date'));
  const days = visibleDays(
    view === 'week' ? startOfWeek(date) : date,
    view,
    showWeekend,
  );
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  const query = useAppointments({
    from: firstDay.toISOString(),
    to: addDays(lastDay, 1).toISOString(),
  });

  // Plannings visibles (un utilisateur ne voit pas ceux des admins)
  const people = users.map(({ id, firstName, lastName }) => ({
    id,
    name: `${firstName} ${lastName}`,
    status: 'active' as const,
  }));
  const personFilter = usePersonFilter({
    listing: 'appointments',
    param: 'user',
    people,
    mineLabel: 'Mon planning',
  });
  const move = useMoveAppointment();
  const appointments = (query.data ?? [])
    .filter(
      (appointment) =>
        personFilter.selectedId === undefined ||
        appointment.user.id === personFilter.selectedId,
    )
    // Rendez-vous déplacé : affiché à sa nouvelle place pendant l'enregistrement
    .map((appointment) =>
      move.isPending && move.variables.id === appointment.id
        ? { ...appointment, ...move.variables }
        : appointment,
    );

  // Légende : les personnes qui ont un rendez-vous sur la période affichée
  const legend = people.filter(({ id }) =>
    appointments.some((appointment) => appointment.user.id === id),
  );
  const step = view === 'week' ? 7 : 1;
  const unit = view === 'week' ? 'Semaine' : 'Jour';
  const period =
    view === 'week'
      ? `Semaine du ${dayMonth.format(firstDay)} au ${dayMonthYear.format(lastDay)}`
      : fullDate.format(firstDay);
  // Rendez-vous ouvert : dans l'URL, pour le lien « Mes RDV du jour » de l'accueil
  const openId = Number(searchParams.get('appointment')) || undefined;
  const selected = useAppointment(openId);
  const [mode, setMode] = useState<FormMode>();
  const [createStart, setCreateStart] = useState(() => defaultStartOn(date));
  const [result, setResult] = useState<ActionResult>();
  const [deletedCount, setDeletedCount] = useState(0);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  // Le rendez-vous supprimé a disparu : le focus va sur « Nouveau rendez-vous ».
  // Effet nécessaire : il faut attendre que la fenêtre de confirmation soit fermée.
  useEffect(() => {
    if (deletedCount > 0) createButtonRef.current?.focus();
  }, [deletedCount]);

  function openCreate(start: Date) {
    setCreateStart(start);
    setMode('create');
  }

  function openDetail(appointmentId: number) {
    setMode(undefined);
    updateParam('appointment', String(appointmentId));
  }

  function closeDetail() {
    setMode(undefined);
    updateParam('appointment', '');
  }

  function moveAppointment(appointment: Appointment, start: Date, end: Date) {
    const startAt = start.toISOString();
    const endAt = end.toISOString();
    move.mutate(
      { id: appointment.id, startAt, endAt },
      {
        onSuccess: () =>
          setResult({
            message: `Rendez-vous « ${appointment.title} » déplacé au ${fullDate.format(start)}, de ${formatTime(startAt)} à ${formatTime(endAt)}.`,
            isError: false,
          }),
        onError: (error) =>
          setResult({ message: getErrorMessage(error), isError: true }),
      },
    );
  }

  return (
    <div className="space-y-6">
      <title>Planning – Oriaa</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Planning</h1>
        <Button
          ref={createButtonRef}
          onClick={() => openCreate(defaultStartOn(date))}
        >
          <Plus className="size-4" aria-hidden="true" />
          Nouveau rendez-vous
        </Button>
      </div>
      <ResultMessage result={result} />

      <div className="space-y-3">
        {/* Les flèches changent la période affichée juste à côté */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label={`${unit} précédent${view === 'week' ? 'e' : ''}`}
              onClick={() =>
                updateParam('date', toDateKey(addDays(date, -step)))
              }
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => updateParam('date', '')}>
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={`${unit} suivant${view === 'week' ? 'e' : ''}`}
              onClick={() =>
                updateParam('date', toDateKey(addDays(date, step)))
              }
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold first-letter:uppercase">
            {period}
          </h2>
          <div className="sm:ml-auto">
            <SegmentedControl
              label="Affichage"
              options={viewOptions}
              value={view}
              onChange={(value) => updateParam('view', value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="sm:w-60">
            <PersonFilterSelect
              filter={personFilter}
              label="Filtrer par personne"
              allLabel="Tous les plannings"
            />
          </div>
          {view === 'week' && (
            <label className="flex min-h-11 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showWeekend}
                onChange={(event) => {
                  setShowWeekend(event.target.checked);
                  saveShowWeekend(event.target.checked);
                }}
                className="size-5 accent-interaction"
              />
              Afficher le week-end
            </label>
          )}
        </div>
        <SavedPersonFilter filter={personFilter} />
      </div>

      <Card className="space-y-4 p-0 md:p-0">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 pt-4 md:px-6">
          <p role="status" className="text-sm text-muted">
            {query.isSuccess &&
              `${appointments.length} rendez-vous ${view === 'week' ? 'sur la semaine' : 'sur la journée'}`}
          </p>
          {/* Couleur de chaque personne quand plusieurs plannings sont affichés */}
          {legend.length > 1 && (
            <ul
              aria-label="Couleurs des plannings"
              className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
            >
              {legend.map(({ id, name }) => (
                <li key={id} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-sm border-l-4"
                    style={colorOf(id)}
                  />
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <QueryState
          query={query}
          isPending={query.isPending || personFilter.isPending}
        >
          <div className="pr-2 pb-4">
            <PlanningGrid
              days={days}
              appointments={appointments}
              onOpen={(appointment) => openDetail(appointment.id)}
              onSlot={openCreate}
              onMove={moveAppointment}
            />
          </div>
        </QueryState>
      </Card>

      {/* Dans l'ordre d'ouverture : le détail se ferme avant que la
          modification ou la suppression s'ouvre */}
      <AppointmentDialog
        open={openId !== undefined && mode === undefined}
        query={selected}
        onClose={closeDetail}
        onEdit={() => setMode('edit')}
        onDelete={() => setMode('delete')}
      />
      <AppointmentFormDialog
        open={mode === 'create' || (mode === 'edit' && !!selected.data)}
        appointment={mode === 'edit' ? selected.data : undefined}
        defaultStart={createStart}
        // Modification annulée : retour au détail du rendez-vous
        onClose={() => setMode(undefined)}
        onSaved={(appointment) => {
          setMode(undefined);
          setResult({
            message: `Rendez-vous « ${appointment.title} » enregistré.`,
            isError: false,
          });
          // Création : on affiche le jour du nouveau rendez-vous
          if (!openId) {
            updateParam('date', toDateKey(new Date(appointment.startAt)));
          }
        }}
      />
      {selected.data && (
        <DeleteAppointmentDialog
          appointment={selected.data}
          open={mode === 'delete'}
          onClose={() => setMode(undefined)}
          onDeleted={() => {
            setResult({
              message: `Rendez-vous « ${selected.data.title} » supprimé.`,
              isError: false,
            });
            setMode('deleted');
            updateParam('appointment', '');
            setDeletedCount((count) => count + 1);
          }}
        />
      )}
    </div>
  );
}
