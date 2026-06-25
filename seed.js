import db, { ensureSchema } from './src/config/db.js';

await ensureSchema();

console.log('Nettoyage...');
await db.batch(
  ['DELETE FROM emprunts', 'DELETE FROM lecteurs', 'DELETE FROM livres'],
  'write'
);

const livres = [
  ["L'Etranger", 'Albert Camus', 'Roman', 1942, 3],
  ['Une si longue lettre', 'Mariama Ba', 'Roman', 1979, 2],
  ['Clean Code', 'Robert C. Martin', 'Informatique', 2008, 5],
  ['Les Soleils des independances', 'Ahmadou Kourouma', 'Roman', 1968, 1],
  ['Sapiens', 'Yuval Noah Harari', 'Histoire', 2011, 4],
];
await db.batch(
  livres.map((args) => ({
    sql: 'INSERT INTO livres (titre,auteur,categorie,annee_publication,exemplaires_disponibles) VALUES (?,?,?,?,?)',
    args,
  })),
  'write'
);

const lecteurs = [
  ['Kouassi', 'Ange', 'ange.kouassi@mail.ci', '+2250700000001'],
  ['Diabate', 'Fatim', 'fatim.diabate@mail.ci', '+2250700000002'],
  ['Yao', 'Marc', 'marc.yao@mail.ci', '+2250700000003'],
];
await db.batch(
  lecteurs.map((args) => ({
    sql: 'INSERT INTO lecteurs (nom,prenom,email,telephone) VALUES (?,?,?,?)',
    args,
  })),
  'write'
);

// Un emprunt de demo + decrement de stock, de facon atomique.
await db.batch(
  [
    'UPDATE livres SET exemplaires_disponibles = exemplaires_disponibles - 1 WHERE id = 1',
    "INSERT INTO emprunts (lecteur_id,livre_id,date_retour_prevue) VALUES (1,1,date('now','+14 days'))",
  ],
  'write'
);

console.log('Seed termine : 5 livres, 3 lecteurs, 1 emprunt.');
process.exit(0);
