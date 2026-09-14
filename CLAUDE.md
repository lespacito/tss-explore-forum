# CLAUDE.md

Guidance for agents working in this repository.

## Read First

Use these sources in this order:

1. `CONTEXT.md` for canonical product language and distinctions.
2. `PRODUCT.md` for the current private-beta scope, constraints, and open decisions.
3. `docs/ux/private-beta-ux-brief.md` for the confirmed interface brief.
4. Existing code and tests for implemented behavior.

When documentation conflicts, do not silently combine it. Prefer the more recent,
explicitly canonical source and report the inconsistency.

## Current Product Boundary

Parlons Violence currently runs as a controlled private beta, not as a public
support forum or finished service.

- Participants are invited adults in French-speaking Switzerland.
- Beta participants use fictitious scenarios only.
- Access requires an invitation enforced on the server.
- Submissions can remain closed unless a moderation schedule is configured.
- Human moderation happens before public visibility.
- The beta is not an emergency, counselling, legal, medical, or 24/7 service.
- An alias reduces public exposure but is not a guarantee of absolute anonymity.
- Do not present planned hosting, backups, automation, cohort results, or
  accessibility certification as completed without current evidence.

Use the participant-facing terms from `CONTEXT.md`, notably: scénario fictif,
code d'invitation, code de récupération, À examiner, Publié, Non publié,
Mes scénarios, and Copie sur appareil.

## Commands

```bash
# Development
bun run dev              # Local server on 127.0.0.1:3001
bun run dev:local        # Load .env.local
bun run build
bun run start

# Quality and tests
bun run typecheck
bun run test:unit
bun run test:e2e
bun run lint
bun run format
bun run check

# Database
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio

# UI components
bunx shadcn@latest add <component>
```

The package manager and runtime version are declared in `package.json`. Keep CI
and documentation aligned with that declaration.

## Stack

- TanStack Start, Router, Query, and Form
- React 19 and TypeScript
- PostgreSQL with Drizzle ORM
- Better Auth with credentials-based recovery-code login
- Arcjet for selected security controls
- Tiptap with explicit HTML validation and sanitization
- Radix/Shadcn and Tailwind CSS 4
- Vitest and Playwright
- Biome

## Structure and Boundaries

```text
src/
├── routes/                 # TanStack file-based routes
├── features/<feature>/
│   ├── components/
│   ├── lib/                # Pure feature logic
│   ├── schemas/
│   ├── server/actions/     # Validation, auth, orchestration
│   ├── server/db/          # Reusable Drizzle data access
│   └── __tests__/
├── db/schemas/             # Drizzle table definitions
├── components/             # Shared UI
└── lib/                    # Shared utilities and security helpers
```

Follow the existing feature pattern before creating a new abstraction. Keep
database access in the feature DB layer when that layer exists; keep session,
authorization, rate limiting, and orchestration in server actions. Validate
untrusted input with Zod at the server boundary.

Generated migrations currently exist in both `drizzle/` and
`src/db/migrations/`. Inspect the active Drizzle configuration before changing
or applying migrations; do not infer the authoritative directory from old docs.

## Privacy and Security Invariants

- Public content links to an alias, never directly to `user.id`.
- Never log passwords, tokens, invitation codes, recovery codes, session
  identifiers, personal narratives, or other sensitive participant data.
- Keep invitation and recovery codes conceptually and technically distinct.
- Keep secrets out of URLs.
- Preserve server-side invitation checks for protected pages and APIs.
- Preserve `noindex, nofollow` while the product remains a private beta.
- Treat sensitive-content masking as presentation, not encryption.
- Do not introduce real-person fixtures or identifying narratives.

The recovery code is generated for eligible anonymous sessions and can be used
to recover access. Verify the exact generation and reuse behavior in
`src/features/auth/server/generate-secret-code-logic.ts` and its tests rather
than relying on historical prose.

## Content Editing

HTML passes through multiple controls:

- editor configuration: `src/components/tiptap/TiptapEditor.tsx`
- client validation: `src/lib/security/validate-html-content.ts`
- sanitization: `src/lib/security/sanitize-html.ts`
- safe display: `src/components/tiptap/SafeHtmlDisplay.tsx`

The sanitizer accepts more legacy structure than the private-beta toolbar
currently exposes. Do not infer available toolbar controls from the sanitizer's
allowlist.

Local draft storage is disabled by default. It becomes active only after the
participant consents to “Copie sur appareil”. Current keys are scoped by user
and scenario fields in `src/routes/threads/new/index.tsx`. Preserve the shared-
device warning and clear drafts after successful submission or erasure.

## Testing Expectations

Run checks in proportion to the change. Important paths include:

- invitation enforcement and expiry;
- anonymous session and recovery-code behavior;
- scenario submission and moderation status;
- nullable category versus explicit “Autre situation”;
- rejection reasons and moderation ordering;
- account erasure and local-draft clearing;
- keyboard navigation, focus, readable status, and sensitive-content reveal;
- sanitization and safe rendering.

Tests and historical reports are evidence only for the environment and revision
where they ran. Do not convert automated accessibility checks into a WCAG
certification claim.

## Environment

Relevant variables include:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETA_INVITATION_CODES`
- `BETA_MODERATION_SCHEDULE`
- `BETA_SUBMISSIONS_OPEN`
- Arcjet and transactional-email credentials where those integrations are used

Never expose values from environment files or logs. Before claiming a deployment
works, verify the actual environment rather than only the local configuration.

## Working Rules

1. Preserve unrelated user changes in a dirty worktree.
2. Inspect existing routes, schemas, actions, queries, and tests before editing.
3. Keep changes focused and add regression coverage for behavior changes.
4. Use recoverable deletion and review exact targets first.
5. Keep participant-facing French clear, factual, respectful, and non-judgmental.
6. Separate implemented behavior, planned behavior, and externally verified state.
7. Cite file paths and line numbers when reporting findings.
