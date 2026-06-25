import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Button, Input, Field, Modal, Spinner, EmptyState, Card, Table } from './ui.jsx';
import { Icon } from './icons.jsx';

const EMPTY = { titre: '', auteur: '', categorie: '', annee_publication: '', exemplaires_disponibles: '' };

const COLUMNS = [
  { key: 'titre', label: 'Titre' },
  { key: 'auteur', label: 'Auteur' },
  { key: 'categorie', label: 'Catégorie' },
  { key: 'annee', label: 'Année' },
  { key: 'stock', label: 'Stock' },
  { key: 'actions', label: 'Actions', align: 'right' },
];

export default function Livres({ notify }) {
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load(categorie) {
    setLoading(true);
    try {
      const res = await api.livres.list(categorie);
      setLivres(res.data);
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
    setForm({
      titre: l.titre,
      auteur: l.auteur,
      categorie: l.categorie,
      annee_publication: l.annee_publication,
      exemplaires_disponibles: l.exemplaires_disponibles,
    });
    setModal({ mode: 'edit', id: l.id });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      titre: form.titre.trim(),
      auteur: form.auteur.trim(),
      categorie: form.categorie.trim(),
      annee_publication: Number(form.annee_publication),
      exemplaires_disponibles: Number(form.exemplaires_disponibles),
    };
    try {
      if (modal.mode === 'create') {
        await api.livres.create(payload);
        notify('success', 'Livre ajouté');
      } else {
        await api.livres.update(modal.id, payload);
        notify('success', 'Livre modifié');
      }
      setModal(null);
      load(search.trim() || undefined);
    } catch (e) {
      notify('error', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(l) {
    if (!window.confirm(`Supprimer « ${l.titre} » ? Ses emprunts seront aussi supprimés.`)) return;
    try {
      await api.livres.remove(l.id);
      notify('success', 'Livre supprimé');
      load(search.trim() || undefined);
    } catch (e) {
      notify('error', e.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(search.trim() || undefined);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <Icon.Search size={16} />
            </span>
            <Input
              placeholder="Filtrer par catégorie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <Button variant="secondary" type="submit">
            Rechercher
          </Button>
          {search && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setSearch('');
                load();
              }}
            >
              Réinitialiser
            </Button>
          )}
        </form>
        <Button onClick={openCreate}>
          <Icon.Plus size={16} /> Ajouter un livre
        </Button>
      </div>

      <Card bodyClassName="">
        {loading ? (
          <Spinner />
        ) : livres.length === 0 ? (
          <EmptyState>Aucun ouvrage au catalogue. Ajoutez votre premier livre.</EmptyState>
        ) : (
          <Table columns={COLUMNS}>
            {livres.map((l) => (
              <tr key={l.id} className="transition-colors hover:bg-paper/50">
                <td className="px-5 py-3.5 font-medium">{l.titre}</td>
                <td className="px-5 py-3.5 text-muted">{l.auteur}</td>
                <td className="px-5 py-3.5 text-muted">{l.categorie}</td>
                <td className="px-5 py-3.5 tabular-nums text-muted">{l.annee_publication}</td>
                <td className="px-5 py-3.5">
                  <span className={l.exemplaires_disponibles === 0 ? 'font-semibold text-rose-600' : 'tabular-nums'}>
                    {l.exemplaires_disponibles === 0 ? 'Épuisé' : l.exemplaires_disponibles}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <Button variant="ghost" onClick={() => openEdit(l)}>
                    Modifier
                  </Button>
                  <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => remove(l)}>
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={!!modal}
        title={modal?.mode === 'edit' ? 'Modifier le livre' : 'Nouveau livre'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={save} className="space-y-3">
          <Field label="Titre">
            <Input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
          </Field>
          <Field label="Auteur">
            <Input required value={form.auteur} onChange={(e) => setForm({ ...form, auteur: e.target.value })} />
          </Field>
          <Field label="Catégorie">
            <Input required value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Année de publication">
              <Input
                required
                type="number"
                value={form.annee_publication}
                onChange={(e) => setForm({ ...form, annee_publication: e.target.value })}
              />
            </Field>
            <Field label="Exemplaires">
              <Input
                required
                type="number"
                min="0"
                value={form.exemplaires_disponibles}
                onChange={(e) => setForm({ ...form, exemplaires_disponibles: e.target.value })}
              />
            </Field>
          </div>
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
    </div>
  );
}
