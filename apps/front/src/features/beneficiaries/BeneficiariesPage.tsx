import { Eye, Pencil, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DataList,
  DataListRow,
  IconLink,
  RowLink,
} from '@/components/ui/data-list';
import { Pagination } from '@/components/ui/pagination';
import { QueryState } from '@/components/ui/query-state';
import { ResultMessage } from '@/components/ui/result-message';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select } from '@/components/ui/select';
import {
  PersonFilterSelect,
  SavedPersonFilter,
} from '@/features/filter-preference/PersonFilter';
import { usePersonFilter } from '@/features/filter-preference/usePersonFilter';
import { PersonName } from '@/features/users/PersonName';
import { formatDate } from '@/lib/dates';
import { formatBeneficiaryName, plural } from '@/lib/format';
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

// Mêmes colonnes pour l'en-tête et les lignes, quand la liste est assez large
const columns =
  '@3xl:grid @3xl:grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] @3xl:items-center @3xl:gap-4';

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

  const viewLabel = plural(
    filtered.length,
    isArchivedView ? 'archivé' : 'actif',
  );
  const status = `${filtered.length} ${plural(filtered.length, 'bénéficiaire')} ${viewLabel}`;

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

      <ResultMessage
        result={message ? { message, isError: false } : undefined}
      />

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
        <QueryState
          query={query}
          isPending={query.isPending || referentFilter.isPending}
        >
          <DataList
            status={status}
            page={page}
            pageCount={pageCount}
            isEmpty={beneficiaries.length === 0}
            emptyMessage="Aucun bénéficiaire ne correspond à ces critères."
            columns={columns}
            headers={
              <>
                <span>Nom</span>
                <span>Statut du parcours</span>
                <span>Référent</span>
                <span>{dateLabel}</span>
                <span className="w-[5.5rem]" />
              </>
            }
          >
            {beneficiaries.map((beneficiary) => {
              const name = formatBeneficiaryName(beneficiary);
              const date = isArchivedView
                ? beneficiary.exitDate
                : beneficiary.entryDate;

              return (
                <DataListRow
                  key={beneficiary.id}
                  columns={columns}
                  actions={
                    <>
                      <IconLink
                        to={`/beneficiaries/${beneficiary.id}`}
                        label={`Voir la fiche de ${name}`}
                        tooltip="Voir"
                        icon={Eye}
                      />
                      {/* Un dossier archivé est en lecture seule */}
                      {!isArchivedView && (
                        <IconLink
                          to={`/beneficiaries/${beneficiary.id}/edit`}
                          label={`Modifier ${name}`}
                          tooltip="Modifier"
                          icon={Pencil}
                        />
                      )}
                    </>
                  }
                >
                  <RowLink
                    to={`/beneficiaries/${beneficiary.id}`}
                    className="block"
                  >
                    {name}
                  </RowLink>
                  <div>
                    <Badge tone={pathwayStatusTones[beneficiary.pathwayStatus]}>
                      <span className="sr-only">Statut du parcours : </span>
                      {beneficiary.pathwayStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted @3xl:text-base @3xl:text-structure">
                    <span className="@3xl:sr-only">Référent : </span>
                    <PersonName person={beneficiary.referent} />
                  </p>
                  <p className="text-sm text-muted @3xl:text-base @3xl:text-structure">
                    <span className="@3xl:sr-only">{dateLabel} le </span>
                    {date ? formatDate(date) : '–'}
                  </p>
                </DataListRow>
              );
            })}
          </DataList>
        </QueryState>
      </Card>

      <Pagination
        page={page}
        pageCount={pageCount}
        onChange={(value) => updateParam('page', String(value))}
      />
    </div>
  );
}
