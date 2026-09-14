# T3 — Continuous creation

Objective: a single accessible body-first `/threads/new` form with minimal TipTap, optional category, alias preview, consent-gated device copy and reliable errors.

Depends on: T1 nullable API and T2 civic shell.

Non-goals: wizard, alias editing, rich formatting expansion, automatic categorization.

Allowed writes: `src/routes/threads/new/`, `src/components/tiptap/`, direct tests and generated route tree when build tooling updates it. Coordinator owns all writes.

Guidance: retain old category URL as redirect compatibility until routing proof passes. Focus multi-error summary; preserve content on server failure; no duplicate validation toasts.

Validation: rendered unit/a11y tests, typecheck, browser send. Stop if route generation or TipTap keyboard behavior regresses.
