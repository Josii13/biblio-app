import { useState } from 'react';
import { login } from '../auth.js';
import { Button, Input, Field } from './ui.jsx';
import { Icon } from './icons.jsx';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    // léger délai pour le retour visuel du bouton
    setTimeout(() => {
      if (login(username.trim(), password)) {
        onLogin();
      } else {
        setError('Identifiant ou mot de passe incorrect.');
        setLoading(false);
      }
    }, 250);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brass/20 text-brass">
            <Icon.Book size={28} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-white">Bibliothèque Municipale</h1>
          <p className="mt-1 text-sm text-white/60">Espace de gestion — connectez-vous pour continuer</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-xl">
          <Field label="Identifiant">
            <Input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </Field>
          <Field label="Mot de passe">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-white/40">
          Accès démo · <span className="font-mono text-white/70">admin / biblio2026</span>
        </p>
      </div>
    </div>
  );
}
