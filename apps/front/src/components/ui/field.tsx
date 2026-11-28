import { useId, type ReactNode } from 'react';
import { Label } from './label';

/** Attributs à transmettre au champ pour le relier à son label et à son erreur. */
type ControlProps = {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
};

type FieldProps = {
  label: string;
  error?: string;
  /** Affiche un astérisque : penser aussi à l'attribut required sur le champ. */
  required?: boolean;
  /** Aide sous le label (format attendu…), lue avec le champ. */
  hint?: string;
  children: (control: ControlProps) => ReactNode;
};

/** Label, champ et message d'erreur, reliés pour les lecteurs d'écran. */
export function Field({ label, error, required, hint, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </Label>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
