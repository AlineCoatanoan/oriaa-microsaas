import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { getErrorMessage } from '@/lib/api';
import { BeneficiaryForm } from './BeneficiaryForm';
import { useBeneficiary } from './useBeneficiary';

export function BeneficiaryFormPage() {
  const { id } = useParams();

  return id ? <EditBeneficiary id={Number(id)} /> : <CreateBeneficiary />;
}

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-medium text-interaction hover:underline"
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

function CreateBeneficiary() {
  return (
    <div className="space-y-6">
      <title>Nouveau bénéficiaire – Oriaa</title>
      <BackLink to="/beneficiaries" label="Bénéficiaires" />
      <h1>Nouveau bénéficiaire</h1>
      <BeneficiaryForm />
    </div>
  );
}

function EditBeneficiary({ id }: { id: number }) {
  const query = useBeneficiary(id);

  if (query.isPending) return <LoadingState />;
  if (query.error) {
    return (
      <ErrorState
        message={getErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }

  const beneficiary = query.data;
  const name = `${beneficiary.lastName} ${beneficiary.firstName}`;

  return (
    <div className="space-y-6">
      <title>{`Modifier ${name} – Oriaa`}</title>
      <BackLink to={`/beneficiaries/${id}`} label={name} />
      <h1>Modifier {name}</h1>
      {/* Règle métier : un dossier archivé est en lecture seule */}
      {beneficiary.archivedAt ? (
        <p className="rounded-lg bg-info-soft p-4 text-interaction">
          Ce dossier est archivé : il est en lecture seule. Désarchivez-le
          depuis sa fiche pour pouvoir le modifier.
        </p>
      ) : (
        <BeneficiaryForm beneficiary={beneficiary} />
      )}
    </div>
  );
}
