# APEX preflight

- Run: `20260913-000407-implement-the-confirmed-private-beta-ux-brief-ac-6b8e9162`
- Revision: `09ded5a5dba42add295970c3ca459e2120bb3008`
- Branch: `codex/update-bun-tanstack`
- Date: 2026-09-13, Europe/Zurich
- Policies: interaction low; review adversarial; artifacts verbose; test authoring risk-based; runtime proof on; branch off; PR off; standard budget; automatic orchestration.

## Contract

Implement the confirmed private-beta UX brief across the critical participant flow. Align beta terminology everywhere necessary for a coherent runtime experience; add the minimum moderation, recovery, category-data and erasure behavior needed by the brief; author or update relevant tests; run adversarial independent review and real browser proof.

Non-goals: deployment, production/provider mutation, Git branch/commit/push/PR actions, service-target social features, email authentication redesign, broad unrelated cleanup, and repair of Impeccable's stale design sidecar.

## Acceptance evidence

- The critical flow matches `docs/ux/private-beta-ux-brief.md`.
- Category choice is optional and unclassified remains distinct from Other.
- Terminology consistently uses scenario, invitation code, recovery code and My scenarios.
- Navigation, statuses, moderation reasons, recovery and data-erasure surfaces follow the confirmed decisions.
- TipTap exposes the confirmed minimal toolbar and error handling is accessible.
- Light/dark, keyboard, narrow viewport and runtime behavior receive current evidence.
- Relevant tests, typecheck, build, detector and diff review are classified honestly.

## Risk and authority

Risk class: high. The UI work touches anonymous auth/recovery, moderation states, persisted category data and destructive erasure. Controls: scoped changes, migration review if required, relevant tests, independent adversarial review and browser proof.

Authorized: local repository source, documentation, tests, migrations and local runtime only. Not authorized: production data, external communication, deployment, destructive cleanup or Git delivery.

## Baseline ownership

Pre-existing modified/untracked paths include `Dockerfile`, `README.md`, staging files, Impeccable artifacts, an older APEX run, `CONTEXT.md`, and `docs/ux/`. Preserve all unrelated work. The new glossary and UX documents are task inputs and may be aligned only when required by implementation evidence.
