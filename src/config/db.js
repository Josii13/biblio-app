import { createClient } from '@libsql/client';
import 'dotenv/config';

// libSQL : un seul client pour le local ET la prod.
//  - Local / dev      : DATABASE_URL = file:biblio.db  (SQLite local, zero config)
//  - Production Netlify: DATABASE_URL = libsql://...turso.io + DATABASE_AUTH_TOKEN
const db = createClient({
  url: process.env.DATABASE_URL || 'file:biblio.db',
  authToken: process.env.DATABASE_AUTH_TOKEN, // ignore pour une URL file:
});

// Schema (idempotent). En serverless, on l'execute une seule fois par instance.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS livres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    auteur TEXT NOT NULL,
    categorie TEXT NOT NULL,
    annee_publication INTEGER NOT NULL,
    exemplaires_disponibles INTEGER NOT NULL DEFAULT 0 CHECK (exemplaires_disponibles >= 0),
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS lecteurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telephone TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS emprunts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lecteur_id INTEGER NOT NULL,
    livre_id INTEGER NOT NULL,
    date_emprunt TEXT NOT NULL DEFAULT (date('now')),
    date_retour_prevue TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours','retourne')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lecteur_id) REFERENCES lecteurs(id) ON DELETE CASCADE,
    FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_livres_categorie ON livres(categorie)`,
  `CREATE INDEX IF NOT EXISTS idx_emprunts_lecteur ON emprunts(lecteur_id)`,
  `CREATE INDEX IF NOT EXISTS idx_emprunts_livre ON emprunts(livre_id)`,
];

let schemaPromise;
export function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = db.batch(SCHEMA, 'write').catch((err) => {
      schemaPromise = undefined; // permet une nouvelle tentative au prochain appel
      throw err;
    });
  }
  return schemaPromise;
}

// Helpers : libSQL est asynchrone et renvoie { rows, lastInsertRowid, rowsAffected }.
const stmt = (sql, args) => (args === undefined ? sql : { sql, args });

export async function all(sql, args) {
  return (await db.execute(stmt(sql, args))).rows;
}
export async function get(sql, args) {
  return (await db.execute(stmt(sql, args))).rows[0];
}
export async function run(sql, args) {
  return db.execute(stmt(sql, args));
}

export default db;
