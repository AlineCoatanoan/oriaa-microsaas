import { useParams } from 'react-router';
import { BackLink } from '@/components/ui/back-link';
import { DetailQuery } from '@/components/ui/detail-query';
import { formatBeneficiaryName } from '@/lib/format';
import { BeneficiaryForm } from './BeneficiaryForm';
import type { Beneficiary } from './types';
import { useBeneficiary } from './useBeneficiary';

export function BeneficiaryFormPage() {
  const { id } = useParams();

  return id ? <EditBeneficiary id={Number(id)} /> : <CreateBeneficiary />;
}

function CreateBeneficiary() {
  return (
    <div className="space-y-6">
      <title>Nouveau bénéficiaire – Oriaa</title>
      <BackLink to="/beneficiaries">Bénéficiaires</BackLink>
      <h1>Nouveau bénéficiaire</h1>
      <BeneficiaryForm />
    </div>
  );
}

function EditBeneficiary({ id }: { id: number }) {
  const query = useBeneficiary(id);

  return (
    <DetailQuery
      query={query}
      backTo="/beneficiaries"
      backLabel="Bénéficiaires"
    >
      {(beneficiary) => <EditBeneficiaryForm beneficiary={beneficiary} />}
    </DetailQuery>
  );
}

function EditBeneficiaryForm({ beneficiary }: { beneficiary: Beneficiary }) {
  const name = formatBeneficiaryName(beneficiary);

  return (
    <div className="space-y-6">
      <title>{`Modifier ${name} – Oriaa`}</title>
      <BackLink to={`/beneficiaries/${beneficiary.id}`}>{name}</BackLink>
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
