/** Statuts du parcours d'un bénéficiaire. */
export const DEFAULT_PATHWAY_STATUS = 'En cours';
export const PREPARING_EXIT_PATHWAY_STATUS = 'Préparation à la sortie';
export const EXIT_PATHWAY_STATUS = 'Sortie';
export const PATHWAY_STATUSES = [
  DEFAULT_PATHWAY_STATUS,
  PREPARING_EXIT_PATHWAY_STATUS,
  EXIT_PATHWAY_STATUS,
] as const;

/** Statuts d'une tâche. */
export const DEFAULT_TASK_STATUS = 'À faire';
export const IN_PROGRESS_TASK_STATUS = 'En cours';
export const COMPLETED_TASK_STATUS = 'Terminée';
export const TASK_STATUSES = [
  DEFAULT_TASK_STATUS,
  IN_PROGRESS_TASK_STATUS,
  COMPLETED_TASK_STATUS,
] as const;

/** Priorités d'une tâche. */
export const LOW_TASK_PRIORITY = 'Basse';
export const DEFAULT_TASK_PRIORITY = 'Normale';
export const URGENT_TASK_PRIORITY = 'Haute';
export const TASK_PRIORITIES = [
  LOW_TASK_PRIORITY,
  DEFAULT_TASK_PRIORITY,
  URGENT_TASK_PRIORITY,
] as const;

/** Page à laquelle s'applique un filtre enregistré. */
export const TASKS_LISTING = 'tasks';
