import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { BadRequestError } from '../errors/app-error.js';

/**
 * Les schémas Zod à appliquer, pour chaque partie de la requête.
 * Chacun est facultatif : on ne valide que ce qu'on fournit.
 *  - body   : le corps de la requête (ex. le formulaire envoyé en JSON)
 *  - params : les paramètres dans l'URL (ex. le 12 de /beneficiaries/12)
 *  - query  : la query string (ex. le 2 de ?page=2)
 */
type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

/** Une erreur de validation : où elle se trouve, sur quel champ, et pourquoi. */
type ValidationDetail = {
  location: 'body' | 'params' | 'query';
  field: string;
  message: string;
};

/**
 * Middleware de validation.
 * Utilisation sur une route :
 *   router.post('/', validate({ body: monSchema }), monController);
 *
 * - Si les données sont valides : la requête continue vers le controller,
 *   avec des données nettoyées et converties.
 * - Si elles sont invalides : erreur 400 BAD_REQUEST, avec la liste des
 *   problèmes, transmise au gestionnaire d'erreurs.
 */
export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    // Toutes les erreurs trouvées (on les collecte toutes avant de répondre)
    const details: ValidationDetail[] = [];

    // Les données validées, une fois nettoyées et converties par Zod
    const validated: Record<string, unknown> = {};

    // On vérifie tour à tour le corps, les paramètres d'URL et la query string
    for (const location of ['body', 'params', 'query'] as const) {
      const schema = schemas[location];

      // Pas de schéma fourni pour cette partie : rien à vérifier
      if (!schema) continue;

      // Express 5 laisse req.body à undefined quand la requête n'a pas de corps :
      // on le traite comme un objet vide, pour que Zod signale les champs manquants un par un.
      const data = location === 'body' ? (req.body ?? {}) : req[location];
      const result = schema.safeParse(data);

      if (result.success) {
        // Données valides : on garde la version nettoyée et convertie
        validated[location] = result.data;
      } else {
        // Données invalides : on note chaque problème trouvé par Zod
        for (const issue of result.error.issues) {
          details.push({
            location,
            field: issue.path.join('.'), // ex. "email" ou "address.city"
            message: issue.message,
          });
        }
      }
    }

    // Au moins une erreur : on arrête ici et on passe au gestionnaire d'erreurs
    if (details.length > 0) {
      next(new BadRequestError('Données invalides.', details));
      return;
    }

    // Le corps peut être remplacé directement par sa version nettoyée :
    // les champs non prévus par le schéma (ex. role: 'admin') disparaissent.
    if (validated.body !== undefined) req.body = validated.body;

    // Tout ce qui arrive dans l'URL est du texte : "12" et non 12.
    // Zod le convertit, mais Express 5 interdit de modifier req.query.
    // On range donc toutes les données validées dans res.locals : une "boîte"
    // fournie par Express pour transmettre des informations au controller
    // pendant le traitement de cette requête.
    // Le controller les lira ainsi : res.locals.validated.params.id → 12
    res.locals.validated = validated;

    // Tout est valide : on passe à la suite (le controller)
    next();
  };
}
