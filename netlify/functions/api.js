import serverless from 'serverless-http';
import app from '../../src/app.js';

// Enveloppe l'application Express en handler serverless.
// Netlify reecrit /api/* vers cette fonction (voir netlify.toml),
// en conservant le chemin d'origine que les routes Express attendent.
export const handler = serverless(app);
