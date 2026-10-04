# Landing — passe Impeccable après PR #46

Base : dev, commit 88b8206. Rendu avant inspecté sur staging.parlonsviolence.ch, après sur le build local. La configuration locale suspend les dépôts ; staging les ouvre. Cette différence de statut ne vient pas du diff.

## Corrections

- Même axe horizontal pour le hero et les quatre sections, avec les valeurs de marge existantes réutilisées comme variables locales. Alignement mesuré à 32 px sur une largeur de 320 px, et 86,39 px à 1440 px.
- CTA de consultation aligné au début lorsque son texte revient sur deux lignes.
- Soulignement renforcé au survol des liens éditoriaux ; encre bleue au survol des questions.
- Contour de focus de la FAQ placé à l’intérieur de la ligne pour préserver son intégrité visuelle.

Structure, ordre, copy, polices, palette, auth, backend, sécurité, bêta et dépendances conservés. Aucun changement du rythme vertical : le rendu ne justifiait pas de le retoucher.

## Vérifications

- Avant : desktop 1440, mobile 390, 320 px et thèmes clair/sombre sur staging.
- Après : captures desktop et 320 px sur le build compilé ; vérification mobile 390, reflow 720, thème sombre, menu et FAQ au clavier sur le serveur local. Pas de débordement horizontal observé.
- Focus visible ; menu ouvert avec Entrée, fermé avec Échap ; FAQ ouverte avec Entrée.
- 7 tests de composition réussis, typecheck réussi, build réussi, diff --check réussi.
- Détecteur Impeccable : 12 avis sur des tailles et une couleur déjà présentes ; aucun des nouveaux styles concerné.
- E2E Chromium existant lancé : échec à l’arrivée sur /threads, qui affiche « Cette page n’a pas pu être chargée » dans cet environnement. Le parcours complet n’est donc pas validé.
- Zoom natif 200 % : raccourci sans effet dans le navigateur intégré. Reflow à 720 px vérifié, sans le présenter comme un test de zoom réel.
- Build : avertissements de directives « use client » ignorées et propriété CSS « file » issue du scan Tailwind, hors du diff.
- La prévisualisation du build a servi aux captures finales : le serveur Vite initial refusait les fichiers de polices du node_modules partagé hors du worktree.

## Verdict

NO-GO pour merge/déploiement tant que le parcours E2E et le zoom réel à 200 % ne sont pas validés. PR de revue uniquement ; attendre le GO explicite du propriétaire.
