# APEX analysis

## Verified baseline

- Revision `09ded5a5dba42add295970c3ca459e2120bb3008`, branch `codex/update-bun-tanstack`.
- Pre-existing tracked changes are limited to `Dockerfile` and one staging-guide link in `README.md`; neither belongs to this implementation scope.
- `bun run typecheck` passed before source edits.
- Focused Vitest baseline passed for confirmation, creation taxonomy and recovery-code display. The full-suite baseline began successfully but exceeded the 30-second capture window, so it is not yet completion evidence.
- `.env.local`, `.env.test`, dependencies and Playwright configuration are present. Active browser tests match only `src/**/*.ci.e2e.test.ts` and use port 3001.

## Verified implementation shape

- The root mounts both sidebar and navbar; the confirmed IA requires one compact top bar.
- `/beta` is raw server HTML styled by `public/beta-entry.css`, not a router page.
- The landing is already the civic Persuade surface; participant flows remain generic Shadcn Operate surfaces.
- Creation is split into a mandatory category page and `/threads/new/$category`; category is required by UI, API, type and database.
- TipTap exposes bold, italic, H2, H3, blockquote, bullets and numbered lists.
- Confirmation uses a sound ephemeral receipt provider, but old terminology and nested rounded cards.
- Profile filters a newest-first list and labels pending/rejected content as publications.
- Public feed correctly queries only published records and already gates sensitive-content reading.
- Recovery exposes email login and old `code secret` copy.
- Erasure is transactional and clears local drafts after success; server confirmation is case-sensitive even though the client uppercases it.
- Moderation is newest-first and uses a free-text rejection reason.

## Data decisions

- Use nullable `threads.category` plus a new migration. `null` is the only representation that preserves the confirmed distinction between no classification and explicit `AUTRE`; a sentinel would pollute the taxonomy.
- Keep internal moderation enum values `pending/published/rejected`; map only participant-facing labels.
- Add a required rejection reason code and optional detail, then persist a canonical combined explanation in the existing text column for this cohort. No analytics column migration is required.
- Make recovery-code acquisition concurrency-safe with a conditional update, and acquire the code before the first anonymous thread insert. A successful first send must never omit a usable recovery code.
- Normalize erasure confirmation on the server with trim + uppercase.

## Surface modes and styling strategy

- Operate: beta entry, creation, confirmation, My scenarios, recovery, settings and moderation.
- Read: public feed/detail, rules, privacy and help.
- Persuade: landing, distilled to the confirmed orientation without replacing its civic visual world.
- Scope civic tokens and straight-edge surface classes to beta/task surfaces instead of globally zeroing every Shadcn primitive; unrelated auth/admin dialogs must not be restyled accidentally.
- Keep system theme behavior. Do not repair stale `.impeccable/design.json` as a side effect.

## Refined proof map

- Static/types: nullable category contracts, reason-code contracts, recovery invariant, route loaders and accessibility attributes.
- Unit/integration: optional category vs Other, minimal toolbar, status grouping/copy, moderation order/reasons, recovery copy/invariant, normalized erasure.
- Build: Biome check, TypeScript, full Vitest, Vite production build.
- Runtime: invitation/orientation, creation, confirmation, recovery, My scenarios, sensitive reveal, erasure and moderation where fixtures permit.
- Visual/accessibility: batched desktop + 390px captures, light/dark, keyboard focus, 200% zoom checks, and one final Impeccable detector pass.

## Bounded unknowns

- Live database fixtures may limit end-to-end moderation and erasure proof; if so, unit/integration evidence will be distinguished from browser evidence.
- Deployment, backup expiry and restoration cannot be proven locally and remain explicitly outside this implementation.
- Existing generated route-tree behavior after removing the category gate must be validated by typecheck/build rather than assumed.
