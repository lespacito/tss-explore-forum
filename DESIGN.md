---
name: "Parlons Violence"
description: "Un carnet numérique calme et accueillant pour déposer, comprendre et suivre une publication sous alias."
colors:
  paper-mist: "oklch(0.9232 0.0026 48.7171)"
  ink-blue: "oklch(0.2795 0.0368 260.031)"
  warm-card: "oklch(0.9699 0.0013 106.4238)"
  trust-violet: "oklch(0.5854 0.2041 277.1173)"
  on-trust-violet: "oklch(1 0 0)"
  quiet-stone: "oklch(0.8687 0.0043 56.366)"
  quiet-ink: "oklch(0.4461 0.0263 256.8018)"
  secondary-ink: "oklch(0.46 0.0234 264.3637)"
  tender-lilac: "oklch(0.9376 0.026 321.9388)"
  lilac-ink: "oklch(0.3729 0.0306 259.7328)"
  alert-coral: "oklch(0.6368 0.2078 25.3313)"
  attention-amber: "oklch(0.7528 0.1345 81.4633)"
  night-paper: "oklch(0.2244 0.0074 67.437)"
  night-ink: "oklch(0.9288 0.0126 255.5078)"
  night-card: "oklch(0.2801 0.008 59.3379)"
  night-trust-violet: "oklch(0.6801 0.1583 276.9349)"
  night-stone: "oklch(0.3359 0.0077 59.4197)"
  night-secondary-ink: "oklch(0.7137 0.0192 261.3246)"
  night-lilac: "oklch(0.3896 0.0074 59.4734)"
  night-attention-amber: "oklch(0.8112 0.1567 88.3421)"
typography:
  display:
    fontFamily: "Lora Variable, serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.29167
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Lora Variable, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Lora Variable, serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
  code:
    fontFamily: "Roboto Mono Variable, monospace"
rounded:
  sm: "1rem"
  md: "1.125rem"
  lg: "1.25rem"
  xl: "1.5rem"
  pill: "9999px"
spacing:
  compact: "0.5rem"
  field: "0.75rem"
  control: "1rem"
  cluster: "1.5rem"
  section: "2rem"
  page-inline: "1rem"
  page-block: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.trust-violet}"
    textColor: "{colors.on-trust-violet}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  button-secondary:
    backgroundColor: "{colors.quiet-stone}"
    textColor: "{colors.quiet-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  button-destructive:
    backgroundColor: "{colors.alert-coral}"
    textColor: "{colors.on-trust-violet}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink-blue}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  card:
    backgroundColor: "{colors.warm-card}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  category-chip:
    backgroundColor: "{colors.quiet-stone}"
    textColor: "{colors.secondary-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.75rem"
  navigation-link:
    backgroundColor: "transparent"
    textColor: "{colors.secondary-ink}"
    typography: "{typography.label}"
    padding: "0.5rem 0"
  safety-notice:
    backgroundColor: "color-mix(in oklab, {colors.attention-amber} 15%, transparent)"
    textColor: "{colors.ink-blue}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "1rem"
---

# Design System: Parlons Violence

## Overview

**Creative North Star: "Le carnet de confiance"**

Parlons Violence prend la forme d’un carnet numérique calme : un espace personnel, lisible et suffisamment chaleureux pour accompagner une action délicate sans dramatiser l’interface. La douceur vient du papier grisé, des surfaces claires, des coins généreux et du dialogue entre une serif éditoriale et une sans-serif très lisible.

Le système privilégie une densité modérée, des parcours explicites et des états visibles. Il inspire la confiance par la précision, la retenue et la continuité entre mobile et ordinateur, jamais par des promesses visuelles de protection absolue. L’ensemble doit rester humain sans adopter les codes d’un service clinique, et vivant sans emprunter la stimulation, la compétition ou la ludification d’un réseau social.

**Key Characteristics:**

- Calme, chaleureux et respectueux.
- Éditorial dans les titres, fonctionnel dans les actions.
- Surfaces doucement stratifiées et coins enveloppants.
- Couleur rare, sémantique et immédiatement compréhensible.
- États interactifs et statuts perceptibles autrement que par la couleur seule.

## Colors

La palette associe un fond minéral chaud à une encre bleutée, puis réserve le Violet de confiance aux actions, sélections et repères qui demandent une attention nette.

### Primary

- **Violet de confiance** : action principale, sélection active, lien mis en avant, caret, sélection de texte et anneau de focus.
- **Blanc franc** : texte et icônes posés sur le Violet de confiance en thème clair.

### Secondary

- **Pierre tranquille** : boutons secondaires, navigation latérale et surfaces fonctionnelles qui doivent rester en retrait.
- **Encre discrète** : contenu secondaire posé sur les surfaces de pierre.

### Tertiary

- **Lilas tendre** : surbrillances légères, états restaurés et interactions de navigation sans urgence.
- **Ambre d’attention** : informations de prudence et limites importantes qui nécessitent une lecture avant de poursuivre.
- **Corail d’alerte** : actions destructrices et erreurs confirmées, jamais comme décoration.

### Neutral

- **Papier brumeux** : toile principale claire et surface des champs transparents.
- **Encre bleutée** : texte principal, titres et contenu à forte priorité.
- **Carte chaude** : cartes, panneaux et menus superposés.
- **Encre secondaire** : descriptions, métadonnées et aide contextuelle.
- **Papier nocturne**, **Encre nocturne**, **Carte nocturne** et **Pierre nocturne** : équivalents du thème sombre, avec un Violet de confiance plus lumineux.

### Named Rules

**The One Signal Rule.** Le Violet de confiance indique une action ou un état important ; il ne devient jamais un remplissage décoratif omniprésent.

**The Meaning Before Hue Rule.** Une couleur de statut est toujours accompagnée d’un libellé, d’un message ou d’une forme qui transmet le même sens.

## Typography

**Display Font:** Lora Variable (avec serif en repli)  
**Body Font:** Plus Jakarta Sans Variable (avec sans-serif en repli)  
**Label/Mono Font:** Roboto Mono Variable (avec monospace en repli, réservé aux codes et données techniques)

**Character:** Lora donne aux titres une voix éditoriale, posée et humaine. Plus Jakarta Sans conserve aux parcours, formulaires et informations une lecture directe ; Roboto Mono distingue les secrets et valeurs techniques sans contaminer le ton général.

### Hierarchy

- **Display** (graisse 700, taille fluide, interligne serré) : titre d’accueil, exceptionnel et limité à la première hiérarchie d’une surface persuasive.
- **Headline** (graisse 600, taille 1.875rem, interligne 1.2) : titre principal des parcours, pages d’information et outils de modération.
- **Title** (graisse 700, taille 1.125rem, interligne 1.25) : titres de cartes et publications.
- **Body** (graisse 400, taille 1rem, interligne 1.75) : explications, contenu éditorial et formulaires ; limiter les textes longs à environ 65–72 caractères par ligne.
- **Label** (graisse 500, taille 0.875rem, interligne 1.25) : boutons, champs, métadonnées et filtres.

### Named Rules

**The Human Headline Rule.** Lora porte les titres qui orientent ou accueillent ; les commandes, statuts et longues lectures restent en Plus Jakarta Sans.

**The Quiet Code Rule.** Roboto Mono sert uniquement lorsqu’une valeur doit être reconnue et recopiée comme un code.

## Layout

Les parcours utilisent une colonne centrée et mobile-first. Les lectures et formulaires sensibles restent étroits, généralement entre 42rem et 48rem ; les listes et espaces personnels montent jusqu’à 56rem ; la modération peut s’étendre jusqu’à 72rem. La navigation globale plafonne à 80rem.

La marge latérale de base est de 1rem et passe à 1.5rem sur les surfaces larges. Le rythme vertical récurrent s’appuie sur 1rem entre éléments proches, 1.5rem dans les cartes ou formulaires, puis 2 à 2.5rem entre sections. Les groupes deviennent horizontaux à partir du petit écran quand la comparaison le justifie ; les grilles de choix passent à deux colonnes à partir du format moyen.

**The One Calm Column Rule.** Un dépôt, une lecture ou une décision personnelle conserve un axe principal unique ; les colonnes supplémentaires sont réservées à la comparaison de choix ou aux outils d’administration.

## Elevation & Depth

Le système est doucement stratifié. Les différences de ton et les bordures installent d’abord la hiérarchie ; les ombres grises, larges et diffuses donnent ensuite une présence tactile aux cartes et menus. Au repos, une surface ne doit jamais sembler flotter fortement. Le survol d’une carte peut augmenter d’un seul niveau pour confirmer qu’elle est ouvrable.

### Shadow Vocabulary

- **Trace diffuse** : séparation minimale pour champs et petites surfaces.
- **Carte calme** : profondeur habituelle des cartes, avec deux couches douces et légèrement décalées.
- **Carte active** : niveau supérieur réservé au survol ou à une surface temporairement mise en avant.
- **Premier plan** : profondeur forte réservée aux dialogues et menus superposés.

### Named Rules

**The Layer Before Lift Rule.** Utiliser d’abord le contraste de surface et la bordure ; renforcer l’ombre seulement lorsqu’une interaction ou une superposition l’exige.

## Shapes

Les formes sont généreusement arrondies, avec une base de 1.25rem. Les contrôles compacts utilisent des coins légèrement plus resserrés, les cartes et avertissements assument une courbe plus enveloppante, et les filtres prennent une silhouette de pilule. Les bordures restent fines par défaut ; une bordure double n’est justifiée que pour un état sélectionné ou un message de prudence explicite.

**The Soft Boundary Rule.** Les coins accueillent, mais la forme ne doit jamais faire perdre la distinction entre une action, un champ, une carte et un simple texte.

## Components

### Buttons

Les boutons sont accueillants et explicites, avec une cible principale d’au moins 44px de haut.

- **Shape:** coins généreusement courbés ; pilule uniquement pour les filtres.
- **Primary:** Violet de confiance, texte blanc, graisse moyenne et espace horizontal confortable.
- **Hover / Focus:** assombrissement léger au survol ; anneau de focus visible à trois couches translucides, renforcé par le contour global décalé.
- **Secondary / Outline:** surface Pierre tranquille pour le secondaire ; fond de page, bordure et ombre très légère pour l’outline.
- **Ghost / Link:** sans surface au repos ; le ghost reçoit un Lilas tendre au survol et le lien gagne un soulignement.
- **Destructive:** Corail d’alerte, réservé aux conséquences irréversibles et associé à un libellé sans ambiguïté.

### Chips

- **Style:** silhouette en pilule, libellé compact et contraste modéré.
- **State:** la sélection reçoit le Violet de confiance ou la teinte sémantique de sa catégorie ; `aria-pressed` porte l’état fonctionnel.

### Cards / Containers

- **Corner Style:** courbe enveloppante de niveau XL.
- **Background:** Carte chaude en thème clair et Carte nocturne en thème sombre.
- **Shadow Strategy:** Carte calme au repos, Carte active uniquement quand toute la carte est interactive.
- **Border:** trait fin neutre ; accent renforcé pour sélection, avertissement ou contenu guidé.
- **Internal Padding:** 1rem pour les cartes denses de liste, 1.5rem pour les cartes de formulaire et de lecture.

### Inputs / Fields

- **Style:** fond transparent, bordure neutre, hauteur compacte pour les champs simples et zone plus généreuse pour l’éditeur.
- **Focus:** bordure Violet de confiance et anneau visible ; le caret reprend le même accent.
- **Error / Disabled:** Corail d’alerte avec message textuel ; opacité réduite et curseur explicite pour l’état désactivé.

### Navigation

La barre supérieure reste collante, posée sur le Papier brumeux et séparée par une bordure fine. Les liens sont calmes par défaut puis deviennent Violet de confiance au survol et sur la route active. La navigation complète se replie à partir du format XL ; sur mobile, un bouton iconique ouvre un menu large et la barre latérale reste fermée par défaut.

### Safety Notice

Les messages de prudence utilisent une surface Ambre d’attention très diluée, une bordure explicite et un premier énoncé en graisse forte. Ils informent sans simuler une alerte d’urgence et gardent les numéros et ressources directement actionnables.

## Do's and Don'ts

### Do:

- **Do** utiliser Lora pour donner une voix humaine aux titres et Plus Jakarta Sans pour garder chaque action immédiatement lisible.
- **Do** maintenir des cibles tactiles d’au moins 44px, un focus visible et un texte pour chaque statut important.
- **Do** conserver les parcours sensibles dans une colonne calme et limiter les lignes longues à une largeur de lecture confortable.
- **Do** utiliser le Violet de confiance pour guider l’action, l’Ambre d’attention pour prévenir et le Corail d’alerte pour les erreurs ou destructions.
- **Do** préserver les thèmes clair et sombre comme deux expressions équivalentes du même système.

### Don't:

- **Don't** transformer l’interface en environnement clinique, froid ou pseudo-médical.
- **Don't** introduire de compteurs sociaux, réactions, récompenses, couleurs festives ou mécanismes de compétition.
- **Don't** employer une couleur seule pour indiquer un statut, une erreur ou une sélection.
- **Don't** multiplier les ombres fortes, les surfaces flottantes ou les bordures d’accent décoratives.
- **Don't** présenter l’alias, la modération ou l’avertissement de contenu comme une garantie absolue de protection.
