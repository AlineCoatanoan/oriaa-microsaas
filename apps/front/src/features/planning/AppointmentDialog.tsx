import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailList } from '@/components/ui/detail-list';
import { Dialog } from '@/components/ui/dialog';
import { QueryState } from '@/components/ui/query-state';
import { PersonName } from '@/features/users/PersonName';
import { formatTime } from '@/lib/dates';
import { formatBeneficiaryName, plural } from '@/lib/format';
import type { Appointment } from './types';
import { useAppointment } from './useAppointment';

const fullDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

type AppointmentDialogProps = {
  /** Rendez-vous à afficher ; absent : fenêtre fermée. */
  id: number | undefined;
  onClose: () => void;
};

/** Détail d'un rendez-vous, ouvert depuis le planning ou l'accueil. */
export function AppointmentDialog({ id, onClose }: AppointmentDialogProps) {
  const query = useAppointment(id);

  return (
    <Dialog
      open={id !== undefined}
      onClose={onClose}
      title={query.data?.title ?? 'Rendez-vous'}
      size="large"
    >
      <div className="space-y-4">
        <QueryState query={query}>
          {query.data && <AppointmentDetails appointment={query.data} />}
        </QueryState>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function AppointmentDetails({ appointment }: { appointment: Appointment }) {
  const { startAt, endAt, beneficiaries } = appointment;

  return (
    <div className="space-y-4">
      {/* Règle métier : tous ses bénéficiaires sont archivés */}
      {appointment.isArchived && <Badge>Archivé : lecture seule</Badge>}
      <DetailList
        details={[
          {
            label: 'Date',
            value: (
              <span className="first-letter:uppercase">
                {fullDate.format(new Date(startAt))}
              </span>
            ),
          },
          {
            label: 'Horaire',
            value: `${formatTime(startAt)} – ${formatTime(endAt)}`,
          },
          { label: 'Lieu', value: appointment.location },
          {
            label: 'Personne en charge',
            value: <PersonName person={appointment.user} />,
          },
          {
            label: plural(beneficiaries.length, 'Bénéficiaire'),
            value:
              beneficiaries.length > 0 ? (
                <ul>
                  {beneficiaries.map((beneficiary) => (
                    <li key={beneficiary.id}>
                      <Link
                        to={`/beneficiaries/${beneficiary.id}`}
                        className="font-medium text-interaction hover:underline"
                      >
                        {formatBeneficiaryName(beneficiary)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null,
          },
          {
            label: 'Description',
            value: appointment.description ? (
              <p className="whitespace-pre-wrap">{appointment.description}</p>
            ) : null,
          },
        ]}
      />
    </div>
  );
}
