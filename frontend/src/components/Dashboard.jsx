import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, Spinner, Badge, EmptyState, Button } from './ui.jsx';
import { Icon } from './icons.jsx';

const todayISO = () => new Date().toISOString().slice(0, 10);

function DateStamp() {
  const d = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  return (
    <div className="rotate-[-4deg] select-none rounded-md border-2 border-brass/70 px-4 py-2 text-center font-mono text-brass">
      <div className="text-[10px] uppercase tracking-[0.25em]">Aujourd'hui</div>
      <div className="text-sm font-bold tracking-wide">{d}</div>
    </div>
  );
}

function StatCard({ icon: IconCmp, label, value, sub, alert }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            alert ? 'bg-rose-100 text-rose-600' : 'bg-brass/15 text-brass'
          }`}
        >
          <IconCmp size={20} />
        </span>
        {alert && <Badge color="red">à traiter</Badge>}
      </div>
      <div className="mt-4 font-display text-3xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm font-medium text-ink">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ notify, goto }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [lv, lc, em] = await Promise.all([
          api.livres.list(),
          api.lecteurs.list(),
          api.emprunts.list(),
        ]);
        setData({ livres: lv.data, lecteurs: lc.data, emprunts: em.data });
      } catch (e) {
        notify('error', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [notify]);

  if (loading) return <Spinner />;
  if (!data) return <EmptyState>Impossible de charger les données.</EmptyState>;

  const { livres, lecteurs, emprunts } = data;
  const today = todayISO();
  const exemplaires = livres.reduce((s, l) => s + l.exemplaires_disponibles, 0);
  const enCours = emprunts.filter((e) => e.statut === 'en_cours');
  const enRetard = enCours.filter((e) => e.date_retour_prevue < today);
  const recent = emprunts.slice(0, 5);

  // Répartition par catégorie
  const parCategorie = Object.entries(
    livres.reduce((acc, l) => {
      acc[l.categorie] = (acc[l.categorie] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const maxCat = Math.max(1, ...parCategorie.map((c) => c.count));

  return (
    <div className="space-y-6">
      {/* Bandeau d'accueil */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass">Bibliothèque Municipale</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Bonjour 👋</h2>
          <p className="mt-1 text-muted">
            {enCours.length} emprunt{enCours.length > 1 ? 's' : ''} en cours
            {enRetard.length > 0 && (
              <>
                {' · '}
                <span className="font-medium text-rose-600">{enRetard.length} en retard</span>
              </>
            )}
          </p>
        </div>
        <DateStamp />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Icon.Book}
          label="Ouvrages au catalogue"
          value={livres.length}
          sub={`${exemplaires} exemplaires disponibles`}
        />
        <StatCard icon={Icon.Users} label="Lecteurs inscrits" value={lecteurs.length} />
        <StatCard icon={Icon.Swap} label="Emprunts en cours" value={enCours.length} />
        <StatCard icon={Icon.Alert} label="En retard" value={enRetard.length} alert={enRetard.length > 0} />
      </div>

      {/* Détails */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Derniers emprunts"
          action={
            <Button variant="ghost" onClick={() => goto('emprunts')}>
              Tout voir →
            </Button>
          }
        >
          {recent.length === 0 ? (
            <EmptyState>Aucun emprunt enregistré.</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((e) => {
                const retard = e.statut === 'en_cours' && e.date_retour_prevue < today;
                return (
                  <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{e.titre}</div>
                      <div className="text-sm text-muted">
                        {e.prenom} {e.nom} · retour prévu le {e.date_retour_prevue}
                      </div>
                    </div>
                    {e.statut === 'retourne' ? (
                      <Badge color="green">Retourné</Badge>
                    ) : retard ? (
                      <Badge color="red">En retard</Badge>
                    ) : (
                      <Badge color="amber">En cours</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Répartition par catégorie">
          {parCategorie.length === 0 ? (
            <EmptyState>Aucun ouvrage.</EmptyState>
          ) : (
            <div className="space-y-4 p-5">
              {parCategorie.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="tabular-nums text-muted">{c.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full bg-brass"
                      style={{ width: `${(c.count / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
