import { useEffect, useId, useRef, type ReactNode } from 'react';

type DialogProps = {
  open: boolean;
  /** Échap ou bouton « Annuler » : le parent décide de fermer ou non. */
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * Fenêtre modale basée sur l'élément natif <dialog> : le navigateur gère
 * le piège du focus, la touche Échap et rend le reste de la page inactif.
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
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
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-surface p-6 text-structure backdrop:bg-structure/50"
    >
      <h2 id={titleId} className="mb-4 text-xl font-semibold">
        {title}
      </h2>
      {/* Contenu monté seulement à l'ouverture : il repart de zéro à chaque fois */}
      {open && children}
    </dialog>
  );
}
