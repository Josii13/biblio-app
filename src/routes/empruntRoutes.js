import { Router } from 'express';
import * as ctrl from '../controllers/empruntController.js';
import { validate } from '../middlewares/validate.js';
import { empruntSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', validate(empruntSchema), ctrl.createEmprunt);
router.get('/', ctrl.getEmprunts);
router.patch('/:id/retour', ctrl.retournerEmprunt);
router.get('/lecteur/:lecteurId', ctrl.getEmpruntsByLecteur);
router.get('/livre/:livreId/lecteurs', ctrl.getLecteursByLivre);

export default router;
