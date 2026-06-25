# Tests de l'API

Deux collections fournies (importez celle de votre outil) :

- **Thunder Client** (extension VS Code) : `thunder-collection_biblio.json`
- **Postman** : `postman_collection.json`

## Procédure

1. Démarrer l'API : `npm run seed` puis `npm start`
2. Importer la collection.
3. Exécuter les requêtes **dans l'ordre des dossiers** : Livres → Lecteurs → Emprunts.

## Scénario de validation conseillé (pour les captures)

1. **Créer un livre** → 201
2. **Lister les livres** → 200
3. **Rechercher par catégorie** → 200
4. **Validation KO (422)** → message d'erreur clair
5. **Créer un lecteur** → 201
6. **Email dupliqué (409)** → conflit
7. **Créer un emprunt** → 201, le stock du livre diminue
8. **Emprunts d'un lecteur** → 200
9. **Retourner un emprunt** → 200, le stock remonte

La variable `base` vaut `http://localhost:3000`.
