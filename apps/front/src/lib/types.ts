/** Personne liée à un élément : son statut sert à barrer un compte archivé. */
export type Person = {
  id: number;
  name: string;
  status: 'active' | 'archived' | 'deleted';
};

/** Bénéficiaire tel qu'il apparaît dans une tâche ou un rendez-vous. */
export type BeneficiarySummary = {
  id: number;
  firstName: string;
  lastName: string;
};
