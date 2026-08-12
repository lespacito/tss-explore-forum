# Core Architectural Decisions

## Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Base de données : PostgreSQL (existant)
- ORM : Drizzle (type-safe, migrations, intégration TanStack)
- Validation : Zod (client/serveur unifié, TypeScript strict)
- Authentification : Better-Auth avec plugin anonymous
- Code secret : userId anonyme direct (pas de mapping additionnel)

**Important Decisions (Shape Architecture):**

- Formulaires : TanStack Form (cohérence stack, validation Zod)
- Styling : approche minimaliste + Shadcn ponctuel
- Tests : Vitest + Playwright (écosystème cohérent)
- Server Functions : toute logique sensible côté serveur

## Data Architecture

- **PostgreSQL** : base existante, chiffrement natif, relations complexes (posts/réponses/modération), audit trails
- **Drizzle ORM** : migrations type-safe, performance queries modération, intégration naturelle server functions
- **Zod validation** : schémas unifiés client/serveur, type-safety, validation stricte anti-leak données personnelles

## Authentication & Security

- **Better-Auth + plugin anonymous** :
  - FR1 : `authClient.signIn.anonymous()` → session immédiate
  - FR2-FR3 : `userId` anonyme = "code secret" affiché utilisateur
  - FR4-FR6 : `authClient.signUp.email()` + liaison via `onLinkAccount`
  - Callback `onLinkAccount` : migration posts anonymes → compte enregistré
- **Sessions** : JWT Better-Auth standard, mobile-friendly
- **Server Functions** : toute logique sensible (auth, modération, écritures)

## API & Communication Patterns

- **Server Functions TanStack** : mutations, authentification, modération
- **SSR-first** : chargement initial côté serveur pour SEO et performance
- **Validation stricte** : Zod côté serveur, sanitisation, protection contre injection

## Frontend Architecture

- **TanStack Form** : validation Zod intégrée, gestion d'état formulaires
- **Styling minimal** : CSS/Tailwind de base + Shadcn ponctuel (`pnpx shadcn@latest add button`)
- **Composants accessibles** : WCAG 2.1 AA, navigation clavier, lecteurs d'écran
- **Mobile-first** : responsive, performance, UX calme et empathique

## Infrastructure & Deployment

- **Hébergement** : VPS Hetzner (contrôle complet, coût optimisé, données EU)
- **Déploiement** : Dokploy (interface moderne, Docker automatisé, GitHub integration)
- **Pipeline** : GitHub → Dokploy → containerisation automatique + déploiement zero-downtime
- **Base de données** : PostgreSQL containerisée via Dokploy, backups automatisés
- **Monitoring** : Dokploy dashboard + logs application, audit trails modération
- **SSL/Proxy** : Traefik automatique via Dokploy, certificats Let's Encrypt

## Interface d'administration

- **Dashboard modérateur** : interface séparée avec sidebar navigation
- **Sidebar structure** :
  - Queue de modération (posts en attente)
  - Contenus signalés
  - Utilisateurs (gestion compte/ban)
  - Statistiques/métriques
  - Paramètres/configuration
- **Authentification admin** : Better-Auth avec rôles (user/moderator/admin)
- **Permissions strictes** : RBAC sur server functions, séparation UI user/admin

## Decision Impact Analysis

**Implementation Sequence:**

1. Setup TanStack Start + Better-Auth + PostgreSQL + Drizzle
2. Schema base (users, posts, moderation_queue, reports)
3. Authentification anonyme + enregistrée
4. Interface publique (création/lecture posts)
5. Dashboard admin avec sidebar
6. Modération workflows

- Déploiement VPS Hetzner + Dokploy + CI/CD
