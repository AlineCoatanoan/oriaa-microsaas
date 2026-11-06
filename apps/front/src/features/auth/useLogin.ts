import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { sessionQueryKey, type SessionUser } from './useSession';

export type LoginInput = {
  email: string;
  password: string;
};

/** Connecte l'utilisateur. Le back pose le cookie, le front garde l'utilisateur en cache. */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      api<{ user: SessionUser }>('/auth/login', {
        method: 'POST',
        body: input,
      }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(sessionQueryKey, user);
    },
  });
}
