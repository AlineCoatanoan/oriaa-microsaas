import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TaskDetails } from './types';

// Commence par 'tasks' : invalider ['tasks'] recharge aussi la fiche
export const taskQueryKey = (id: number) => ['tasks', id];

export function useTask(id: number) {
  return useQuery({
    queryKey: taskQueryKey(id),
    queryFn: async () => {
      const { task } = await api<{ task: TaskDetails }>(`/tasks/${id}`);
      return task;
    },
  });
}
