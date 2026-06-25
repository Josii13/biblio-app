import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Button, Select, Field, Input, Modal, Spinner, EmptyState, Badge, Card, Table } from './ui.jsx';
import { Icon } from './icons.jsx';

const todayISO = () => new Date().toISOString().slice(0, 10);

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

  const today = todayISO();

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Icon.Plus size={16} /> Nouvel emprunt
        </Button>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : emprunts.length === 0 ? (
          <EmptyState>Aucun emprunt enregistré. Créez un emprunt pour démarrer.</EmptyState>
        ) : (
          <Table columns={COLUMNS}>
            {emprunts.map((e) => {
              const retard = e.statut === 'en_cours' && e.date_retour_prevue < today;
              return (
                <tr key={e.id} className="transition-colors hover:bg-paper/50">
                  <td className="px-5 py-3.5 tabular-nums text-muted">{e.id}</td>
                  <td className="px-5 py-3.5 font-medium">{e.titre}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {e.prenom} {e.nom}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-muted">{e.date_emprunt}</td>
                  <td className={`px-5 py-3.5 tabular-nums ${retard ? 'font-medium text-rose-600' : 'text-muted'}`}>
                    {e.date_retour_prevue}
                  </td>
                  <td className="px-5 py-3.5">
                    {e.statut === 'retourne' ? (
                      <Badge color="green">Retourné</Badge>
                    ) : retard ? (
                      <Badge color="red">En retard</Badge>
                    ) : (
                      <Badge color="amber">En cours</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {e.statut === 'en_cours' && (
                      <Button variant="secondary" onClick={() => retour(e)}>
                        Marquer retourné
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

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
                  {l.exemplaires_disponibles === 0 ? '(épuisé)' : `(${l.exemplaires_disponibles} dispo)`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date de retour prévue">
            <Input
              required
              type="date"
              min={today}
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
    </div>
  );
}
