# Runtime proof matrix

Proof gate: PASS

| ID | Acceptance criterion | Starting state | Action | Expected result | Evidence | Status |
|---|---|---|---|---|---|---|
| PR9-1 | Lister uniquement les discussions publiées | DB locale avec 2 publiées et 1 pending | Ouvrir `/threads` | 2 publiées visibles, pending absent | Session navigateur locale + requêtes DB; validation ledger | PASS |
| PR9-2 | Filtrer VIOLENCE | Même fixtures | Sélectionner/ouvrir `?category=VIOLENCE` | Seulement Violence | Session navigateur sur port 3002; validation ledger | PASS |
| PR9-3 | Filtrer ABUS | Même fixtures | Sélectionner/ouvrir `?category=ABUS` | Seulement Abus | Session navigateur sur port 3002; validation ledger | PASS |
| PR9-4 | Rejeter une catégorie URL invalide | URL avec catégorie inconnue | Charger la route | Paramètre normalisé/retiré, aucun crash | Session navigateur sur port 3002; validation ledger | PASS |
| DB-1 | Migrer une base vierge | Base jetable vide | `drizzle-kit migrate` | 2 migrations, 13 tables | Sortie PostgreSQL/Drizzle; validation ledger | PASS |
| DB-2 | Lire/écrire localement | Schéma migré | Insérer user/alias/thread, relire, rollback | `write_read=1`, `after_rollback=0` | Sortie `psql`; validation ledger | PASS |
| DB-3 | Préserver une base existante | Schéma `0000` avec user/alias/thread/report/notification | Appliquer `0001_flaky_cerise.sql` | Données préservées, enums renommés, thread backfillé `published`, timestamp UTC stable | Sortie `psql`; validation ledger | PASS |
| DB-4 | Ne laisser aucune fixture | Base jetable après vérification | `dropdb tss_explore_forum_apex_verify`, read-back catalogue | Base absente | Sortie `psql`: `ABSENT`; validation ledger | PASS |
| GH-1 | Garder feature → dev → prod | Trois branches distantes | Lire les PR par API GitHub | #9, #14, #15 ciblent `dev`, OPEN, MERGEABLE, non fusionnées | Read-back GitHub; validation ledger | PASS |
| GH-2 | Vérifier le CI réel | PR distantes ouvertes | Attendre les checks GitHub | Playwright et CodeRabbit verts | GitHub checks; validation ledger | PASS |

Boundaries proven:

- Local browser: application accessible sur `http://127.0.0.1:3001/threads?openDialog=false`; état relu après les validations.
- Local PostgreSQL: opérations réelles sur PostgreSQL 17, pas un mock.
- Provider: branches, bases, états de mergeabilité et checks relus depuis GitHub.
- Not proven: exécution Docker Compose sur cet hôte, car le binaire Docker est absent.
