import { Eye, Pencil, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select } from '@/components/ui/select';
import {
  PersonFilterSelect,
  SavedPersonFilter,
} from '@/features/filter-preference/PersonFilter';
import { usePersonFilter } from '@/features/filter-preference/usePersonFilter';
import { PersonName } from '@/features/users/PersonName';
import { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/dates';
import { paginate } from '@/lib/paginate';
import { uniquePeople } from '@/lib/people';
import { useNavigationMessage } from '@/lib/useNavigationMessage';
import { useUpdateSearchParam } from '@/lib/useUpdateSearchParam';
import {
  filterBeneficiaries,
  sortBeneficiaries,
  type BeneficiarySort,
} from './filter-beneficiaries';
import { pathwayStatusTones } from './types';
import { useBeneficiaries } from './useBeneficiaries';

type View = 'active' | 'archived';

const PAGE_SIZE = 10;

const viewOptions: { value: View; label: string }[] = [
  { value: 'active', label: 'Actifs' },
  { value: 'archived', label: 'Archivés' },
];

// Mêmes colonnes pour l'en-tête et les lignes, à partir de la tablette
const columns =
  'md:grid md:grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] md:items-center md:gap-4';

const iconLinkClass =
  'relative z-10 flex size-11 items-center justify-center rounded-lg text-interaction hover:bg-page';

export function BeneficiariesPage() {
  // Filtres gardés dans l'URL : ils sont conservés au retour depuis une fiche
  const [searchParams] = useSearchParams();
  const updateParam = useUpdateSearchParam();
  // Message laissé par la page précédente (ex. : après une suppression)
  const message = useNavigationMessage();
  const view: View =
    searchParams.get('view') === 'archived' ? 'archived' : 'active';
  const isArchivedView = view === 'archived';
  const search = searchParams.get('search') ?? '';
  // Par défaut : la date la plus récente d'abord
  const sort: BeneficiarySort =
    searchParams.get('sort') === 'date-asc' ? 'date-asc' : 'date-desc';
  const dateLabel = isArchivedView ? 'Sortie' : 'Entrée';

  const query = useBeneficiaries({ archived: isArchivedView });
  // Seuls les référents qui suivent au moins un dossier de la vue sont proposés
  const referentFilter = usePersonFilter({
    listing: 'beneficiaries',
    param: 'referent',
    people: uniquePeople((query.data ?? []).map(({ referent }) => referent)),
    mineLabel: 'Mes bénéficiaires',
  });
  const filtered = sortBeneficiaries(
    filterBeneficiaries(query.data ?? [], {
      search,
      referentId: referentFilter.selectedId,
    }),
    sort,
    isArchivedView,
  );
  const {
    items: beneficiaries,
    page,
    pageCount,
  } = paginate(filtered, Number(searchParams.get('page')) || 1, PAGE_SIZE);

  return (
    <div className="space-y-6">
      <title>Bénéficiaires – Oriaa</title>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>Bénéficiaires</h1>
        <ButtonLink to="/beneficiaries/new">
          <Plus className="size-4" aria-hidden="true" />
          Ajouter un bénéficiaire
        </ButtonLink>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-lg bg-success-soft p-3 text-success"
        >
          {message}
        </p>
      )}

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            label="Rechercher un bénéficiaire"
            placeholder="Nom ou prénom…"
            value={search}
            onChange={(event) => updateParam('search', event.target.value)}
            className="sm:w-64"
          />
          <div className="sm:w-52">
            <PersonFilterSelect
              filter={referentFilter}
              label="Filtrer par référent"
              allLabel="Tous les référents"
              onChange={(value) => updateParam('referent', value)}
            />
          </div>
          <div className="sm:w-52">
            <Select
              aria-label="Trier"
              value={sort}
              onChange={(event) =>
                updateParam(
                  'sort',
                  event.target.value === 'date-asc' ? event.target.value : '',
                )
              }
            >
              <option value="date-desc">{dateLabel} (plus récente)</option>
              <option value="date-asc">{dateLabel} (plus ancienne)</option>
            </Select>
          </div>
          <div className="sm:ml-auto">
            <SegmentedControl
              label="Bénéficiaires affichés"
              options={viewOptions}
              value={view}
              onChange={(value) =>
                updateParam('view', value === 'archived' ? value : '')
              }
            />
          </div>
        </div>

        <SavedPersonFilter filter={referentFilter} />
      </div>

      <Card className="p-0 md:p-0">
        {query.isPending || referentFilter.isPending ? (
          <LoadingState />
        ) : query.error ? (
          <ErrorState
            message={getErrorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        ) : (
          <>
            <p role="status" className="px-4 pt-4 text-sm text-muted md:px-6">
              {filtered.length} bénéficiaire
              {filtered.length > 1 && 's'}{' '}
              {isArchivedView ? 'archivé' : 'actif'}
              {filtered.length > 1 && 's'}
              {pageCount > 1 && ` · page ${page} sur ${pageCount}`}
            </p>

            {beneficiaries.length === 0 ? (
              <p className="px-4 py-8 text-center text-muted md:px-6">
                Aucun bénéficiaire ne correspond à ces critères.
              </p>
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className={`${columns} mt-2 hidden border-b border-border px-6 pb-2 text-xs font-semibold tracking-wide text-muted uppercase`}
                >
                  <span>Nom</span>
                  <span>Statut du parcours</span>
                  <span>Référent</span>
                  <span>{dateLabel}</span>
                  <span className="w-[5.5rem]" />
                </div>
                <ul className="divide-y divide-border">
                  {beneficiaries.map((beneficiary) => {
                    const name = `${beneficiary.lastName} ${beneficiary.firstName}`;
                    const date = isArchivedView
                      ? beneficiary.exitDate
                      : beneficiary.entryDate;

                    return (
                      <li
                        key={beneficiary.id}
                        className={`${columns} relative grid grid-cols-[1fr_auto] gap-x-2 gap-y-2 px-4 py-3 hover:bg-page md:px-6`}
                      >
                        <div className="min-w-0 space-y-2 md:contents md:space-y-0">
                          {/* Le lien couvre toute la ligne grâce à after:inset-0 */}
                          <Link
                            to={`/beneficiaries/${beneficiary.id}`}
                            className="block font-medium after:absolute after:inset-0 hover:underline"
                          >
                            {name}
                          </Link>
                          <div>
                            <Badge
                              tone={
                                pathwayStatusTones[beneficiary.pathwayStatus]
                              }
                            >
                              <span className="sr-only">
                                Statut du parcours :{' '}
                              </span>
                              {beneficiary.pathwayStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted md:text-base md:text-structure">
                            <span className="md:sr-only">Référent : </span>
                            <PersonName person={beneficiary.referent} />
                          </p>
                          <p className="text-sm text-muted md:text-base md:text-structure">
                            <span className="md:sr-only">{dateLabel} le </span>
                            {date ? formatDate(date) : '–'}
                          </p>
                        </div>
                        <div className="flex items-start md:items-center">
                          <Link
                            to={`/beneficiaries/${beneficiary.id}`}
                            aria-label={`Voir la fiche de ${name}`}
                            className={iconLinkClass}
                          >
                            <Eye className="size-5" aria-hidden="true" />
                          </Link>
                          {/* Un dossier archivé est en lecture seule */}
                          {!isArchivedView && (
                            <Link
                              to={`/beneficiaries/${beneficiary.id}/edit`}
                              aria-label={`Modifier ${name}`}
                              className={iconLinkClass}
                            >
                              <Pencil className="size-5" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </>
        )}
      </Card>

      <Pagination
        page={page}
        pageCount={pageCount}
        onChange={(value) => updateParam('page', String(value))}
      />
    </div>
  );
}
