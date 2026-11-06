import { useQuery } from '@tanstack/react-query';
import { api, toQueryString } from '@/lib/api';
import type { Task, TaskPriority, TaskStatus } from './types';

export type TaskFilters = {
  assigneeId?: number;
  beneficiaryId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
};

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { tasks } = await api<{ tasks: Task[] }>(
        `/tasks${toQueryString(filters)}`,
      );
      return tasks;
    },
  });
}
