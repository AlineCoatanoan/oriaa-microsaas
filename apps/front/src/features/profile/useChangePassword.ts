import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      api<void>('/auth/password', { method: 'PATCH', body: input }),
  });
}
