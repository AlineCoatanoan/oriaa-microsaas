import { z } from 'zod/mini';
import { toDateKey } from '@/lib/dates';
import { optionalText, orNull, requiredText } from '@/lib/form';
import type { AppointmentPayload } from './useSaveAppointment';

const required = (message: string) => z.string().check(z.minLength(1, message));

/** Mêmes règles que le back ; la fin doit être après le début. */
export const appointmentFormSchema = z
  .object({
    title: requiredText(50, 'Saisissez le motif.'),
    date: required('Choisissez la date.'),
    startTime: required("Choisissez l'heure de début."),
    endTime: required("Choisissez l'heure de fin."),
    userId: required('Choisissez la personne en charge.'),
    beneficiaryIds: z.array(z.string()),
    location: optionalText(50),
    description: optionalText(500),
  })
  .check(
    z.refine(({ startTime, endTime }) => endTime > startTime, {
      message: "L'heure de fin doit être après l'heure de début.",
      path: ['endTime'],
    }),
  );

/** Champs à plusieurs valeurs, à lire en liste (voir validateForm). */
export const appointmentFormLists = ['beneficiaryIds'];

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

/** Date et heure locales (« 2026-11-26 » + « 09:30 ») au format de l'API. */
const toIso = (date: string, time: string) =>
  new Date(`${date}T${time}`).toISOString();

/** Prépare les données pour l'API. */
export function toAppointmentPayload(
  values: AppointmentFormValues,
): AppointmentPayload {
  return {
    title: values.title,
    description: orNull(values.description),
    location: orNull(values.location),
    startAt: toIso(values.date, values.startTime),
    endAt: toIso(values.date, values.endTime),
    userId: Number(values.userId),
    beneficiaryIds: values.beneficiaryIds.map(Number),
  };
}

/** Début proposé pour un nouveau rendez-vous : l'heure suivante aujourd'hui, 9h un autre jour. */
export function defaultStartOn(day: Date) {
  const start = new Date(day);
  const now = new Date();
  if (toDateKey(day) === toDateKey(now) && now.getHours() >= 8) {
    start.setHours(now.getHours() + 1, 0, 0, 0);
  } else {
    start.setHours(9, 0, 0, 0);
  }
  return start;
}
