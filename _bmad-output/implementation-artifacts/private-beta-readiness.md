---
document_type: private-beta-readiness
project: tss-explore-forum
updated: 2026-09-05
status: in-progress
---

# Private beta readiness

## Goal

Validate that 5-10 invited adults can submit content anonymously and that one moderator can review it safely during a two-week closed beta.

## Included

- Invitation-only access
- Anonymous session and secret-code recovery
- Guided thread creation and rich-text editing
- Pre-publication moderation
- Moderator approve, reject-with-reason, sensitive-content, and audit actions
- Published-thread browsing without social metrics
- Account erasure or content anonymization
- Privacy, terms, and emergency guidance

## Deferred

- Replies and comments
- Mandatory email registration
- Third-party analytics
- Minors
- Public launch
- Community reporting and social metrics

## Repository findings

- Anonymous access, secret-code recovery, registration, sign-in, guided creation, rich-text editing, and published-thread listing have implementation evidence.
- Account deletion exists but still contains a deferred audit-trail implementation and requires end-to-end verification.
- Submission and personal status tracking are marked in progress.
- The schema contains moderation status, moderator, sensitive-content, rejection-reason, and moderation-log foundations.
- A moderator-only dashboard now provides a queue, approve, reject-with-reason,
  sensitive-content toggling, and atomic audit logging. Runtime and E2E
  verification remain pending.
- Legal and emergency stories have no implementation artifact beyond backlog planning.
- Historical test totals are inconsistent and are not accepted as current evidence.

## Entry gates

- [x] TypeScript check passes
- [x] Unit test suite passes in a clean environment
- [x] Production build succeeds
- [ ] Migrations apply to an empty disposable database
- [ ] Anonymous submit-to-moderation flow passes end to end
- [ ] Moderator approve, reject, and mark-sensitive actions pass end to end
- [ ] Account erasure and anonymization are verified
- [ ] Backup and restore are exercised
- [ ] Privacy, terms, and emergency pages are accessible
- [ ] Raw IP addresses are not exposed in the moderator interface
- [ ] No critical anonymity or security finding remains

## Success criteria

- At least 80% of testers publish without assistance.
- Every submitted thread can be moderated correctly.
- No critical anonymity or security incident occurs.
- The moderation workload remains sustainable for one person.

## Validation run — 2026-08-29

- PASS: `bun run typecheck`.
- FAIL, pre-existing: `bun run check` reports repository-wide formatting and lint debt.
- UNAVAILABLE: unit tests and production build stop before loading their configuration because esbuild cannot read a protected Windows parent directory.
- PENDING: database, critical E2E, backup/restore, and account-erasure validation.
- PASS: moderator dashboard changed files pass Biome and TypeScript.
- PASS: the Impeccable interface detector reports no mechanical design findings.
- PASS: 8 targeted moderation authorization and validation tests run with
  Bun's test runner.

## Validation run — 2026-09-03

- PASS: `bun run typecheck`.
- PASS: `bun run test:unit` — 42 test files and 684 tests passed.
- PASS: `bun run build` — production output generated successfully.
- FAIL, pre-existing: `bun run check` reports 69 errors and 238 warnings.
- WARN: the build reports generated-CSS optimizer warnings and third-party
  module directive warnings; neither prevents production output generation.
- WARN: account-deletion component tests pass but emit Radix accessibility
  warnings about dialog title/description discovery; this remains part of the
  account-erasure hardening work.
- PENDING: database migrations, critical Playwright flows, backup/restore,
  and end-to-end account-erasure verification.

## Validation run — 2026-09-05

- PASS: `bun run check` — no Biome errors; 237 non-blocking warnings remain.
- PASS: `bun run typecheck`.
- PASS: `bun run test:unit` — 42 test files and 685 tests passed.
- PASS: `bun run build` — production output generated successfully.
- WARN: the build still reports generated-CSS optimizer warnings and
  third-party module directive warnings; neither prevents output generation.
