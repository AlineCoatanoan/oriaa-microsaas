import type { Request, Response } from 'express';
import type { Listing } from '../config/constants.js';
import * as filterPreferenceService from '../services/filter-preference.service.js';
import { getCurrentUser } from '../lib/current-user.js';

/** Contrôleurs du filtre enregistré, pour une liste donnée (tâches, bénéficiaires…). */
export function filterPreferenceController(listing: Listing) {
  return {
    /** GET .../filter-preference */
    async get(_req: Request, res: Response) {
      const user = getCurrentUser(res);
      const filterPreference = await filterPreferenceService.find(
        user.id,
        listing,
      );
      res.status(200).json({ filterPreference });
    },

    /** PUT .../filter-preference */
    async save(req: Request, res: Response) {
      const user = getCurrentUser(res);
      const filterPreference = await filterPreferenceService.save(
        user.id,
        listing,
        req.body,
      );
      res.status(200).json({ filterPreference });
    },

    /** DELETE .../filter-preference */
    async remove(_req: Request, res: Response) {
      const user = getCurrentUser(res);
      await filterPreferenceService.remove(user.id, listing);
      res.status(204).end();
    },
  };
}
