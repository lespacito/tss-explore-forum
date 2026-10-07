# Publication manuelle des images préprod

La branche par défaut vérifiée sur GitHub est `master`. La PR cible donc `master`
pour rendre `workflow_dispatch` disponible. Le job accepte uniquement cette
branche et le dépôt `lespacito/tss-explore-forum`. Il ne se lance ni sur push ni
sur PR. Aucun déclenchement du workflow n’est effectué par cette préparation.

Après merge autorisé, lancer manuellement **Build and publish preproduction
images** sur `master`. Il checkout toujours
`cd99f328c0e5ab9287651fb38d4f36d91414328f`, jamais le HEAD de master, et vérifie
`git rev-parse HEAD`. Pour changer le code construit, une modification revue du
SHA du workflow est nécessaire.

Le Dockerfile source, `package.json`, `bun.lock` et le journal Drizzle ont été
inspectés : targets `runner` et `builder`, installation gelée du lockfile,
`drizzle-kit` dans les devDependencies, neuf fichiers SQL référencés au journal.
Le contexte Docker conserve ces fichiers et exclut les fichiers `.env*`.
Le Dockerfile source n’est pas modifié. Un contexte Buildx verrouille son image
`oven/bun:1-alpine` au digest linux/amd64 résolu une seule fois pour les deux builds.
La base peut évoluer entre deux runs ; le digest figure dans les labels et le
Job Summary.

Images :

- `ghcr.io/lespacito/parlons-violence-preprod-app` : target `runner`.
- `ghcr.io/lespacito/parlons-violence-preprod-migrate` : target `builder`.

Tags pour chaque image : `sha-<SHA complet>` et
`sha-<SHA complet>-run-<run ID>-attempt-<attempt>`. Aucun tag flottant.
Les deux builds sont chargés localement avant publication. Le contrôle du builder
lit la configuration, le journal, chaque SQL référencé et le paquet/binaire
Drizzle, dans un conteneur sans réseau et en lecture seule. Il n’importe pas la
configuration et n’exécute ni le CLI Drizzle ni une migration.

Le seul credential est `GITHUB_TOKEN`, avec `contents: read` et `packages: write`.
Les quatre build args client sont publics. Aucun credential métier, accès serveur,
action de déploiement ou déclenchement d’un autre workflow n’est ajouté.
Le runner ne démarre pas l’application.

## Collisions et publication partielle

Les tags des deux images sont contrôlés avant le build puis juste avant les push.
Seul HTTP 404 autorise la publication. Un tag existant, une erreur réseau ou une
erreur d’autorisation arrête le job. Les publications de ce workflow sont
sérialisées. GHCR n’offre pas ici de création conditionnelle atomique : réserver
ces packages à ce workflow pour éviter une course avec un autre outil éditeur.

Un rerun après succès est refusé, même si son tag secondaire serait nouveau.
Après échec partiel, inspecter les images/digests et le run ; ne pas supprimer un
tag ou le remplacer automatiquement. La publication des deux images n’est pas
transactionnelle. Le Summary confirme chaque tag après lecture de son digest au registre. En cas d’échec entre deux push, les logs et GHCR restent à examiner.

Si un package existe déjà, accorder au dépôt l’accès Actions dans ses paramètres
GHCR. La visibilité des packages et les droits de lecture des consommateurs sont
à configurer séparément. Préférer les références `image@sha256:…` du Summary pour
la consommation ultérieure. Aucune publication ni installation distante n’est
réalisée par cette PR.

## Validation de la PR

`ruby tests/preprod-workflow-test.rb` vérifie le contrat manuel, les permissions,
le SHA fixe, l’ordre contrôle/push, la syntaxe Bash et les cas GHCR 404/200,
401/403/429/500 et panne réseau simulés. Le même programme Bun de contrôle de
contenu est testé sur des fichiers temporaires : succès, SQL manquant et binaire
non exécutable. `actionlint` valide les expressions et la structure Actions.

Le Dockerfile et les neuf SQL sont également contrôlés depuis un export Git du
SHA source. Aucun build/push réel n’a été exécuté localement : daemon Docker
indisponible. Le premier run manuel reste la validation d’intégration BuildKit/GHCR.
La publication ne devient disponible qu’après merge explicitement autorisé sur
la branche par défaut ; cette PR n’est pas mergée ni déclenchée.
