import { Router } from 'express';
import type { Listing } from '../config/constants.js';
import { validate } from '../middlewares/validate.js';
import { saveFilterPreferenceSchema } from '../schemas/filter-preference.schema.js';
import { filterPreferenceController } from '../controllers/filter-preference.controller.js';

/**
 * Routes du filtre enregistré d'une liste.
 * Montées sur /api/tasks/filter-preference et /api/beneficiaries/filter-preference.
 */
export function createFilterPreferenceRouter(listing: Listing) {
  const router = Router();
  const controller = filterPreferenceController(listing);

  router.get('/', controller.get);
  router.put(
    '/',
    validate({ body: saveFilterPreferenceSchema }),
    controller.save,
  );
  router.delete('/', controller.remove);

  return router;
}
