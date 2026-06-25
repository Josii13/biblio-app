// Portail de connexion COTE FRONT uniquement (démo).
// ⚠️ Ceci n'est pas une vraie sécurité : les identifiants sont livrés au navigateur
// et l'API /api reste accessible directement. C'est un simple garde visuel.
const KEY = 'biblio.session';

const CREDENTIALS = { username: 'admin', password: 'biblio2026' };

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getSession();
}

export function login(username, password) {
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    localStorage.setItem(KEY, JSON.stringify({ username }));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}
