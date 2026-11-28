import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { movedTimes } from './planning-grid';
import type { Appointment } from './types';

/** Distance en pixels avant qu'un appui devienne un glisser (en dessous : un clic). */
const DRAG_THRESHOLD = 4;

/** Nouvel horaire affiché pendant le glisser. */
export type DragPreview = {
  appointment: Appointment;
  dayIndex: number;
  start: Date;
  end: Date;
};

type DragState = {
  pointerId: number;
  x: number;
  y: number;
  preview?: DragPreview;
};

type UseAppointmentDragOptions = {
  days: Date[];
  range: { start: number; end: number };
  onOpen: (appointment: Appointment) => void;
  onMove: (appointment: Appointment, start: Date, end: Date) => void;
};

/**
 * Glisser-déposer des rendez-vous à la souris, au quart d'heure.
 * Au clavier et au doigt : « Modifier » dans le détail du rendez-vous.
 */
export function useAppointmentDrag({
  days,
  range,
  onOpen,
  onMove,
}: UseAppointmentDragOptions) {
  const gridRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>(undefined);
  // Le clic qui suit un glisser ne doit pas ouvrir le détail
  const skipClick = useRef(false);
  const [preview, setPreview] = useState<DragPreview>();

  // Échap annule le glisser en cours
  useEffect(() => {
    if (!preview) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      drag.current = undefined;
      skipClick.current = true;
      setPreview(undefined);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preview]);

  /** Colonne du jour sous le pointeur (la plus proche s'il sort de la grille). */
  function dayIndexAt(clientX: number) {
    const columns =
      gridRef.current?.querySelectorAll('[data-day-column]') ?? [];
    let index = 0;
    columns.forEach((column, columnIndex) => {
      if (clientX >= column.getBoundingClientRect().left) index = columnIndex;
    });
    return index;
  }

  /** Gestionnaires du bouton d'un rendez-vous : ouvrir au clic, déplacer en glissant. */
  function handlersFor(appointment: Appointment) {
    return {
      onPointerDown(event: PointerEvent<HTMLButtonElement>) {
        skipClick.current = false;
        // Souris et stylet ; au doigt, glisser fait défiler la page.
        // Règle métier : un rendez-vous archivé ne se déplace pas.
        if (
          appointment.isArchived ||
          event.pointerType === 'touch' ||
          event.button !== 0
        ) {
          return;
        }
        // Le bouton reçoit les mouvements même quand le pointeur le quitte
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
      },
      onPointerMove(event: PointerEvent<HTMLButtonElement>) {
        const state = drag.current;
        if (state?.pointerId !== event.pointerId) return;
        const offset = event.clientY - state.y;
        if (
          !state.preview &&
          Math.hypot(event.clientX - state.x, offset) < DRAG_THRESHOLD
        ) {
          return;
        }

        const dayIndex = dayIndexAt(event.clientX);
        const times = movedTimes(appointment, days[dayIndex], offset, range);
        // Même créneau qu'avant : rien à redessiner
        if (state.preview?.start.getTime() === times.start.getTime()) return;
        state.preview = { appointment, dayIndex, ...times };
        setPreview(state.preview);
      },
      onPointerUp(event: PointerEvent<HTMLButtonElement>) {
        const state = drag.current;
        if (state?.pointerId !== event.pointerId) return;
        drag.current = undefined;
        if (!state.preview) return;

        skipClick.current = true;
        setPreview(undefined);
        const { start, end } = state.preview;
        if (start.getTime() !== new Date(appointment.startAt).getTime()) {
          onMove(appointment, start, end);
        }
      },
      onPointerCancel() {
        drag.current = undefined;
        setPreview(undefined);
      },
      onClick() {
        if (skipClick.current) {
          skipClick.current = false;
          return;
        }
        onOpen(appointment);
      },
    };
  }

  return { gridRef, preview, handlersFor };
}

/** Gestionnaires à poser sur le bouton d'un rendez-vous. */
export type DragHandlers = ReturnType<typeof useAppointmentDrag>['handlersFor'];
