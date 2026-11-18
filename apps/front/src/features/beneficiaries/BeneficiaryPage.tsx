import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  FileText,
  ListTodo,
  NotebookPen,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { BackLink } from '@/components/ui/back-link';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { DetailList } from '@/components/ui/detail-list';
import { DetailQuery } from '@/components/ui/detail-query';
import { FormAlert } from '@/components/ui/form-alert';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { isAdmin } from '@/features/auth/roles';
import { useCurrentUser } from '@/features/auth/useSession';
import { PersonName } from '@/features/users/PersonName';
import { getErrorMessage } from '@/lib/api';
import { computeAge, formatDate } from '@/lib/dates';
import { formatBeneficiaryName } from '@/lib/format';
import { ArchiveBeneficiaryDialog } from './ArchiveBeneficiaryDialog';
import { DeleteBeneficiaryDialog } from './DeleteBeneficiaryDialog';
import { pathwayStatusTones, type Beneficiary } from './types';
import { useUnarchiveBeneficiary } from './useArchiveBeneficiary';
import { useBeneficiary } from './useBeneficiary';

const tabs = [
  { value: 'tasks', label: 'Tâches', icon: ListTodo },
  { value: 'notes', label: 'Notes', icon: NotebookPen },
  { value: 'appointments', label: 'Rendez-vous', icon: CalendarDays },
  { value: 'documents', label: 'Documents', icon: FileText },
];

export function BeneficiaryPage() {
  const id = Number(useParams().id);
  const query = useBeneficiary(id);

  return (
    <DetailQuery
      query={query}
      backTo="/beneficiaries"
      backLabel="Bénéficiaires"
    >
      {(data) => <BeneficiaryDetails beneficiary={data} />}
    </DetailQuery>
  );
}

function BeneficiaryDetails({ beneficiary }: { beneficiary: Beneficiary }) {
  const user = useCurrentUser();
  const unarchive = useUnarchiveBeneficiary(beneficiary.id);
  const [openDialog, setOpenDialog] = useState<'archive' | 'delete'>();
  const [announcement, setAnnouncement] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  const name = formatBeneficiaryName(beneficiary);
  const isArchived = beneficiary.archivedAt !== null;

  // Le bouton cliqué a disparu : on replace le focus sur le titre de la page
  useEffect(() => {
    if (announcement) headingRef.current?.focus();
  }, [announcement]);

  function handleArchived() {
    setOpenDialog(undefined);
    setAnnouncement('Dossier archivé.');
  }

  function handleUnarchive() {
    unarchive.mutate(undefined, {
      onSuccess: () => setAnnouncement('Dossier désarchivé.'),
    });
  }

  return (
    <div className="space-y-6">
      <title>{`${name} – Oriaa`}</title>
      <BackLink to="/beneficiaries">Bénéficiaires</BackLink>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 ref={headingRef} tabIndex={-1} className="outline-none">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted">
            <Badge tone={pathwayStatusTones[beneficiary.pathwayStatus]}>
              <span className="sr-only">Statut du parcours : </span>
              {beneficiary.pathwayStatus}
            </Badge>
            {beneficiary.dateOfBirth && (
              <span>
                Naissance : {formatDate(beneficiary.dateOfBirth)} (
                {computeAge(beneficiary.dateOfBirth)} ans)
              </span>
            )}
            <span>Entrée le {formatDate(beneficiary.entryDate)}</span>
            <span>
              Référent : <PersonName person={beneficiary.referent} />
            </span>
          </div>
        </div>
        {/* Un dossier archivé est en lecture seule */}
        {!isArchived && (
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              variant="outline"
              to={`/beneficiaries/${beneficiary.id}/edit`}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Modifier
            </ButtonLink>
            <Button variant="outline" onClick={() => setOpenDialog('archive')}>
              <Archive className="size-4" aria-hidden="true" />
              Archiver
            </Button>
          </div>
        )}
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      {isArchived && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-info-soft p-4 text-interaction">
            <p className="flex items-center gap-2">
              <Archive className="size-5 shrink-0" aria-hidden="true" />
              Dossier archivé
              {beneficiary.exitDate &&
                ` (sortie le ${formatDate(beneficiary.exitDate)})`}{' '}
              : il est en lecture seule.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleUnarchive}
                pending={unarchive.isPending}
              >
                <ArchiveRestore className="size-4" aria-hidden="true" />
                Désarchiver
              </Button>
              {/* Suppression RGPD : réservée aux admins */}
              {isAdmin(user) && (
                <Button
                  variant="danger"
                  onClick={() => setOpenDialog('delete')}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Supprimer définitivement
                </Button>
              )}
            </div>
          </div>
          {unarchive.isError && (
            <FormAlert>{getErrorMessage(unarchive.error)}</FormAlert>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <CardTitle>Coordonnées</CardTitle>
            <DetailList
              details={[
                {
                  label: 'Adresse',
                  value: (beneficiary.address ||
                    beneficiary.postalCode ||
                    beneficiary.city) && (
                    <>
                      {beneficiary.address}
                      {beneficiary.address && <br />}
                      {[beneficiary.postalCode, beneficiary.city]
                        .filter(Boolean)
                        .join(' ')}
                    </>
                  ),
                },
                {
                  label: 'Téléphone',
                  value: beneficiary.phone && (
                    <a
                      href={`tel:${beneficiary.phone}`}
                      className="text-interaction hover:underline"
                    >
                      {beneficiary.phone}
                    </a>
                  ),
                },
                {
                  label: 'E-mail',
                  value: beneficiary.email && (
                    <a
                      href={`mailto:${beneficiary.email}`}
                      className="text-interaction hover:underline"
                    >
                      {beneficiary.email}
                    </a>
                  ),
                },
              ]}
            />
          </Card>

          <Card className="space-y-4">
            <CardTitle>Situation familiale</CardTitle>
            <DetailList
              details={[
                { label: 'Situation', value: beneficiary.familyStatus },
                { label: 'Enfants', value: beneficiary.numberOfChildren },
                {
                  label: 'Composition du foyer',
                  value: beneficiary.householdComposition,
                },
              ]}
            />
          </Card>

          <Card className="space-y-4">
            <CardTitle>Parcours</CardTitle>
            <DetailList
              details={[
                { label: 'Statut', value: beneficiary.pathwayStatus },
                { label: 'Entrée', value: formatDate(beneficiary.entryDate) },
                {
                  label: 'Sortie',
                  value:
                    beneficiary.exitDate && formatDate(beneficiary.exitDate),
                },
              ]}
            />
          </Card>
        </div>

        <Card className="p-0 md:p-0">
          <Tabs defaultValue="tasks">
            <TabsList className="px-2 md:px-4">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTab key={value} value={value}>
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </TabsTab>
              ))}
            </TabsList>
            {/* Contenu ajouté par #90 (tâches), #89 (notes), #91 (rendez-vous) et #134 (documents) */}
            {tabs.map(({ value, label }) => (
              <TabsPanel key={value} value={value} className="p-4 md:p-6">
                <p className="text-muted">
                  {label} de ce bénéficiaire : bientôt disponible.
                </p>
              </TabsPanel>
            ))}
          </Tabs>
        </Card>
      </div>

      <ArchiveBeneficiaryDialog
        beneficiary={beneficiary}
        open={openDialog === 'archive'}
        onClose={() => setOpenDialog(undefined)}
        onArchived={handleArchived}
      />
      <DeleteBeneficiaryDialog
        beneficiary={beneficiary}
        open={openDialog === 'delete'}
        onClose={() => setOpenDialog(undefined)}
      />
    </div>
  );
}
