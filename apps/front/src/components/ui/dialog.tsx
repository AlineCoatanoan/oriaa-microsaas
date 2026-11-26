import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DialogProps = {
  open: boolean;
  /** Échap ou bouton « Annuler » : le parent décide de fermer ou non. */
  onClose: () => void;
  title: string;
  /** « large » : pour lire ou écrire un texte long (une note). */
  size?: 'default' | 'large';
  children: ReactNode;
};

/**
 * Fenêtre modale basée sur l'élément natif <dialog> : le navigateur gère
 * le piège du focus, la touche Échap et rend le reste de la page inactif.
 */
export function Dialog({
  open,
  onClose,
  title,
  size = 'default',
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Sans ça, Échap fermerait la fenêtre sans prévenir le parent
        event.preventDefault();
        onClose();
      }}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-xl border border-border bg-surface p-6 text-structure backdrop:bg-structure/50',
        size === 'large' ? 'max-w-3xl' : 'max-w-md',
      )}
    >
      <h2 id={titleId} className="mb-4 text-xl font-semibold">
        {title}
      </h2>
      {/* Contenu monté seulement à l'ouverture : il repart de zéro à chaque fois */}
      {open && children}
    </dialog>
  );
}
