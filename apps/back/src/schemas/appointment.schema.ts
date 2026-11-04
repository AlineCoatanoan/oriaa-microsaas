import { z } from 'zod';
import {
  atLeastOneField,
  idList,
  idParam,
  isoDateTime,
  idField,
  optionalText,
  requiredText,
} from './common.js';

/**
 * Données acceptées pour créer un rendez-vous.
 * userId absent : la personne connectée en a la charge.
 * La cohérence entre début et fin est vérifiée par le service.
 */
export const createAppointmentSchema = z.object({
  title: requiredText(50),
  description: optionalText(500),
  location: optionalText(50),
  startAt: isoDateTime,
  endAt: isoDateTime,
  userId: idField.optional(),
  beneficiaryIds: idList.optional(), // absent ou vide : aucun bénéficiaire
  noteIds: idList.optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

/**
 * Données acceptées pour modifier un rendez-vous (PATCH).
 * beneficiaryIds et noteIds remplacent les listes existantes.
 */
export const updateAppointmentSchema = atLeastOneField(
  createAppointmentSchema.partial(),
);

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

/**
 * Filtres de la liste, combinables entre eux.
 * Le planning envoie une période (from et to).
 * Avec beneficiaryId (onglet de la fiche) : tous ses rendez-vous, même archivés.
 */
export const listAppointmentsQuerySchema = z
  .object({
    from: isoDateTime.optional(),
    to: isoDateTime.optional(),
    userId: idParam.optional(),
    beneficiaryId: idParam.optional(),
  })
  .refine((query) => query.beneficiaryId || (query.from && query.to), {
    message: 'Indiquez une période (from et to) ou un bénéficiaire.',
  });

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
