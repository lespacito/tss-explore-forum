# T8 — Resolve and revalidate

Objective: fix only confirmed review findings and rerun invalidated evidence.

Depends on: T7 dispositions.

Allowed writes: files directly implicated by confirmed findings plus evidence artifacts. Coordinator owns writes.

Stop when no confirmed material finding remains and all affected checks are fresh; re-plan on broadened interfaces or scope.
