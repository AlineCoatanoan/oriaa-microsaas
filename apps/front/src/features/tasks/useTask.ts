import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { TaskDetails } from './types';

export function useTask(id: number) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: async () => {
      const { task } = await api<{ task: TaskDetails }>(`/tasks/${id}`);
      return task;
    },
  });
}
