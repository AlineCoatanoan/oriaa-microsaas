import type { Request, Response } from 'express';
import * as taskFilterService from '../services/task-filter.service.js';
import { getCurrentUser } from '../lib/current-user.js';

/** GET /api/tasks/filter-preference */
export async function get(_req: Request, res: Response) {
  const user = getCurrentUser(res);
  const filterPreference = await taskFilterService.find(user.id);
  res.status(200).json({ filterPreference });
}

/** PUT /api/tasks/filter-preference */
export async function save(req: Request, res: Response) {
  const user = getCurrentUser(res);
  const filterPreference = await taskFilterService.save(user.id, req.body);
  res.status(200).json({ filterPreference });
}

/** DELETE /api/tasks/filter-preference */
export async function remove(_req: Request, res: Response) {
  const user = getCurrentUser(res);
  await taskFilterService.remove(user.id);
  res.status(204).end();
}
