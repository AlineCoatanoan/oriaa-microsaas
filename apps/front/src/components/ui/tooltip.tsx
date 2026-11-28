import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Infobulle : le nom court d'un bouton-icône (« Modifier »), au survol
 * et au focus clavier. Elle reste affichée tant que le pointeur est sur
 * le bouton ou sur elle, et Échap la masque (WCAG 1.4.13).
 * Visuelle seulement : les lecteurs d'écran lisent déjà le nom complet
 * du bouton (aria-label), qui commence par ce même mot.
 */
export function Tooltip({
  text,
  align = 'center',
  children,
}: {
  text: string;
  /** « start » : calée à gauche du bouton, pour un bouton au bord de la page. */
  align?: 'center' | 'start';
  children: ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Échap masque l'infobulle, même quand le focus est ailleurs dans la page
  useEffect(() => {
    if (!isHovered) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDismissed(true);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isHovered]);

  return (
    <span
      className="group/tooltip relative z-10 inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setDismissed(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setDismissed(true);
      }}
      onBlur={() => setDismissed(false)}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-full hidden pb-1',
          align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
          !dismissed &&
            'group-hover/tooltip:block group-has-[:focus-visible]/tooltip:block',
        )}
      >
        <span className="block rounded-md bg-structure px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-md">
          {text}
        </span>
      </span>
    </span>
  );
}
