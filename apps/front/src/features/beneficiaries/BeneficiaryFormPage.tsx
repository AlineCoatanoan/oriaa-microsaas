import { useParams } from 'react-router';

/** Création ou modification d'un bénéficiaire : formulaire à venir (#88, PR 3). */
export function BeneficiaryFormPage() {
  const { id } = useParams();
  return <h1>{id ? 'Modifier le bénéficiaire' : 'Nouveau bénéficiaire'}</h1>;
}
