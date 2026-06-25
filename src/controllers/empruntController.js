import {
  EmpruntModel,
  createEmpruntTransaction,
  retourEmpruntTransaction,
} from '../models/empruntModel.js';
import { LivreModel } from '../models/livreModel.js';
import { LecteurModel } from '../models/lecteurModel.js';
import AppError from '../middlewares/AppError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const createEmprunt = asyncHandler(async (req, res) => {
  const { lecteur_id, livre_id, date_retour_prevue } = req.body;

  // Verifs d'existence avant transaction (messages clairs)
  if (!(await LecteurModel.findById(lecteur_id))) throw new AppError('Lecteur introuvable', 404);
  if (!(await LivreModel.findById(livre_id))) throw new AppError('Livre introuvable', 404);

  const id = await createEmpruntTransaction({ lecteur_id, livre_id, date_retour_prevue });
  const emprunt = await EmpruntModel.findById(id);
  res.status(201).json({ success: true, data: emprunt });
});

export const getEmprunts = asyncHandler(async (req, res) => {
  const emprunts = await EmpruntModel.findAll();
  res.json({ success: true, count: emprunts.length, data: emprunts });
});

export const getEmpruntsByLecteur = asyncHandler(async (req, res) => {
  if (!(await LecteurModel.findById(req.params.lecteurId))) throw new AppError('Lecteur introuvable', 404);
  const emprunts = await EmpruntModel.findByLecteur(req.params.lecteurId);
  res.json({ success: true, count: emprunts.length, data: emprunts });
});

export const getLecteursByLivre = asyncHandler(async (req, res) => {
  if (!(await LivreModel.findById(req.params.livreId))) throw new AppError('Livre introuvable', 404);
  const lecteurs = await EmpruntModel.findLecteursByLivre(req.params.livreId);
  res.json({ success: true, count: lecteurs.length, data: lecteurs });
});

export const retournerEmprunt = asyncHandler(async (req, res) => {
  await retourEmpruntTransaction(Number(req.params.id));
  const emprunt = await EmpruntModel.findById(req.params.id);
  res.json({ success: true, message: 'Emprunt retourne, stock mis a jour', data: emprunt });
});
