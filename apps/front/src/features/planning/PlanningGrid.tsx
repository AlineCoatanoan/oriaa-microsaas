import { useId, type MouseEvent } from 'react';
import { formatTime, toDateKey } from '@/lib/dates';
import { formatBeneficiaries } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  HOUR_HEIGHT,
  hourRange,
  placeAppointments,
  type PlacedAppointment,
} from './planning-grid';
import { ARCHIVED_COLOR, colorOf } from './person-colors';
import type { Appointment } from './types';

const dayLabel = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const shortDayLabel = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
});

type PlanningGridProps = {
  days: Date[];
  appointments: Appointment[];
  onOpen: (appointment: Appointment) => void;
  /** Clic sur un créneau libre : début du rendez-vous à créer. */
  onSlot: (start: Date) => void;
};

/**
 * Grille du planning : une colonne par jour, une ligne par heure.
 * Pour les lecteurs d'écran, chaque jour est un titre suivi de la liste
 * de ses rendez-vous, dans l'ordre ; la grille des heures est décorative.
 */
export function PlanningGrid({
  days,
  appointments,
  onOpen,
  onSlot,
}: PlanningGridProps) {
  const range = hourRange(appointments, days);
  const hours = Array.from(
    { length: range.end - range.start },
    (_, index) => range.start + index,
  );
  const height = hours.length * HOUR_HEIGHT;
  const todayKey = toDateKey(new Date());

  return (
    // La semaine garde une largeur lisible : elle défile dans son cadre si besoin
    <div
      tabIndex={0}
      role="region"
      aria-label="Grille du planning"
      className="overflow-x-auto"
    >
      <div className={cn('flex', days.length > 1 && 'min-w-[48rem]')}>
        {/* Heures : repères visuels seulement */}
        <div aria-hidden="true" className="w-14 shrink-0">
          <div className="h-14" />
          <div className="relative" style={{ height }}>
            {hours.map((hour, index) => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-xs text-muted"
                style={{ top: index * HOUR_HEIGHT }}
              >
                {hour}h
              </span>
            ))}
          </div>
        </div>

        {days.map((day) => (
          <DayColumn
            key={day.getTime()}
            day={day}
            isToday={toDateKey(day) === todayKey}
            placed={placeAppointments(appointments, day, range.start)}
            hourCount={hours.length}
            height={height}
            startHour={range.start}
            onOpen={onOpen}
            onSlot={onSlot}
          />
        ))}
      </div>
    </div>
  );
}

type DayColumnProps = {
  day: Date;
  isToday: boolean;
  placed: PlacedAppointment[];
  hourCount: number;
  height: number;
  startHour: number;
  onOpen: (appointment: Appointment) => void;
  onSlot: (start: Date) => void;
};

/** Créneaux d'un quart d'heure : un clic arrondit au quart d'heure inférieur. */
const SLOT_MINUTES = 15;

function DayColumn({
  day,
  isToday,
  placed,
  hourCount,
  height,
  startHour,
  onOpen,
  onSlot,
}: DayColumnProps) {
  const titleId = useId();

  // Clic dans la colonne, hors d'un rendez-vous : créneau à cette heure.
  // Raccourci à la souris ; au clavier, le bouton « Nouveau rendez-vous ».
  function handleSlotClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) return;
    const offset =
      event.clientY - event.currentTarget.getBoundingClientRect().top;
    const minutes =
      startHour * 60 +
      Math.floor((offset / HOUR_HEIGHT) * (60 / SLOT_MINUTES)) * SLOT_MINUTES;
    const start = new Date(day);
    start.setMinutes(minutes);
    onSlot(start);
  }

  return (
    <section
      aria-labelledby={titleId}
      className="min-w-0 flex-1 border-l border-border"
    >
      <h3
        id={titleId}
        className="flex h-14 items-center justify-center px-1 text-sm font-semibold whitespace-nowrap"
      >
        <span
          className={cn(
            'rounded-lg px-2 py-1',
            isToday && 'bg-structure text-white',
          )}
        >
          {/* Court à l'écran (« Mar. 24 »), complet pour les lecteurs d'écran */}
          <span aria-hidden="true" className="capitalize">
            {shortDayLabel.format(day)}
          </span>
          <span className="sr-only">
            {dayLabel.format(day)}
            {isToday && " (aujourd'hui)"}
          </span>
        </span>
      </h3>

      {/* Aujourd'hui : colonne légèrement grisée */}
      <div
        className={cn('relative cursor-pointer', isToday && 'bg-page')}
        style={{ height }}
        onClick={handleSlotClick}
      >
        {/* Lignes des heures */}
        <div aria-hidden="true">
          {Array.from({ length: hourCount }, (_, index) => (
            <div
              key={index}
              className="absolute inset-x-0 border-t border-border"
              style={{ top: index * HOUR_HEIGHT }}
            />
          ))}
        </div>

        {placed.length === 0 ? (
          <p className="sr-only">Aucun rendez-vous.</p>
        ) : (
          <ul>
            {placed.map((item) => (
              <AppointmentBlock
                key={item.appointment.id}
                item={item}
                onOpen={onOpen}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AppointmentBlock({
  item,
  onOpen,
}: {
  item: PlacedAppointment;
  onOpen: (appointment: Appointment) => void;
}) {
  const { appointment, top, height, lane, lanes } = item;
  const time = `${formatTime(appointment.startAt)} – ${formatTime(appointment.endAt)}`;
  // Lignes de 16 px qui tiennent dans le bloc : le reste n'est lu
  // que par les lecteurs d'écran, sans texte coupé à l'écran
  const visibleLines = Math.floor((height - 8) / 16);
  const lineClass = (line: number) =>
    visibleLines >= line ? 'truncate' : 'sr-only';

  return (
    <li
      className="absolute px-0.5"
      style={{
        top,
        height,
        left: `${(lane / lanes) * 100}%`,
        width: `${100 / lanes}%`,
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(appointment)}
        // Couleur de la personne, ou grisé si le dossier est archivé
        style={
          appointment.isArchived ? undefined : colorOf(appointment.user.id)
        }
        className={cn(
          'flex size-full flex-col overflow-hidden rounded-md border-l-4 px-2 py-1 text-left text-xs leading-4 hover:brightness-95',
          appointment.isArchived && ARCHIVED_COLOR,
        )}
      >
        <span className="truncate font-semibold">
          {time}
          {/* Bloc d'une seule ligne : le titre suit l'heure */}
          {visibleLines < 2 && ` · ${appointment.title}`}
        </span>
        {visibleLines >= 2 && (
          <span className="truncate font-medium">{appointment.title}</span>
        )}
        {appointment.beneficiaries.length > 0 && (
          <span className={lineClass(3)}>
            {formatBeneficiaries(appointment.beneficiaries)}
          </span>
        )}
        <span
          className={lineClass(appointment.beneficiaries.length > 0 ? 4 : 3)}
        >
          {appointment.user.name}
        </span>
        {appointment.isArchived && <span className="sr-only">(archivé)</span>}
      </button>
    </li>
  );
}
