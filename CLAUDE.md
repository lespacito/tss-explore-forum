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

## Environment Variables

Required (see `.env.example` if present):
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth signing secret (min 32 chars)
- `BETTER_AUTH_URL` - App URL
- `ARCJET_KEY` - Rate limiting API key
- Email service credentials for verification/password reset
