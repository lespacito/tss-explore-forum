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

### Project Structure
```
src/
├── routes/           # TanStack file-based routing
├── features/         # Feature modules (auth, threads, posts, profiles, etc.)
│   └── <feature>/
│       ├── components/
│       ├── lib/
│       ├── server/   # Server functions
│       ├── schemas/  # Zod schemas
│       └── __tests__/
├── db/
│   ├── schemas/      # Drizzle table definitions
│   └── migrations/
├── components/       # Shared UI components
└── lib/              # Utilities (logger, etc.)
```

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

Located in `src/features/*/server/`. All sensitive operations must be server functions with:
- Session validation via `getAuthSession()`
- Rate limiting via Arcjet for auth endpoints
- Input validation (Zod schemas)

### Server Function Pattern

```typescript
import { createServerFn } from '@tanstack/react-start';
import { loggingMiddleware } from '@/lib/logger';
import { authMiddleware } from '@/features/auth/lib/auth-middleware';
import { z } from 'zod';

// Schema definition
const createThreadSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10),
  category: z.enum(['support', 'témoignage', 'questions', 'ressources']),
});

// Server function with middleware stack
export const createThreadFn = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .validator(createThreadSchema.parse)
  .handler(async ({ context, data }) => {
    // context.logger includes correlationId automatically
    context.logger.info('Creating thread', {
      title: data.title,
      category: data.category,
    });

    // Verify authentication
    if (!context.isAuthenticated) {
      context.logger.warn('Unauthorized thread creation attempt');
      throw new Error('Unauthorized');
    }

    try {
      // Get user's primary alias
      const alias = await getPrimaryAlias(context.user.id);

      // Create thread via alias (NOT directly via user.id)
      const thread = await createThread(alias.id, data);

      context.logger.info('Thread created', {
        threadId: thread.id,
        userId: context.user.id,
      });

      return { success: true, thread };
    } catch (error) {
      context.logger.error('Failed to create thread', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  });
```

## Common Tasks

### Adding a New Feature

1. **Create feature module** in `src/features/<feature-name>/`
   ```
   src/features/my-feature/
   ├── components/       # React components
   ├── lib/             # Business logic
   ├── server/          # Server functions
   ├── schemas/         # Zod schemas
   └── __tests__/       # Tests
   ```

2. **Add server functions** in `server/`
   - Use middleware stack: `[loggingMiddleware, authMiddleware]`
   - Validate input with Zod schemas
   - Always log important events with `context.logger`

3. **Create components** in `components/`
   - Use TanStack Form for forms
   - Use TanStack Query for data fetching
   - Follow Shadcn/UI patterns

4. **Write tests** in `__tests__/`
   - Unit tests for pure functions
   - Integration tests for server functions
   - Component tests for UI

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
3. **Use the alias system** for all public content (never direct user references)
4. **Add logging** to all server functions with `context.logger`
5. **Write tests** for critical paths (authentication, secret code, anonymity)
6. **Follow the feature structure** (`components/`, `lib/`, `server/`, `schemas/`, `__tests__/`)
7. **Validate input** with Zod schemas on both client and server
8. **Document complex logic** with inline comments
9. **Reference line numbers** when discussing code (e.g., `file.ts:123`)
10. **Check the validation report** at [docs/DOCUMENTATION-VALIDATION-REPORT.md](docs/DOCUMENTATION-VALIDATION-REPORT.md)
