import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Button, Input, Field, Modal, Spinner, EmptyState, Table } from './ui.jsx';

const EMPTY = { nom: '', prenom: '', email: '', telephone: '' };

const COLUMNS = [
  { key: 'nom', label: 'Nom' },
  { key: 'prenom', label: 'Prénom' },
  { key: 'email', label: 'Email' },
  { key: 'tel', label: 'Téléphone' },
  { key: 'actions', label: 'Actions', align: 'right' },
];

export default function Lecteurs({ notify }) {
  const [lecteurs, setLecteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.lecteurs.list();
      setLecteurs(res.data);
    } catch (e) {
      notify('error', e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(EMPTY);
    setModal({ mode: 'create' });
  }

  function openEdit(l) {
    setForm({ nom: l.nom, prenom: l.prenom, email: l.email, telephone: l.telephone });
    setModal({ mode: 'edit', id: l.id });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
    };
    try {
      if (modal.mode === 'create') {
        await api.lecteurs.create(payload);
        notify('success', 'Lecteur ajouté');
      } else {
        await api.lecteurs.update(modal.id, payload);
        notify('success', 'Lecteur modifié');
      }
      setModal(null);
      load();
    } catch (e) {
      notify('error', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(l) {
    if (!window.confirm(`Supprimer ${l.prenom} ${l.nom} ? Ses emprunts seront aussi supprimés.`)) return;
    try {
      await api.lecteurs.remove(l.id);
      notify('success', 'Lecteur supprimé');
      load();
    } catch (e) {
      notify('error', e.message);
    }
  }

  return (
    <section>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Ajouter un lecteur</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : lecteurs.length === 0 ? (
        <EmptyState>Aucun lecteur.</EmptyState>
      ) : (
        <Table columns={COLUMNS}>
          {lecteurs.map((l) => (
            <tr key={l.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{l.nom}</td>
              <td className="px-4 py-3 text-slate-600">{l.prenom}</td>
              <td className="px-4 py-3 text-slate-600">{l.email}</td>
              <td className="px-4 py-3 text-slate-600">{l.telephone}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Button variant="ghost" onClick={() => openEdit(l)}>
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => remove(l)}
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'edit' ? 'Modifier le lecteur' : 'Nouveau lecteur'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom">
              <Input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </Field>
            <Field label="Prénom">
              <Input
                required
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Email">
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Téléphone">
            <Input
              required
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>
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
