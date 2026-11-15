import type { Request, Response } from 'express';
import * as subtaskService from '../services/subtask.service.js';
import { getCurrentUser } from '../lib/current-user.js';

/** POST /api/tasks/:id/subtasks */
export async function create(req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const subtask = await subtaskService.create(
    id,
    req.body,
    getCurrentUser(res),
  );
  res.status(201).json({ subtask });
}

/** PATCH /api/tasks/:id/subtasks/:subtaskId */
export async function update(req: Request, res: Response) {
  const { id, subtaskId } = res.locals.validated.params;
  const subtask = await subtaskService.update(
    id,
    subtaskId,
    req.body,
    getCurrentUser(res),
  );
  res.status(200).json({ subtask });
}

/** DELETE /api/tasks/:id/subtasks/:subtaskId */
export async function remove(_req: Request, res: Response) {
  const { id, subtaskId } = res.locals.validated.params;
  await subtaskService.remove(id, subtaskId, getCurrentUser(res));
  res.status(204).end();
}
