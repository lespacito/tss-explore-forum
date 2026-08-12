# Project Structure & Boundaries

## Complete Project Directory Structure

```
tss-explore-forum/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── biome.json
├── components.json
├── compose.yaml
├── compose.prod.yaml
├── .cursorrules
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   └── assets/
├── src/
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── styles.css
│   ├── logo.svg
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── posts/
│   │   │   └── index.tsx
│   │   ├── threads/
│   │   ├── admin/
│   │   │   ├── index.tsx
│   │   │   ├── moderation/
│   │   │   ├── users/
│   │   │   └── reports/
│   │   └── auth/
│   ├── features/
│   │   ├── posts/
│   │   │   ├── server/
│   │   │   │   ├── get-posts.ts
│   │   │   │   ├── create-post.ts
│   │   │   │   └── moderate-post.ts
│   │   │   └── components/
│   │   │       ├── post-card.tsx
│   │   │       ├── post-form.tsx
│   │   │       └── content-warning.tsx
│   │   ├── threads/
│   │   │   ├── server/
│   │   │   │   ├── get-threads.ts
│   │   │   │   └── create-thread.ts
│   │   │   └── components/
│   │   │       └── thread-card.tsx
│   │   ├── users/
│   │   │   ├── server/
│   │   │   │   ├── get-user.ts
│   │   │   │   └── manage-user.ts
│   │   │   └── components/
│   │   │       └── user-profile.tsx
│   │   ├── auth/
│   │   │   ├── server/
│   │   │   │   ├── anonymous-auth.ts
│   │   │   │   └── better-auth.ts
│   │   │   └── components/
│   │   │       ├── login-form.tsx
│   │   │       └── anonymous-banner.tsx
│   │   ├── moderation/
│   │   │   ├── server/
│   │   │   │   ├── moderation-queue.ts
│   │   │   │   ├── moderate-content.ts
│   │   │   │   └── audit-logs.ts
│   │   │   └── components/
│   │   │       ├── moderation-dashboard.tsx
│   │   │       ├── content-review.tsx
│   │   │       └── admin-sidebar.tsx
│   │   └── alias/
│   │       ├── server/
│   │       │   ├── create-alias.ts
│   │       │   └── rotate-alias.ts
│   │       └── components/
│   │           └── alias-display.tsx
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── navigation.tsx
│   │   └── common/
│   │       ├── content-warning-blur.tsx
│   │       ├── loading-spinner.tsx
│   │       └── error-boundary.tsx
│   ├── db/
│   │   ├── schemas/
│   │   │   ├── user.ts
│   │   │   ├── post.ts
│   │   │   ├── thread.ts
│   │   │   ├── alias.ts
│   │   │   ├── moderation.ts
│   │   │   ├── notification.ts
│   │   │   └── ressource.ts
│   │   ├── schemaHelpers.ts
│   │   ├── migrations/
│   │   └── drizzle.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── utils.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-moderation.ts
│   │   └── use-alias.ts
│   ├── actions/
│   │   └── server-actions.ts
│   ├── integrations/
│   │   ├── better-auth/
│   │   └── arcjet/
│   ├── data/
│   │   └── categories.ts
│   └── assets/
│       └── icons/
├── drizzle/
│   └── migrations/
├── scripts/
│   ├── db-setup.ts
│   └── seed-data.ts
├── .tanstack/
├── .vscode/
├── .gemini/
└── _bmad/
    └── (BMAD workflow files)
```

## Architectural Boundaries

**API Boundaries:**

- **Server Functions**: Toutes les mutations et logiques sensibles via TanStack Start server functions (`/features/{entity}/server/`)
- **Route Boundaries**: Séparation claire `/routes/` (UI) vs `/features/` (business logic)
- **Admin Interface**: Routes `/admin/*` avec authentification RBAC stricte
- **Auth Layer**: Better-Auth géré via `/lib/auth.ts` et `/features/auth/server/`

**Component Boundaries:**

- **Feature Components**: Encapsulés dans `/features/{entity}/components/`
- **Shared UI**: Composants Shadcn dans `/components/ui/`
- **Layout Components**: Header/Footer/Navigation dans `/components/layout/`
- **Common Utils**: Composants transversaux dans `/components/common/`

**Service Boundaries:**

- **Database Access**: Centralisé via Drizzle dans `/db/`
- **Authentication**: Better-Auth avec plugin anonymous
- **Moderation**: Service isolé avec audit trails
- **Alias System**: Service anonymat séparé pour confidentialité

**Data Boundaries:**

- **Schema Isolation**: Chaque entité dans `/db/schemas/{entity}.ts`
- **Migration Control**: Drizzle migrations versionnées
- **Relation Boundaries**: Relations via Drizzle avec cascade controls
- **Soft Delete**: `deletedAt` pour audit trail, jamais de hard delete

## Requirements to Structure Mapping

**Feature/Epic Mapping:**

- **FR1-FR3 (Anonymous Auth)**: `/features/auth/` + `/features/alias/`
- **FR4-FR6 (Registered Auth)**: `/features/auth/` + `/features/users/`
- **FR7-FR13 (Content Creation)**: `/features/posts/` + `/features/threads/`
- **FR14-FR19 (Content Discovery)**: `/routes/posts/` + `/components/common/content-warning-blur.tsx`
- **FR20-FR27 (Moderation)**: `/features/moderation/` + `/routes/admin/`

**Cross-Cutting Concerns:**

- **Security**: `/lib/auth.ts` + Better-Auth + Arcjet integration
- **Accessibility**: Shadcn components + semantic HTML patterns
- **SEO**: TanStack Router SSR + metadata generation
- **Anonymity**: `/features/alias/` system pour tous posts/comments
- **Audit Trails**: `/features/moderation/server/audit-logs.ts`

## Integration Points

**Internal Communication:**

- **Router → Server Functions**: TanStack Start pattern avec validation Zod
- **Forms → Mutations**: TanStack Form + Server Functions + toast feedback
- **Auth State**: Better-Auth hooks + context providers
- **Error Handling**: Toast notifications + error boundaries

**External Integrations:**

- **PostgreSQL**: Via Drizzle ORM avec connection pooling
- **Better-Auth**: Configuration centralisée `/lib/auth.ts`
- **Arcjet**: Rate limiting et protection bot
- **Dokploy**: Containerisation via `compose.yaml`

**Data Flow:**

```
User Input → TanStack Form → Zod Validation → Server Function → Drizzle → PostgreSQL
                                  ↓
Database Response → Server Function → Router Invalidation → UI Update + Toast
```

## File Organization Patterns

**Configuration Files:**

- **Root Config**: `package.json`, `tsconfig.json`, `vite.config.ts`, `drizzle.config.ts`
- **Tool Config**: `biome.json`, `components.json`, `.cursorrules`
- **Deploy Config**: `compose.yaml`, `compose.prod.yaml`
- **Database Config**: `/lib/db.ts`, `/db/drizzle.ts`

**Source Organization:**

- **Routes-First**: `/routes/` pour structure URL et pages
- **Features-Based**: `/features/` pour logique métier et composants
- **Shared Libraries**: `/lib/` pour utilitaires transversaux
- **UI Components**: `/components/` organisés par type (ui/layout/common)

**Test Organization:**

- **Co-located Tests**: `*.test.ts` à côté des fichiers source
- **Integration Tests**: Tests E2E avec Playwright
- **Unit Tests**: Vitest pour composants et server functions
- **Test Utilities**: Mocks et helpers partagés

**Asset Organization:**

- **Static Assets**: `/public/assets/` pour images/icons
- **Component Assets**: `/src/assets/` pour assets liés au code
- **Generated Assets**: Build output géré par Vite

## Development Workflow Integration

**Development Server Structure:**

- **Hot Reload**: Vite dev server avec TanStack Router
- **Database Dev**: Drizzle Studio pour exploration schema
- **Type Safety**: TypeScript strict avec path mapping
- **Code Quality**: Biome pour lint/format automatique

**Build Process Structure:**

- **SSR Build**: TanStack Start build avec optimisation bundle
- **Database Build**: Drizzle migrations en CI/CD
- **Asset Optimization**: Vite bundling avec code splitting
- **Type Checking**: tsc validation en build pipeline

**Deployment Structure:**

- **Container Build**: Docker via Dokploy avec multi-stage
- **Database Deploy**: Migrations automatiques via CI/CD
- **Environment Config**: Variables d'environnement par stage
- **Monitoring Setup**: Logs Winston + audit trails modération

---
