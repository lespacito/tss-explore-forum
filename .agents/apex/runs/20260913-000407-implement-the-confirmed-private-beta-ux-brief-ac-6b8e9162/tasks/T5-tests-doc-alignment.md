# T5 — Tests and documentation

Objective: replace stale/fake assertions with current rendered behavior, add active critical-flow coverage where feasible and align in-scope product/design terminology.

Depends on: T3 and T4 integrated.

Non-goals: unrelated README rewrite, historical artifact deletion, claiming WCAG certification.

Allowed writes: tests that cover changed behavior, `PRODUCT.md`, `DESIGN.md`, additive edits around the existing README staging link, `CONTEXT.md`, `docs/ux/`.

Guidance: preserve user-owned README line and staging work. Active Playwright files must end `.ci.e2e.test.ts`.

Validation: focused and full test commands, Playwright discovery. Stop if a test needs secrets or non-disposable data.
