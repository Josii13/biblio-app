import { LecteurModel } from '../models/lecteurModel.js';
import AppError from '../middlewares/AppError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const createLecteur = asyncHandler(async (req, res) => {
  const lecteur = await LecteurModel.create(req.body);
  res.status(201).json({ success: true, data: lecteur });
});

export const getLecteurs = asyncHandler(async (req, res) => {
  const lecteurs = await LecteurModel.findAll();
  res.json({ success: true, count: lecteurs.length, data: lecteurs });
});

export const getLecteur = asyncHandler(async (req, res) => {
  const lecteur = await LecteurModel.findById(req.params.id);
  if (!lecteur) throw new AppError('Lecteur introuvable', 404);
  res.json({ success: true, data: lecteur });
});

export const updateLecteur = asyncHandler(async (req, res) => {
  const existing = await LecteurModel.findById(req.params.id);
  if (!existing) throw new AppError('Lecteur introuvable', 404);
  const lecteur = await LecteurModel.update(req.params.id, req.body);
  res.json({ success: true, data: lecteur });
});

export const deleteLecteur = asyncHandler(async (req, res) => {
  const existing = await LecteurModel.findById(req.params.id);
  if (!existing) throw new AppError('Lecteur introuvable', 404);
  await LecteurModel.remove(req.params.id);
  res.json({ success: true, message: 'Lecteur supprime' });
});
