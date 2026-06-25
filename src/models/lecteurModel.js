import { all, get, run } from '../config/db.js';

export const LecteurModel = {
  async create(data) {
    const r = await run(
      `INSERT INTO lecteurs (nom, prenom, email, telephone)
       VALUES (@nom, @prenom, @email, @telephone)`,
      { nom: data.nom, prenom: data.prenom, email: data.email, telephone: data.telephone }
    );
    return this.findById(Number(r.lastInsertRowid));
  },

  async findAll() {
    return all('SELECT * FROM lecteurs ORDER BY id DESC');
  },

  async findById(id) {
    return get('SELECT * FROM lecteurs WHERE id = ?', [id]);
  },

  async update(id, data) {
    await run(
      `UPDATE lecteurs SET nom = @nom, prenom = @prenom, email = @email, telephone = @telephone
       WHERE id = @id`,
      { id, nom: data.nom, prenom: data.prenom, email: data.email, telephone: data.telephone }
    );
    return this.findById(id);
  },

  async remove(id) {
    return run('DELETE FROM lecteurs WHERE id = ?', [id]);
  },
};
