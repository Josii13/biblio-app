# API REST - Gestion d'une Bibliothèque Municipale

API REST pour gérer les **livres**, **lecteurs** et **emprunts** d'une bibliothèque municipale.

**Stack** : Node.js · Express.js · SQLite/libSQL (Turso) · architecture MVC · async/await · déployable sur **Netlify**.

---

## 1. Choix techniques (justification)

| Choix | Justification |
|-------|---------------|
| **Express.js** | Imposé par la consigne ; framework minimaliste et standard pour les API REST Node. |
| **libSQL (`@libsql/client`)** | Même langage que SQLite. En **local** : un simple fichier (`file:biblio.db`, zéro config). En **production** : base **Turso** hébergée (`libsql://…`), persistante et compatible serverless — contrairement à un fichier SQLite local qui ne survit pas sur Netlify. Un seul code pour les deux. |
| **serverless-http + Netlify Functions** | Permet de faire tourner la même app Express en tant que fonction serverless sur Netlify, sans serveur à gérer. |
| **Architecture MVC** | `models/` (accès données), `controllers/` (logique), `routes/` (endpoints). Séparation claire et maintenable. |
| **async/await** | Toute la couche métier (controllers + modèles) est asynchrone, comme exigé. |
| **Transactions SQL** | Un emprunt décrémente le stock **atomiquement** : pas d'incohérence possible entre l'emprunt créé et le stock du livre. |
| **Middleware d'erreurs centralisé** | Une seule source de vérité pour les réponses d'erreur (404, 409, 422, 500). |
| **Validation par schéma** | Middleware `validate()` réutilisable, vérifie types/champs requis/formats avant d'atteindre la base. |

---

## 2. Ressources et structure

```
biblio-api/
├── src/
│   ├── config/db.js            # Connexion SQLite + schéma (auto-créé)
│   ├── models/                 # Accès données (SQL)
│   │   ├── livreModel.js
│   │   ├── lecteurModel.js
│   │   └── empruntModel.js     # + transactions emprunt/retour
│   ├── controllers/            # Logique métier
│   ├── routes/                 # Définition des endpoints
│   ├── middlewares/
│   │   ├── AppError.js          # Erreur applicative
│   │   ├── asyncHandler.js      # Wrapper async (évite try/catch répétés)
│   │   ├── errorHandler.js      # Gestion centralisée des erreurs
│   │   └── validate.js          # Validation générique par schéma
│   ├── validators/schemas.js   # Schémas de validation
│   └── app.js                  # Configuration Express
├── frontend/                   # App React (Vite + Tailwind) — interface CRUD
│   └── src/
│       ├── api.js              # Client fetch vers /api
│       ├── App.jsx             # Onglets Livres / Lecteurs / Emprunts
│       └── components/         # UI + sections CRUD
├── netlify/functions/api.js    # Wrapper serverless (Express -> Netlify Function)
├── netlify.toml                # Config Netlify (build front + functions + redirections)
├── server.js                   # Point d'entrée API (dev local)
├── seed.js                     # Données de test
└── package.json
```

**3 ressources** : `livres`, `lecteurs`, `emprunts`.

---

## 3. Installation et lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement (en local : base fichier, aucun token requis)
cp .env.example .env

# 3. Charger des données de test
npm run seed

# 4. Démarrer
npm start          # ou : npm run dev  (auto-reload)
```

Serveur : `http://localhost:3000`
En local, la base `biblio.db` et son schéma sont créés automatiquement au premier démarrage (`DATABASE_URL=file:biblio.db`).

---

## 3 bis. Déploiement sur Netlify

L'API tourne en **Netlify Function** (Express enveloppé par `serverless-http`) et utilise une base **Turso** persistante.

1. **Créer la base Turso** (gratuit) :
   ```bash
   # via la CLI Turso
   turso db create biblio
   turso db show biblio --url        # -> DATABASE_URL (libsql://…)
   turso db tokens create biblio     # -> DATABASE_AUTH_TOKEN
   ```
2. **Déployer** : connecter le dépôt à Netlify (ou `netlify deploy`). La config est déjà dans `netlify.toml`.
3. **Variables d'environnement** dans Netlify (*Site settings → Environment variables*) :
   - `DATABASE_URL` = l'URL `libsql://…` de Turso
   - `DATABASE_AUTH_TOKEN` = le token Turso
4. **Initialiser le schéma + données** une fois la base créée :
   ```bash
   DATABASE_URL="libsql://…" DATABASE_AUTH_TOKEN="…" npm run seed
   ```
   (Le schéma se crée aussi tout seul à la première requête ; le seed n'ajoute que les données de démo.)

Une fois déployé : interface React à la racine `/`, API sous `https://<votre-site>.netlify.app/api`.

---

## 3 ter. Frontend React (Vite + Tailwind)

Interface de gestion (onglets **Livres / Lecteurs / Emprunts**) qui consomme l'API.
En production, elle est servie à la racine sur le même domaine que l'API (donc **pas de CORS**).

```bash
# Terminal 1 : l'API (port 3000)
npm start

# Terminal 2 : le frontend en dev (port 5173, proxy /api -> :3000)
cd frontend
npm install
npm run dev
```

Le build de production (`frontend/dist`) est généré automatiquement par Netlify (voir `netlify.toml`).

---

## 4. Endpoints

Base URL : `http://localhost:3000/api`

### Livres
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/livres` | Ajouter un livre |
| GET | `/livres` | Lister tous les livres |
| GET | `/livres?categorie=Roman` | **Rechercher par catégorie** |
| GET | `/livres/:id` | Afficher un livre |
| PUT | `/livres/:id` | Modifier un livre |
| DELETE | `/livres/:id` | Supprimer un livre |

### Lecteurs
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/lecteurs` | Ajouter un lecteur |
| GET | `/lecteurs` | Lister tous les lecteurs |
| GET | `/lecteurs/:id` | Afficher un lecteur |
| PUT | `/lecteurs/:id` | Modifier un lecteur |
| DELETE | `/lecteurs/:id` | Supprimer un lecteur |

### Emprunts
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/emprunts` | Enregistrer un emprunt (décrémente le stock) |
| GET | `/emprunts` | Lister tous les emprunts |
| PATCH | `/emprunts/:id/retour` | Marquer comme retourné (réincrémente le stock) |
| GET | `/emprunts/lecteur/:lecteurId` | Emprunts d'un lecteur |
| GET | `/emprunts/livre/:livreId/lecteurs` | Lecteurs ayant emprunté un livre |

---

## 5. Exemples de payloads

**Créer un livre**
```json
POST /api/livres
{
  "titre": "Clean Code",
  "auteur": "Robert C. Martin",
  "categorie": "Informatique",
  "annee_publication": 2008,
  "exemplaires_disponibles": 5
}
```

**Créer un lecteur**
```json
POST /api/lecteurs
{
  "nom": "Kouassi",
  "prenom": "Ange",
  "email": "ange.kouassi@mail.ci",
  "telephone": "+2250700000001"
}
```

**Créer un emprunt**
```json
POST /api/emprunts
{
  "lecteur_id": 1,
  "livre_id": 1,
  "date_retour_prevue": "2026-07-15"
}
```

---

## 6. Gestion des erreurs

Toutes les réponses suivent un format uniforme.

**Succès**
```json
{ "success": true, "data": { ... } }
```

**Erreur**
```json
{ "success": false, "message": "Description claire de l'erreur" }
```

| Code | Cas |
|------|-----|
| `201` | Ressource créée |
| `200` | Succès |
| `404` | Ressource introuvable |
| `409` | Conflit (email dupliqué, stock épuisé, emprunt déjà retourné) |
| `422` | Validation échouée (champ requis/format invalide) |
| `400` | Référence invalide (FK) |
| `500` | Erreur interne |

---

## 7. Règles métier importantes

- Un emprunt **n'est créé que s'il reste au moins un exemplaire** (transaction atomique).
- L'email d'un lecteur est **unique**.
- Supprimer un lecteur ou un livre supprime ses emprunts associés (`ON DELETE CASCADE`).
- Le retour d'un emprunt **réincrémente** le stock et passe le statut à `retourne`.

---

## 8. Tests

Importer la collection dans **Postman / Thunder Client / Insomnia** et exécuter dans l'ordre :
1. Créer livres et lecteurs.
2. Créer un emprunt → vérifier la décrémentation du stock.
3. Tenter un emprunt sans stock → `409`.
4. Consulter emprunts par lecteur / lecteurs par livre.
5. Retourner l'emprunt → vérifier la réincrémentation.

Les données de test sont fournies via `npm run seed` (5 livres, 3 lecteurs, 1 emprunt).
