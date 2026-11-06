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
  children: (control: ControlProps) => ReactNode;
};

/** Label, champ et message d'erreur, reliés pour les lecteurs d'écran. */
export function Field({ label, error, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
