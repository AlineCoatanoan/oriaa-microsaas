import type { Request, Response } from 'express';
import * as subtaskService from '../services/subtask.service.js';

/** POST /api/tasks/:id/subtasks */
export async function create(req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const subtask = await subtaskService.create(id, req.body);
  res.status(201).json({ subtask });
}

/** PATCH /api/tasks/:id/subtasks/:subtaskId */
export async function update(req: Request, res: Response) {
  const { id, subtaskId } = res.locals.validated.params;
  const subtask = await subtaskService.update(id, subtaskId, req.body);
  res.status(200).json({ subtask });
}

/** DELETE /api/tasks/:id/subtasks/:subtaskId */
export async function remove(_req: Request, res: Response) {
  const { id, subtaskId } = res.locals.validated.params;
  await subtaskService.remove(id, subtaskId);
  res.status(204).end();
}
