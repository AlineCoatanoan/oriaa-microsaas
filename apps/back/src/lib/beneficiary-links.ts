type BeneficiaryLink = {
  beneficiary: {
    beneficiary_id: number;
    first_name: string;
    last_name: string;
    archived_at: Date | null;
  };
};

/** Enlève les doublons d'une liste d'identifiants. */
export const unique = (ids: number[]) => [...new Set(ids)];

/** Garde uniquement les identifiants absents de la liste actuelle. */
export const newIds = (ids: number[], current: number[]) =>
  ids.filter((id) => !current.includes(id));

export const toBeneficiaryLinks = (ids: number[]) =>
  ids.map((beneficiary_id) => ({ beneficiary_id }));

/** Bénéficiaires liés à récupérer avec Prisma. */
export const beneficiaryLinksInclude = {
  include: {
    beneficiary: {
      select: {
        beneficiary_id: true,
        first_name: true,
        last_name: true,
        archived_at: true,
      },
    },
  },
};

/** Élément archivé : il a des bénéficiaires, et ils sont tous archivés. */
export const allBeneficiariesArchivedWhere = {
  beneficiaries: {
    some: {},
    every: { beneficiary: { archived_at: { not: null } } },
  },
};

/** Même règle, sur des données déjà chargées. */
export const areAllBeneficiariesArchived = (links: BeneficiaryLink[]) =>
  links.length > 0 &&
  links.every((link) => link.beneficiary.archived_at !== null);

/** Format d'un bénéficiaire lié renvoyé au front. */
export const toBeneficiarySummary = ({ beneficiary }: BeneficiaryLink) => ({
  id: beneficiary.beneficiary_id,
  firstName: beneficiary.first_name,
  lastName: beneficiary.last_name,
});
