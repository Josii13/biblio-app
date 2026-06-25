import { Router } from 'express';
import * as ctrl from '../controllers/livreController.js';
import { validate } from '../middlewares/validate.js';
import { livreSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', validate(livreSchema), ctrl.createLivre);
router.get('/', ctrl.getLivres);            // ?categorie=Roman pour filtrer
router.get('/:id', ctrl.getLivre);
router.put('/:id', validate(livreSchema), ctrl.updateLivre);
router.delete('/:id', ctrl.deleteLivre);

export default router;
