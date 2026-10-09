# Publication GHCR préproduction après CI

Le workflow `preprod-ghcr.yml` publie uniquement les images
`ghcr.io/lespacito/parlons-violence-preprod-app` et
`ghcr.io/lespacito/parlons-violence-preprod-migrate` après la réussite de
`Playwright Tests` pour un **push sur `dev`**. Les CI de pull request, forks,
autres branches, échecs, annulations et anciennes tentatives ne sont pas admis.

## Activation après GO

État vérifié le 9 octobre 2026 : la branche par défaut est **`master`**. Elle
contient une ancienne version manuelle du publisher, avec un SHA source fixe.
Fusionner cette PR dans `dev` ne suffit donc pas à activer l'automatisation.

1. Relire et fusionner la draft PR vers `dev` uniquement après GO.
2. Préparer une PR distincte vers `master` portant **la version complète** de
   `.github/workflows/preprod-ghcr.yml`, avec les tests et leur workflow de
   validation. Remplacer l'ancien publisher à SHA fixe, ne pas créer un second
   publisher ni porter seulement le bloc `on`. Aucune modification applicative
   de production ni changement de branche par défaut n'est nécessaire.
3. Après un GO d'activation, fusionner cette PR vers `master`. GitHub charge le
   workflow `workflow_run` depuis la branche par défaut. Les anciens événements
   ne sont pas rejoués : le prochain push sur `dev`, suivi de sa CI réussie,
   devient éligible à la publication automatique.
4. Vérifier les droits GHCR des deux packages pour le `GITHUB_TOKEN` du dépôt
   (`packages: write`), ainsi que l'autorisation des actions Docker épinglées.
   Les lectures CI exigent `actions: read`, la lecture de `dev` `contents: read`.
   Le prochain run doit présenter le SHA testé, le run CI et sa tentative,
   les tags immuables et les références par digest dans son résumé.

Ne pas lancer de `workflow_dispatch`, de rerun de CI sur `dev`, ni de push de
validation sur `dev` avant le GO : après activation, cela peut publier.
Cette PR n'effectue aucune activation, publication ou fusion.

Référence : [événement workflow_run dans la documentation GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run).

## SHA, fraîcheur et doubles déclenchements

Le SHA applicatif est `workflow_run.head_sha`, jamais le `github.sha` de la
branche par défaut. Le garde-fou, embarqué dans le workflow de confiance avant
le checkout applicatif, vérifie via l'API GitHub :

- dépôt source, workflow actif `Playwright Tests`, ID et chemin du workflow ;
- événement `push`, branche `dev`, SHA exact, dernier run et dernière tentative
  terminés avec `success` ;
- correspondance avec le run et la tentative de l'événement `workflow_run` ;
- égalité du SHA avec la tête actuelle de `dev`.

Le checkout et le label OCI revision utilisent ce SHA vérifié. Les vérifications
sont répétées après le build et immédiatement avant **chaque** push de tag.
Toute erreur API ou donnée inattendue arrête la publication. Le déclenchement
manuel sur `dev` est conservé, soumis aux mêmes contrôles CI et de fraîcheur.

Le groupe de concurrence global `parlons-violence-preprod-ghcr` sérialise
publications manuelles, automatiques et reruns, avec `cancel-in-progress: false`.
GitHub ne garantit pas l'ordre des runs en attente : les contrôles de fraîcheur
refusent les anciens SHA. Les tags `sha-<SHA>` et
`sha-<SHA>-run-<run>-attempt-<attempt>` ne sont jamais volontairement écrasés.
Un second déclenchement pour un SHA déjà publié échoue au contrôle de collision,
avant les pushes. Même une publication partielle interdit une republication
automatique de ce SHA ; inspecter le résumé et le registre avant toute reprise.
Les réponses registre autres que 404 bloquent, y compris les erreurs d'accès.

La base Bun est résolue une fois par digest amd64, les deux targets sont bâties
avant publication, le contenu migrations est vérifié hors réseau sans exécution
de migration, et les digests des tags SHA et run sont comparés après publication.

GitHub et GHCR n'offrent pas de transaction atomique entre la tête de `dev` et
les quatre pushes. Un push déjà commencé n'est pas annulé si `dev` avance pendant
son transfert. Le contrôle précédant le push suivant bloque la suite. Les tags
restent immuables, aucun alias mutable (`latest`, `dev`) n'est publié, et aucune
image n'est déployée. Les autres writers GHCR doivent utiliser le même verrou
ou être désactivés : le contrôle d'absence n'est pas une écriture conditionnelle
atomique du registre.

## Validation sans effet externe

```sh
python3 -m unittest discover -s tests/ci -v
actionlint -shellcheck= -pyflakes= .github/workflows/preprod-ghcr.yml .github/workflows/preprod-ghcr-checks.yml
git diff --check
```

Les tests exécutent le code exact du garde-fou embarqué avec une API simulée.
Le workflow `Preproduction publisher guard tests` les exécute sur les PR et
changements concernés de `dev`/`master`, sans accès packages en écriture.
Aucun build ni push GHCR réel n'est requis pour ces vérifications.
Dokploy, PostgreSQL et la production sont hors périmètre.
