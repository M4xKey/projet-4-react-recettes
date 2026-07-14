# Projet 4 - React Recettes

Une application web de gestion de recettes de cuisine : consultation publique des recettes, authentification par compte, et ajout/suppression de recettes réservé aux utilisateurs connectés.

## Démo

- **Application en ligne** : https://projet-4-react-recettes.vercel.app
- **API associée** : https://github.com/M4xKey/projet-3-api-recettes

## Stack technique

- **Frontend** : React 19 + Vite
- **Backend** : Node.js / Express (dépôt séparé, voir lien ci-dessus)
- **Base de données** : SQLite
- **Authentification** : JWT (JSON Web Token)
- **Lint** : Oxlint

## Installation locale

### Prérequis

- Node.js
- L'API backend démarrée localement (voir [projet-3-api-recettes](https://github.com/M4xKey/projet-3-api-recettes))

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/M4xKey/projet-4-react-recettes.git
cd projet-4-react-recettes

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
```

Variables d'environnement (`.env`) :

| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3000` |

```bash
# 4. Lancer le serveur de développement
npm run dev
```

L'application est alors accessible sur `http://localhost:5173` (par défaut).

### Autres commandes

```bash
npm run build    # build de production
npm run preview  # prévisualiser le build de production
npm run lint      # linter le code avec Oxlint
```

## Note

Ce projet a été réalisé dans le cadre d'un apprentissage du développement web, en utilisant **Claude Code** comme assistant de code.
