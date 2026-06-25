import { Router } from 'express';
import * as ctrl from '../controllers/lecteurController.js';
import { validate } from '../middlewares/validate.js';
import { lecteurSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', validate(lecteurSchema), ctrl.createLecteur);
router.get('/', ctrl.getLecteurs);
router.get('/:id', ctrl.getLecteur);
router.put('/:id', validate(lecteurSchema), ctrl.updateLecteur);
router.delete('/:id', ctrl.deleteLecteur);

export default router;
