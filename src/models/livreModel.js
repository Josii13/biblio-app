import { all, get, run } from '../config/db.js';

export const LivreModel = {
  async create(data) {
    const r = await run(
      `INSERT INTO livres (titre, auteur, categorie, annee_publication, exemplaires_disponibles)
       VALUES (@titre, @auteur, @categorie, @annee_publication, @exemplaires_disponibles)`,
      {
        titre: data.titre,
        auteur: data.auteur,
        categorie: data.categorie,
        annee_publication: data.annee_publication,
        exemplaires_disponibles: data.exemplaires_disponibles,
      }
    );
    return this.findById(Number(r.lastInsertRowid));
  },

  async findAll() {
    return all('SELECT * FROM livres ORDER BY id DESC');
  },

  async findById(id) {
    return get('SELECT * FROM livres WHERE id = ?', [id]);
  },

  async findByCategorie(categorie) {
    return all('SELECT * FROM livres WHERE categorie = ? COLLATE NOCASE ORDER BY titre', [categorie]);
  },

  async update(id, data) {
    await run(
      `UPDATE livres SET
         titre = @titre, auteur = @auteur, categorie = @categorie,
         annee_publication = @annee_publication, exemplaires_disponibles = @exemplaires_disponibles
       WHERE id = @id`,
      {
        id,
        titre: data.titre,
        auteur: data.auteur,
        categorie: data.categorie,
        annee_publication: data.annee_publication,
        exemplaires_disponibles: data.exemplaires_disponibles,
      }
    );
    return this.findById(id);
  },

  async remove(id) {
    return run('DELETE FROM livres WHERE id = ?', [id]);
  },
};
