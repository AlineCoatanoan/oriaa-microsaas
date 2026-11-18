import { useQuery } from '@tanstack/react-query';
import { api, toQueryString } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Task, TaskPriority, TaskStatus } from './types';

export type TaskQueryFilters = {
  assigneeId?: number;
  beneficiaryId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
};

export function useTasks(filters: TaskQueryFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: async () => {
      const { tasks } = await api<{ tasks: Task[] }>(
        `/tasks${toQueryString(filters)}`,
      );
      return tasks;
    },
  });
}
