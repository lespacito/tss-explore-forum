# Publication GHCR préproduction après CI

Le workflow `preprod-ghcr.yml` publie uniquement les images
`ghcr.io/lespacito/parlons-violence-preprod-app` et
`ghcr.io/lespacito/parlons-violence-preprod-migrate` après la réussite de
`Playwright Tests` pour un **push sur `dev`**. Les CI de pull request, forks,
autres branches, échecs, annulations et anciennes tentatives ne sont pas admis.

## Activation après GO

État vérifié le 9 octobre 2026 : la branche par défaut est **`master`**. Le portage est préparé depuis le merge de la PR #57 sur `dev`
(`4404f9fe987aa2a529b08c4c73610ae4f2e57664`), sur une branche issue de
`master` (`4438ac2a496b0d1a6439b6b12b52d91036639f5a`). Le publisher et les
tests sont repris intégralement, sans modification applicative de production.
La fusion sur `dev` est terminée ; cette PR distincte vers `master` reste draft.

1. Confirmer la provenance : PR #57 déjà fusionnée sur `dev`, SHA ci-dessus.
2. Relire cette PR distincte vers `master` portant **la version complète** de
   `.github/workflows/preprod-ghcr.yml`, avec les tests et leur workflow de
   validation. Remplacer l'ancien publisher à SHA fixe, ne pas créer un second
   publisher ni porter seulement le bloc `on`. Aucune modification applicative
   de production ni changement de branche par défaut n'est nécessaire.
3. **Avant toute activation**, vérifier les droits GHCR des deux packages pour
   le `GITHUB_TOKEN` du dépôt (`packages: write`) et l'autorisation des actions
   Docker épinglées. Les lectures CI exigent `actions: read`, la lecture de `dev`
   `contents: read`. Cette vérification est un prérequis, pas un test de push.
4. Vérifier qu'**aucune CI `dev` n'est en cours ou en attente**, y compris les
   reruns, et convenir d'une fenêtre sans nouveau push ni rerun sur `dev`.
   Une CI `dev` commencée **avant** l'activation sur `master` peut se terminer
   **après** celle-ci et déclencher GHCR si les garde-fous l'admettent. Il n'est
   donc pas nécessaire qu'un nouveau push ait lieu après l'activation.
5. Obtenir une **autorisation d'activation distincte**, après présentation des
   droits GHCR vérifiés et de l'absence de CI `dev` en cours/en attente. Le GO de
   fusion de la PR vers `dev` n'autorise pas l'activation sur `master`.
6. Juste avant la fusion vers `master`, revérifier l'absence de CI `dev` en
   cours/en attente et le respect de la fenêtre convenue. Fusionner uniquement
   après cette autorisation distincte. GitHub charge le workflow `workflow_run`
   depuis la branche par défaut : dès son activation, toute nouvelle complétion
   CI éligible peut publier. Les événements de complétion déjà terminés ne sont
   pas rejoués.
7. Le run autorisé doit présenter le SHA testé, le run CI et sa tentative,
   les tags immuables et les références par digest dans son résumé.

Ne pas lancer de `workflow_dispatch`, de rerun de CI sur `dev`, ni de push de
validation sur `dev` avant le GO : après activation, cela peut publier.
Cette PR n'effectue aucune activation, publication ou fusion.

Référence : [événement workflow_run dans la documentation GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run).

## Audit en lecture seule du 9 octobre 2026

- API branches : `dev` et `master` ont `protected: false` ; liste des rulesets vide.
  Les endpoints détaillés de protection renvoient 403 pour le connecteur ;
  aucune configuration n’a été modifiée.
- Paramètres des deux packages : dépôt source `lespacito/tss-explore-forum`,
  accès Actions pour `tss-explore-forum` avec rôle **Admin**, héritage du dépôt
  activé, visibilité publique. Lectures des pages de paramètres uniquement ;
  aucun test de push ni changement de permission.
- Paramètres Actions : toutes les actions autorisées, permissions par défaut
  en lecture. Le publisher demande explicitement `contents: read`,
  `actions: read`, `packages: write` ; le workflow de tests reste en lecture.
- CI du merge `4404f9f` : [Playwright](https://github.com/lespacito/tss-explore-forum/actions/runs/37967466974)
  et [guards](https://github.com/lespacito/tss-explore-forum/actions/runs/37967466818)
  terminés avec succès, tentative 1. Ce constat ne réserve aucune fenêtre
  d’activation ; revérifier tous les états non terminaux et les reruns au GO.

Points à résoudre avant activation : décider des protections avec autorisation
distincte, valider les CI de cette PR sur son dernier SHA, convenir de la fenêtre
sans push/rerun, puis confirmer l’absence de CI `dev` en cours/en attente juste
avant la fusion. Les droits de configuration GHCR sont vérifiés ; une vraie
publication d’intégration reste réservée à un GO ultérieur.

## Protections de branches recommandées avant activation

État vérifié via l'API GitHub le 9 octobre 2026 : **`dev` et `master` ne sont
actuellement pas protégées** (`protected: false`). Cette PR ne change pas leur
configuration. Les contrôles CI du publisher ne remplacent pas la protection
des sources ni celle du workflow de confiance chargé depuis `master`.

Avant activation, mettre en place des protections de branches ou rulesets pour
`dev` et `master` : PR obligatoire, revue approuvée, checks `test` (Playwright) et
`guards` requis quand applicables (le workflow `guards` a un filtre de chemins :
prévoir un statut toujours présent avant de le rendre obligatoire pour toutes les PR), interdiction des force pushes et suppressions, et restrictions
des pushes directs et des contournements. Imposer une **revue obligatoire des
workflows** `.github/workflows/**`, par exemple avec CODEOWNERS et l'approbation
des propriétaires requise. Étendre cette revue aux tests du publisher afin que
ses contrôles ne puissent pas être affaiblis sans validation. Ces protections
sont recommandées ; leur configuration doit être traitée séparément avant
l'autorisation d'activation.

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
ruby tests/preprod-workflow-test.rb
python3 -m unittest discover -s tests/ci -v
actionlint -shellcheck= -pyflakes= .github/workflows/preprod-ghcr.yml .github/workflows/preprod-ghcr-checks.yml
git diff --check
```

La suite Ruby vérifie le contrat du workflow, les collisions GHCR, le payload
migrations hors réseau et les digests. Elle exige Bun (version CI : 1.4.2).
Les 11 tests Python exécutent le code exact du garde-fou embarqué avec une API
simulée. Le workflow `Preproduction publisher guard tests` les exécute sur les PR et
changements concernés de `dev`/`master`, sans accès packages en écriture.
Le job `guards` installe Bun puis exécute Ruby et Python dans deux étapes
obligatoires : l'échec de l'une ou l'autre suite fait échouer le check.
Aucun build ni push GHCR réel n'est requis pour ces vérifications.
Dokploy, PostgreSQL et la production sont hors périmètre.
