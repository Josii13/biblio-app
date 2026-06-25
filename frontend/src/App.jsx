import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Livres from './components/Livres.jsx';
import Lecteurs from './components/Lecteurs.jsx';
import Emprunts from './components/Emprunts.jsx';
import Login from './components/Login.jsx';
import { Toast } from './components/ui.jsx';
import { isAuthenticated, logout } from './auth.js';

const PAGES = {
  dashboard: { title: 'Tableau de bord', subtitle: "Vue d'ensemble de la bibliothèque" },
  livres: { title: 'Catalogue', subtitle: 'Gérez les ouvrages et leurs exemplaires' },
  lecteurs: { title: 'Lecteurs', subtitle: 'Gérez les inscrits de la bibliothèque' },
  emprunts: { title: 'Emprunts', subtitle: 'Suivez les prêts et les retours' },
};

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (type, text) => setToast({ type, text, id: type + text + Math.random() });
  const meta = PAGES[page];

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setPage('dashboard');
    setAuthed(false);
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Sidebar
        page={page}
        setPage={setPage}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex min-h-screen flex-col md:pl-64">
        <Topbar title={meta.title} subtitle={meta.subtitle} onMenu={() => setMenuOpen(true)} />

        <main className="flex-1 px-5 py-6 lg:px-10">
          {page === 'dashboard' && <Dashboard notify={notify} goto={setPage} />}
          {page === 'livres' && <Livres notify={notify} />}
          {page === 'lecteurs' && <Lecteurs notify={notify} />}
          {page === 'emprunts' && <Emprunts notify={notify} />}
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
