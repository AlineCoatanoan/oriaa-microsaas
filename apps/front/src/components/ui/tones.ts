/** Couleurs communes aux badges et aux listes de statut ou de priorité. */
export const tones = {
  info: 'bg-info-soft text-interaction',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
};

export type Tone = keyof typeof tones;
