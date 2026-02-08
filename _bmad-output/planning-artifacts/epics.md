---
stepsCompleted: [1]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd/index.md"
  - "_bmad-output/planning-artifacts/prd/functional-requirements.md"
  - "_bmad-output/planning-artifacts/prd/non-functional-requirements.md"
  - "_bmad-output/planning-artifacts/architecture/index.md"
  - "_bmad-output/planning-artifacts/architecture/starter-template-evaluation.md"
  - "_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# tss-explore-forum - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for tss-explore-forum, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR1:** Un utilisateur invité (comme Marie) peut soumettre une publication sans créer de compte.
- **FR2:** Un utilisateur anonyme peut recevoir un "code secret" unique après sa première publication.
- **FR3:** Un utilisateur anonyme peut utiliser son "code secret" pour retrouver ses publications précédentes sur différents appareils.
- **FR4:** Un utilisateur (comme Thomas) peut s'inscrire en utilisant un pseudonyme, un email et un mot de passe.
- **FR5:** Un utilisateur enregistré peut se connecter et se déconnecter.
- **FR6:** Un utilisateur enregistré peut supprimer son compte et toutes ses données associées.
- **FR7:** Un utilisateur peut créer une nouvelle publication (un "post").
- **FR8:** Un utilisateur peut choisir une catégorie visible pour sa publication parmi une liste prédéfinie.
- **FR9:** Le système affiche un template de publication guidé basé sur la catégorie choisie.
- **FR10:** Un utilisateur peut écrire et formater le contenu de sa publication.
- **FR11:** Un utilisateur peut soumettre une publication pour modération.
- **FR12:** Un utilisateur peut écrire une réponse à une publication existante.
- **FR13:** Un utilisateur peut signaler une publication ou une réponse comme étant inappropriée.
- **FR14:** Un utilisateur peut voir une liste de publications publiées.
- **FR15:** Un utilisateur peut filtrer les publications par catégorie.
- **FR16:** Le système affiche un avertissement pour le contenu sensible et le floute par défaut.
- **FR17:** Un utilisateur peut choisir de "voir le contenu" pour révéler un message flouté.
- **FR18:** Un utilisateur peut lire une publication et toutes ses réponses.
- **FR19:** Le système n'affiche aucune métrique sociale (likes, nombre de vues, etc.).
- **FR20:** Un modérateur peut voir un tableau de bord avec une file des messages en attente de validation.
- **FR21:** Un modérateur peut voir une file des contenus signalés par la communauté.
- **FR22:** Un modérateur peut lire le contenu d'un message en attente ou signalé.
- **FR23:** Un modérateur peut approuver un message, le rendant public.
- **FR24:** Un modérateur peut rejeter un message, qui ne sera pas publié.
- **FR25:** Un modérateur peut supprimer une publication ou une réponse qui viole les règles.
- **FR26:** Un modérateur peut marquer un message comme "sensible", ce qui déclenchera le floutage.
- **FR27:** Un modérateur peut envoyer un avertissement standardisé à un utilisateur ayant enfreint les règles.
- **FR28:** Un utilisateur peut consulter les Conditions Générales d'Utilisation (CGU).
- **FR29:** Un utilisateur peut consulter la Politique de Confidentialité.
- **FR30:** Le système affiche des avertissements clairs indiquant que la plateforme n'est pas un service d'urgence.

### Non-Functional Requirements

**NFR1 - Sécurité:**
- Confidentialité des Données: Toutes les données des utilisateurs doivent être chiffrées au repos et en transit.
- Principe de Moindre Privilège: Les modérateurs ne peuvent que supprimer du contenu, jamais le modifier. L'accès à la base de données est strictement limité.
- Anonymat: Le système doit être conçu pour ne jamais exiger d'informations personnelles identifiables pour les parcours de crise.
- Dépendances: Toutes les dépendances logicielles devront être auditées régulièrement pour des failles de sécurité.

**NFR2 - Performance:**
- Temps de Réponse: L'interaction pour commencer à écrire un message (parcours de Marie) doit se charger en moins de 2 secondes sur une connexion mobile standard.
- Publication: La soumission d'un post doit recevoir une confirmation du système en moins de 3 secondes.

**NFR3 - Accessibilité:**
- Standard: L'application doit se conformer au minimum au standard WCAG 2.1 niveau AA.
- Tests: L'application doit être testable et utilisable via la navigation au clavier et avec les principaux lecteurs d'écran.

**NFR4 - Fiabilité:**
- Disponibilité: Le service doit viser un temps de disponibilité de 99.9%.
- Sauvegardes: Des sauvegardes régulières de la base de données doivent être effectuées pour prévenir toute perte de données.

**NFR5 - Scalabilité:**
- MVP: Le système doit pouvoir gérer confortablement les 20+ utilisateurs actifs et 50+ posts prévus dans les 6 premières semaines.
- Post-MVP: L'architecture choisie devra permettre une mise à l'échelle pour supporter une croissance future.

### Additional Requirements

**Architecture Technique:**

- **Starter Template:** TanStack Start RC (full-stack SSR + server functions) avec TypeScript strict
  - Command: `pnpx create tanstack-start@latest`
  - SSR par défaut pour SEO et performance au premier chargement
  - Server functions pour toute logique sensible (auth, modération, écritures)

- **Data Layer:**
  - Base de données: PostgreSQL (chiffrement natif, relations complexes)
  - ORM: Drizzle (type-safe, migrations, intégration TanStack)
  - Validation: Zod (schémas unifiés client/serveur)

- **Authentication & Security:**
  - Better-Auth avec plugin anonymous
  - Sessions JWT Better-Auth standard, mobile-friendly
  - Authentification anonyme: `authClient.signIn.anonymous()` → session immédiate
  - Code secret: `userId` anonyme direct (pas de mapping additionnel)
  - Liaison compte: callback `onLinkAccount` pour migration posts anonymes → compte enregistré

- **Frontend Stack:**
  - Formulaires: TanStack Form (cohérence stack, validation Zod)
  - Styling: approche minimaliste + Shadcn ponctuel (`pnpx shadcn@latest add button`)
  - Composants accessibles: WCAG 2.1 AA, navigation clavier, lecteurs d'écran
  - Mobile-first responsive

- **Testing:**
  - Vitest pour tests unitaires et intégration
  - Playwright pour tests end-to-end
  - Tests accessibilité navigation clavier complète

- **Infrastructure & Deployment:**
  - Hébergement: VPS Hetzner (contrôle complet, coût optimisé, données EU)
  - Déploiement: Dokploy (interface moderne, Docker automatisé, GitHub integration)
  - Pipeline: GitHub → Dokploy → containerisation automatique + déploiement zero-downtime
  - Base de données PostgreSQL containerisée via Dokploy, backups automatisés
  - Monitoring: Dokploy dashboard + logs application, audit trails modération
  - SSL/Proxy: Traefik automatique via Dokploy, certificats Let's Encrypt

- **Interface d'Administration:**
  - Dashboard modérateur avec sidebar navigation
  - Sections: Queue de modération, Contenus signalés, Utilisateurs, Statistiques, Paramètres
  - Authentification admin: Better-Auth avec rôles (user/moderator/admin)
  - Permissions strictes: RBAC sur server functions, séparation UI user/admin

**UX Design & Visual:**

- **Design System:**
  - Shadcn/UI + Tailwind CSS
  - Composants copy-paste pour rapidité MVP
  - Accessibilité WCAG 2.1 AA built-in

- **Color System (OKLCH):**
  - Primary: oklch(0.5854 0.2041 277.1173) - Violet doux, apaisant
  - Destructive: oklch(0.6368 0.2078 25.3313) - Orange tempéré (pas rouge agressif)
  - Muted: oklch(0.9232 0.0026 48.7171) - Beige ultra-doux backgrounds
  - Système perception humaine optimisée, contraste accessible automatique light/dark

- **Typography:**
  - Primary (UI): Plus Jakarta Sans Variable - Humaniste moderne, empathique
  - Reading (Contenu): Lora Variable - Serif empathique pour contenu émotionnel long
  - Mono (Codes): Roboto Mono Variable - Clean pour codes secrets, metadata

- **Spacing & Layout:**
  - Border Radius: 1.25rem (douceur visuelle extrême)
  - Shadows: Subtiles avec opacité réduite
  - Transitions: >300ms pour interactions sensibles (éviter stress)
  - Espacement généreux (jamais de densité oppressante)

- **UX Patterns Spécifiques:**
  - Session anonyme automatique (zéro friction)
  - Auto-save permanent (jamais perdre contenu en cours)
  - Floutage empathique pour contenu sensible avec révélation progressive
  - Guidance template douce selon catégorie choisie
  - Confirmation apaisante post-soumission avec code secret
  - Navigation intuitive même sous stress émotionnel
  - Micro-copy chaleureux (chaque message respire l'empathie)

- **Performance Critique:**
  - <2 secondes pour chargement Premier Post (contrainte critique)
  - SSR (TanStack Start) pour rapidité
  - Cache agressif pour interactions fluides
  - Loading states apaisants (pas de spinners agressifs)

- **Emotional Design Principles:**
  - "Stress-Cognitive Aware": Jamais de choix complexes sous détresse
  - "Bienveillance by Design": Chaque micro-interaction respire sécurité et empathie
  - "Anonymat Rassurant": L'invisibilité = protection, pas isolement
  - "Progression Douce": Du anonyme vers confiance, jamais l'inverse

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
