import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

/** Demande un lien de réinitialisation, envoyé par e-mail. */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      }),
  });
}

type ResetPasswordInput = { token: string; password: string };

/** Choisit un nouveau mot de passe avec le jeton reçu dans le lien. */
export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      api<void>('/auth/reset-password', { method: 'POST', body: input }),
  });
}
