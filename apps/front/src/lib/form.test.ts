import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateForm } from './form';

const schema = z.object({
  email: z.email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

function createForm(values: Record<string, string>) {
  const form = document.createElement('form');
  for (const [name, value] of Object.entries(values)) {
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    form.append(input);
  }
  return form;
}

describe('validateForm', () => {
  it('renvoie les données valides', () => {
    const form = createForm({ email: 'a@oriaa.test', password: 'secret' });

    expect(validateForm(schema, form)).toEqual({
      success: true,
      data: { email: 'a@oriaa.test', password: 'secret' },
    });
  });

  it('renvoie un message par champ invalide', () => {
    const form = createForm({ email: 'invalide', password: '' });

    expect(validateForm(schema, form)).toEqual({
      success: false,
      errors: {
        email: 'Adresse e-mail invalide.',
        password: 'Mot de passe requis.',
      },
    });
  });
});
