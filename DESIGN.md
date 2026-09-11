---
name: "Parlons Violence"
description: "Un dossier civique franc et lisible, imprimé sur papier ivoire dans un champ bleu nuit."
colors:
  civic-night: "#101c3a"
  civic-blue: "#2958d2"
  signal-yellow: "#ffcc4d"
  signal-yellow-hover: "#f3bb2e"
  uncoated-paper: "#f4f1e8"
  civic-sky: "#dce2ee"
  paper-white: "#f8f7f2"
  quiet-blue: "#40506e"
  quiet-on-night: "#d8deea"
typography:
  display:
    fontFamily: "Yaldevi Variable, Plus Jakarta Sans Variable, sans-serif"
    fontSize: "clamp(2.75rem, 5vw, 5.75rem)"
    fontWeight: 760
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Lora Variable, serif"
    fontSize: "clamp(2.2rem, 4vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Lora Variable, serif"
    fontSize: "clamp(1.1rem, 1.55vw, 1.55rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Roboto Mono Variable, monospace"
    fontSize: "0.875rem"
    fontWeight: 650
    lineHeight: 1.45
    letterSpacing: "0.13em"
rounded:
  square: "0"
spacing:
  compact: "0.5rem"
  small: "0.75rem"
  control: "1rem"
  panel: "1.5rem"
  section: "clamp(5rem, 10vw, 10rem)"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.civic-night}"
    rounded: "{rounded.square}"
    padding: "0 1.5rem"
    height: "3.75rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-yellow-hover}"
    textColor: "{colors.civic-night}"
    rounded: "{rounded.square}"
  session-link:
    backgroundColor: "transparent"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "0 1rem"
    height: "2.75rem"
  paper-panel:
    backgroundColor: "{colors.uncoated-paper}"
    textColor: "{colors.civic-night}"
    rounded: "{rounded.square}"
    padding: "1.5rem"
  status-stamp:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.civic-night}"
    rounded: "{rounded.square}"
    padding: "0.55rem 0.35rem"
  navigation-link:
    backgroundColor: "transparent"
    textColor: "{colors.quiet-on-night}"
    rounded: "{rounded.square}"
    padding: "0.5rem 0"
---

# Design System: Parlons Violence

## Overview

**Creative North Star: "Le dossier civique"**

Parlons Violence emprunte la franchise d’un document public suisse : un champ bleu nuit encadre du papier ivoire non couché, une encre bleue organise les repères et un jaune direct signale l’action. Le monde reste humain grâce au contraste entre titres sans-serif compacts, voix éditoriale en serif et annotations monospace qui évoquent références, folios et tampons.

Le « livret accordéon » est la signature des explications séquentielles, pas un gabarit obligatoire pour chaque écran. Ailleurs, le système conserve ses invariants durables — aplats francs, lignes fines, angles droits, numérotation et hiérarchie typographique — sans transformer la composition de la landing en loi universelle.

**Key Characteristics:**

- Civique, direct et digne, sans froideur administrative.
- Papier ivoire et aplats bleus structurés par des règles fines.
- Signal jaune rare, réservé aux actions et statuts décisifs.
- Typographie très contrastée : Yaldevi, Lora, Plus Jakarta Sans et Roboto Mono.
- Profondeur quasi plate, avec un pli ou une feuille seulement quand le sens le justifie.

## Colors

La palette oppose un socle nocturne à des surfaces imprimées claires ; le bleu trace la structure et le jaune attire l’œil sans devenir décoratif.

### Primary

- **Bleu nuit civique** : champ de marque, navigation et zones de respiration à forte autorité.
- **Bleu civique accessible** : icônes, folios, liens et règles sur papier ; il porte la logique du document.

### Secondary

- **Jaune signal** : appel principal, statut estampillé et courts traits de repère. Sa variante plus sombre appartient uniquement au survol.

### Neutral

- **Papier non couché** : surface de lecture principale, chaleureuse et tactile.
- **Ciel civique** : fond secondaire des questions et zones de compréhension.
- **Blanc papier** : texte prioritaire sur bleu nuit.
- **Bleu discret** et **bleu pâle sur nuit** : paragraphes secondaires selon le fond.

### Named Rules

**The Yellow Means Act Rule.** Le jaune signale une action, un statut ou un repère bref ; il ne remplit jamais une grande surface sans fonction.

**The Ink Carries Meaning Rule.** Toute information colorée garde un libellé, un numéro, une icône ou une règle qui transmet le même sens.

## Typography

**Display Font:** Yaldevi Variable (avec Plus Jakarta Sans et sans-serif en repli)

**Editorial Font:** Lora Variable (avec serif en repli)

**Body Font:** Plus Jakarta Sans Variable (avec sans-serif en repli)

**Label/Mono Font:** Roboto Mono Variable (avec monospace en repli)

**Character:** Yaldevi donne aux grandes déclarations une présence publique, dense et contemporaine. Lora apporte le ton humain des titres de parcours ; Plus Jakarta Sans garde la lecture nette, tandis que Roboto Mono transforme codes, folios et mentions courtes en repères documentaires.

### Hierarchy

- **Display** (graisse 760, taille fluide, interligne 0.9) : grands titres civiques et déclarations courtes.
- **Headline** (graisse 600, taille fluide, interligne 0.95) : transitions éditoriales sur champ sombre.
- **Title** (graisse 700, taille fluide, interligne 1) : étapes, questions et sous-titres de dossier.
- **Body** (graisse 400, 1rem, interligne 1.5) : explication courante ; les lectures longues peuvent monter à 1.7 et restent autour de 46–64 caractères par ligne.
- **Label** (graisse 650, 0.875rem, interligne 1.45, capitales espacées) : références, statuts et légendes brèves, jamais un paragraphe.

### Named Rules

**The Four Voices Rule.** Yaldevi déclare, Lora raconte, Plus Jakarta Sans explique et Roboto Mono référence ; ne pas échanger leurs rôles pour varier gratuitement.

## Layout

Le système alterne champs pleine largeur et dossiers contenus. Les grands ensembles plafonnent entre 86rem et 96rem, avec une marge latérale minimale de 1.5rem. Les compositions éditoriales utilisent des grilles asymétriques et des séparateurs plutôt qu’une mosaïque de cartes ; l’espacement de section est généreux pour rendre chaque changement de sujet évident.

À 70rem et moins, les séquences larges se réorganisent en grille de trois colonnes. À 46rem et moins, elles deviennent une lecture verticale continue, les entêtes fixes redeviennent statiques et les sections passent sur un axe unique. Les actions essentielles restent visibles dans le premier écran mobile et les cibles interactives conservent au moins 44px.

**The Reading Order Survives Rule.** Une grille peut se replier, mais numéros, titres, preuves et action gardent toujours leur ordre logique.

## Elevation & Depth

Le système est quasi plat : aplats, traits de 1px et changements de ton portent la hiérarchie. Une grande ombre ambiante et de légères ombres internes sont réservées au papier physiquement mis en scène ; les listes, panneaux d’information, boutons et questions restent sans ombre. Le mouvement d’ouverture dure 700ms avec une courbe de décélération franche et disparaît lorsque la réduction des mouvements est demandée.

### Named Rules

**The Paper Alone Lifts Rule.** Seul un objet présenté comme une feuille ou une superposition réelle peut quitter le plan.

## Shapes

Angles droits, filets fins et aplats rectangulaires forment la grammaire de base. La silhouette pliée est une exception signifiante pour une séquence explicative : ses arêtes restent droites et ses plis sont suggérés par lumière, ombre interne et découpe, jamais par des coins arrondis. Les petites estampilles peuvent pivoter légèrement pour évoquer un geste imprimé.

**The Straight Edge Rule.** Les composants de ce monde ne deviennent ni pilules ni cartes molles ; l’adoucissement vient du papier, du rythme et de la typographie.

## Components

### Buttons

- **Shape:** rectangle à angles droits, hauteur minimale de 3.75rem pour l’action principale.
- **Primary:** jaune signal, encre bleu nuit, graisse forte et flèche terminale ; toute la largeur est autorisée dans un panneau étroit.
- **Hover / Focus:** jaune légèrement assombri au survol ; contour bleu visible avec décalage de 3px au clavier.
- **Secondary / Session:** lien encadré d’un filet bleu clair sur champ nuit, sans ombre.

### Navigation

La barre supérieure est compacte, collante et bleue nuit. La marque Yaldevi reçoit un court filet jaune ; les liens secondaires sont bleu pâle puis deviennent blancs et soulignés de jaune au survol. Sous 64rem, la navigation textuelle disparaît et la récupération de session conserve une icône explicite.

### Paper Panels

Les panneaux de dossier utilisent le papier non couché, une bordure de 1px, une numérotation Lora bleue et des annotations monospace. Ils se regroupent par ligne ou par séquence verticale selon la place disponible. L’ombre n’est permise qu’au conteneur-feuille qui rassemble la séquence.

### Ledgers and Disclosure Rows

Les listes comparatives et FAQ s’organisent comme des registres : filets horizontaux, colonnes de texte, numéros ou pictogrammes minces. L’état ouvert se manifeste par la rotation de l’icône en 180ms et par l’apparition du texte, sans carte flottante.

### Status Stamps

Une estampille jaune, légèrement inclinée, associe toujours la couleur à un libellé en capitales. Elle convient à un statut bref et vérifiable, pas à une information longue ni à une décoration.

## Do's and Don'ts

### Do:

- **Do** utiliser les lignes de 1px, les numéros et l’alignement pour créer la hiérarchie avant d’ajouter une surface.
- **Do** réserver le jaune aux actions, statuts et repères décisifs.
- **Do** conserver les quatre rôles typographiques et une lecture claire sur mobile comme sur ordinateur.
- **Do** accompagner chaque état coloré d’un mot, d’une icône ou d’une forme explicite.
- **Do** employer le pli et la texture seulement lorsqu’ils renforcent l’idée de document ou de parcours.

### Don't:

- **Don't** revenir aux grandes cartes pastel arrondies, aux pilules ou aux ombres diffuses omniprésentes.
- **Don't** généraliser l’accordéon de la landing à tous les parcours ou écrans applicatifs.
- **Don't** utiliser le jaune comme couleur de fond décorative sans action ni information.
- **Don't** ajouter de profondeur à un élément qui se comprend déjà par un aplat, un filet ou l’espacement.
- **Don't** faire suggérer par le graphisme une garantie d’anonymat, d’assistance immédiate ou de disponibilité permanente.
