const currentYear = new Date().getFullYear();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const livreSchema = {
  titre: { required: true, type: 'string' },
  auteur: { required: true, type: 'string' },
  categorie: { required: true, type: 'string' },
  annee_publication: { required: true, type: 'number', min: 0, max: currentYear },
  exemplaires_disponibles: { required: true, type: 'number', min: 0 },
};

export const lecteurSchema = {
  nom: { required: true, type: 'string' },
  prenom: { required: true, type: 'string' },
  email: { required: true, type: 'string', regex: emailRegex },
  telephone: { required: true, type: 'string' },
};

export const empruntSchema = {
  lecteur_id: { required: true, type: 'number' },
  livre_id: { required: true, type: 'number' },
  date_retour_prevue: { required: true, type: 'string', regex: dateRegex },
};
