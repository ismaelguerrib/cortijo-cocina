# Cortijo Cocina

PWA mobile-first pour organiser les repas familiaux du mois d'août 2026.

## Structure

```txt
frontend/   Application Angular PWA
backend/    API NestJS + TypeORM
docker-compose.yml
README.md
```

## Prérequis

- Node.js 20+
- npm 10+
- Docker Desktop

## Installation

Installer les dépendances de chaque application :

```bash
cd frontend && npm install
cd ../backend && npm install
```

Depuis la racine, vous pouvez aussi utiliser les scripts utilitaires :

```bash
npm run start:frontend
npm run start:backend
```

## Lancer PostgreSQL

Depuis la racine du projet :

```bash
docker compose up -d postgres
```

PostgreSQL sera exposé sur `localhost:5432` avec les identifiants suivants :

- base : `cortijo_cocina`
- utilisateur : `postgres`
- mot de passe : `postgres`

## Variables backend

Le backend lit ces variables d'environnement :

```bash
PORT=3000
FRONTEND_ORIGIN=http://localhost:4200
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=cortijo_cocina
```

Un exemple est fourni dans [backend/.env.example](/Users/ismaelguerrib/Codebase/cortijo-cocina/backend/.env.example).

## Exécuter les migrations

Après démarrage de PostgreSQL :

```bash
cd backend
npm run migration:run
```

## Lancer le backend

```bash
cd backend
npm run start:dev
```

API disponible sur `http://localhost:3000`.

## Lancer le frontend

```bash
cd frontend
npm run start -- --host 127.0.0.1 --port 4200
```

Application disponible sur `http://127.0.0.1:4200`.

## Tests

Backend :

```bash
cd backend
npm test
```

Frontend :

```bash
cd frontend
npm test
```

Vérification de typage Angular :

```bash
cd frontend
npm run typecheck
```

## Fonctionnalités livrées

- calendrier complet du mois d'août 2026 ;
- synthèse midi/soir sur chaque jour ;
- détail d'un jour en bottom sheet ;
- création, modification et suppression d'un repas ;
- sélection multiple de préparateurs ;
- persistance PostgreSQL ;
- API REST NestJS ;
- PWA installable avec manifest et service worker.
