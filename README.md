# Parlons Violence

**Un forum anonyme et sécurisé pour aborder des sujets sensibles liés à la violence, l'abus et la détresse.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-RC-orange.svg)](https://tanstack.com/start)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🎯 Mission

Créer un espace sûr où les personnes confrontées à la violence peuvent **partager, échanger et trouver du soutien** sans barrières à l'entrée. Notre principe fondamental : **Anonymous-first, registration optional**.

### Valeurs Clés

- **Anonymat garanti** : Système d'alias pour séparer l'identité réelle du contenu public
- **Friction minimale** : Publier sans inscription, en quelques clics
- **Sécurité par défaut** : Rate limiting, bot protection, redaction automatique
- **Confiance et empathie** : UX conçue pour utilisateurs vulnérables

---

## ✨ Fonctionnalités Principales

### 🎭 Authentification Anonyme avec Code Secret

- Session anonyme immédiate (aucune donnée personnelle requise)
- Code secret généré après première publication (format: `XXXX-XXXX-XXXX`)
- Récupération de session sur n'importe quel appareil
- Migration optionnelle vers compte email

**Documentation:** [Auth Flows](docs/auth-flows.md)

### 🔒 Système d'Alias

- Séparation totale User ↔ Contenu Public
- Impossible de lier directement un utilisateur à ses publications
- Support multi-alias (alias principal + secondaires)
- Rotation automatique (future feature)

**Documentation:** [Alias System](src/features/alias/README.md) | [ERD](docs/diagrams/alias-system-erd.md)

### 📝 Publications et Réponses

- **Threads** : Sujets principaux avec catégories (support, témoignage, questions, ressources)
- **Posts** : Réponses aux threads avec support contenu sensible
- **Comments** : Commentaires imbriqués sur les posts
- Modération intégrée pour garantir la sécurité

**Documentation:** [Architecture Flows](docs/architecture-flux-threads-posts.md)

### 🛡️ Sécurité Multi-Couches

1. **Client Validation** : TanStack Form + Zod
2. **Server Validation** : Server Functions + Zod
3. **Rate Limiting** : Arcjet (anti-brute force)
4. **Authentication** : Better Auth (sessions sécurisées)
5. **Authorization** : Middleware checks
6. **Anonymat** : Alias system
7. **Redaction** : Logs auto-redactés (passwords, tokens)

**Documentation:** [System Overview](docs/diagrams/system-overview.md)

---

## 🏗️ Stack Technique

### Frontend

- **React 19** : UI moderne avec Server Components
- **TanStack Start (RC)** : Framework full-stack avec SSR
- **TanStack Router** : File-based routing
- **TanStack Query** : Server state management
- **TanStack Form** : Form state + validation
- **Shadcn/UI + Radix** : Composants accessibles
- **Tailwind CSS 4** : Styling utility-first

### Backend

- **TanStack Start Server Functions** : API type-safe
- **Better Auth** : Authentification (anonyme + email/password)
- **Drizzle ORM** : Type-safe SQL queries
- **PostgreSQL** : Base de données relationnelle
- **Arcjet** : Rate limiting + bot protection
- **Winston** : Logging structuré avec correlation IDs

### Tooling

- **TypeScript (strict mode)** : Type safety
- **Vitest 3.x** : Testing framework
- **Biome** : Linting + formatting
- **Bun** : runtime et gestionnaire de paquets

**Documentation:** [Project Context](project-context.md)

---

## 🚀 Quick Start

### Prérequis

- Bun 1.3+
- Docker, ou PostgreSQL 17 installé localement

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/your-org/parlons-violence.git
cd parlons-violence

# Installer les dépendances
bun install --frozen-lockfile

# Configurer l'environnement local (fichier ignoré par Git)
cp .env.example .env.local

# Démarrer PostgreSQL avec Docker
docker compose --env-file .env.local up -d postgres

# Appliquer les migrations versionnées
bun run db:local:migrate

# Lancer le serveur de développement
bun run dev:local
```

L'application sera accessible sur [http://localhost:3001](http://localhost:3001)

Le parcours ci-dessus suppose une base neuve. Ne lancez pas
`db:local:migrate` sur une base créée auparavant avec `db:push` et dépourvue de
journal Drizzle : la migration initiale serait rejouée.

Pour conserver un volume Docker existant, gardez d'abord son ancien fichier
d'environnement et sauvegardez la base avec `pg_dump`. Ouvrez ensuite `psql`
dans le conteneur avec l'ancien superutilisateur :

```bash
docker compose --env-file .env.previous exec postgres \
  psql -U <ancien_utilisateur> -d postgres
```

Créez une base migrée distincte sans supprimer l'ancienne :

```sql
CREATE ROLE tss_local LOGIN PASSWORD 'tss_local_password';
CREATE DATABASE tss_explore_forum OWNER tss_local;
```

Quittez `psql`, alignez `.env.local` sur ces valeurs, puis lancez
`bun run db:local:migrate`. `db:local:push` reste disponible uniquement pour
synchroniser temporairement l'ancienne base pendant la récupération des
données. Les variables `POSTGRES_*` de Compose ne créent pas de nouveau rôle ou
de nouvelle base lorsqu'un volume PostgreSQL existe déjà.

---

## 📦 Commandes Disponibles

### Développement

```bash
bun run dev           # Démarrer le serveur de développement (port 3001)
bun run dev:local     # Démarrer avec les variables de .env.local
bun run build         # Build de production
bun run start         # Démarrer le serveur de production
```

### Database (Drizzle)

```bash
bun run db:generate   # Générer les migrations
bun run db:local:generate # Générer avec les variables de .env.local
bun run db:migrate    # Exécuter les migrations
bun run db:local:migrate # Migrer la base définie dans .env.local
bun run db:push       # Push du schéma (dev uniquement)
bun run db:local:push # Push vers la base définie dans .env.local
bun run db:studio     # Ouvrir Drizzle Studio (GUI)
```

### Testing

```bash
bun run test:unit     # Exécuter tous les tests unitaires une fois
bun run test          # Mode interactif Vitest
bun run test:e2e      # Exécuter les tests Playwright
```

### Code Quality (Biome)

```bash
bun run lint          # Linter le code
bun run format        # Formatter le code
bun run check         # Vérification Biome complète
```

### UI Components (Shadcn)

```bash
bunx shadcn@latest add <component>  # Ajouter un composant Shadcn
```

---

## 🔧 Variables d'Environnement

Copiez `.env.example` vers `.env.local`. Les scripts `*:local` chargent ce
fichier explicitement, y compris pour les variables serveur non exposées par
Vite :

```bash
# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tss_explore_forum
DB_USER=tss_local
DB_PASSWORD=tss_local_password
DB_SSL=false

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://127.0.0.1:3001

# Arcjet (Rate Limiting)
ARCJET_KEY=your-arcjet-api-key

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key

# Environment
NODE_ENV=development

# Client
VITE_APP_NAME=Parlons Violence
VITE_APP_URL=http://127.0.0.1:3001
VITE_BETTER_AUTH_URL=http://127.0.0.1:3001

# Logging (optionnel)
LOG_LEVEL=debug
LOG_DIR=./logs
SERVICE_NAME=parlons-violence
```

**Important:** Ne jamais committer `.env.local`; il est ignoré par Git.

---

## 📚 Documentation

### Architecture et Diagrammes

- [System Overview](docs/diagrams/system-overview.md) - Vue d'ensemble complète
- [Alias System ERD](docs/diagrams/alias-system-erd.md) - Modèle de données détaillé
- [Logging Architecture](docs/diagrams/logging-architecture.md) - Système de logs
- [Index des Diagrammes](docs/diagrams/README.md) - Navigation complète

### Guides Techniques

- [Project Context](project-context.md) - Contexte complet du projet (MUST READ)
- [Auth Flows](docs/auth-flows.md) - Flux d'authentification détaillés
- [Architecture Flows](docs/architecture-flux-threads-posts.md) - Flux threads/posts
- [Logger README](src/lib/logger/README.md) - Système de logging Winston
- [Logger Usage](src/lib/logger/USAGE.md) - Guide d'utilisation du logger
- [Alias System](src/features/alias/README.md) - Système d'alias anonymes

### Pour Claude Code

- [CLAUDE.md](CLAUDE.md) - Instructions pour Claude Code AI

### Validation

- [Documentation Validation Report](docs/DOCUMENTATION-VALIDATION-REPORT.md) - Audit de la documentation

---

## 🧪 Testing

### Stratégie de Test (Risk-Based)

1. **Critical Path** (priorité HAUTE)
   - Anonymous user flow (session → first post → secret code)
   - Secret code generation and validation
   - Authentication flows (anonymous, email, secret code login)
   - Content moderation workflows

2. **High-Risk Areas**
   - Authentication and session management
   - Secret code security (uniqueness, format, timing)
   - Database transactions (post creation, user linking)
   - Server functions (all mutations, sensitive reads)

### Exécuter les Tests

```bash
# Tous les tests
bun run test:unit

# Tests spécifiques
bun run test:unit auth        # Tests d'authentification
bun run test:unit secret-code # Tests du code secret

# Mode watch
bun run test

# Coverage
bunx vitest run --coverage
```

**Documentation:** [Project Context - Testing Strategy](project-context.md#-testing-strategy)

---

## 🏛️ Structure du Projet

```
src/
├── routes/                # TanStack file-based routing
│   ├── __root.tsx        # Layout root
│   ├── index.tsx         # Homepage
│   ├── threads/          # Routes threads
│   └── auth/             # Routes authentification
├── features/             # Modules fonctionnels
│   ├── auth/            # Authentification (Better Auth)
│   ├── alias/           # Système d'alias
│   ├── threads/         # Gestion des threads
│   ├── posts/           # Gestion des posts
│   ├── moderation/      # Modération
│   ├── notifications/   # Notifications
│   └── users/           # Gestion utilisateurs
├── components/          # Composants UI partagés
├── db/                  # Database (Drizzle)
│   ├── schemas/        # Schémas des tables
│   ├── migrations/     # Migrations SQL
│   └── index.ts        # Client DB
├── lib/                 # Utilitaires
│   ├── logger/         # Winston logger
│   └── utils/          # Helpers
└── integrations/        # Services externes
    └── tanstack-query/ # Config TanStack Query
```

---

## 🔒 Sécurité

### Garanties d'Anonymat

- **Séparation totale** : `user.id` n'apparaît JAMAIS dans `threads`, `posts`, ou `comments`
- **Alias system** : Toutes les interactions publiques passent par un alias
- **Code secret sécurisé** : Format `XXXX-XXXX-XXXX`, 30^12 combinaisons possibles
- **Rate limiting** : Arcjet protège contre le brute force
- **Redaction automatique** : Passwords, tokens, secrets jamais loggés

### Conformité

- **WCAG 2.1 AA** : Accessibilité pour tous
- **RGPD** : Données minimales, droit à l'oubli
- **OWASP Top 10** : Protection contre les vulnérabilités courantes

**Documentation:** [Security Considerations](project-context.md#-security-considerations)

---

## 🤝 Contributing

Les contributions sont les bienvenues! Veuillez suivre ces étapes:

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Guidelines

- Respecter la structure des features (`src/features/<feature>/`)
- Écrire des tests pour les nouvelles fonctionnalités
- Suivre les conventions de code (Biome)
- Documenter les changements importants

---

## 📖 Ressources Externes

### TanStack Ecosystem

- [TanStack Start](https://tanstack.com/start) - Framework full-stack
- [TanStack Router](https://tanstack.com/router) - Routing
- [TanStack Query](https://tanstack.com/query) - Server state
- [TanStack Form](https://tanstack.com/form) - Forms

### Technologies

- [Better Auth](https://www.better-auth.com) - Authentication
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [Shadcn/UI](https://ui.shadcn.com) - UI Components
- [Arcjet](https://arcjet.com) - Security

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Équipe

Développé avec ❤️ par l'équipe Parlons Violence.

**Contact:** [contact@parlonsviolence.ch](mailto:contact@parlonsviolence.ch)

**Site web:** [parlonsviolence.ch](https://parlonsviolence.ch)

---

## 🙏 Remerciements

- Communauté TanStack pour l'écosystème incroyable
- Better Auth pour l'authentification flexible
- Shadcn pour les composants accessibles
- Tous les contributeurs et testeurs

---

**Note:** Ce projet est en développement actif. Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

## Bêta privée sur invitation

L’accès à la lecture, aux dépôts et aux API nécessite une invitation. Les pages d’aide,
de confidentialité et de règles restent publiques. Sans `BETA_INVITATION_CODES` et
un `BETTER_AUTH_SECRET` d’au moins 32 caractères, l’accès reste fermé.

Générer un code aléatoire distinct par invité, puis les configurer séparés par des
virgules dans `BETA_INVITATION_CODES` (jamais dans Git ou une URL). Retirer un code
et redémarrer les instances révoque aussi ses cookies existants. Les cookies
expirent après 14 jours. Le limiteur d’essais est local à chaque instance.

Les dépôts exigent à la fois `BETA_SUBMISSIONS_OPEN=true` et un créneau réel dans
`BETA_MODERATION_SCHEDULE`. Passer le premier à `false` et redémarrer suspend les
nouveaux dépôts, tout en conservant lecture et modération. Déployer derrière HTTPS.
La première cohorte utilise uniquement des scénarios fictifs.

Pour une validation locale isolée, `node scripts/beta-validation-setup.mjs` utilise
la connexion de `.env.local`, crée un **nouveau schéma vide**, applique les migrations
versionnées et écrit `.env.beta-validation.local` (ignoré, contient des secrets de
test). Il ne modifie pas le schéma public. Démarrer avec :

```sh
bunx dotenv -e .env.beta-validation.local -- bun run dev
```

Avant toute invitation réelle : confirmer les créneaux, la capacité quotidienne,
le contact organisateur, l’hébergement et le délai de conservation des sauvegardes.
Voir `docs/private-beta-interface-audit-2026-09-06.md` pour l’audit initial.
