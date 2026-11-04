import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';
import { ROLES } from '../config/roles.js';
import { ForbiddenError } from '../errors/app-error.js';
import { getCurrentUser } from '../lib/current-user.js';

/** GET /api/users (?archived=true : admin uniquement) */
export async function list(_req: Request, res: Response) {
  const { archived } = res.locals.validated.query;
  if (archived && getCurrentUser(res).role !== ROLES.ADMIN) {
    throw new ForbiddenError();
  }

  const users = await userService.findAll({ archived });
  res.status(200).json({ users });
}

/** POST /api/users (admin) */
export async function create(req: Request, res: Response) {
  const user = await userService.create(req.body);
  res.status(201).json({ user });
}

/** PATCH /api/users/:id (admin) */
export async function update(req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const user = await userService.update(id, req.body, getCurrentUser(res).id);
  res.status(200).json({ user });
}

/** PATCH /api/users/:id/archive (admin) */
export async function archive(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const user = await userService.archive(id, getCurrentUser(res).id);
  res.status(200).json({ user });
}

/** DELETE /api/users/:id (admin) */
export async function remove(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  await userService.remove(id, getCurrentUser(res).id);
  res.status(204).end();
}
