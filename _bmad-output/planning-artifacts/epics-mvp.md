---
stepsCompleted:
  [
    "step-01-validate-prerequisites",
    "step-02-design-epics",
    "step-03-create-stories",
    "step-04-final-validation",
    "step-05-mvp-refactoring"
  ]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd/index.md"
  - "_bmad-output/planning-artifacts/architecture/index.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/implementation-readiness-report-2026-01-22.md"
  - "_bmad-output/planning-artifacts/mvp-scope-final.md"
workflowCompleted: true
completedAt: "2026-01-22"
mvpScope: "Phase 1 + Phase 2"
projectStatus: "brownfield"
phase1Target: "Week 3 (Epic 1-3)"
phase2Target: "Week 4 (Epic 5.1 Simplified)"
totalStories: 18
issuesResolved:
  - "Code Secret Format unified to XXXX-XXXX-XXXX"
  - "Auto-save added as FR31"
  - "Story 1.1 marked DONE (2026-01-07)"
  - "Project initialization clarified as brownfield"
  - "Epic 5.1 Simplified aligned with MVP Scope"
  - "MVP scope divergence resolved"
---

# tss-explore-forum - MVP Epic Breakdown

**Document Version:** 2.0 (Refactored for MVP Scope)
**Date:** 2026-01-22
**Author:** John (PM Agent) + Dev-linux
**Source Documents:** PRD, Architecture, UX, Implementation Readiness Report, MVP Scope Final

---

## Overview

This document provides the **MVP-specific** epic and story breakdown for tss-explore-forum, covering **Phase 1** (Epic 1-3) and **Phase 2** (Epic 5.1 Simplified). All post-MVP features (Epic 4, Epic 6, Stories 1.5-1.6, Stories 5.2-5.6) are documented in `epics-post-mvp.md`.

**MVP Strategy:**
- **Phase 1 (Weeks 1-3):** Epic 1-3 - Core user flows (anonymous posting, content discovery)
- **Phase 2 (Week 4):** Epic 5.1 Simplified - Basic moderation dashboard

**Success Criteria:**
- Users can post anonymously in < 3 minutes
- 50 posts published in 6 weeks
- 20% code secret adoption rate
- Moderation time < 2 hours average

---

## Requirements Inventory

### Functional Requirements (MVP Scope)

#### Gestion des Utilisateurs et de l'Anonymat

- **FR1:** Un **utilisateur invité (comme Marie)** peut soumettre une publication sans créer de compte.
- **FR2:** Un **utilisateur anonyme** peut recevoir un "code secret" unique après sa première publication.
- **FR3:** Un **utilisateur anonyme** peut utiliser son "code secret" pour retrouver ses publications précédentes sur différents appareils.
- **FR4:** Un **utilisateur (comme Thomas)** peut s'inscrire en utilisant un pseudonyme, un email et un mot de passe.
- ~~**FR5:** Un **utilisateur enregistré** peut se connecter et se déconnecter.~~ *(Post-MVP - Story 1.5)*
- ~~**FR6:** Un **utilisateur enregistré** peut supprimer son compte et toutes ses données associées.~~ *(Post-MVP - Story 1.6)*

#### Création et Interaction de Contenu

- **FR7:** Un **utilisateur** peut créer une nouvelle publication (un "thread").
- **FR8:** Un **utilisateur** peut choisir une catégorie visible pour sa publication parmi une liste prédéfinie.
- **FR9:** Le **système** affiche un template de publication guidé basé sur la catégorie choisie.
- **FR10:** Un **utilisateur** peut écrire et formater le contenu de sa publication.
- **FR11:** Un **utilisateur** peut soumettre une publication pour modération.
- ~~**FR12:** Un **utilisateur** peut écrire une réponse à une publication existante.~~ *(Post-MVP - Epic 4)*
- ~~**FR13:** Un **utilisateur** peut signaler une publication ou une réponse comme étant inappropriée.~~ *(Post-MVP - Epic 4)*

#### Découverte et Consommation de Contenu

- **FR14:** Un **utilisateur** peut voir une liste de publications publiées.
- **FR15:** Un **utilisateur** peut filtrer les publications par catégorie.
- **FR16:** Le **système** affiche un avertissement pour le contenu sensible et le floute par défaut.
- **FR17:** Un **utilisateur** peut choisir de "voir le contenu" pour révéler un message flouté.
- **FR18:** Un **utilisateur** peut lire une publication et toutes ses réponses.
- **FR19:** Le **système** n'affiche aucune métrique sociale (likes, nombre de vues, etc.).

#### Modération et Sécurité (Phase 2 Simplified)

- **FR20:** Un **modérateur** peut voir un tableau de bord avec une file des messages en attente de validation.
- ~~**FR21:** Un **modérateur** peut voir une file des contenus signalés par la communauté.~~ *(Post-MVP - Story 5.2)*
- **FR22:** Un **modérateur** peut lire le contenu d'un message en attente ou signalé.
- **FR23:** Un **modérateur** peut **approuver** un message, le rendant public.
- **FR24:** Un **modérateur** peut **rejeter** un message, qui ne sera pas publié.
- **FR25:** Un **modérateur** peut **supprimer** une publication ou une réponse qui viole les règles.
- **FR26:** Un **modérateur** peut marquer un message comme "sensible", ce qui déclenchera le floutage.
- ~~**FR27:** Un **modérateur** peut envoyer un avertissement standardisé à un utilisateur ayant enfreint les règles.~~ *(Post-MVP - Story 5.5)*

#### Plateforme et Gouvernance

- ~~**FR28:** Un **utilisateur** peut consulter les Conditions Générales d'Utilisation (CGU).~~ *(Post-MVP - Epic 6)*
- ~~**FR29:** Un **utilisateur** peut consulter la Politique de Confidentialité.~~ *(Post-MVP - Epic 6)*
- ~~**FR30:** Le **système** affiche des avertissements clairs indiquant que la plateforme n'est pas un service d'urgence.~~ *(Post-MVP - Epic 6)*

#### Nouveau - Auto-save Feature

- **FR31:** Le **système** sauvegarde automatiquement le contenu en cours de rédaction (NEW - Issue #4 Resolution)
  - localStorage pour persistance client-side
  - Indicateur visuel "Sauvegardé automatiquement"
  - Récupération automatique au retour
  - Protection contre perte de contenu émotionnel

**Total MVP FRs:** 21 FRs (FR1-FR4, FR7-FR11, FR14-FR20, FR22-FR26, FR31)

---

### Non-Functional Requirements

- **NFR1 - Sécurité - Confidentialité des Données:** Toutes les données des utilisateurs doivent être chiffrées au repos et en transit.
- **NFR2 - Sécurité - Principe de Moindre Privilège:** Les modérateurs ne peuvent que supprimer du contenu, jamais le modifier. L'accès à la base de données est strictement limité.
- **NFR3 - Sécurité - Anonymat:** Le système doit être conçu pour ne jamais exiger d'informations personnelles identifiables pour les parcours de crise.
- **NFR4 - Sécurité - Dépendances:** Toutes les dépendances logicielles devront être auditées régulièrement pour des failles de sécurité.
- **NFR5 - Performance - Temps de Réponse:** L'interaction pour commencer à écrire un message (parcours de Marie) doit se charger en moins de 2 secondes sur une connexion mobile standard.
- **NFR6 - Performance - Publication:** La soumission d'un post doit recevoir une confirmation du système en moins de 3 secondes.
- **NFR7 - Accessibilité - Standard:** L'application doit se conformer au minimum au standard WCAG 2.1 niveau AA.
- **NFR8 - Accessibilité - Tests:** L'application doit être testable et utilisable via la navigation au clavier et avec les principaux lecteurs d'écran.
- **NFR9 - Fiabilité - Disponibilité:** Le service doit viser un temps de disponibilité de 99.9%.
- **NFR10 - Fiabilité - Sauvegardes:** Des sauvegardes régulières de la base de données doivent être effectuées pour prévenir toute perte de données.
- **NFR11 - Scalability - MVP:** Le système doit pouvoir gérer confortablement les 20+ utilisateurs actifs et 50+ posts prévus dans les 6 premières semaines.
- **NFR12 - Scalability - Post-MVP:** L'architecture choisie devra permettre une mise à l'échelle pour supporter une croissance future.

**Total NFRs:** 12 (All applicable to MVP)

---

### Additional Requirements (Architecture & Technical)

**Note:** AR1-AR2 (Project initialization commands) removed - **Project is BROWNFIELD** (already initialized, Story 1.1 DONE).

**Database & ORM Requirements:**

- **AR3:** PostgreSQL database with native encryption and complex relations support
- **AR4:** Drizzle ORM with type-safe migrations and query performance optimization
- **AR5:** Zod validation schemas unified between client and server
- **AR6:** Standard entity columns pattern with id, createdAt, updatedAt, deletedAt fields
- **AR7:** Soft delete implementation using deletedAt for moderatable content

**Authentication Architecture Requirements:**

- **AR8:** Better-Auth implementation with anonymous plugin support
- **AR9:** Anonymous authentication via `authClient.signIn.anonymous()`
- **AR10:** Anonymous userId as user-visible "code secret" (Format: **XXXX-XXXX-XXXX** - Issue #2 Resolution)
- **AR11:** Email registration via `authClient.signUp.email()`
- **AR12:** Account linking with `onLinkAccount` callback for anonymous to registered migration
- **AR13:** Role-based access control (user/moderator/admin)

**Infrastructure & Deployment Requirements:**

- **AR14:** VPS Hetzner hosting for EU data compliance and cost optimization
- **AR15:** Dokploy deployment platform with GitHub integration
- **AR16:** Docker containerization with zero-downtime deployment
- **AR17:** PostgreSQL containerized via Dokploy with automated backups
- **AR18:** Traefik proxy with automatic SSL/Let's Encrypt certificates
- **AR19:** Monitoring via Dokploy dashboard and application logs

**Development Patterns & Standards:**

- **AR20:** Feature structure pattern: `/features/{entity}/` organization
- **AR21:** Server function naming: `{action}{Entity}Fn` pattern
- **AR22:** TanStack Form for all form implementations
- **AR23:** Toast notifications for user feedback
- **AR24:** Router invalidation after mutations
- **AR25:** Alias system for all posts/comments to maintain anonymity
- **AR26:** WCAG 2.1 AA compliance for accessibility
- **AR27:** Mobile-first responsive design approach

**Admin Interface Requirements (Phase 2):**

- **AR28:** Separate moderation dashboard with sidebar navigation (Simplified for MVP)
- **AR29:** Strict RBAC enforcement on server functions
- **AR30:** UI separation between user and admin interfaces

**Total ARs:** 28 (AR3-AR30, removing AR1-AR2 for brownfield)

---

### MVP FR Coverage Map

| FR | Epic | Story | Phase | Status |
|----|------|-------|-------|--------|
| FR1 | Epic 1 | 1.1 | Phase 1 | ✅ DONE (2026-01-07) |
| FR2 | Epic 1 | 1.2 | Phase 1 | 🔨 In Progress |
| FR3 | Epic 1 | 1.3 | Phase 1 | 📋 Ready |
| FR4 | Epic 1 | 1.4 | Phase 1 | 📋 Ready |
| FR7 | Epic 2 | 2.1 | Phase 1 | 📋 Ready |
| FR8 | Epic 2 | 2.1 | Phase 1 | 📋 Ready |
| FR9 | Epic 2 | 2.2 | Phase 1 | 📋 Ready |
| FR10 | Epic 2 | 2.3 | Phase 1 | 📋 Ready |
| FR11 | Epic 2 | 2.4 | Phase 1 | 📋 Ready |
| FR31 | Epic 2 | 2.3 | Phase 1 | 📋 Ready (NEW) |
| FR14 | Epic 3 | 3.1 | Phase 1 | 📋 Ready |
| FR15 | Epic 3 | 3.2 | Phase 1 | 📋 Ready |
| FR16 | Epic 3 | 3.3 | Phase 1 | 📋 Ready |
| FR17 | Epic 3 | 3.4 | Phase 1 | 📋 Ready |
| FR18 | Epic 3 | 3.5 | Phase 1 | 📋 Ready |
| FR19 | Epic 3 | 3.6 | Phase 1 | 📋 Ready |
| FR20 | Epic 5 | 5.1 Simplified | Phase 2 | 📋 Ready |
| FR22 | Epic 5 | 5.1 Simplified | Phase 2 | 📋 Ready |
| FR23 | Epic 5 | 5.1 Simplified | Phase 2 | 📋 Ready |
| FR24 | Epic 5 | 5.1 Simplified | Phase 2 | 📋 Ready |
| FR25 | Epic 5 | 5.1 Simplified | Phase 2 | 📋 Ready |
| FR26 | Epic 5 | 5.1 Simplified | Phase 2 | 📋 Ready |

---

## Epic List (MVP Scope)

### Epic 1: Fondations d'Authentification Anonyme (Phase 1)

Les utilisateurs peuvent participer de manière anonyme ou créer un compte selon leur confort, permettant un premier contact sécurisé et flexible pour utilisateurs vulnérables.

**FRs couverts:** FR1, FR2, FR3, FR4
**Stories:** 1.1 (DONE), 1.2, 1.3, 1.4
**Post-MVP Extensions:** Stories 1.5-1.6 (Connexion/Déconnexion, Suppression Compte)

---

### Epic 2: Création et Soumission de Contenu (Phase 1)

Les utilisateurs peuvent exprimer leurs expériences via des publications guidées, offrant une expression sécurisée avec guidance appropriée selon la catégorie choisie.

**FRs couverts:** FR7, FR8, FR9, FR10, FR11, FR31
**Stories:** 2.1, 2.2, 2.3, 2.4, 2.5

---

### Epic 3: Découverte et Consommation Sécurisée (Phase 1)

Les utilisateurs peuvent consulter du contenu avec protection appropriée, incluant filtrage par catégorie et contrôles de sécurité émotionnelle avec floutage du contenu sensible.

**FRs couverts:** FR14, FR15, FR16, FR17, FR18, FR19
**Stories:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6

---

### Epic 5: Modération Basique (Phase 2 - Simplified)

Les modérateurs peuvent maintenir un espace sûr via un dashboard essentiel, permettant modération sans SQL direct.

**FRs couverts:** FR20, FR22, FR23, FR24, FR25, FR26
**Stories:** 5.1 Simplified
**Post-MVP Extensions:** Stories 5.2-5.6 (Signalements, Avertissements, RBAC Complet)

---

## Epic 1: Fondations d'Authentification Anonyme

**Phase:** 1
**Estimated Effort:** 3 jours (1.1 déjà DONE)
**User Value:** Permettre participation immédiate sans barrière d'inscription

---

### Story 1.1: Session Anonyme Immédiate ✅ DONE

**Status:** ✅ Completed (2026-01-07)
**Tests Passed:** 59
**Story Points:** 5

As a **utilisateur en détresse (comme Marie)**,
I want **accéder immédiatement à la plateforme sans créer de compte**,
So that **je peux exprimer mon besoin urgent sans barrière administrative**.

**Acceptance Criteria:**

**Given** je visite la plateforme pour la première fois
**When** j'accède à la page d'accueil
**Then** je peux naviguer et voir le contenu public sans inscription
**And** un bouton "Publier Anonymement" est visible et accessible
**And** aucune information personnelle n'est requise pour commencer

**Given** je clique sur "Publier Anonymement"
**When** le système traite ma demande
**Then** une session anonyme temporaire est créée automatiquement
**And** je suis redirigé vers le formulaire de création de publication
**And** le processus prend moins de 2 secondes (NFR5)

---

### Story 1.2: Code Secret pour Utilisateur Anonyme

As a **utilisateur anonyme**,
I want **recevoir un code secret unique après ma première publication**,
So that **je puisse retrouver mes contenus plus tard sans révéler mon identité**.

**Acceptance Criteria:**

**Given** j'ai soumis ma première publication en mode anonyme
**When** la publication est envoyée pour modération
**Then** le système génère un code secret unique au format **XXXX-XXXX-XXXX** (12 caractères hexadécimaux, 3 groupes de 4)
**And** le code exclut les caractères ambigus (0, O, I, 1, l) pour faciliter la mémorisation
**And** le code secret est affiché clairement avec instructions de sauvegarde
**And** le code est associé à mon userId anonyme dans la base de données
**And** le code secret respecte les exigences d'anonymat (NFR3)

**Given** mon code secret est généré
**When** je consulte l'écran de confirmation
**Then** des instructions claires expliquent comment utiliser le code
**And** je peux copier le code facilement (bouton "Copier")
**And** un avertissement bienveillant indique l'importance de sauvegarder le code
**And** le format XXXX-XXXX-XXXX est facile à lire et mémoriser

---

### Story 1.3: Récupération via Code Secret

As a **utilisateur anonyme avec code secret**,
I want **pouvoir me reconnecter avec mon code secret sur n'importe quel appareil**,
So that **je puisse suivre mes publications et continuer mes interactions**.

**Acceptance Criteria:**

**Given** j'ai un code secret valide d'une session précédente (format XXXX-XXXX-XXXX)
**When** je saisis mon code secret sur la page de connexion anonyme
**Then** le système me reconnecte à ma session anonyme
**And** je retrouve l'accès à toutes mes publications précédentes
**And** je peux créer de nouvelles publications sous la même identité anonyme

**Given** je saisis un code secret invalide ou inexistant
**When** je tente de me connecter
**Then** le système affiche un message d'erreur clair et bienveillant
**And** aucune information sur la validité des codes n'est révélée (protection timing attacks)
**And** je peux réessayer ou créer une nouvelle session anonyme

---

### Story 1.4: Inscription avec Email/Pseudonyme

As a **utilisateur (comme Thomas) voulant un compte permanent**,
I want **créer un compte avec pseudonyme et email**,
So that **j'aie un accès plus stable et des fonctionnalités étendues**.

**Acceptance Criteria:**

**Given** je choisis de créer un compte permanent
**When** j'accède au formulaire d'inscription
**Then** je peux saisir un pseudonyme, email et mot de passe
**And** la validation Zod vérifie la sécurité des données côté client et serveur (AR5)
**And** le système valide l'unicité du pseudonyme et email

**Given** j'ai des publications anonymes existantes
**When** je m'inscris avec un email
**Then** le système propose de lier mes publications anonymes au nouveau compte
**And** le callback `onLinkAccount` (AR12) migre automatiquement mes contenus
**And** mon code secret devient optionnel mais reste fonctionnel

**Given** mes données d'inscription sont valides
**When** je soumets le formulaire
**Then** mon compte est créé avec le rôle "user" par défaut (AR13)
**And** je reçois une confirmation d'inscription
**And** toutes les données sont chiffrées selon NFR1

---

## Epic 2: Création et Soumission de Contenu

**Phase:** 1
**Estimated Effort:** 5 jours
**User Value:** Expression sécurisée avec guidance appropriée

---

### Story 2.1: Choix de Catégorie de Publication

As a **utilisateur connecté (anonyme ou enregistré)**,
I want **choisir une catégorie appropriée pour ma publication**,
So that **je puisse bénéficier de guidance adaptée à ma situation**.

**Acceptance Criteria:**

**Given** je suis connecté et veux créer une publication
**When** j'accède à la page de création de contenu
**Then** une liste de catégories prédéfinies est affichée clairement
**And** chaque catégorie a une description courte et empathique
**And** les catégories sont organisées par thématiques sensibles
**And** je peux sélectionner une seule catégorie pour ma publication

**Given** j'ai sélectionné une catégorie
**When** je confirme mon choix
**Then** le système enregistre ma sélection
**And** je suis dirigé vers le template correspondant
**And** la catégorie choisie influence le template affiché (FR9)

---

### Story 2.2: Template Guidé par Catégorie

As a **utilisateur ayant choisi une catégorie**,
I want **voir un template de publication adapté à ma catégorie**,
So that **je reçoive une guidance appropriée pour structurer mon message**.

**Acceptance Criteria:**

**Given** j'ai sélectionné une catégorie spécifique
**When** le template de publication se charge
**Then** le formulaire affiche des sections guidées adaptées à la catégorie
**And** des questions d'aide et conseils sont affichés de manière bienveillante
**And** le template respecte l'approche empathique et non-agressive (UX guidelines)

**Given** le template est chargé
**When** j'interagis avec les champs du formulaire
**Then** des conseils contextuels apparaissent pour m'aider
**And** la validation Zod (AR5) s'exécute en temps réel côté client
**And** le format encourage l'expression tout en respectant la sécurité

**Template Examples by Category:**

- **Catégorie "Violence/Abus":**
  - "Que s'est-il passé ?" (optionnel, sans pression)
  - "Comment vous sentez-vous maintenant ?" (validation émotionnelle)
  - "Avez-vous besoin d'aide immédiate ?" (lien ressources)

- **Catégorie "Témoin Bienveillant":**
  - "Quelle est votre relation avec la personne concernée ?"
  - "Quels changements avez-vous observés ?"
  - "Qu'espérez-vous accomplir en partageant ?"

---

### Story 2.3: Éditeur de Contenu avec Auto-save

As a **utilisateur en train de rédiger**,
I want **pouvoir écrire et formater le contenu de ma publication avec sauvegarde automatique**,
So that **je puisse exprimer clairement ma situation sans risquer de perdre mon contenu émotionnellement coûteux**.

**Acceptance Criteria:**

**Given** je suis dans l'éditeur de contenu
**When** je tape mon message
**Then** je peux utiliser un formatage de base (gras, italique, listes)
**And** l'éditeur supporte le markdown simple et sécurisé
**And** la validation côté client empêche l'injection de contenu malveillant
**And** l'interface reste simple et accessible (WCAG 2.1 AA - NFR7)

**Given** je rédige un contenu long
**When** je tape dans l'éditeur
**Then** le texte se sauvegarde automatiquement toutes les 5 secondes en localStorage (FR31)
**And** un indicateur visuel "✓ Sauvegardé automatiquement" s'affiche
**And** le brouillon est récupérable automatiquement si je quitte et reviens
**And** le brouillon est stocké localement (pas de serveur) pour confidentialité
**And** un compteur de caractères/mots est visible
**And** l'éditeur reste réactif et mobile-friendly (AR27)

**Given** j'ai fini de rédiger mon contenu
**When** je révise ma publication
**Then** je peux prévisualiser le rendu final
**And** je peux retourner en édition si nécessaire
**And** tous les champs requis sont validés avant soumission

---

### Story 2.4: Soumission pour Modération

As a **utilisateur ayant terminé sa publication**,
I want **soumettre ma publication pour validation**,
So that **mon contenu soit révisé avant publication selon les règles de sécurité**.

**Acceptance Criteria:**

**Given** ma publication est complète et validée
**When** je clique sur "Soumettre pour modération"
**Then** le système envoie ma publication dans la queue de modération
**And** un enregistrement est créé avec le statut "pending" (AR6)
**And** la soumission respecte la limite de 3 secondes (NFR6)

**Given** ma soumission est traitée côté serveur
**When** le processus de sauvegarde s'exécute
**Then** la publication est liée à mon alias (AR25 - pas directement userId)
**And** toutes les données sont chiffrées selon NFR1
**And** les server functions TanStack (AR21) gèrent la logique sensible
**And** la validation Zod côté serveur (AR5) vérifie la sécurité des données

**Given** la soumission est réussie
**When** la confirmation est renvoyée
**Then** je vois un message de confirmation clair et rassurant
**And** je reçois des informations sur les délais de modération
**And** mon code secret est affiché/rappelé si je suis anonyme (FR2 - Story 1.2)

---

### Story 2.5: Confirmation et Suivi de Statut

As a **utilisateur ayant soumis une publication**,
I want **pouvoir suivre le statut de ma publication**,
So that **je sache quand mon contenu sera publié ou si des modifications sont nécessaires**.

**Acceptance Criteria:**

**Given** j'ai soumis une publication pour modération
**When** j'accède à mon tableau de bord personnel (route `/account/profile`)
**Then** je peux voir le statut actuel de mes publications
**And** les statuts possibles sont clairement indiqués (pending, published, rejected)
**And** je peux filtrer mes publications par statut

**Given** ma publication change de statut
**When** un modérateur traite ma soumission
**Then** le statut est mis à jour en temps réel dans la base de données
**And** si rejetée, un message d'explication bienveillant est fourni
**And** si approuvée, ma publication devient visible publiquement

**Given** je suis un utilisateur anonyme avec code secret
**When** je me reconnecte avec mon code (Story 1.3)
**Then** je retrouve l'historique complet de mes publications
**And** je peux voir leurs statuts actuels
**And** je peux créer de nouvelles publications sous la même identité anonyme

---

## Epic 3: Découverte et Consommation Sécurisée

**Phase:** 1
**Estimated Effort:** 6 jours
**User Value:** Consultation de contenu avec protection émotionnelle appropriée

---

### Story 3.1: Liste des Publications Publiées

As a **visiteur ou utilisateur de la plateforme**,
I want **voir une liste des publications approuvées et publiées**,
So that **je puisse découvrir du contenu pertinent et des expériences partagées**.

**Acceptance Criteria:**

**Given** je visite la page d'accueil ou de découverte (route `/threads`)
**When** la liste des publications se charge
**Then** seules les publications avec statut "published" sont affichées
**And** les publications sont triées par ordre chronologique (plus récentes en premier)
**And** chaque publication affiche le titre, catégorie, et extrait sécurisé
**And** les informations personnelles des auteurs ne sont jamais révélées (anonymat respecté - NFR3)

**Given** la liste contient de nombreuses publications
**When** je fais défiler la page
**Then** le système charge les publications par pagination/lazy loading
**And** les performances restent fluides sur mobile (NFR5)
**And** l'accessibilité clavier est maintenue (NFR8)

**Given** je consulte une publication dans la liste
**When** j'interagis avec l'élément
**Then** je peux cliquer pour lire la publication complète
**And** aucune métrique sociale n'est visible (pas de likes, vues, etc.) selon FR19
**And** l'interface reste calme et non-agressive (UX principles)

---

### Story 3.2: Filtrage par Catégorie

As a **utilisateur cherchant du contenu spécifique**,
I want **filtrer les publications par catégorie**,
So that **je puisse trouver des expériences similaires à la mienne**.

**Acceptance Criteria:**

**Given** je suis sur la page de découverte (`/threads`)
**When** j'accède aux options de filtrage
**Then** toutes les catégories disponibles sont listées
**And** je peux sélectionner une ou plusieurs catégories
**And** le nombre de publications par catégorie est affiché si pertinent

**Given** j'ai sélectionné une catégorie spécifique
**When** j'applique le filtre
**Then** seules les publications de cette catégorie sont affichées
**And** l'URL est mise à jour pour permettre le partage/bookmark du filtre (`?category=violence`)
**And** je peux facilement revenir à la vue complète
**And** le filtrage se fait côté serveur pour optimiser les performances

**Given** une catégorie n'a aucune publication
**When** je sélectionne cette catégorie
**Then** un message bienveillant indique qu'aucun contenu n'est disponible
**And** des suggestions d'autres catégories sont proposées
**And** je peux facilement naviguer vers d'autres sections

---

### Story 3.3: Avertissements et Floutage Contenu Sensible

As a **utilisateur consultant du contenu potentiellement sensible**,
I want **être averti et voir le contenu flouté par défaut**,
So that **je puisse me préparer émotionnellement avant de lire des expériences difficiles**.

**Acceptance Criteria:**

**Given** une publication est marquée comme "sensible" par un modérateur (`is_sensitive=true`)
**When** la publication s'affiche dans la liste ou en lecture
**Then** le contenu principal est automatiquement flouté/masqué
**And** un avertissement clair et bienveillant est affiché
**And** l'avertissement explique la nature sensible du contenu
**And** des ressources d'aide peuvent être mentionnées si approprié

**Given** le contenu sensible est flouté
**When** je consulte la publication
**Then** le titre et la catégorie restent visibles
**And** l'avertissement utilise un langage calme et non-alarmant
**And** l'interface respecte les principes d'UX empathique
**And** l'implémentation respecte les standards d'accessibilité (NFR7)

---

### Story 3.4: Révélation Contrôlée du Contenu

As a **utilisateur face à du contenu flouté/sensible**,
I want **pouvoir choisir consciemment de voir le contenu**,
So that **je garde le contrôle sur mon exposition aux expériences difficiles**.

**Acceptance Criteria:**

**Given** je vois une publication avec contenu flouté/sensible
**When** je décide de révéler le contenu
**Then** un bouton clair "Voir le contenu" ou équivalent est disponible
**And** le bouton est accessible via navigation clavier (WCAG 2.1 AA - NFR7)
**And** un clic révèle progressivement le contenu sans brutalité

**Given** j'ai cliqué pour révéler le contenu
**When** le contenu se dévoile
**Then** le floutage disparaît graduellement (transition CSS douce)
**And** je peux re-masquer le contenu si nécessaire (bouton "Masquer")
**And** mon choix est respecté lors de la navigation dans la même session (localStorage)
**And** aucune donnée personnelle sur mes préférences n'est stockée de manière identifiable (NFR3)

**Given** je révèle du contenu sensible
**When** je lis la publication
**Then** des ressources d'aide restent accessibles en bas de page
**And** je peux facilement retourner à la liste ou naviguer ailleurs
**And** l'expérience reste respectueuse et soutenante

---

### Story 3.5: Lecture Complète avec Réponses

As a **utilisateur intéressé par une publication**,
I want **lire la publication complète ainsi que toutes ses réponses**,
So that **je puisse comprendre l'expérience complète et les interactions communautaires**.

**Note:** Les réponses (Epic 4 - Story 4.1) sont POST-MVP, mais cette story affiche les réponses existantes si présentes.

**Acceptance Criteria:**

**Given** je clique sur une publication depuis la liste
**When** la page de lecture complète se charge (route `/threads/$slug`)
**Then** je vois le contenu intégral de la publication
**And** toutes les réponses approuvées sont affichées en dessous (si Epic 4 implémenté)
**And** les réponses sont triées chronologiquement
**And** l'anonymat des auteurs est préservé pour publications et réponses (AR25)

**Given** la publication a de nombreuses réponses
**When** je consulte la page
**Then** les réponses peuvent être paginées si nécessaire
**And** je peux naviguer facilement entre les réponses
**And** l'interface reste lisible et accessible sur mobile (AR27)
**And** les performances de chargement restent optimales (NFR5)

**Given** une réponse est également marquée comme sensible
**When** je consulte les réponses
**Then** les mêmes règles de floutage s'appliquent aux réponses (Story 3.3-3.4)
**And** je peux révéler chaque réponse individuellement
**And** la cohérence UX est maintenue entre publications et réponses

---

### Story 3.6: Interface Sans Métriques Sociales

As a **utilisateur consultant du contenu**,
I want **une interface dépourvue de métriques sociales compétitives**,
So that **je puisse me concentrer sur le contenu sans pression sociale ou comparaison**.

**Acceptance Criteria:**

**Given** je consulte n'importe quelle publication ou réponse
**When** j'observe l'interface
**Then** aucun compteur de likes, vues, ou réactions n'est visible
**And** aucun classement par popularité n'est proposé
**And** aucune métrique de comparaison entre utilisateurs n'existe
**And** l'interface priorise la lisibilité et l'accessibilité

**Given** je navigue dans l'application
**When** je consulte différentes sections
**Then** la philosophie "sans métriques sociales" est cohérente partout
**And** l'accent est mis sur la qualité et la bienveillance du contenu
**And** les éléments d'interface favorisent l'introspection plutôt que la compétition

**Given** je suis un développeur implémentant cette fonctionnalité
**When** je construis l'interface
**Then** aucune collecte de métriques sociales n'est implémentée côté serveur
**And** les modèles de données (schemas Drizzle) n'incluent pas de champs pour ces métriques
**And** l'architecture respecte cette philosophie dès la conception

---

## Epic 5: Modération Basique (Phase 2 - Simplified)

**Phase:** 2
**Estimated Effort:** 2-3 jours
**User Value:** Interface web pour modérer sans SQL direct

**MVP Scope:** Story 5.1 Simplified UNIQUEMENT
**Post-MVP:** Stories 5.2-5.6 (voir `epics-post-mvp.md`)

---

### Story 5.1 Simplified: Dashboard Modérateur Essentiel

As a **modérateur connecté avec rôles appropriés**,
I want **accéder à un dashboard basique pour modérer les threads en attente**,
So that **je puisse traiter la queue de modération sans utiliser SQL direct**.

**MVP Scope Clarification:**

Cette version **Simplified** se concentre sur les fonctionnalités **MUST-HAVE** uniquement. Les fonctionnalités avancées (Stories 5.2-5.6) sont reportées en Post-MVP v1.1.

**Acceptance Criteria - Must-Have Features:**

**Given** je suis connecté avec le rôle "moderator" ou "admin" (AR13)
**When** j'accède au dashboard de modération (route `/admin/moderation`)
**Then** je vois une interface d'administration séparée de l'interface utilisateur (AR30)
**And** une sidebar de navigation affiche les sections principales (simplified)
**And** la queue de modération affiche tous les threads avec statut "pending"
**And** l'authentification RBAC (AR29) vérifie mes permissions via server functions

**Given** la queue contient des threads en attente
**When** je consulte la liste
**Then** chaque thread affiche: ID, Title, Category, Author Alias, Created At
**And** je peux trier par date (récents en premier par défaut)
**And** un compteur indique "X posts en attente"
**And** la pagination affiche 20 items par page
**And** l'interface respecte l'accessibilité (WCAG 2.1 AA - NFR7)

**Given** je clique sur un thread pour l'examiner
**When** la vue détaillée s'ouvre (modal ou drawer)
**Then** je vois le contenu complet en **read-only** (NFR2 - pas d'édition)
**And** les informations contextuelles (catégorie, date, author alias) sont affichées
**And** les actions de modération sont accessibles: **Approve**, **Reject**, **Mark Sensitive**
**And** je peux fermer le modal et retourner à la liste

**Given** je décide d'approuver un thread
**When** je clique sur "Approve"
**Then** le statut passe à "published" et le thread devient public (FR23)
**And** l'auteur peut voir sa publication dans l'interface utilisateur
**And** la publication apparaît dans le flux `/threads` (Story 3.1)
**And** l'action est enregistrée dans les logs avec timestamp
**And** un toast de confirmation s'affiche: "✓ Thread approuvé"
**And** la liste se rafraîchit automatiquement (AR24 - router invalidation)

**Given** je décide de rejeter un thread
**When** je clique sur "Reject"
**Then** un modal s'ouvre pour saisir la raison du rejet (textarea **required**)
**And** des guidelines bienveillantes sont affichées: "Soyez constructif et empathique"
**And** je dois confirmer l'action (bouton "Confirmer le Rejet")
**And** le statut passe à "rejected" et le thread n'est jamais publié (FR24)
**And** l'auteur voit un message d'explication bienveillant (si logged)
**And** le thread reste stocké pour audit mais invisible publiquement (AR7 - soft delete)
**And** un toast de confirmation s'affiche: "✓ Thread rejeté"

**Given** je décide de marquer un thread comme sensible
**When** je clique sur "Mark Sensitive"
**Then** le flag `is_sensitive` est défini à `true` dans la base de données (FR26)
**And** le thread peut être approuvé simultanément (ou déjà approuvé)
**And** le contenu sera automatiquement flouté côté utilisateur (Story 3.3)
**And** un toast de confirmation s'affiche: "✓ Thread marqué sensible"

**Acceptance Criteria - Nice-to-Have Features (si temps Phase 2):**

**Given** la queue contient de nombreux threads
**When** j'utilise les fonctionnalités optionnelles
**Then** je peux filtrer par catégorie (dropdown select)
**And** je peux rechercher par titre (search input)
**And** je vois un compteur "X posts modérés aujourd'hui" (basic stats)

**Acceptance Criteria - Explicitly OUT OF SCOPE (Post-MVP Stories 5.2-5.6):**

- ❌ Gestion des contenus signalés (Story 5.2 - Epic 4 requis)
- ❌ Actions avancées: ban users, bulk approve (Story 5.3)
- ❌ Système d'avertissements aux utilisateurs (Story 5.5)
- ❌ RBAC avec roles multiples et permissions granulaires (Story 5.6)
- ❌ Analytics dashboard avec charts (Story 5.6)
- ❌ Audit trail complet avec historique détaillé (Story 5.6)
- ❌ Email notifications depuis UI (Story 5.5)
- ❌ AI-assisted moderation

**Technical Implementation Notes:**

- **Stack:** TanStack Start route `/admin/moderation`
- **Server Functions:** `fetchPendingThreadsFn()`, `approveThreadFn()`, `rejectThreadFn()`, `markSensitiveFn()`
- **UI Components:** Shadcn Table, Modal, Button, Toast (AR22)
- **Auth Protection:** Better-Auth role check (AR13, AR29)
- **Data Flow:**
  1. Load threads: `fetchPendingThreadsFn()` → returns `status='pending'`
  2. Approve: `approveThreadFn(threadId)` → updates DB → invalidates router → shows toast
  3. Reject: `rejectThreadFn(threadId, reason)` → updates DB + reason → shows toast
  4. Mark Sensitive: `markSensitiveFn(threadId)` → sets `is_sensitive=true` → shows toast

---

## MVP Completion Checklist

### Phase 1 Definition of Done

**Epic 1 (Stories 1.1-1.4) Completed:**
- [x] Story 1.1: ✅ DONE (2026-01-07, 59 tests passed)
- [ ] Story 1.2: Code Secret (XXXX-XXXX-XXXX format)
- [ ] Story 1.3: Récupération via Code Secret
- [ ] Story 1.4: Inscription Email/Pseudonyme
- [ ] All tests passing (100% test pass rate)
- [ ] Manual testing: Anonymous session → post → retrieve via code
- [ ] Email signup → post flow working
- [ ] 0 diagnostic errors/warnings

**Epic 2 (Stories 2.1-2.5) Completed:**
- [ ] Story 2.1: Category selection working
- [ ] Story 2.2: Templates display per category
- [ ] Story 2.3: Editor with auto-save (FR31) + formatting
- [ ] Story 2.4: Posts go to 'pending' status
- [ ] Story 2.5: Confirmation page shows code secret

**Epic 3 (Stories 3.1-3.6) Completed:**
- [ ] Story 3.1: Published threads display correctly
- [ ] Story 3.2: Category filtering works
- [ ] Story 3.3: Sensitive content blurred by default
- [ ] Story 3.4: Reveal/blur toggle functional
- [ ] Story 3.5: Thread detail page with replies
- [ ] Story 3.6: NO social metrics visible

**End-to-End Flow Validated:**
- [ ] Anonymous user can post → see confirmation → retrieve session via code
- [ ] Email user can signup → post → see thread published (after moderation)
- [ ] Moderation via SQL working smoothly (temporary Phase 1 solution)

**Technical Quality:**
- [ ] 0 TypeScript errors
- [ ] Test coverage >80% on critical paths
- [ ] Accessibility WCAG 2.1 AA validated (NFR7)
- [ ] Performance: Pages load <2s (NFR5)
- [ ] Security: Rate limiting active, no secrets exposed (NFR1-NFR4)

---

### Phase 2 Definition of Done

**Epic 5.1 Simplified Completed:**
- [ ] `/admin/moderation` accessible avec auth RBAC
- [ ] Liste threads pending avec pagination
- [ ] View modal displays full content (read-only)
- [ ] Approve/Reject working avec DB updates
- [ ] Mark Sensitive functional
- [ ] Rejection reason required & stored
- [ ] Toast notifications for all actions (AR23)

**Moderation Workflow Validated:**
- [ ] Moderator can process 10 threads in <5 minutes
- [ ] Actions reflect immediately dans user UI (AR24)
- [ ] Rejected threads show reason to author (if logged)

**Technical Quality:**
- [ ] All server functions protected by auth (AR29)
- [ ] Actions logged for audit
- [ ] No performance degradation
- [ ] Mobile-responsive (desktop-first OK)

---

### Full MVP Definition of Done

- [ ] Phase 1 DoD ✅
- [ ] Phase 2 DoD ✅
- [ ] **User Acceptance Testing:**
  - [ ] 5-10 beta users test posting flow
  - [ ] Feedback collected & critical bugs fixed
  - [ ] Moderator (Dev-linux) validates dashboard usability
- [ ] **Deployment Ready:**
  - [ ] Environment variables configured
  - [ ] Database migrations run successfully
  - [ ] Monitoring/logging setup (basic)
  - [ ] Backup strategy documented
- [ ] **Documentation:**
  - [ ] README updated with setup instructions
  - [ ] Moderation guidelines documented
  - [ ] Known limitations listed
  - [ ] Roadmap for v1.1 (Epic 4, 5 extensions, 6) documented

---

## Success Metrics (MVP)

### Primary Metrics

1. **Time to First Post (GTM Critical):**
   - Target: <3 minutes from landing to post submitted
   - Measure: Analytics event timestamps
   - Success: 80% users achieve <3min

2. **User Adoption:**
   - Target: 50 posts published in 6 weeks
   - Measure: `SELECT COUNT(*) FROM threads WHERE status='published'`
   - Success: ≥50 posts

3. **Code Secret Adoption:**
   - Target: 20% anonymous users save their code
   - Measure: Track code generation events (Story 1.2)
   - Success: ≥20% adoption rate

4. **Moderation Efficiency (Phase 2):**
   - Target: <2 hours average moderation time
   - Measure: `moderated_at - created_at` average
   - Success: Avg <2h during business hours

### Secondary Metrics

- User return rate: >30%
- Content quality: <5% posts rejected
- Security: 0 data breaches (NFR1)
- Performance: 99.9% uptime (NFR9)

---

## Timeline Summary

### Optimistic Timeline (Full Focus)

```
Week 1:     Epic 1 complete (Stories 1.2-1.4)
Week 2:     Epic 2 complete (Stories 2.1-2.5)
Week 3:     Epic 3 complete (Stories 3.1-3.6)
Week 3-4:   Testing, bug fixes, end-to-end validation
Week 4:     Epic 5.1 Simplified (Dashboard admin)
---------------------------------------------------
Total:      4 weeks (20 business days)
```

### Realistic Timeline (with interruptions)

```
Week 1-2:   Epic 1 complete
Week 2-3:   Epic 2 complete
Week 4-5:   Epic 3 complete
Week 5-6:   Testing, bug fixes, user testing
Week 6-7:   Epic 5.1 + final polish
---------------------------------------------------
Total:      6-7 weeks
```

### Current Progress

```
✅ Sprint 1 Started:        2026-01-07
✅ Story 1.1 Completed:     2026-01-07 (59 tests, 5 points)
🔨 Stories 1.2-1.4:         Ready for dev (13 points remaining)
📋 Epic 2-3:                Defined, ready after Epic 1
📋 Epic 5.1:                Defined, starts after Epic 1-3
```

**Estimated MVP Completion:** Mid-February 2026 (realistic timeline)

---

## Post-MVP Roadmap (v1.1+)

**See `epics-post-mvp.md` for complete details.**

### Immediately After MVP

1. **Epic 6: Conformité Légale** (Essential avant public launch)
   - Story 6.1: CGU
   - Story 6.2: Politique de Confidentialité
   - Story 6.3: Avertissements Sécurité
   - Estimated: 3-5 jours

2. **Epic 1 Extensions: Auth Completeness**
   - Story 1.5: Connexion/Déconnexion
   - Story 1.6: Suppression de Compte (RGPD)
   - Estimated: 3 jours

### v1.1 Features (Prioritized)

1. **Epic 4: Interactions Communautaire**
   - Story 4.1: Création de Réponses
   - Story 4.2: Signalement de Contenu
   - Estimated: 5 jours

2. **Epic 5 Extensions: Complete Moderation**
   - Stories 5.2-5.6
   - Estimated: 7-10 jours

---

## Key Documents & References

### Planning Documents
- **PRD (Fragmenté):** `_bmad-output/planning-artifacts/prd/index.md`
- **Architecture (Fragmenté):** `_bmad-output/planning-artifacts/architecture/index.md`
- **UX Design:** `_bmad-output/planning-artifacts/ux-design-specification.md`
- **Implementation Readiness:** `_bmad-output/planning-artifacts/implementation-readiness-report-2026-01-22.md`
- **MVP Scope Final:** `_bmad-output/planning-artifacts/mvp-scope-final.md`
- **Post-MVP Epics:** `_bmad-output/planning-artifacts/epics-post-mvp.md`

### Implementation Guidance
- **CLAUDE.md:** Project instructions and conventions
- **Project Context:** `project-context.md`
- **Architecture Diagrams:** `docs/diagrams/`

---

## Approval & Sign-off

**Document Created:** 2026-01-22 (Refactored from v1.0)
**Created By:** John (PM Agent) + Dev-linux
**Status:** ✅ APPROVED FOR MVP IMPLEMENTATION

**Approved By:**
- [x] Dev-linux (Product Owner / Developer)
- [x] John (Product Manager Agent)

**Next Review:** After Phase 1 completion (Epic 1-3 done)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-06 | 1.0 | Initial epics document (all 6 epics) | John + Dev-linux |
| 2026-01-22 | 2.0 | **Refactored for MVP Scope** - Separated MVP (this doc) vs Post-MVP (`epics-post-mvp.md`), resolved 6 issues (code secret format XXXX-XXXX-XXXX, auto-save FR31, Story 1.1 DONE, brownfield clarification, Epic 5.1 Simplified, scope alignment) | John + Dev-linux |

---

**This document is the MVP source of truth. All Phase 1+2 implementation decisions reference this document. Post-MVP features are in `epics-post-mvp.md`.**
