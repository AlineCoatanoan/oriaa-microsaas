import type { Request, Response } from 'express';
import * as noteService from '../services/note.service.js';
import { getCurrentUser } from '../lib/current-user.js';

/** GET /api/beneficiaries/:id/notes */
export async function list(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const notes = await noteService.findAllByBeneficiary(id);
  res.status(200).json({ notes });
}

/** POST /api/beneficiaries/:id/notes */
export async function create(req: Request, res: Response) {
  const user = getCurrentUser(res);

  const { id } = res.locals.validated.params;
  const note = await noteService.create(id, req.body, user.id);
  res.status(201).json({ note });
}

/** PATCH /api/beneficiaries/:id/notes/:noteId */
export async function update(req: Request, res: Response) {
  const { id, noteId } = res.locals.validated.params;
  const note = await noteService.update(id, noteId, req.body);
  res.status(200).json({ note });
}

/** DELETE /api/beneficiaries/:id/notes/:noteId */
export async function remove(_req: Request, res: Response) {
  const { id, noteId } = res.locals.validated.params;
  await noteService.remove(id, noteId);
  res.status(204).end();
}
