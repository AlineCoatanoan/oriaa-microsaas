import { cn } from '@/lib/utils';

/** Résultat d'une action (changement de statut, suppression…). */
export type ActionResult = { message: string; isError: boolean };

/**
 * Message de retour après une action. Toujours présent dans la page
 * (role="status") pour que les lecteurs d'écran annoncent chaque nouveau message.
 */
export function ResultMessage({ result }: { result?: ActionResult }) {
  return (
    <p
      role="status"
      className={cn(
        result && 'rounded-lg p-3',
        result?.isError
          ? 'bg-danger-soft text-danger'
          : 'bg-success-soft text-success',
      )}
    >
      {result?.message}
    </p>
  );
}
