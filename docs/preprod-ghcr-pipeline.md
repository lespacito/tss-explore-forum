# Publication des images préprod

La procédure actuelle est décrite dans [Publication GHCR après CI](preprod-ghcr-ci.md).
Le publisher complet est porté depuis la PR #57, merge sur `dev`
`4404f9fe987aa2a529b08c4c73610ae4f2e57664`, dans une PR draft distincte vers
`master`. Ce portage ne modifie pas l’application de production.

L’ancienne procédure manuelle sur `master` au SHA fixe
`cd99f328c0e5ab9287651fb38d4f36d91414328f` est remplacée par ce portage.
Après activation autorisée, seule une CI push `dev` réussie pour sa tête actuelle
est admise ; le dispatch manuel doit également viser `dev` et satisfaire les
mêmes contrôles. Ne pas lancer de dispatch, push ou rerun de validation avant GO.

La fusion vers `master` active `workflow_run` : obtenir un GO distinct après
revue des CI, protections et permissions GHCR, dans une fenêtre sans CI `dev`
en cours/en attente ni nouveaux push/rerun. Une CI commencée avant activation
peut publier si elle se termine ensuite.

Les images restent `parlons-violence-preprod-app` et
`parlons-violence-preprod-migrate`, avec tags immuables et références par digest.
Les collisions bloquent ; une publication partielle est possible et exige
une inspection avant reprise. Aucun déploiement ni accès Dokploy/PostgreSQL
ou production ne fait partie de cette préparation.
