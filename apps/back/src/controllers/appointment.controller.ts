import type { Request, Response } from 'express';
import * as appointmentService from '../services/appointment.service.js';
import { getCurrentUser } from '../lib/current-user.js';

/** GET /api/appointments (filtres : voir listAppointmentsQuerySchema) */
export async function list(_req: Request, res: Response) {
  const appointments = await appointmentService.findAll(
    res.locals.validated.query,
  );
  res.status(200).json({ appointments });
}

/** GET /api/appointments/:id */
export async function getById(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const appointment = await appointmentService.findById(id);
  res.status(200).json({ appointment });
}

/** POST /api/appointments */
export async function create(req: Request, res: Response) {
  const user = getCurrentUser(res);
  const appointment = await appointmentService.create(req.body, user.id);
  res.status(201).json({ appointment });
}

/** PATCH /api/appointments/:id */
export async function update(req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  const appointment = await appointmentService.update(id, req.body);
  res.status(200).json({ appointment });
}

/** DELETE /api/appointments/:id */
export async function remove(_req: Request, res: Response) {
  const { id } = res.locals.validated.params;
  await appointmentService.remove(id);
  res.status(204).end();
}
