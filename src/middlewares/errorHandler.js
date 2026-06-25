import AppError from './AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Route introuvable : ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  // Contraintes SQLite / libSQL -> messages clairs.
  // libSQL (LibsqlError) n'expose pas toujours le code granulaire :
  // on detecte aussi via le texte du message ("UNIQUE constraint failed", etc.).
  const code = err.code || '';
  const raw = (err.message || '').toUpperCase();

  if (code === 'SQLITE_CONSTRAINT_UNIQUE' || raw.includes('UNIQUE CONSTRAINT')) {
    statusCode = 409;
    message = 'Une ressource avec ces informations existe deja (email unique).';
  } else if (code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || raw.includes('FOREIGN KEY CONSTRAINT')) {
    statusCode = 400;
    message = 'Reference invalide (lecteur ou livre inexistant).';
  } else if (code === 'SQLITE_CONSTRAINT_CHECK' || raw.includes('CHECK CONSTRAINT')) {
    statusCode = 400;
    message = 'Contrainte de donnees violee (valeur invalide).';
  }

  if (statusCode === 500) console.error('[ERROR]', err);

  res.status(statusCode).json({ success: false, message });
}
