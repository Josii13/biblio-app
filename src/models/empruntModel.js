import db, { all, get } from '../config/db.js';

export const EmpruntModel = {
  async findById(id) {
    return get('SELECT * FROM emprunts WHERE id = ?', [id]);
  },

  async findAll() {
    return all(`
      SELECT e.*, l.nom, l.prenom, b.titre
      FROM emprunts e
      JOIN lecteurs l ON l.id = e.lecteur_id
      JOIN livres b ON b.id = e.livre_id
      ORDER BY e.id DESC
    `);
  },

  async findByLecteur(lecteurId) {
    return all(
      `SELECT e.*, b.titre, b.auteur
       FROM emprunts e
       JOIN livres b ON b.id = e.livre_id
       WHERE e.lecteur_id = ?
       ORDER BY e.date_emprunt DESC`,
      [lecteurId]
    );
  },

  async findLecteursByLivre(livreId) {
    return all(
      `SELECT DISTINCT l.*, e.date_emprunt, e.statut
       FROM emprunts e
       JOIN lecteurs l ON l.id = e.lecteur_id
       WHERE e.livre_id = ?
       ORDER BY e.date_emprunt DESC`,
      [livreId]
    );
  },
};

// Transaction : creer l'emprunt + decrementer le stock atomiquement.
// La condition "exemplaires_disponibles > 0" garantit qu'aucun emprunt
// n'est cree si le stock est epuise (verrou au niveau SQL).
export async function createEmpruntTransaction({ lecteur_id, livre_id, date_retour_prevue }) {
  const tx = await db.transaction('write');
  try {
    const stock = await tx.execute({
      sql: 'UPDATE livres SET exemplaires_disponibles = exemplaires_disponibles - 1 WHERE id = ? AND exemplaires_disponibles > 0',
      args: [livre_id],
    });

    if (stock.rowsAffected === 0) {
      const err = new Error('Aucun exemplaire disponible pour ce livre.');
      err.statusCode = 409;
      throw err;
    }

    const info = await tx.execute({
      sql: `INSERT INTO emprunts (lecteur_id, livre_id, date_retour_prevue)
            VALUES (@lecteur_id, @livre_id, @date_retour_prevue)`,
      args: { lecteur_id, livre_id, date_retour_prevue },
    });

    await tx.commit();
    return Number(info.lastInsertRowid);
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// Transaction : retour + reincrementer le stock.
export async function retourEmpruntTransaction(empruntId) {
  const tx = await db.transaction('write');
  try {
    const res = await tx.execute({ sql: 'SELECT * FROM emprunts WHERE id = ?', args: [empruntId] });
    const emprunt = res.rows[0];

    if (!emprunt) {
      const e = new Error('Emprunt introuvable.');
      e.statusCode = 404;
      throw e;
    }
    if (emprunt.statut === 'retourne') {
      const e = new Error('Emprunt deja retourne.');
      e.statusCode = 409;
      throw e;
    }

    await tx.execute({ sql: "UPDATE emprunts SET statut = 'retourne' WHERE id = ?", args: [empruntId] });
    await tx.execute({
      sql: 'UPDATE livres SET exemplaires_disponibles = exemplaires_disponibles + 1 WHERE id = ?',
      args: [emprunt.livre_id],
    });

    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}
