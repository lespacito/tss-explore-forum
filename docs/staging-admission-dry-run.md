# Staging : garde d'admission en dry-run

## Statut et périmètre

Ce garde est un **contrôle CI en lecture seule**, pas un déploiement et pas une
activation du futur pipeline. Il ne corrige pas encore la course entre le push
et l'auto-déploiement Dokploy existant. Il ne dispose d'aucun mode `--apply`.

Il ne lit aucune URL de hook, n'appelle ni Dokploy ni Docker, ne publie aucune
image, n'exécute aucune migration et ne modifie ni DNS, ni secrets, ni protections
bêta. Il ne dépend pas de l'accès aux bases ou aux conteneurs applicatifs.

## Contrat

Pour le dépôt `lespacito/tss-explore-forum`, et uniquement pour la branche `dev` :

1. Le SHA candidat est exactement 40 caractères hexadécimaux minuscules ; aucune
   normalisation implicite, aucun nom de branche ou SHA abrégé n'est accepté.
2. Le candidat est le HEAD distant de `dev`.
3. Le workflow actif est `Playwright Tests`, au chemin
   `.github/workflows/playwright.yml`.
4. Le dernier run **push** de ce workflow pour ce SHA et cette branche appartient
   au dépôt attendu, est terminé et a conclu `success`. Un résultat de PR, un
   fork, un run en cours, ignoré, annulé, en échec ou sans preuve est refusé.
5. Le dernier run et son détail sont relus : changer de run ou de tentative
   pendant le contrôle est refusé. Aucun repli sur un ancien succès.
6. Le HEAD `dev` est relu après les requêtes de CI : s'il a avancé, le candidat
   est refusé.

Le reçu JSON contient le dépôt, l'environnement logique `staging`, le SHA, le
run CI, sa tentative, `mode: dry-run` et `deployment_performed: false`.

**Ce reçu n'est pas une autorisation de déployer.** C'est une observation à un
instant donné, non signée, sans verrou atomique sur GitHub/Dokploy. Il ne prouve
ni la disponibilité d'une sauvegarde, ni le digest de l'image, ni le résultat
d'un futur déploiement. Un futur consommateur devra relire les preuves juste
avant l'action, sérialiser les déploiements et contrôler son propre code de
confiance ; ne jamais utiliser un reçu ancien ou fourni par une PR comme feu vert.

## Tests locaux entièrement hors ligne

Python 3.10 ou supérieur, bibliothèque standard uniquement :

```bash
python3 -m unittest discover -s .github/staging -v
```

Les réponses de test sont des fixtures explicites, jamais des résultats de
production. Elles couvrent les refus, les changements de SHA/run/tentative,
les échecs d'API, le CLI et l'adaptateur GitHub GET.

## Dry-run sur les métadonnées GitHub réelles

Prérequis : GitHub CLI `gh` déjà authentifié avec des droits de lecture du dépôt
et de ses runs Actions. Aucun token ne doit être copié dans ce dépôt.

```bash
gh auth status
candidate_sha=$(gh api --hostname github.com --method GET \
  repos/lespacito/tss-explore-forum/git/ref/heads/dev --jq .object.sha)
python3 .github/staging/admission.py --sha "$candidate_sha"
```

Le CLI utilise exclusivement des appels `gh api --method GET` vers github.com,
avec un timeout par lecture. Les diagnostics bruts du sous-processus ne sont
pas affichés. Code de sortie : `0` si les preuves CI satisfont le contrat,
`1` si refus ou API indisponible, `2` si arguments CLI invalides. Un refus
n'est pas une demande de relancer automatiquement une CI ou un déploiement.

## Workflow ajouté

`.github/workflows/staging-admission-dry-run.yml` exécute **uniquement les tests
hors ligne** sur les PR vers `dev` et les push sur `dev` affectant ce périmètre.
Son jeton a seulement `contents: read`, sans credentials persistés au checkout,
sans secret de déploiement et sans événement privilégié `workflow_run` ou
`pull_request_target`. Il n'évalue pas la branche de PR comme une release.

Les workflows Playwright et de publication d'images existants sont inchangés.
Aucun hook staging n'est activé, désactivé ou appelé par ce changement.

## Activation ultérieure : GO séparé obligatoire

Avant toute activation réelle :

- vérifier une sauvegarde de la DB cible et sa procédure de restauration ;
- confirmer explicitement le périmètre des migrations automatiques du Compose ;
- choisir comment déployer le SHA testé sans suivre une branche mutable ;
- définir la provenance applicative et le digest des images propres au staging ;
- prévoir admission fraîche, sérialisation, vérification runtime et compte rendu ;
- préparer le rollback applicatif, sans restauration DB automatique implicite ;
- autoriser séparément le changement du déclencheur Dokploy et tout déploiement ;
- conserver la préproduction vitrine et la production inchangées.

Une fusion de cette PR sur `dev` déclenchera **le mécanisme d'auto-déploiement
staging déjà existant**, indépendamment de ce nouveau garde. La fusion nécessite
donc elle aussi un accord explicite et le préflight de déploiement.
