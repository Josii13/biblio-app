import { LivreModel } from '../models/livreModel.js';
import AppError from '../middlewares/AppError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const createLivre = asyncHandler(async (req, res) => {
  const livre = await LivreModel.create(req.body);
  res.status(201).json({ success: true, data: livre });
});

export const getLivres = asyncHandler(async (req, res) => {
  // Recherche par categorie via query param : /api/livres?categorie=Roman
  const { categorie } = req.query;
  const livres = categorie
    ? await LivreModel.findByCategorie(categorie)
    : await LivreModel.findAll();
  res.json({ success: true, count: livres.length, data: livres });
});

export const getLivre = asyncHandler(async (req, res) => {
  const livre = await LivreModel.findById(req.params.id);
  if (!livre) throw new AppError('Livre introuvable', 404);
  res.json({ success: true, data: livre });
});

export const updateLivre = asyncHandler(async (req, res) => {
  const existing = await LivreModel.findById(req.params.id);
  if (!existing) throw new AppError('Livre introuvable', 404);
  const livre = await LivreModel.update(req.params.id, req.body);
  res.json({ success: true, data: livre });
});

export const deleteLivre = asyncHandler(async (req, res) => {
  const existing = await LivreModel.findById(req.params.id);
  if (!existing) throw new AppError('Livre introuvable', 404);
  await LivreModel.remove(req.params.id);
  res.json({ success: true, message: 'Livre supprime' });
});
