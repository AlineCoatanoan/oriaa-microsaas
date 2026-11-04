import type { Request, Response } from 'express';
import * as taskService from '../services/task.service.js';
import { getCurrentUser } from '../lib/current-user.js';

/** GET /api/tasks (?archived=true, ?beneficiaryId=5) */
export async function list(_req: Request, res: Response) {
  const { archived, beneficiaryId } = res.locals.validated.query;
  const tasks = await taskService.findAll({ archived, beneficiaryId });
  res.status(200).json({ tasks });
}

/** GET /api/tasks/:id */
export async function getById(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const task = await taskService.findById(id);
  res.status(200).json({ task });
}

/** POST /api/tasks */
export async function create(req: Request, res: Response) {
  const user = getCurrentUser(res);

  const task = await taskService.create(req.body, user.id);
  res.status(201).json({ task });
}

/** PATCH /api/tasks/:id */
export async function update(req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const task = await taskService.update(id, req.body);
  res.status(200).json({ task });
}

/** DELETE /api/tasks/:id */
export async function remove(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  await taskService.remove(id);
  res.status(204).end();
}
