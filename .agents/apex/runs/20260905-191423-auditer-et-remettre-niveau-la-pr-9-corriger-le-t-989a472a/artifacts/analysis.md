# Analyse APEX

## Contrat

- Objectif: remettre la PR #9 à niveau sur `dev`, corriger le typecheck, séparer les changements locaux en deux livraisons et ouvrir deux PR vers `dev` sans fusion.
- Politiques: interaction faible (`-a`), revue contradictoire (`-x`), artifacts détaillés (`-s`), preuve runtime (`-v`).
- Risque: élevé, car le périmètre inclut une migration PostgreSQL et la mise à jour d'une branche GitHub existante.
- Actions externes autorisées: push des branches et ouverture/mise à jour des PR; aucune fusion, promotion ou action de production.

## Faits vérifiés

- Baseline: `codex/fix-biome` à `ab9566d`, identique à `origin/dev`, sans upstream et avec 56 fichiers suivis modifiés plus trois groupes non suivis.
- PR #9: brouillon `feature/story-3.2-category-filter -> dev`, commit `1cb77bd`, huit fichiers, 340 ajouts et 20 suppressions.
- GitHub marque la PR #9 `CONFLICTING/DIRTY`; son unique conflit textuel avec `dev` est `src/routes/threads/index.tsx`.
- Le seul chevauchement de chemin entre la PR #9 et les changements locaux est `src/features/threads/server/__tests__/get-all-published-threads.test.ts`.
- Les checks distants de la PR #9 sont verts mais datent du 20 août 2026 et ne prouvent pas la compatibilité avec le `dev` actuel.
- Baseline locale Biome au niveau erreur: réussite sur 250 fichiers.
- Baseline locale TypeScript: échec unique dans `src/routes/threads/$threadSlug.tsx:257`; l'annotation explicite du paramètre de `map` exige `threadTitle` avant que l'objet soit enrichi.
- La revue DB indépendante précédente a confirmé que la procédure de récupération des anciens volumes est non destructive.

## Hypothèses bornées

- La résolution de PR #9 conservera à la fois le filtre de catégorie et les ajustements de typage/formatage arrivés sur `dev`.
- Les deux PR locales seront empilées depuis `dev` seulement si leur séparation impose une dépendance; sinon elles resteront indépendantes.
- Les artifacts APEX restent non livrés, sauf décision explicite contraire au moment du scope Git.

## Critères de preuve

- PR #9: conflit résolu, diff revu, tests ciblés, Biome, typecheck, build et filtre vérifié dans le navigateur avec la DB locale.
- Lot Biome/autosave: zéro erreur Biome, typecheck, tests autosave et tests affectés, build, revue contradictoire.
- Lot DB locale: génération sans drift inattendu, migration fraîche, tables présentes, lecture/écriture locale, route `/threads` fonctionnelle, revue contradictoire.
- Livraison: branches distantes et PR vers `dev` relues via GitHub; aucune fusion.

## Déclencheurs de replanification

- Conflit additionnel après actualisation de `dev`.
- Échec inattendu révélant un couplage PR #9 / migration / autosave.
- Fichier local impossible à attribuer sans ambiguïté à l'une des deux PR.
- Modification distante de PR #9 pendant l'exécution.
