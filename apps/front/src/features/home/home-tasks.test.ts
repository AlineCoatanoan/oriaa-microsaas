import { describe, it, expect } from 'vitest';
import type { Task } from '@/features/tasks/types';
import { countTaskAlerts, selectTodayTasks } from './home-tasks';

const today = '2026-11-06';

function createTask(overrides: Partial<Task>): Task {
  return {
    id: 1,
    title: 'Tâche',
    description: null,
    dueDate: today,
    status: 'À faire',
    priority: 'Normale',
    isOverdue: false,
    isUrgent: false,
    isArchived: false,
    assignees: [],
    beneficiaries: [],
    ...overrides,
  };
}

describe('selectTodayTasks', () => {
  it('garde les tâches en retard et du jour, non terminées', () => {
    const tasks = [
      createTask({ id: 1, dueDate: today }),
      createTask({ id: 2, dueDate: '2026-11-03' }),
      createTask({ id: 3, dueDate: '2026-11-10' }),
      createTask({ id: 4, dueDate: null }),
      createTask({ id: 5, status: 'Terminée' }),
    ];

    expect(selectTodayTasks(tasks, today).map((task) => task.id)).toEqual([
      2, 1,
    ]);
  });

  it('classe par échéance, puis par priorité', () => {
    const tasks = [
      createTask({ id: 1, priority: 'Basse' }),
      createTask({ id: 2, priority: 'Haute' }),
    ];

    expect(selectTodayTasks(tasks, today).map((task) => task.id)).toEqual([
      2, 1,
    ]);
  });
});

describe('countTaskAlerts', () => {
  it('compte les tâches en retard et prioritaires', () => {
    const tasks = [
      createTask({ isOverdue: true, isUrgent: true }),
      createTask({ isUrgent: true }),
      createTask({}),
    ];

    expect(countTaskAlerts(tasks)).toEqual({ overdue: 1, urgent: 2 });
  });
});
