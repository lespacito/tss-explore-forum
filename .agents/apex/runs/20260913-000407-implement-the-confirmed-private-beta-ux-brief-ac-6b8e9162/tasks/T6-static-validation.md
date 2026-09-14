# T6 — Static validation

Objective: classify formatter/lint, typecheck, tests, build, diff scope and Impeccable detector evidence.

Depends on: T5.

Allowed writes: formatting changes inside task scope and APEX evidence artifacts only. Local build/test outputs are exclusive resources.

Validation contract: record command, exit status and relevant output. Run detector once after UI is finished, never early. Stop until introduced failures are resolved or unavailable/pre-existing failures are precisely classified.
