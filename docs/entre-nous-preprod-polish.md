# Passe ciblée Entre nous — 9 octobre 2026

Skills appliqués : better-writing, better-ui, better-accessibility et better-layout.
Périmètre : vitrine de préproduction, explications adjacentes au CTA, exemple,
présentation de l’offre future, aide et FAQ. Identité visuelle conservée.

## Plain words over clever ones / Address the reader directly

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `src/features/beta/components/entre-nous-showcase.tsx:14`, `:128` | « Cette fonction n’est pas implémentée », « prévues, non implémentées » | « Le futur service prévoit… Elles ne sont pas encore disponibles » | Expliquer la disponibilité avec des mots courants, sans suggérer que les réponses sont livrées. |
| LOW | `src/features/beta/components/entre-nous-showcase.tsx:43`, `:107`, `:119`, `:136` | Formulations impersonnelles sur l’offre et le parcours | Adresse directe en « vous », phrases plus courtes, distinction entre futur service et parcours de test | Garder une voix cohérente et faciliter la première lecture. |
| LOW | `src/features/beta/components/entre-nous-showcase.tsx:22`, `:84`, `:148` | Limites et explications longues répétées dans plusieurs sections | Exemple décrit comme inventé, aide disponible aujourd’hui, limites détaillées dans la FAQ | Réduire la répétition tout en gardant la fermeture des dépôts et la fiction visibles avant l’action. |

## Contextual icons / One SVG, recolored per state

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `src/features/beta/components/entre-nous-showcase.tsx:59` | Flèche d’avancement sur une action indisponible | Icône de pause, décorative, même bibliothèque et `currentColor` | Renforcer l’état désactivé sans suggérer une navigation ou une protection d’anonymat. |

Les libellés des liens correspondent à leur destination. Le CTA conserve son
nom, son `disabled` natif et l’explication visible liée par `aria-describedby`.
Les mots alias, Mes scénarios et code de récupération restent cohérents.

## Vérification de l’accessibilité et de la disposition

No actionable accessibility findings. No actionable layout findings.

Contrôles effectués dans Chromium sur le rendu statique du composant avec le CSS
compilé du projet : 1440, 390 et 320 px, thème clair/sombre, zoom CSS à 200 % et
miroir RTL à 390 px. Aucun débordement horizontal. Ces essais ne constituent pas
une validation d’une traduction RTL ou de toute l’application.

- Audit axe-core, règles WCAG 2 A/AA, 2.1 A/AA et 2.2 AA : aucune violation
  détectée, aucune vérification laissée incomplète, dans ces cinq configurations
  et avec la FAQ ouverte. Les couleurs existantes ne sont pas modifiées.
- Quinze arrêts clavier : liens et quatre résumés de FAQ, focus visible de 2 px.
  Le bouton indisponible est absent de l’ordre de tabulation. Entrée ouvre chaque
  réponse ; Espace la referme. Noms, rôles et état désactivé inspectés dans
  l’arbre d’accessibilité du navigateur.
- État survolé du CTA toujours désactivé, sans changement de fond suggérant une
  action. Les liens et disclosures conservent leurs états existants.
- Mouvement réduit : transition du chevron à 0 s. Mode couleurs forcées : focus
  visible de 2 px avec la couleur système existante.

Not verified : lecture avec un lecteur d’écran réel, zoom natif du navigateur,
rejeu à 10 % dans le panneau Animations, navigation entre pages dans cet aperçu
statique, barre de navigation et écrans hors vitrine. Les essais automatisés ne
constituent pas une certification d’accessibilité.

Tests ciblés : 44 réussis (composition de la landing et paramètres de bêta).
Les tests continuent à vérifier le CTA réellement désactivé, l’absence de
création de session, les modes de publication et l’indépendance des permissions.
Les dépendances d’audit et aperçus sont temporaires, hors du commit ; aucune
nouvelle dépendance n’est ajoutée au projet.

Approbation limitée au périmètre et aux vérifications décrits ci-dessus.

Approve
