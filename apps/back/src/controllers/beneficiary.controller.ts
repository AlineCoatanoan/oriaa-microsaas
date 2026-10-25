import type { Request, Response } from 'express';
import * as beneficiaryService from '../services/beneficiary.service.js';
import { UnauthorizedError } from '../errors/app-error.js';

/** POST /api/beneficiaries */
export async function create(req: Request, res: Response) {
  const user = res.locals.user;
  if (!user) throw new UnauthorizedError();

  const beneficiary = await beneficiaryService.create(req.body, user.id);
  // 201 : ressource créée
  res.status(201).json({ beneficiary });
}

/** GET /api/beneficiaries/:id */
export async function getById(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const beneficiary = await beneficiaryService.findById(id);
  res.status(200).json({ beneficiary });
}

/** GET /api/beneficiaries (?archived=true) */
export async function list(_req: Request, res: Response) {
  const { archived } = res.locals.validated.query;
  const beneficiaries = await beneficiaryService.findAll({ archived });
  res.status(200).json({ beneficiaries });
}

/** PATCH /api/beneficiaries/:id */
export async function update(req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const beneficiary = await beneficiaryService.update(id, req.body);
  res.status(200).json({ beneficiary });
}

/** PATCH /api/beneficiaries/:id/archive */
export async function archive(req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const beneficiary = await beneficiaryService.archive(id, req.body.exitDate);
  res.status(200).json({ beneficiary });
}

/** PATCH /api/beneficiaries/:id/unarchive */
export async function unarchive(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const beneficiary = await beneficiaryService.unarchive(id);
  res.status(200).json({ beneficiary });
}

/** DELETE /api/beneficiaries/:id (admin) */
export async function remove(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  await beneficiaryService.remove(id);
  // 204 : succès, sans contenu à renvoyer
  res.status(204).end();
}
