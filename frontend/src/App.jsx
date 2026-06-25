import { useState } from 'react';
import Livres from './components/Livres.jsx';
import Lecteurs from './components/Lecteurs.jsx';
import Emprunts from './components/Emprunts.jsx';
import { Toast } from './components/ui.jsx';

const TABS = [
  { key: 'livres', label: 'Livres', icon: '📚' },
  { key: 'lecteurs', label: 'Lecteurs', icon: '👤' },
  { key: 'emprunts', label: 'Emprunts', icon: '🔄' },
];

export default function App() {
  const [tab, setTab] = useState('livres');
  const [toast, setToast] = useState(null);

  const notify = (type, text) => setToast({ type, text, id: type + text + Math.random() });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-lg font-semibold">Bibliothèque Municipale</h1>
            <p className="text-xs text-slate-500">Gestion des livres, lecteurs et emprunts</p>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                tab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === 'livres' && <Livres notify={notify} />}
        {tab === 'lecteurs' && <Lecteurs notify={notify} />}
        {tab === 'emprunts' && <Emprunts notify={notify} />}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
