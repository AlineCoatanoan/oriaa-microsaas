import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import type { Appointment } from '@/features/planning/types';
import { getErrorMessage } from '@/lib/api';
import { formatTime } from '@/lib/dates';
import { formatBeneficiaries } from '@/lib/format';

type TodayAppointmentsProps = {
  query: UseQueryResult<Appointment[]>;
};

export function TodayAppointments({ query }: TodayAppointmentsProps) {
  const appointments = query.data ?? [];

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <CardTitle>Mes RDV du jour</CardTitle>
        {query.data && (
          <span className="text-muted">{appointments.length}</span>
        )}
      </div>

      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState
          message={getErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : appointments.length === 0 ? (
        <p className="py-4 text-muted">Aucun rendez-vous aujourd'hui.</p>
      ) : (
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
                <Link
                  to={`/planning?appointment=${appointment.id}`}
                  className="font-medium after:absolute after:inset-0 hover:underline"
                >
                  {appointment.title}
                </Link>
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
      )}

      <Link
        to="/planning"
        className="mt-auto inline-flex items-center gap-2 self-start font-medium text-interaction hover:underline"
      >
        Voir mon planning
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
