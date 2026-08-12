# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Parlons Violence is an anonymous-first support forum for sensitive topics (violence, abuse, distress). Built with TanStack Start (RC), the codebase emphasizes trust, anonymity, and minimal friction to participation.

**Key principle:** Anonymous users can post without registration. They receive a secret code (`XXXX-XXXX-XXXX` format) after their first publication for session recovery.

## Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests (Vitest)
pnpm test <pattern>   # Run specific tests (e.g., pnpm test auth)
pnpm test --watch     # Watch mode

# Database (Drizzle)
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes directly
pnpm db:studio        # Open Drizzle Studio GUI

# Code Quality (Biome)
pnpm lint             # Lint only
pnpm format           # Auto-format
pnpm check            # Full check (lint + format)

# Shadcn components
pnpx shadcn@latest add <component>
```

## Architecture

### Stack
- **Frontend:** TanStack Start RC, React 19, TanStack Router/Query/Form
- **Backend:** TanStack Server Functions, Nitro SSR
- **Auth:** Better Auth with `better-auth-credentials-plugin` for secret code login
- **Database:** PostgreSQL with Drizzle ORM
- **Security:** Arcjet (rate limiting, bot protection)
- **UI:** Shadcn/Radix + Tailwind CSS 4

### Project Structure (Updated Feb 2026)
```
src/
├── routes/           # TanStack file-based routing
├── features/         # Feature modules (auth, threads, posts, profiles, etc.)
│   └── <feature>/
│       ├── components/      # React components
│       ├── lib/             # Pure business logic (no DB, no server fns)
│       ├── server/
│       │   ├── actions/     # Server functions (orchestration, validation, auth)
│       │   └── db/          # DB queries (pure, reusable, testable)
│       ├── schemas/         # Zod validation schemas
│       └── __tests__/       # Tests
├── db/
│   ├── schemas/      # Drizzle table definitions
│   └── migrations/
├── components/       # Shared UI components
└── lib/              # Utilities (logger, etc.)
```

**Architecture Principles (Established Feb 2026):**
- **Separation of Concerns:** Server functions (actions/) handle orchestration, DB queries (db/) handle data access
- **Reusability:** DB queries are pure functions, reusable across features
- **Testability:** Each layer can be tested independently
- **Zero Duplication:** Common query patterns extracted into shared functions

### Key Feature: Anonymous Authentication

Two user types:
1. **Anonymous users:** `isAnonymous: true`, authenticate via secret code
2. **Registered users:** `isAnonymous: false`, email/password login

Secret code flow:
- Generated after first publication (not on session creation)
- Format: `XXXX-XXXX-XXXX` (excludes ambiguous chars: 0, O, I, 1, l)
- Login via `better-auth-credentials-plugin` configured in `src/features/auth/lib/auth.ts`
- Anonymous users can later link an email account while keeping their secret code

### Database Entities
- `user` - Auth data, `isAnonymous`, `secretCode`
- `alias` - Anonymous posting identities (one user → many aliases)
- `threads` - Top-level discussions with categories
- `post` - Replies within threads
- `moderation`, `notification`, `ressource` - Supporting entities

### Rich Text Editing & HTML Sanitization

**Editor:** Tiptap (ProseMirror-based) with strict security configuration

**Allowed HTML Tags (Whitelist):**
- **Text formatting:** `<strong>` (bold), `<em>` (italic)
- **Structure:** `<p>` (paragraph), `<h2>`, `<h3>` (headings), `<br>` (line break)
- **Lists:** `<ul>`, `<ol>`, `<li>`
- **Quotes:** `<blockquote>`

**Forbidden Elements (Blacklist):**
- ❌ `<script>`, `<iframe>`, `<style>`, `<link>` (XSS vectors)
- ❌ `<img>`, `<video>`, `<audio>` (media not supported in MVP)
- ❌ `<code>`, `<pre>` (code injection risk)
- ❌ `<a>` (links disabled by default, can enable with URL validation)
- ❌ `<h1>` (reserved for page titles)
- ❌ All event handlers (`onclick`, `onerror`, etc.)
- ❌ All inline styles and classes

**Security Layers (Defense in Depth):**
1. **Client-side:** Tiptap configured without dangerous extensions
2. **Client validation:** `validateHtmlContent()` before form submit
3. **Server sanitization:** `sanitizeHtml()` before database insert (CRITICAL)
4. **Display sanitization:** `SafeHtmlDisplay` component re-sanitizes before render

**Files:**
- Editor: `src/components/tiptap/TiptapEditor.tsx`
- Toolbar: `src/components/tiptap/Toolbar.tsx`
- Sanitization: `src/lib/security/sanitize-html.ts`
- Display: `src/components/tiptap/SafeHtmlDisplay.tsx`
- Client validation: `src/lib/security/validate-html-content.ts`

**Auto-Save:**
- Draft auto-save to localStorage every 1.5s
- Hook: `useAutoSaveDraft(key, value, delay)`
- Keys: `draft-thread-${category}-title`, `draft-thread-${category}-body`
- Cleared after successful submission

**Accessibility:**
- WCAG 2.1 AA compliant
- Full keyboard navigation
- Screen reader support (ARIA labels, roles)
- Keyboard shortcuts documented: `docs/tiptap-keyboard-shortcuts.md`
- Compliance report: `docs/tiptap-accessibility-compliance.md`

## Testing

Tests live alongside code in `__tests__/` directories. Framework: Vitest with jsdom.

```typescript
// Example test location: src/features/auth/__tests__/generate-secret-code.test.ts
import { describe, it, expect } from "vitest";
```

Critical paths requiring test coverage:
1. Anonymous session → first post → secret code generation
2. Secret code validation and login
3. Anonymous account → email linking
4. Server function authorization

## Routing

TanStack Router with file-based routes in `src/routes/`. Key routes:
- `/auth/login` - Login page (email or secret code)
- `/threads/new` - Create new thread
- `/threads/confirmation` - Shows secret code after first post

## Server Functions

**IMPORTANT:** Server functions are now organized in two layers:
- **`server/actions/`** - Server functions (orchestration, validation, auth, security)
- **`server/db/`** - Pure database queries (SELECT, INSERT, UPDATE, DELETE)

All sensitive operations must be server functions with:
- Session validation via `getAuthSession()`
- Rate limiting via Arcjet for auth endpoints
- Input validation (Zod schemas)
- Delegation to DB layer for all database operations

### Server Function Pattern (Updated Feb 2026)

**File: `src/features/threads/server/actions/create-thread.ts`** (Server function - orchestration)
```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getAuthSession } from '@/features/auth/server/get-auth-session';
import { getPrimaryAlias } from '@/features/alias/lib/get-primary-alias';
import { createThreadRecord } from '../db/thread-queries'; // ← DB layer

const createThreadSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10),
  category: z.enum(['VIOLENCE', 'ABUS', 'TEMOIN', 'DETRESSE', 'AUTRE']),
});

export const createThreadFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createThreadSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Security & Authentication
    const session = await getAuthSession();
    if (!session?.user) throw new Error('Unauthorized');

    // 2. Get user's primary alias
    const primaryAlias = await getPrimaryAlias(session.user.id);
    if (!primaryAlias) throw new Error('No alias found');

    // 3. Delegate to DB layer for data access
    const thread = await createThreadRecord({
      aliasId: primaryAlias.id,
      title: data.title.trim(),
      body: data.body.trim(),
      category: data.category,
      slug: generateSlug(data.title),
      status: 'pending',
    });

    return { success: true, thread };
  });
```

**File: `src/features/threads/server/db/thread-queries.ts`** (DB layer - pure queries)
```typescript
import { db } from '@/db';
import { threads } from '@/db/schemas/thread';

/**
 * Create a new thread record
 * Pure database insert - caller must validate and sanitize data
 */
export async function createThreadRecord(data: {
  aliasId: string;
  title: string;
  body: string;
  category: string;
  slug: string;
  status: 'pending' | 'published' | 'rejected';
}) {
  const [newThread] = await db.insert(threads).values(data).returning();
  return newThread;
}

/**
 * Get all published threads with alias and user data
 * Includes common JOIN pattern for thread queries
 */
export async function getAllPublishedThreads() {
  return await db
    .select({
      id: threads.id,
      title: threads.title,
      body: threads.body,
      slug: threads.slug,
      category: threads.category,
      createdAt: threads.createdAt,
      aliasName: alias.alias,
      displayUsername: user.displayUsername,
    })
    .from(threads)
    .leftJoin(alias, eq(threads.aliasId, alias.id))
    .leftJoin(user, eq(alias.userId, user.id))
    .where(eq(threads.status, 'published'))
    .orderBy(desc(threads.createdAt));
}
```

## Common Tasks

### Adding a New Feature (Updated Feb 2026)

1. **Create feature module** in `src/features/<feature-name>/`
   ```
   src/features/my-feature/
   ├── components/       # React components
   ├── lib/             # Pure business logic (no DB, no server fns)
   ├── server/
   │   ├── actions/     # Server functions (orchestration)
   │   └── db/          # DB queries (pure functions)
   ├── schemas/         # Zod validation schemas
   └── __tests__/       # Tests
   ```

2. **Create DB queries** in `server/db/my-feature-queries.ts`
   - **Pure functions only** - no business logic, no auth checks
   - Use descriptive names: `getUserById()`, `createPostRecord()`, `getAllPublishedThreads()`
   - Add JSDoc comments with @param, @returns, and @example
   - Return null for not found (not undefined)
   - Example:
   ```typescript
   /**
    * Get user by ID
    * Pure database query - no business logic
    */
   export async function getUserById(id: string) {
     const [user] = await db.select().from(user).where(eq(user.id, id)).limit(1);
     return user ?? null;
   }
   ```

3. **Create server functions** in `server/actions/`
   - **Orchestration only** - validate, authorize, delegate to DB layer
   - Use middleware for logging and auth if needed
   - Validate input with Zod schemas
   - Always delegate to DB layer for database operations
   - Example:
   ```typescript
   export const getThreadBySlugFn = createServerFn({ method: 'GET' })
     .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
     .handler(async ({ data }) => {
       return await getThreadBySlug(data.slug); // ← Delegate to DB layer
     });
   ```

4. **Create components** in `components/`
   - Use TanStack Form for forms
   - Use TanStack Query for data fetching
   - Follow Shadcn/UI patterns

5. **Write tests** in `__tests__/`
   - Unit tests for pure functions (lib/ and server/db/)
   - Integration tests for server functions (server/actions/)
   - Component tests for UI

### Architecture Maintenance & Best Practices (Feb 2026)

**CRITICAL:** Always maintain separation between server/actions/ and server/db/

#### ✅ DO's

**In `server/db/` (Database Layer):**
- ✅ Write pure database queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ Use descriptive function names (`getUserById`, not `getUser`)
- ✅ Return `null` for not found (not `undefined`)
- ✅ Add comprehensive JSDoc with @param, @returns, @example
- ✅ Extract common SELECT patterns into reusable objects
- ✅ Keep functions focused (one query = one function)
- ✅ Example:
  ```typescript
  // Good - Pure DB query
  export async function getThreadsByAliasId(aliasId: string) {
    return await db.select().from(threads).where(eq(threads.aliasId, aliasId));
  }
  ```

**In `server/actions/` (Server Functions):**
- ✅ Handle orchestration: validate → authorize → delegate
- ✅ Use Zod schemas for input validation
- ✅ Check authentication/authorization
- ✅ Delegate ALL database operations to server/db/ layer
- ✅ Handle business logic coordination
- ✅ Example:
  ```typescript
  // Good - Orchestration only
  export const createPostFn = createServerFn({ method: 'POST' })
    .inputValidator(createPostSchema.parse)
    .handler(async ({ data }) => {
      const session = await getAuthSession(); // Auth
      if (!session) throw new Error('Unauthorized');

      const alias = await getPrimaryAlias(session.user.id); // Business logic
      return await createPostRecord({ ...data, aliasId: alias.id }); // Delegate to DB
    });
  ```

#### ❌ DON'Ts

**In `server/db/` (Database Layer):**
- ❌ NO authentication checks (`getAuthSession()`)
- ❌ NO business logic (validation, authorization)
- ❌ NO session handling
- ❌ NO Arcjet rate limiting
- ❌ Example of what NOT to do:
  ```typescript
  // Bad - Business logic in DB layer
  export async function getUserThreads(userId: string) {
    const session = await getAuthSession(); // ❌ NO AUTH IN DB LAYER
    if (!session) throw new Error('Unauthorized'); // ❌ NO AUTH
    return await db.select()... // Only this line should be here
  }
  ```

**In `server/actions/` (Server Functions):**
- ❌ NO direct database queries (use server/db/ instead)
- ❌ NO raw SQL (use Drizzle ORM via DB layer)
- ❌ Example of what NOT to do:
  ```typescript
  // Bad - Direct DB query in action
  export const getThreadFn = createServerFn({ method: 'GET' })
    .handler(async () => {
      return await db.select().from(threads)... // ❌ Use DB layer instead
    });
  ```

#### Common Patterns

**Pattern 1: Common SELECT with JOINs**
```typescript
// server/db/thread-queries.ts
const threadWithAliasSelect = {
  id: threads.id,
  title: threads.title,
  aliasName: alias.alias,
  displayUsername: user.displayUsername,
} as const;

export async function getAllPublishedThreads() {
  return await db
    .select(threadWithAliasSelect) // Reuse pattern
    .from(threads)
    .leftJoin(alias, eq(threads.aliasId, alias.id))
    .leftJoin(user, eq(alias.userId, user.id))
    .where(eq(threads.status, 'published'));
}
```

**Pattern 2: Check then Create**
```typescript
// server/db/alias-queries.ts
export async function findAliasByName(name: string) {
  const [alias] = await db.select().from(alias).where(eq(alias.alias, name)).limit(1);
  return alias ?? null;
}

// server/actions/create-alias.ts
const existing = await findAliasByName(name);
if (existing) throw new Error('Alias taken');
const newAlias = await createAliasRecord({ ... });
```

**Pattern 3: Parallel Queries**
```typescript
// server/actions/create-thread.ts
const [existingThreads, currentUser] = await Promise.all([
  getThreadsByAliasId(alias.id),     // DB layer
  getUserById(session.user.id),       // DB layer
]);
```

#### Refactoring Checklist

When moving code to new architecture:
- [ ] Extract all DB queries to `server/db/`
- [ ] Update server functions to use DB layer
- [ ] Remove direct `db.` calls from server functions
- [ ] Add JSDoc to all DB functions
- [ ] Update imports in routes
- [ ] Run tests to verify no breakage
- [ ] Check for code duplication opportunities

### Debugging Secret Code Flow

1. **Check generation:**
   - File: `src/features/auth/lib/generate-secret-code.ts`
   - Verify format: `XXXX-XXXX-XXXX`
   - Check uniqueness constraint

2. **Check database:**
   ```bash
   pnpm db:studio
   # Navigate to user table
   # Verify secretCode and secretCodeGeneratedAt fields
   ```

3. **Review logs:**
   - Look for correlation ID in server logs
   - Check Winston logs in `logs/` directory (production)
   - Filter by userId or secretCode context

### Working with Alias System

**IMPORTANT:** Never link `user.id` directly to public content (threads, posts, comments).

```typescript
// ❌ WRONG - Direct user reference
const thread = await db.insert(threads).values({
  title: data.title,
  userId: user.id, // ❌ This breaks anonymity!
});

// ✅ CORRECT - Via alias
const alias = await getPrimaryAlias(user.id);
const thread = await db.insert(threads).values({
  title: data.title,
  aliasId: alias.id, // ✅ Preserves anonymity
});
```

### Using the Logger

```typescript
import { logger } from '@/lib/logger';
import { getContextLogger, withMeta } from '@/lib/logger';

// In server functions (with middleware)
export const myFn = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware])
  .handler(async ({ context }) => {
    context.logger.info('Event', { data: 'value' });
  });

// In utility functions (without context)
export function utilityFunction() {
  const log = getContextLogger(); // Gets context from AsyncLocalStorage
  log.info('Processing data');
}

// Create child logger with metadata
const jobLogger = withMeta({
  jobId: 'batch-001',
  jobType: 'email'
});
jobLogger.info('Job started');
```

### Database Migrations

```bash
# 1. Modify schema in src/db/schemas/
# 2. Generate migration
pnpm db:generate

# 3. Review generated SQL in src/db/migrations/
# 4. Apply migration
pnpm db:migrate

# For dev only (skips migrations):
pnpm db:push
```

## Environment Variables

Required (see `.env.example` if present):
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth signing secret (min 32 chars)
- `BETTER_AUTH_URL` - App URL
- `ARCJET_KEY` - Rate limiting API key
- `RESEND_API_KEY` - Email service for verification/password reset
- `NODE_ENV` - Environment (development, production, test)
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

## Documentation

### Essential Reading

- **[project-context.md](project-context.md)** - Complete project context (MUST READ)
  - Mission statement and core principles
  - Critical user flows
  - Testing strategy
  - Known risks and constraints

### Architecture and Diagrams

- **[docs/diagrams/system-overview.md](docs/diagrams/system-overview.md)** - System architecture
- **[docs/diagrams/alias-system-erd.md](docs/diagrams/alias-system-erd.md)** - Database model
- **[docs/diagrams/logging-architecture.md](docs/diagrams/logging-architecture.md)** - Logging system
- **[docs/diagrams/README.md](docs/diagrams/README.md)** - Diagram index

### Feature Documentation

- **[docs/auth-flows.md](docs/auth-flows.md)** - Authentication flows (10+ diagrams)
- **[docs/architecture-flux-threads-posts.md](docs/architecture-flux-threads-posts.md)** - Thread/post flows
- **[src/lib/logger/README.md](src/lib/logger/README.md)** - Winston logger system
- **[src/features/alias/README.md](src/features/alias/README.md)** - Alias system

### Quick Reference

| Need | Document | Section |
|------|----------|---------|
| Understand project | [project-context.md](project-context.md) | Mission Statement |
| See architecture | [system-overview.md](docs/diagrams/system-overview.md) | Architecture Globale |
| Understand anonymity | [alias-system-erd.md](docs/diagrams/alias-system-erd.md) | Focus: Anonymat Garanti |
| Write server functions | This file | Server Function Pattern |
| Implement logging | [logger/README.md](src/lib/logger/README.md) | Usage |
| Debug secret code | This file | Common Tasks |

## Key Patterns

### Anonymous-First Design

Every public interaction MUST go through the alias system:
- ✅ `threads.aliasId` → `alias.id` → `alias.userId` → `user.id`
- ❌ `threads.userId` (this field should NOT exist)

### Middleware Stack Order

```typescript
.middleware([
  loggingMiddleware,  // 1. Generate correlationId + context
  authMiddleware,     // 2. Verify session + load user
  // ... other middlewares
])
```

### Error Handling

```typescript
try {
  const result = await operation();
  context.logger.info('Success', { resultId: result.id });
  return { success: true, data: result };
} catch (error) {
  context.logger.error('Operation failed', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  throw error; // Let TanStack handle error response
}
```

### Data Redaction

Never log sensitive data. The logger auto-redacts these fields:
- `password`, `pass`
- `token`, `authorization`, `bearer`
- `secret`, `secretCode`
- `apiKey`, `api_key`
- `creditcard`, `ssn`

## Tips for Claude Code

1. **Always read `project-context.md` first** when starting a new task
2. **Check existing patterns** before creating new ones
3. **Follow the architecture** - NEVER put DB queries in server/actions/, NEVER put auth in server/db/
4. **Use the alias system** for all public content (never direct user references)
5. **Delegate to DB layer** - All server functions must use server/db/ for database operations
6. **Write tests** for critical paths (authentication, secret code, anonymity)
7. **Follow the feature structure** (`components/`, `lib/`, `server/actions/`, `server/db/`, `schemas/`, `__tests__/`)
8. **Validate input** with Zod schemas on both client and server
9. **Document complex logic** with inline comments and JSDoc
10. **Reference line numbers** when discussing code (e.g., `file.ts:123`)
11. **Check existing DB queries** before creating duplicates (see server/db/ files)
12. **Check the validation report** at [docs/DOCUMENTATION-VALIDATION-REPORT.md](docs/DOCUMENTATION-VALIDATION-REPORT.md)

## Current Architecture Status (Feb 2026)

**Fully Refactored Features** (server/actions/ + server/db/):
- ✅ **Alias** - 6 DB queries in `alias-queries.ts` (153 lines)
- ✅ **Users** - 6 DB queries in `user-queries.ts` (170 lines)
- ✅ **Threads** - 6 DB queries in `thread-queries.ts` (183 lines)
- ✅ **Posts** - 6 DB queries in `post-queries.ts` (186 lines)

**Total:** 24 reusable DB functions, 692 lines, zero duplication

**Features Not Yet Refactored:**
- ⏳ **Auth** - Complex security requirements, deferred
- ⏳ **Profiles** - Deferred (low priority)
- ⏳ **Moderation** - To be refactored when updated

**When adding/modifying features:**
1. Check if feature is refactored (see list above)
2. If refactored: Use `server/actions/` and `server/db/` pattern
3. If not refactored: Consider refactoring before making changes
4. Never mix old and new patterns in the same feature
