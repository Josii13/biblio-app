import { Icon } from './icons.jsx';

export default function Topbar({ title, subtitle, onMenu }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-paper/85 px-5 py-4 backdrop-blur lg:px-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-muted transition hover:bg-surface md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Icon.Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
