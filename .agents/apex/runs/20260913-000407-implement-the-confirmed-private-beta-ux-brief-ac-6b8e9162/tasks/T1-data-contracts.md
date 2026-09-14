# T1 — Data contracts

Objective: implement nullable category, recovery-code success invariant, canonical moderation reasons/order and server-normalized erasure.

Non-goals: production migration execution, moderation analytics schema, new status enum, auth-provider replacement.

Verified paths: `src/db/schemas/thread.ts`, `src/data/threads-categories.ts`, `src/features/threads/server/`, `src/features/auth/server/generate-secret-code-logic.ts`, `src/features/moderation/server/thread-moderation.ts`, `src/features/beta/server/erase-account.ts`, `drizzle/`.

Allowed writes are those T1 paths and their direct tests. Exclusive resource: migration metadata. Coordinator owns all writes.

Guidance: use database `NULL` for no classification; keep `AUTRE` explicit. Use conditional recovery-code assignment so concurrent first sends return one stable code. Acquire recovery code before first anonymous insert and never return first-send success without it. Persist canonical reason text without adding analytics columns.

Validation: focused Vitest, typecheck, generated migration inspection. Stop on unsafe migration output or an unrecoverable auth contract mismatch and re-plan.
