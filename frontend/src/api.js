// Client API minimal. Meme origine que le front => /api (pas de CORS).
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* reponse sans corps JSON */
  }

  if (!res.ok || (body && body.success === false)) {
    throw new Error((body && body.message) || `Erreur ${res.status}`);
  }
  return body;
}

const query = (categorie) =>
  categorie ? `?categorie=${encodeURIComponent(categorie)}` : '';

export const api = {
  livres: {
    list: (categorie) => request('/livres' + query(categorie)),
    create: (data) => request('/livres', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/livres/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/livres/${id}`, { method: 'DELETE' }),
  },
  lecteurs: {
    list: () => request('/lecteurs'),
    create: (data) => request('/lecteurs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/lecteurs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/lecteurs/${id}`, { method: 'DELETE' }),
  },
  emprunts: {
    list: () => request('/emprunts'),
    create: (data) => request('/emprunts', { method: 'POST', body: JSON.stringify(data) }),
    retour: (id) => request(`/emprunts/${id}/retour`, { method: 'PATCH' }),
  },
};
