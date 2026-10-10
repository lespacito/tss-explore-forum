# Vérification contrôlée du publisher GHCR — 10 octobre 2026

## Objet

Cette note opérationnelle prépare **un nouveau push sur `dev` après fusion explicite d'une PR**, afin de tester le publisher GHCR automatique corrigé sur `master` par la PR #61. La modification est exclusivement documentaire : **aucun changement de code applicatif, de configuration CI, de secrets ou de déploiement**.

## État de départ

- `dev` au moment de la préparation : `98b7f0b39876c2f9d1a9aba347e2e62b961ff2fc`.
- `master` contient le correctif BuildKit de la PR #61, commit de fusion `3d41905cfd9ddf65443828405e7bc97d167da613`.
- Les deux checks sur `master` après cette fusion (`test` et `guards`) sont verts.
- Les échecs GHCR précédents sont survenus au bootstrap BuildKit lors de l'accès à Docker Hub, **avant** le build.
- Les images actuellement déployées en préprod ne sont pas remplacées par cette PR.

## Procédure après un GO distinct de fusion

1. Vérifier que la PR ne contient que ce document et que ses checks sont verts ; vérifier aussi la tête de `dev` et l'absence de CI `dev` en cours.
2. Avec autorisation explicite, fusionner cette PR vers `dev` par le chemin protégé habituel, sans push direct.
3. Vérifier que le run `Playwright Tests` de type **push** sur `dev` passe ; relever son ID, sa tentative et son SHA exact.
4. Vérifier qu'un run **Build and publish preproduction images** est déclenché automatiquement par `workflow_run` sur `master`. Ne pas utiliser `workflow_dispatch`, ne pas relancer manuellement le publisher.
5. Dans les logs et le résumé, vérifier le bootstrap BuildKit, les contrôles de fraîcheur/CI, les tags immuables et les deux digests `sha256` distincts pour APP et MIGRATE :
   - `ghcr.io/lespacito/parlons-violence-preprod-app`
   - `ghcr.io/lespacito/parlons-violence-preprod-migrate`
6. Si le publisher échoue, **ne pas relancer aveuglément** : vérifier si l'une des images ou des tags a été publiée, puis diagnostiquer l'étape fautive. Les publications ne sont pas transactionnelles.
7. Si les deux images sont publiées et vérifiées, demander un **nouveau GO distinct** avant toute modification Dokploy, migration ou déploiement préprod. Ne pas ouvrir la production ni les dépôts de témoignages réels.

## Garde-fous

Le publisher conserve les conditions d'admission : CI `push` réussie sur la tête actuelle de `dev`, dernier run et dernière tentative valides, source et SHA concordants, absence de collision GHCR. La fusion de cette PR documentaire est précisément l'événement qui produira un nouveau SHA sur `dev` et donc une nouvelle CI éligible ; **préparer la PR ne l'autorise pas à être fusionnée**.

Le miroir Google peut retomber sur Docker Hub si l'image n'est pas en cache. Ce test ne prouve la correction de bout en bout que si les images APP et MIGRATE sont réellement publiées et que leurs digests sont vérifiés.

La préprod reste en mode démonstration fictive, dépôts fermés ; staging et production sont hors périmètre.
