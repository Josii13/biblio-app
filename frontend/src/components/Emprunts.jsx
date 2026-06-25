import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Button, Select, Field, Input, Modal, Spinner, EmptyState, Badge, Table } from './ui.jsx';

const COLUMNS = [
  { key: 'id', label: '#' },
  { key: 'livre', label: 'Livre' },
  { key: 'lecteur', label: 'Lecteur' },
  { key: 'emprunte', label: 'Emprunté le' },
  { key: 'retour', label: 'Retour prévu' },
  { key: 'statut', label: 'Statut' },
  { key: 'action', label: 'Action', align: 'right' },
];

export default function Emprunts({ notify }) {
  const [emprunts, setEmprunts] = useState([]);
  const [livres, setLivres] = useState([]);
  const [lecteurs, setLecteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ lecteur_id: '', livre_id: '', date_retour_prevue: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [e, lv, lc] = await Promise.all([
        api.emprunts.list(),
        api.livres.list(),
        api.lecteurs.list(),
      ]);
      setEmprunts(e.data);
      setLivres(lv.data);
      setLecteurs(lc.data);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm({ lecteur_id: '', livre_id: '', date_retour_prevue: '' });
    setModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.emprunts.create({
        lecteur_id: Number(form.lecteur_id),
        livre_id: Number(form.livre_id),
        date_retour_prevue: form.date_retour_prevue,
      });
      notify('success', 'Emprunt enregistré');
      setModal(false);
      load();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function retour(emp) {
    try {
      await api.emprunts.retour(emp.id);
      notify('success', 'Retour enregistré, stock mis à jour');
      load();
    } catch (err) {
      notify('error', err.message);
    }
  }

  return (
    <section>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Nouvel emprunt</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : emprunts.length === 0 ? (
        <EmptyState>Aucun emprunt.</EmptyState>
      ) : (
        <Table columns={COLUMNS}>
          {emprunts.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-400">{e.id}</td>
              <td className="px-4 py-3 font-medium">{e.titre}</td>
              <td className="px-4 py-3 text-slate-600">
                {e.prenom} {e.nom}
              </td>
              <td className="px-4 py-3 text-slate-600">{e.date_emprunt}</td>
              <td className="px-4 py-3 text-slate-600">{e.date_retour_prevue}</td>
              <td className="px-4 py-3">
                {e.statut === 'retourne' ? (
                  <Badge color="green">Retourné</Badge>
                ) : (
                  <Badge color="amber">En cours</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {e.statut === 'en_cours' && (
                  <Button variant="secondary" onClick={() => retour(e)}>
                    Marquer retourné
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal open={modal} title="Nouvel emprunt" onClose={() => setModal(false)}>
        <form onSubmit={save} className="space-y-3">
          <Field label="Lecteur">
            <Select
              required
              value={form.lecteur_id}
              onChange={(e) => setForm({ ...form, lecteur_id: e.target.value })}
            >
              <option value="">— Choisir un lecteur —</option>
              {lecteurs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.prenom} {l.nom}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Livre">
            <Select
              required
              value={form.livre_id}
              onChange={(e) => setForm({ ...form, livre_id: e.target.value })}
            >
              <option value="">— Choisir un livre —</option>
              {livres.map((l) => (
                <option key={l.id} value={l.id} disabled={l.exemplaires_disponibles === 0}>
                  {l.titre}{' '}
                  {l.exemplaires_disponibles === 0
                    ? '(épuisé)'
                    : `(${l.exemplaires_disponibles} dispo)`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date de retour prévue">
            <Input
              required
              type="date"
              value={form.date_retour_prevue}
              onChange={(e) => setForm({ ...form, date_retour_prevue: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
