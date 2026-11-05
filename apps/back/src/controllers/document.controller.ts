import type { Request, Response } from 'express';
import * as documentService from '../services/document.service.js';
import { getCurrentUser } from '../lib/current-user.js';

/** GET /api/beneficiaries/:id/documents */
export async function list(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const documents = await documentService.findAllByBeneficiary(id);
  res.status(200).json({ documents });
}

/** POST /api/beneficiaries/:id/documents (multipart/form-data) */
export async function create(req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const document = await documentService.create(
    id,
    req.body,
    req.file,
    getCurrentUser(res).id,
  );
  res.status(201).json({ document });
}

/** GET /api/beneficiaries/:id/documents/:documentId/download */
export async function download(_req: Request, res: Response) {
  const { id, documentId } = res.locals.validated.params;
  const file = await documentService.findFile(id, documentId);

  // attachment : le navigateur télécharge le fichier au lieu de l'exécuter
  res.attachment(file.file_name);
  res.type(file.mime_type);
  res.status(200).send(Buffer.from(file.content));
}

/** PATCH /api/beneficiaries/:id/documents/:documentId */
export async function update(req: Request, res: Response) {
  const { id, documentId } = res.locals.validated.params;
  const document = await documentService.update(id, documentId, req.body);
  res.status(200).json({ document });
}

/** DELETE /api/beneficiaries/:id/documents/:documentId */
export async function remove(_req: Request, res: Response) {
  const { id, documentId } = res.locals.validated.params;
  await documentService.remove(id, documentId);
  res.status(204).end();
}
