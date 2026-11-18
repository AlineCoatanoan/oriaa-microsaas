import { describe, it, expect } from 'vitest';
import { queryClient } from './query-client';
import { queryKeys } from '@/lib/query-keys';
import { ApiError } from '@/lib/api';

describe('queryClient', () => {
  it("oublie l'utilisateur quand l'API répond 401", async () => {
    queryClient.setQueryData(queryKeys.session, { id: 1 });

    await queryClient
      .fetchQuery({
        queryKey: ['tasks'],
        queryFn: () => Promise.reject(new ApiError(401, 'Session expirée.')),
        retry: false,
      })
      .catch(() => {});

    expect(queryClient.getQueryData(queryKeys.session)).toBeNull();
  });
});
