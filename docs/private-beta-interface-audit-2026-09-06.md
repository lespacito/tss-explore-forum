# Audit Impeccable — bêta privée, 6 septembre 2026

## Verdict

Intégrité produit : insuffisante pour inviter des testeurs en l’état. L’identité visuelle existe (Lora, Plus Jakarta Sans, palette douce, tokens clair/sombre), mais navigation, promesses et parcours divergent du périmètre de la bêta.

Audit de la copie locale avec ses modifications préexistantes, pas du déploiement. Inspection du code, accueil en navigateur ordinateur et mobile 390 × 844, fil vide et entrée dans la création. Aucun contenu publié, aucune modification fonctionnelle. Le parcours authentifié, la modération et l’effacement ne sont pas validés en exécution.

## Évaluation provisoire

| Dimension | Note /4 | Preuve et limite |
|---|---:|---|
| Accessibilité | 2 | Boutons FAQ sans nom accessible ; main imbriqués. Contrastes et navigation clavier complète non mesurés. |
| Performance | Non notée | Images WebP avec dimensions et chargement différé ; pas de mesure de production. |
| Responsive | 1 | Largeur document 488 px pour viewport 390 px ; contenu et navigation coupés. Débordement aussi visible sur ordinateur avec sidebar ouverte. |
| Thèmes | 2 | Tokens clair/sombre présents ; variante CSS dark suspecte et rendu clair non vérifié. |
| Intégrité | 1 | Liens absents, promesses hors périmètre, deux parcours de création. |

Pas de total /20 : une mesure manquerait et donnerait une précision trompeuse. Détecteur mécanique exécuté sur routes, blocs, navigation et composants métier sélectionnés : `[]`. Ce résultat ne valide ni les liens ni les parcours.

## Constats prioritaires

### P0 — Échec de l’entrée dans la création en local

- Emplacement : `src/routes/threads/index.tsx`, bouton « Créer une publication » ; destination `src/routes/threads/new/index.tsx:10` avec redirection vers la connexion sans session.
- Observé : depuis le fil vide, le clic affiche « Something went wrong! » et « Cannot read properties of null (reading 'useContext') ».
- Impact : impossible de poursuivre ce parcours dans l’exécution inspectée.
- Action : diagnostiquer la pile React et la redirection, puis vérifier un démarrage frais et la version de production avant de conclure à un défaut déployé. Commande : `$impeccable harden`.

### P1 — Navigation de confiance non fonctionnelle

- Emplacements : `src/components/header/sidebar.tsx`, `src/data/navigation.ts`, `src/components/shadcn-studio/blocks/footer.tsx`.
- Les catégories pointent vers `/demo/...`. Urgence, aide, signalement, règles, sécurité et contact pointent vers des routes absentes de l’arbre actuel. Les quatre liens du footer ont `href="#"`.
- Impact : une personne cherchant une aide ou une information de confidentialité est envoyée dans une impasse.
- Action : limiter la navigation aux destinations réelles et fournir les pages indispensables. `$impeccable harden`, puis `$impeccable distill`.

### P1 — Débordement mobile et navigation trop large

- Emplacements : `src/routes/__root.tsx`, `src/components/shadcn-studio/blocks/navbar-component/navbar-component.tsx`, footer.
- Mesure DOM sur accueil : viewport 390 px, document 488 px, footer nav environ 456 px. Capture : texte principal et connexion coupés à droite. Sur ordinateur, navigation tronquée et barre horizontale avec sidebar ouverte.
- Impact : lecture et accès aux actions nécessitent un défilement horizontal.
- Action : corriger les contraintes flex/min-width, permettre le retour à la ligne du footer et adapter la navigation à l’espace disponible. `$impeccable adapt`.

### P1 — Promesses incompatibles avec la bêta

- Emplacements : `features-section.tsx`, `hero-section/hero-section.tsx`, `faq-section.tsx:12`, `src/routes/threads/confirmation.tsx`.
- Accueil : « Disponibilité 24/7 », « Signalements faciles », « Anonymat garanti ». La confirmation promet 24–48 h et une notification. Le brief prévoit un seul modérateur et reporte les signalements communautaires.
- Impact : attentes de présence, de protection et de suivi supérieures à ce qui est établi.
- Action : décider du service réellement assuré puis aligner la copie, sans inventer de garanties. `$impeccable clarify`.

### P1 — Code secret transporté dans l’URL

- Emplacements : `src/routes/threads/index.tsx`, `src/routes/threads/new/$category.tsx:98`, `src/routes/threads/confirmation.tsx`.
- Le secret est passé dans les paramètres de navigation puis lu dans la query string.
- Impact : il peut rester dans l’historique et être copié avec le lien. Aucune fuite effective n’a été constatée.
- Action : transfert éphémère sans secret dans l’URL, puis vérification de la récupération. `$impeccable harden`.

### P1 — FAQ sans noms accessibles pour ses boutons

- Emplacement : `src/components/shadcn-studio/blocks/faq-section.tsx:58`.
- Trigger rendu en div et bouton icône enfant sans libellé. L’arbre d’accessibilité expose quatre boutons vides.
- Impact : les commandes ne permettent pas d’identifier la question à ouvrir avec un lecteur d’écran.
- Action : une question = un vrai bouton contenant son libellé et l’état ouvert/fermé. `$impeccable harden`.

### P2 — Deux parcours anonymes divergents

- Emplacements : `src/features/auth/components/AnonymousPostButton.tsx`, `src/routes/threads/index.tsx`, `src/routes/threads/new/index.tsx`.
- Le CTA d’accueil crée une session et ouvre l’ancien formulaire modal. Le bouton du fil mène à la sélection guidée, protégée par une session.
- Impact : un même objectif offre des étapes et protections différentes selon le point d’entrée.
- Action : choisir un parcours canonique et y raccorder les CTA. `$impeccable onboard`.

### P2 — Structure sémantique et cohérence des thèmes

- `src/routes/__root.tsx` contient un main, imbriqué avec celui de l’accueil et de la modération.
- `src/styles.css` déclare `@custom-variant dark (&: is(.dark *));` avec un espace suspect ; vérifier le CSS compilé avant correction. Les variables `.dark` existent indépendamment de cette variante : ne pas conclure que tout le thème sombre est cassé.
- Action : un landmark principal par page et validation des variantes dans les deux thèmes. `$impeccable harden`.

## Décisions et vérifications restantes

- La FAQ et le formulaire ne présentent pas les mêmes numéros d’aide. Choisir le territoire, puis vérifier les ressources officielles avant toute modification ; cet audit ne certifie pas leur pertinence médicale ou juridique.
- Les brouillons sont sauvegardés dans localStorage : arbitrer reprise de rédaction et discrétion sur appareil partagé.
- Le champ isSensitive est absent du contrat de ThreadCard et l’extrait est affiché directement. Vérifier le comportement complet du marquage sensible avec des données de test avant validation.
- Le caractère « sur invitation » est documenté mais aucun mécanisme n’a été trouvé dans le scan ciblé de src ; un contrôle d’hébergement reste possible et n’a pas été vérifié.
- Le brief de readiness contient des résultats historiques positifs ; ils n’ont pas été relancés pendant cet audit et ne prouvent pas les parcours actuels.

## Points à conserver

Palette et typographies identifiables, composants partagés, images WebP dimensionnées, libellés français, parcours guidé avec aria-pressed et descriptions de catégories, confirmation explicite de la prémodération. Le périmètre de test documenté est petit et mesurable.

## Suite proposée

Après les décisions Grill Me : `$impeccable harden` pour le parcours et les destinations essentielles ; `$impeccable adapt` pour les débordements ; `$impeccable clarify` et `$impeccable onboard` pour la promesse et la publication ; `$impeccable polish` en dernier. Les commandes peuvent être réalisées ensemble ou dans l’ordre convenu. Refaire un audit borné après corrections.

Conformément à Grill Me, l’implémentation attend la confirmation du brief final. Ce rapport est un diagnostic, pas une approbation de lancement.

## Mise en œuvre et vérification — 8 septembre 2026

Le périmètre confirmé a été appliqué localement : accès sur invitation côté serveur,
parcours guidé unique, pages d’aide/règles/confidentialité, statuts personnels,
récupération du code sur demande, brouillon conservé uniquement sur consentement,
effacement réel et suspension des dépôts par configuration. Les promesses de
modération permanente, de notification anonyme et d’anonymat absolu ont été retirées.

Deux erreurs ont été découvertes et corrigées pendant les essais : la politique
`no-referrer` de la page d’entrée produisait une origine inutilisable lors du POST
(le formulaire utilise maintenant `same-origin`), et l’export conjoint de la logique
de génération du code embarquait des dépendances serveur dans la page du profil
(logique isolée dans un module chargé côté serveur).

### Preuves obtenues

- Migrations versionnées appliquées dans un nouveau schéma local isolé
  `beta_validation_1788851142590`, sans modification du schéma public.
- Navigateur : invitation, session anonyme, rédaction fictive, dépôt, statut en
  attente, consultation du code, déconnexion et reconnexion avec ce code.
- Navigateur : connexion du modérateur, approbation, masquage de l’extrait sensible,
  avertissement avant ouverture du message, refus avec motif.
- Effacement en base par la fonction réelle : compte, code, deux sessions, alias et
  publication supprimés ; compte témoin préservé ; deuxième effacement rejeté.
  Le clic final du formulaire de suppression n’a pas été exécuté dans le navigateur.
- Profil inspecté sur ordinateur et en largeur mobile 390 px : largeur de document
  mesurée à 390 px, aucun élément du contenu au-delà du viewport.
- TypeScript et build de production réussis. Détecteur Impeccable : aucun signal sur
  les fichiers ciblés. Ces contrôles ne constituent pas une certification WCAG.
- Suite unitaire : 675/676 au passage complet, un timeout sur l’inscription ;
  relance du fichier seul : 17/17 réussis. Aucun échec fonctionnel restant identifié.

### Avant les invitations réelles

Renseigner les créneaux effectifs, le temps quotidien disponible, le contact
organisateur, l’hébergement et la conservation des sauvegardes. Configurer un code
aléatoire par invité et conserver les dépôts fermés tant que ces informations ne sont
pas communiquées. Première cohorte : 5–10 adultes, Suisse romande, deux semaines,
scénarios fictifs uniquement. Mesurer l’autonomie de dépôt et la compréhension des
statuts ; seuil retenu pour la cohorte suivante : 80 % sans assistance et charge de
modération soutenable.

Aucun déploiement ni invitation réelle n’a été effectué. Le build est vérifié ; le
parcours navigateur décrit ci-dessus a été exercé sur le serveur local de développement.
