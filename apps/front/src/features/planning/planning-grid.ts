import { addDays } from '@/lib/dates';
import type { Appointment } from './types';

/** Hauteur d'une heure dans la grille, en pixels (h-16). */
export const HOUR_HEIGHT = 64;

/** Heures affichées par défaut ; la grille s'agrandit si un rendez-vous déborde. */
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 19;

const MINUTES_PER_DAY = 24 * 60;
/** Créneaux d'un quart d'heure : clic sur la grille et glisser-déposer. */
export const SLOT_MINUTES = 15;

/** Minutes écoulées depuis le début du jour (peut dépasser 24 h). */
const minutesSince = (date: Date, day: Date) =>
  (date.getTime() - day.getTime()) / 60_000;

/** Rendez-vous placé dans la colonne d'un jour. */
export type PlacedAppointment = {
  appointment: Appointment;
  /** Position et hauteur, en pixels. */
  top: number;
  height: number;
  /** Colonne occupée quand plusieurs rendez-vous se chevauchent. */
  lane: number;
  lanes: number;
};

/** Jours affichés : un seul en vue jour, la semaine (avec ou sans week-end) sinon. */
export function visibleDays(
  firstDay: Date,
  view: 'week' | 'day',
  showWeekend: boolean,
) {
  if (view === 'day') return [firstDay];
  return Array.from({ length: showWeekend ? 7 : 5 }, (_, index) =>
    addDays(firstDay, index),
  );
}

/** Rendez-vous qui touchent ce jour, avec leur début et fin limités à ce jour. */
function segmentsOf(appointments: Appointment[], day: Date) {
  return appointments
    .map((appointment) => ({
      appointment,
      start: Math.max(0, minutesSince(new Date(appointment.startAt), day)),
      end: Math.min(
        MINUTES_PER_DAY,
        minutesSince(new Date(appointment.endAt), day),
      ),
    }))
    .filter(({ start, end }) => start < MINUTES_PER_DAY && end > 0)
    .sort((a, b) => a.start - b.start || b.end - a.end);
}

/** Première et dernière heure de la grille : celles par défaut, élargies si besoin. */
export function hourRange(appointments: Appointment[], days: Date[]) {
  let start = DEFAULT_START_HOUR;
  let end = DEFAULT_END_HOUR;

  for (const day of days) {
    for (const segment of segmentsOf(appointments, day)) {
      start = Math.min(start, Math.floor(segment.start / 60));
      end = Math.max(end, Math.ceil(segment.end / 60));
    }
  }
  return { start, end };
}

/**
 * Place les rendez-vous d'un jour dans sa colonne.
 * Des rendez-vous qui se chevauchent se partagent la largeur, côte à côte.
 */
export function placeAppointments(
  appointments: Appointment[],
  day: Date,
  startHour: number,
): PlacedAppointment[] {
  const placed: PlacedAppointment[] = [];
  // Groupe de rendez-vous qui se chevauchent, en cours de construction
  let group: PlacedAppointment[] = [];
  let laneEnds: number[] = [];
  let groupEnd = 0;

  const closeGroup = () => {
    for (const item of group) item.lanes = laneEnds.length;
    group = [];
    laneEnds = [];
  };

  for (const { appointment, start, end } of segmentsOf(appointments, day)) {
    if (start >= groupEnd) closeGroup();

    // Première colonne libre, sinon une nouvelle
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = end;
    groupEnd = Math.max(groupEnd, end);

    const item = {
      appointment,
      top: ((start - startHour * 60) / 60) * HOUR_HEIGHT,
      // Hauteur minimale : un rendez-vous de 10 minutes reste lisible et cliquable
      height: Math.max(((end - start) / 60) * HOUR_HEIGHT, 24),
      lane,
      lanes: 1,
    };
    group.push(item);
    placed.push(item);
  }
  closeGroup();

  return placed;
}

/**
 * Nouvel horaire d'un rendez-vous glissé de `offset` pixels vers le bas
 * (négatif : vers le haut) et posé sur `day` : même durée, début arrondi
 * au quart d'heure le plus proche, sans sortir des heures de la grille.
 */
export function movedTimes(
  appointment: Appointment,
  day: Date,
  offset: number,
  range: { start: number; end: number },
) {
  const start = new Date(appointment.startAt);
  const duration = new Date(appointment.endAt).getTime() - start.getTime();
  const minutes =
    start.getHours() * 60 + start.getMinutes() + (offset / HOUR_HEIGHT) * 60;
  const snapped = Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES;
  const earliest = range.start * 60;
  const latest = Math.max(earliest, range.end * 60 - duration / 60_000);

  const movedStart = new Date(day);
  movedStart.setMinutes(Math.min(Math.max(snapped, earliest), latest));
  return {
    start: movedStart,
    end: new Date(movedStart.getTime() + duration),
  };
}
