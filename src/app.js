import express from 'express';
import cors from 'cors';
import livreRoutes from './routes/livreRoutes.js';
import lecteurRoutes from './routes/lecteurRoutes.js';
import empruntRoutes from './routes/empruntRoutes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { ensureSchema } from './config/db.js';
import { asyncHandler } from './middlewares/asyncHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Garantit que le schema existe avant tout acces base (idempotent, memoise).
// Indispensable en serverless : chaque nouvelle instance demarre a froid.
app.use(asyncHandler(async (req, res, next) => {
  await ensureSchema();
  next();
}));

const health = (req, res) =>
  res.json({ success: true, message: 'API Bibliotheque Municipale - OK' });

app.get('/', health);     // accessible en local (npm start)
app.get('/api', health);  // accessible une fois deploye sur Netlify (/api)

app.use('/api/livres', livreRoutes);
app.use('/api/lecteurs', lecteurRoutes);
app.use('/api/emprunts', empruntRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
