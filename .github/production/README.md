# Publication production GHCR — préparation uniquement

Cette branche prépare une PR **vers master**, depuis `origin/master` (`3d41905cfd9ddf65443828405e7bc97d167da613`). Aucun commit, push, PR, merge, dispatch, build réel ou publication n'est autorisé par cette préparation. Ne pas intégrer via dev : chaque push dev peut redéployer staging. Ne pas modifier le publisher préprod.

## Contrat

- `production-ghcr.yml` : uniquement workflow_dispatch, dépôt exact `lespacito/tss-explore-forum`, ref `refs/heads/master`, input `release_sha` de 40 caractères hexadécimaux minuscules.
- Le script est chargé depuis le checkout `trusted` au commit du workflow master (`github.sha`), jamais depuis `source` au SHA applicatif.
- Le SHA doit être le dev actuel. Identité Playwright active `.github/workflows/playwright.yml`, dernier run **push dev sur ce SHA** completed/success. Aucun filtrage sur success, aucun fallback ancien. Run et attempt figés, dev relu après les requêtes CI, garde répétée avant chacun des quatre push.
- Deux images distinctes : `ghcr.io/lespacito/parlons-violence-production-app` (target runner) et `ghcr.io/lespacito/parlons-violence-production-migrate` (target builder).
- Build uniquement GitHub `ubuntu-26.04`, depuis Dockerfile et lockfile source non modifiés. URLs publiques au build `https://parlonsviolence.ch`, OAuth désactivé.
- Résolution unique de `oven/bun:1.4.2-alpine` en manifeste linux/amd64. Même digest passé aux deux builds via le contexte existant `oven/bun:1-alpine`; Bun 1.4.2 contrôlé sans réseau dans base et deux images.
- MIGRATE vérifié sans exécuter les migrations : drizzle-kit présent/exécutable, SHA-256 de drizzle.config.ts, journal et tous les SQL comparés au source exact. Architecture et labels revision/source/title/base vérifiés localement, puis après pull par digest réel.
- Login standard action seulement après les builds. Credentials HTTP manipulés en mémoire Python, aucun token/password dans argv; erreurs HTTP brutes non affichées. Aucun secret prod/staging requis au build.
- Tags `sha-<SHA>` et `sha-<SHA>-run-<RUN_ID>-attempt-<ATTEMPT>`. Tous les tags doivent être absents avant publication, puis le tag cible est recontrôlé avant chaque push. Seul HTTP 404 établit l'absence; 200/401/403/429/5xx et erreurs réseau arrêtent le job.
- Concurrency dédiée sans annulation. Aucun deploy, bootstrap DB, DNS, ressource infrastructure, ouverture publique ou promotion préprod.

## Limites explicites

GHCR ne fournit pas de création atomique « si absent » pour les tags. La concurrency sérialise ce workflow, pas les writers externes. **Restreindre les droits d'écriture sur ces deux packages avant publication** : une course externe entre contrôle et push ne peut pas être éliminée par le client. Les push ne sont pas transactionnels; un échec peut laisser une publication partielle, voire un push réussi non encore vérifié. Aucun effacement ou écrasement automatique pour reprendre; les tags existants font échouer une nouvelle tentative.

Les résumés distinguent tentative et digest réellement relu/vérifié. Cette préparation n'a produit **aucun digest d'image production** et ne valide pas le build sur le runner réel, GHCR, ni la disponibilité/sécurité de Bun. Aucun secret Arcjet/Resend production n'est inventé ou emprunté au staging. Aucun contrôle runtime de production n'est revendiqué.

## Tests

Python publisher : bibliothèque standard. Tests : `unittest` et parseur YAML explicitement épinglé dans `requirements-tests.txt` (PyYAML 6.0.2).

```sh
python3 -m venv "$TMPDIR/pv-production-tests"
"$TMPDIR/pv-production-tests/bin/python" -m pip install -r .github/production/requirements-tests.txt
"$TMPDIR/pv-production-tests/bin/python" -m unittest discover -s .github/production -v
```

TDD exercé localement : garde contexte RED (1 test manquant) → GREEN; gardes CI/collision RED (3 échecs) → GREEN; contrat workflow/manifeste RED (2 échecs) → GREEN; métadonnées résumé RED → GREEN. Tests complémentaires avec adaptateurs HTTP/Docker simulés, sans appel de mutation réseau. Les digests/tokens synthétiques n'existent que dans les fixtures des tests.

`production-ghcr-checks.yml` exécute ces tests sur PR master modifiant scripts ou workflows production, avec `contents: read` uniquement. Le vert Playwright existant ne constitue pas la preuve de ces nouveaux tests. Leur premier run GitHub reste à obtenir après GO push/PR, avant toute fusion autorisée.

Validation locale additionnelle : actionlint 1.7.12 (archive vérifiée via checksums officiels) et syntaxe JS offline via node --check. actionlint ne connaît pas encore le label ubuntu-26.04 : seul ce diagnostic a été exclu, après confirmation du label x64 dans le README officiel actions/runner-images. Aucun autre diagnostic. Cette exclusion n'affirme pas qu'un runner réel a été exécuté.

Pins découverts en lecture seule via releases/latest + git/ref/tags des dépôts officiels : setup-buildx v4.4.1 `f87e5991a6d7451dcb8d9637bfbc97413f497069`; login v4.8.0 `8aa5831fb8d48d8f76594c7ddde61ae58019f550`. Checkout conserve le SHA demandé `3d3c42e5aac5ba805825da76410c181273ba90b1`. Mirror et image BuildKit épinglée repris du mécanisme préprod, sans modifier celui-ci.

## Autorisations distinctes à obtenir

1. Revue puis GO commit/push/PR vers master; pas de push dev.
2. Résultat vert **Production publisher checks**, puis GO séparé de fusion master. Le workflow manuel doit exister dans la branche par défaut master avant d'être utilisable.
3. GO séparé de dispatch/publication sur le SHA explicitement approuvé, encore identique au dev courant et avec sa CI Playwright valide.
4. Déploiement, provisionnement, secrets, migration DB, DNS/proxy et ouverture restent hors périmètre et demandent leurs propres GO.
