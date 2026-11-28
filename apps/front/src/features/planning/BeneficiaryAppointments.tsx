import { CalendarDays, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListRow,
  IconLink,
  RowButton,
} from '@/components/ui/data-list';
import { Pagination } from '@/components/ui/pagination';
import { QueryState } from '@/components/ui/query-state';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { Beneficiary } from '@/features/beneficiaries/types';
import { PersonName } from '@/features/users/PersonName';
import { formatDate, formatTime, toDateKey } from '@/lib/dates';
import { plural } from '@/lib/format';
import { paginate } from '@/lib/paginate';
import { defaultStartOn } from './appointment-form';
import {
  AppointmentDialogs,
  type AppointmentDialogMode,
} from './AppointmentDialogs';
import { useAppointments } from './useAppointments';

const PAGE_SIZE = 10;

// Dernière colonne de largeur fixe : le lien vers le planning reste aligné
const columns =
  '@3xl:grid @3xl:grid-cols-[2fr_1.5fr_1fr_2.75rem] @3xl:items-center @3xl:gap-4';

type View = 'upcoming' | 'past';

const viewOptions: { value: View; label: string }[] = [
  { value: 'upcoming', label: 'À venir' },
  { value: 'past', label: 'Passés' },
];

/** Onglet « Rendez-vous » de la fiche : les rendez-vous du bénéficiaire. */
export function BeneficiaryAppointments({
  beneficiary,
}: {
  beneficiary: Beneficiary;
}) {
  // Avec beneficiaryId, l'API renvoie aussi les rendez-vous archivés
  const query = useAppointments({ beneficiaryId: beneficiary.id });
  const [view, setView] = useState<View>('upcoming');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number>();
  const [mode, setMode] = useState<AppointmentDialogMode>();
  const [createStart, setCreateStart] = useState(() =>
    defaultStartOn(new Date()),
  );
  const [result, setResult] = useState<ActionResult>();
  const [deletedCount, setDeletedCount] = useState(0);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  // Moment qui sépare « À venir » et « Passés » : l'ouverture de l'onglet
  const [now] = useState(Date.now);

  // Un dossier archivé est en lecture seule
  const isArchived = beneficiary.archivedAt !== null;

  // La ligne du rendez-vous supprimé a disparu : le focus va sur « Nouveau rendez-vous ».
  // Effet nécessaire : il faut attendre que la fenêtre de confirmation soit fermée.
  useEffect(() => {
    if (deletedCount > 0) createButtonRef.current?.focus();
  }, [deletedCount]);

  // L'API les renvoie du plus ancien au plus récent. À venir (ou en cours) :
  // le plus proche d'abord ; passés : le plus récent d'abord.
  const appointments = query.data ?? [];
  const shown =
    view === 'upcoming'
      ? appointments.filter(({ endAt }) => new Date(endAt).getTime() >= now)
      : appointments
          .filter(({ endAt }) => new Date(endAt).getTime() < now)
          .reverse();
  const {
    items: pageAppointments,
    page: currentPage,
    pageCount,
  } = paginate(shown, page, PAGE_SIZE);
  const viewLabel =
    view === 'upcoming' ? 'à venir' : plural(shown.length, 'passé');
  const status = `${shown.length} rendez-vous ${viewLabel}`;

  function openCreate() {
    setCreateStart(defaultStartOn(new Date()));
    setMode('create');
  }

  function openDetail(id: number) {
    setMode(undefined);
    setOpenId(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6">
        <SegmentedControl
          label="Rendez-vous affichés"
          options={viewOptions}
          value={view}
          onChange={(value) => {
            setView(value);
            setPage(1);
          }}
        />
        {!isArchived && (
          <Button ref={createButtonRef} variant="outline" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Nouveau rendez-vous
          </Button>
        )}
      </div>

      <div className={result && 'px-4 md:px-6'}>
        <ResultMessage result={result} />
      </div>

      <QueryState query={query}>
        <DataList
          status={status}
          page={currentPage}
          pageCount={pageCount}
          isEmpty={shown.length === 0}
          emptyMessage={
            view === 'upcoming'
              ? 'Aucun rendez-vous à venir pour ce bénéficiaire.'
              : 'Aucun rendez-vous passé.'
          }
          columns={columns}
          headers={
            <>
              <span>Motif</span>
              <span>Date</span>
              <span>Personne en charge</span>
              <span />
            </>
          }
        >
          {pageAppointments.map((appointment) => {
            const dateKey = toDateKey(new Date(appointment.startAt));
            return (
              <DataListRow
                key={appointment.id}
                columns={columns}
                actions={
                  <IconLink
                    to={`/planning?date=${dateKey}&view=day&appointment=${appointment.id}`}
                    label={`Voir « ${appointment.title} » dans le planning`}
                    tooltip="Voir dans le planning"
                    icon={CalendarDays}
                  />
                }
              >
                <RowButton
                  className="block"
                  onClick={() => openDetail(appointment.id)}
                >
                  {appointment.title}
                </RowButton>
                <p className="text-sm text-muted @3xl:text-base @3xl:text-structure">
                  <span className="@3xl:sr-only">Le </span>
                  {formatDate(dateKey)}, {formatTime(appointment.startAt)} –{' '}
                  {formatTime(appointment.endAt)}
                </p>
                <p className="text-sm text-muted @3xl:text-base @3xl:text-structure">
                  <span className="@3xl:sr-only">Suivi par </span>
                  <PersonName person={appointment.user} />
                </p>
              </DataListRow>
            );
          })}
        </DataList>
      </QueryState>

      <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />

      <AppointmentDialogs
        openId={openId}
        mode={mode}
        onModeChange={setMode}
        onCloseDetail={() => setOpenId(undefined)}
        createStart={createStart}
        defaultBeneficiaryIds={[beneficiary.id]}
        onResult={setResult}
        onDeleted={() => {
          setOpenId(undefined);
          setDeletedCount((count) => count + 1);
        }}
      />
    </div>
  );
}
