import type { UseQueryResult } from '@tanstack/react-query';
import { RowLink } from '@/components/ui/data-list';
import type { Appointment } from '@/features/planning/types';
import { formatTime } from '@/lib/dates';
import { formatBeneficiaries } from '@/lib/format';
import { HomeListCard } from './HomeListCard';

type TodayAppointmentsProps = {
  query: UseQueryResult<Appointment[]>;
};

export function TodayAppointments({ query }: TodayAppointmentsProps) {
  const appointments = query.data ?? [];

  return (
    <HomeListCard
      title="Mes RDV du jour"
      query={query}
      count={appointments.length}
      emptyMessage="Aucun rendez-vous aujourd'hui."
      link={{ to: '/planning', label: 'Voir mon planning' }}
    >
      <ul className="divide-y divide-border">
        {appointments.map((appointment) => (
          <li key={appointment.id} className="relative flex gap-4 py-3">
            <time
              dateTime={appointment.startAt}
              className="w-14 shrink-0 font-semibold"
            >
              {formatTime(appointment.startAt)}
            </time>
            <div className="min-w-0">
              {/* Le Planning ouvrira la fenêtre de détail de ce rendez-vous */}
              <RowLink to={`/planning?appointment=${appointment.id}`}>
                {appointment.title}
              </RowLink>
              <p className="text-sm text-muted">
                {[
                  formatBeneficiaries(appointment.beneficiaries),
                  appointment.location,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </HomeListCard>
  );
}
