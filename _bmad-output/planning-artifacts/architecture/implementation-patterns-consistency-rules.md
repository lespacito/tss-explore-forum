# Implementation Patterns & Consistency Rules

## Pattern Categories Defined

**Critical Conflict Points Identified:**
Analyse du code existant révèle des patterns établis qu'il faut respecter pour la cohérence.

## Naming Patterns

**Database Naming Conventions:**

- Tables : `snake_case` pluriel (`users`, `posts`, `threads`, `comments`, `reports`)
- Colonnes : `snake_case` (`user_id`, `thread_id`, `alias_id`, `created_at`, `updated_at`)
- Relations : `{entity}Id` en camelCase dans le code TypeScript (`threadId`, `aliasId`)
- Enums PostgreSQL : `{entity}_{field}` format (`user_role`, `report_status`, `report_target_type`)
- Index : `{table}_{columns}_idx` format (`posts_thread_created_idx`, `threads_category_created_idx`)

**API Naming Conventions:**

- Routes : `/posts/`, `/threads/` (pluriel, trailing slash)
- Server Functions : `{action}{Entity}Fn` format (`getPostsFn`, `createPostFn`, `getThreadsFn`)
- Features structure : `/features/{entity}/server/{action}-{entity}.ts`

**Code Naming Conventions:**

- Composants : `PascalCase` (`PostCard`, `DialogTrigger`)
- Fichiers : `kebab-case` pour composants (`post-card.tsx`), `kebab-case` pour server functions
- Variables/props : `camelCase` (`threadCategory`, `isSensitive`, `contentWarnings`)
- Types : `PascalCase` (`UserRole`, `ReportStatus`, `ReportType`)

## Structure Patterns

**Project Organization:**

- Features par domaine : `/features/{posts|threads|users}/`
- Server functions : `/features/{entity}/server/{action}-{entity}.ts`
- Components : `/features/{entity}/components/{component-name}.tsx`
- Schemas : `/db/schemas/{entity}.ts` (un fichier par entité)
- UI Components : `/components/ui/` (shadcn structure)

**Database Schema Patterns:**

- Helpers centralisés : `createdAt()`, `updatedAt()`, `id()` dans `schemaHelpers`
- Relations Drizzle : exports séparés `{entity}Relations`
- Soft delete : `deletedAt: timestamp("deleted_at")` optionnel
- Primary keys : `text("id").primaryKey()` (pour Better-Auth compatibility)
- Foreign keys : `uuid()` avec `.references()` et `onDelete: "cascade"`

## Format Patterns

**API Response Formats:**

- Server Functions : retour direct de données (pas de wrapper `{data, error}`)
- Gestion erreur : try/catch avec `toast.error()` côté client
- Loading : utilisation TanStack Router loader pattern
- Validation : Zod schemas (pattern établi mais à documenter)

**Data Formats:**

- IDs : UUIDs via `uuid()` pour entités, `text()` pour Better-Auth users
- Dates : `timestamp()` Drizzle, format ISO automatique
- Arrays : `.array()` pour `contentWarnings`
- Booleans : `boolean().default(false).notNull()` pattern

## Communication Patterns

**State Management Patterns:**

- TanStack Form : `useForm()` avec `defaultValues`, `onSubmit` async
- Router state : `router.invalidate()` pour refresh après mutations
- Toast notifications : `toast.success()`, `toast.error()` avec Sonner
- Dialog state : `useState()` local pour modals (`isOpen`, `setIsOpen`)

**Authentication Patterns:**

- Alias system : tous les posts/comments liés via `aliasId` (anonymity layer)
- User roles : enum `["ADMIN", "MODERATOR", "USER", "BANNED"]`
- Session management : Better-Auth tables (`session`, `account`, `verification`)

## Process Patterns

**Content Creation Patterns:**

- Validation : côté client (required, form validation) + serveur (Zod schemas)
- Moderation : `isSensitive` flag + `contentWarnings` array
- Soft delete : `deletedAt` timestamp pour audit trail
- Polymorphic relations : `targetId` + `targetType` enum pour reports

**Error Handling Patterns:**

- Server errors : `console.error(error)` + user-friendly `toast.error()`
- Form validation : TanStack Form field-level validation
- Data loading : TanStack Router loader avec Promise.all pour parallel loading

## Enforcement Guidelines

**All AI Agents MUST:**

- Respecter la structure `/features/{entity}/` pour nouvelles fonctionnalités
- Utiliser Drizzle schema helpers (`createdAt`, `updatedAt`, `id`)
- Implémenter soft delete avec `deletedAt` pour contenu modérable
- Utiliser alias system pour tous les posts/comments (anonymity)
- Suivre pattern `{action}{Entity}Fn` pour server functions
- Utiliser TanStack Form pour tous les formulaires
- Implémenter toast notifications pour feedback utilisateur

**Pattern Examples:**

**Good Examples:**

```typescript
// Schema pattern
export const entityColumns = {
  id: id(),
  // ... other fields
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: timestamp("deleted_at"),
};

// Server function pattern
export async function createEntityFn({ data }: { data: EntityInput }) {
  // validation + creation
}

// Form pattern
const form = useForm({
  defaultValues: {
    /* */
  },
  onSubmit: async ({ value }) => {
    try {
      await createEntityFn({ data: value });
      toast.success("Success message");
      router.invalidate();
    } catch (error) {
      toast.error("Error message");
    }
  },
});
```

**Anti-Patterns:**

- Tables en camelCase ou PascalCase
- Server functions sans suffix `Fn`
- Hard delete d'entités modérables
- Posts/comments sans alias (exposition directe user)
- Forms sans toast feedback
- Mutations sans router.invalidate()
