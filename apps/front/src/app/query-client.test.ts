import { describe, it, expect } from 'vitest';
import { queryClient } from './query-client';
import { sessionQueryKey } from '@/features/auth/useSession';
import { ApiError } from '@/lib/api';

describe('queryClient', () => {
  it("oublie l'utilisateur quand l'API répond 401", async () => {
    queryClient.setQueryData(sessionQueryKey, { id: 1 });

    await queryClient
      .fetchQuery({
        queryKey: ['tasks'],
        queryFn: () => Promise.reject(new ApiError(401, 'Session expirée.')),
        retry: false,
      })
      .catch(() => {});

    expect(queryClient.getQueryData(sessionQueryKey)).toBeNull();
  });
});
