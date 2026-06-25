import AppError from './AppError.js';

// schema: { field: { required, type, enum, min, max, regex } }
export const validate = (schema) => (req, res, next) => {
  const errors = [];
  const body = req.body || {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    const absent = value === undefined || value === null || value === '';

    if (rules.required && absent) {
      errors.push(`${field} est requis`);
      continue;
    }
    if (absent) continue;

    if (rules.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} doit etre un nombre`);
      continue;
    }
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} doit etre une chaine`);
      continue;
    }
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} doit etre parmi : ${rules.enum.join(', ')}`);
    }
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${field} doit etre >= ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${field} doit etre <= ${rules.max}`);
    }
    if (rules.regex && !rules.regex.test(value)) {
      errors.push(`${field} a un format invalide`);
    }
  }

  if (errors.length) return next(new AppError(errors.join(' ; '), 422));
  next();
};
