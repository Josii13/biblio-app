import { Icon } from './icons.jsx';

const NAV = [
  { key: 'dashboard', label: 'Tableau de bord', icon: Icon.Dashboard },
  { key: 'livres', label: 'Catalogue', icon: Icon.Book },
  { key: 'lecteurs', label: 'Lecteurs', icon: Icon.Users },
  { key: 'emprunts', label: 'Emprunts', icon: Icon.Swap },
];

export default function Sidebar({ page, setPage, open, onClose }) {
  return (
    <>
      {/* Fond sombre sur mobile quand le menu est ouvert */}
      {open && <div className="fixed inset-0 z-30 bg-ink/40 md:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-white/70 transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass/20 text-brass">
            <Icon.Book size={20} />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold text-white">Bibliothèque</div>
            <div className="text-xs uppercase tracking-[0.18em] text-brass">Municipale</div>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const ItemIcon = item.icon;
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setPage(item.key);
                  onClose();
                }}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? 'bg-white/10 font-medium text-white' : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-brass" />}
                <ItemIcon size={18} className={active ? 'text-brass' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Base Turso · en ligne
          </div>
          <div className="mt-1">API REST · Express · Netlify</div>
        </div>
      </aside>
    </>
  );
}
