---
stepsCompleted:
  [
    "step-01-validate-prerequisites",
    "step-02-design-epics",
    "step-03-create-stories",
    "step-04-final-validation",
  ]
inputDocuments:
  - "tss-explore-forum/_bmad-output/planning-artifacts/prd.md"
  - "tss-explore-forum/_bmad-output/planning-artifacts/architecture.md"
workflowCompleted: true
completedAt: "2026-01-06"
archived: true
archivedAt: "2026-01-22"
archiveReason: "Refactored into epics-mvp.md and epics-post-mvp.md to align with mvp-scope-final.md"
replacedBy:
  - "epics-mvp.md (Phase 1 + Phase 2: Stories 1.1-1.4, 2.1-2.5, 3.1-3.6, 5.1 Simplified)"
  - "epics-post-mvp.md (v1.1+: Stories 1.5-1.6, 4.1-4.2, 5.2-5.6, 6.1-6.3)"
issuesIdentified:
  - "Code secret format inconsistency"
  - "Auto-save feature missing (FR31)"
  - "Story 1.1 status not updated (DONE)"
  - "Project initialization ambiguity (brownfield)"
  - "Epic 5.1 needed simplification"
  - "MVP scope divergence (included all 6 epics)"
---

# tss-explore-forum - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for tss-explore-forum, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR1 :** Un **utilisateur invité (comme Marie)** peut soumettre une publication sans créer de compte.
- **FR2 :** Un **utilisateur anonyme** peut recevoir un "code secret" unique après sa première publication.
- **FR3 :** Un **utilisateur anonyme** peut utiliser son "code secret" pour retrouver ses publications précédentes sur différents appareils.
- **FR4 :** Un **utilisateur (comme Thomas)** peut s'inscrire en utilisant un pseudonyme, un email et un mot de passe.
- **FR5 :** Un **utilisateur enregistré** peut se connecter et se déconnecter.
- **FR6 :** Un **utilisateur enregistré** peut supprimer son compte et toutes ses données associées.
- **FR7 :** Un **utilisateur** peut créer une nouvelle publication (un "post").
- **FR8 :** Un **utilisateur** peut choisir une catégorie visible pour sa publication parmi une liste prédéfinie.
- **FR9 :** Le **système** affiche un template de publication guidé basé sur la catégorie choisie.
- **FR10 :** Un **utilisateur** peut écrire et formater le contenu de sa publication.
- **FR11 :** Un **utilisateur** peut soumettre une publication pour modération.
- **FR12 :** Un **utilisateur** peut écrire une réponse à une publication existante.
- **FR13 :** Un **utilisateur** peut signaler une publication ou une réponse comme étant inappropriée.
- **FR14 :** Un **utilisateur** peut voir une liste de publications publiées.
- **FR15 :** Un **utilisateur** peut filtrer les publications par catégorie.
- **FR16 :** Le **système** affiche un avertissement pour le contenu sensible et le floute par défaut.
- **FR17 :** Un **utilisateur** peut choisir de "voir le contenu" pour révéler un message flouté.
- **FR18 :** Un **utilisateur** peut lire une publication et toutes ses réponses.
- **FR19 :** Le **système** n'affiche aucune métrique sociale (likes, nombre de vues, etc.).
- **FR20 :** Un **modérateur** peut voir un tableau de bord avec une file des messages en attente de validation.
- **FR21 :** Un **modérateur** peut voir une file des contenus signalés par la communauté.
- **FR22 :** Un **modérateur** peut lire le contenu d'un message en attente ou signalé.
- **FR23 :** Un **modérateur** peut **approuver** un message, le rendant public.
- **FR24 :** Un **modérateur** peut **rejeter** un message, qui ne sera pas publié.
- **FR25 :** Un **modérateur** peut **supprimer** une publication ou une réponse qui viole les règles.
- **FR26 :** Un **modérateur** peut marquer un message comme "sensible", ce qui déclenchera le floutage.
- **FR27 :** Un **modérateur** peut envoyer un avertissement standardisé à un utilisateur ayant enfreint les règles.
- **FR28 :** Un **utilisateur** peut consulter les Conditions Générales d'Utilisation (CGU).
- **FR29 :** Un **utilisateur** peut consulter la Politique de Confidentialité.
- **FR30 :** Le **système** affiche des avertissements clairs indiquant que la plateforme n'est pas un service d'urgence.

### NonFunctional Requirements

- **NFR1 - Sécurité - Confidentialité des Données :** Toutes les données des utilisateurs doivent être chiffrées au repos et en transit.
- **NFR2 - Sécurité - Principe de Moindre Privilège :** Les modérateurs ne peuvent que supprimer du contenu, jamais le modifier. L'accès à la base de données est strictement limité.
- **NFR3 - Sécurité - Anonymat :** Le système doit être conçu pour ne jamais exiger d'informations personnelles identifiables pour les parcours de crise.
- **NFR4 - Sécurité - Dépendances :** Toutes les dépendances logicielles devront être auditées régulièrement pour des failles de sécurité.
- **NFR5 - Performance - Temps de Réponse :** L'interaction pour commencer à écrire un message (parcours de Marie) doit se charger en moins de 2 secondes sur une connexion mobile standard.
- **NFR6 - Performance - Publication :** La soumission d'un post doit recevoir une confirmation du système en moins de 3 secondes.
- **NFR7 - Accessibilité - Standard :** L'application doit se conformer au minimum au standard WCAG 2.1 niveau AA.
- **NFR8 - Accessibilité - Tests :** L'application doit être testable et utilisable via la navigation au clavier et avec les principaux lecteurs d'écran.
- **NFR9 - Fiabilité - Disponibilité :** Le service doit viser un temps de disponibilité de 99.9%.
- **NFR10 - Fiabilité - Sauvegardes :** Des sauvegardes régulières de la base de données doivent être effectuées pour prévenir toute perte de données.
- **NFR11 - Scalability - MVP :** Le système doit pouvoir gérer confortablement les 20+ utilisateurs actifs et 50+ posts prévus dans les 6 premières semaines.
- **NFR12 - Scalability - Post-MVP :** L'architecture choisie devra permettre une mise à l'échelle pour supporter une croissance future.

### Additional Requirements

**Starter Template Requirements:**

- **AR1:** Initialize project using TanStack Start RC with strict TypeScript configuration
- **AR2:** Use `pnpx create tanstack-start@latest` for project initialization
- **AR3:** Configure Shadcn UI components with `pnpx shadcn@latest add button` pattern

**Database & ORM Requirements:**

- **AR4:** PostgreSQL database with native encryption and complex relations support
- **AR5:** Drizzle ORM with type-safe migrations and query performance optimization
- **AR6:** Zod validation schemas unified between client and server
- **AR7:** Standard entity columns pattern with id, createdAt, updatedAt, deletedAt fields
- **AR8:** Soft delete implementation using deletedAt for moderatable content

**Authentication Architecture Requirements:**

- **AR9:** Better-Auth implementation with anonymous plugin support
- **AR10:** Anonymous authentication via `authClient.signIn.anonymous()`
- **AR11:** Anonymous userId as user-visible "code secret"
- **AR12:** Email registration via `authClient.signUp.email()`
- **AR13:** Account linking with `onLinkAccount` callback for anonymous to registered migration
- **AR14:** Role-based access control (user/moderator/admin)

**Infrastructure & Deployment Requirements:**

- **AR15:** VPS Hetzner hosting for EU data compliance and cost optimization
- **AR16:** Dokploy deployment platform with GitHub integration
- **AR17:** Docker containerization with zero-downtime deployment
- **AR18:** PostgreSQL containerized via Dokploy with automated backups
- **AR19:** Traefik proxy with automatic SSL/Let's Encrypt certificates
- **AR20:** Monitoring via Dokploy dashboard and application logs

**Development Patterns & Standards:**

- **AR21:** Feature structure pattern: `/features/{entity}/` organization
- **AR22:** Server function naming: `{action}{Entity}Fn` pattern
- **AR23:** TanStack Form for all form implementations
- **AR24:** Toast notifications for user feedback
- **AR25:** Router invalidation after mutations
- **AR26:** Alias system for all posts/comments to maintain anonymity
- **AR27:** WCAG 2.1 AA compliance for accessibility
- **AR28:** Mobile-first responsive design approach

**Admin Interface Requirements:**

- **AR29:** Separate moderation dashboard with sidebar navigation
- **AR30:** Sidebar structure: moderation queue, flagged content, user management, statistics, settings
- **AR31:** Strict RBAC enforcement on server functions
- **AR32:** UI separation between user and admin interfaces

### FR Coverage Map

FR1: Epic 1 - Utilisateur invité peut soumettre publication sans compte
FR2: Epic 1 - Utilisateur anonyme reçoit "code secret" unique
FR3: Epic 1 - Utilisateur anonyme peut retrouver publications via "code secret"
FR4: Epic 1 - Utilisateur peut s'inscrire avec pseudonyme/email/mot de passe
FR5: Epic 1 - Utilisateur enregistré peut se connecter/déconnecter
FR6: Epic 1 - Utilisateur enregistré peut supprimer compte et données
FR7: Epic 2 - Utilisateur peut créer nouvelle publication
FR8: Epic 2 - Utilisateur peut choisir catégorie pour publication
FR9: Epic 2 - Système affiche template guidé basé sur catégorie
FR10: Epic 2 - Utilisateur peut écrire et formater contenu publication
FR11: Epic 2 - Utilisateur peut soumettre publication pour modération
FR12: Epic 4 - Utilisateur peut écrire réponse à publication existante
FR13: Epic 4 - Utilisateur peut signaler publication/réponse inappropriée
FR14: Epic 3 - Utilisateur peut voir liste publications publiées
FR15: Epic 3 - Utilisateur peut filtrer publications par catégorie
FR16: Epic 3 - Système affiche avertissement et floute contenu sensible
FR17: Epic 3 - Utilisateur peut choisir "voir contenu" pour révéler message flouté
FR18: Epic 3 - Utilisateur peut lire publication et toutes réponses
FR19: Epic 3 - Système n'affiche aucune métrique sociale
FR20: Epic 5 - Modérateur peut voir tableau de bord avec file messages en attente
FR21: Epic 5 - Modérateur peut voir file contenus signalés par communauté
FR22: Epic 5 - Modérateur peut lire contenu message en attente ou signalé
FR23: Epic 5 - Modérateur peut approuver message le rendant public
FR24: Epic 5 - Modérateur peut rejeter message qui ne sera pas publié
FR25: Epic 5 - Modérateur peut supprimer publication/réponse violant règles
FR26: Epic 5 - Modérateur peut marquer message comme "sensible" déclenchant floutage
FR27: Epic 5 - Modérateur peut envoyer avertissement standardisé à utilisateur
FR28: Epic 6 - Utilisateur peut consulter Conditions Générales d'Utilisation
FR29: Epic 6 - Utilisateur peut consulter Politique de Confidentialité
FR30: Epic 6 - Système affiche avertissements clairs que plateforme n'est pas service d'urgence

## Epic List

### Epic 1: Fondations d'Authentification Anonyme

Les utilisateurs peuvent participer de manière anonyme ou créer un compte selon leur confort, permettant un premier contact sécurisé et flexible pour utilisateurs vulnérables.
**FRs couverts:** FR1, FR2, FR3, FR4, FR5, FR6

### Epic 2: Création et Soumission de Contenu

Les utilisateurs peuvent exprimer leurs expériences via des publications guidées, offrant une expression sécurisée avec guidance appropriée selon la catégorie choisie.
**FRs couverts:** FR7, FR8, FR9, FR10, FR11

### Epic 3: Découverte et Consommation Sécurisée

Les utilisateurs peuvent consulter du contenu avec protection appropriée, incluant filtrage par catégorie et contrôles de sécurité émotionnelle avec floutage du contenu sensible.
**FRs couverts:** FR14, FR15, FR16, FR17, FR18, FR19

### Epic 4: Interactions et Signalement Communautaire

Les utilisateurs peuvent interagir de manière respectueuse et signaler les problèmes, permettant une participation communautaire sécurisée avec mécanismes de protection.
**FRs couverts:** FR12, FR13

### Epic 5: Modération et Administration Professionnelle

Les modérateurs peuvent maintenir un espace sûr et gérer le contenu via un dashboard complet, assurant un espace sécurisé et bien modéré pour tous les utilisateurs.
**FRs couverts:** FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27

### Epic 6: Conformité et Transparence Légale

Les utilisateurs ont accès aux informations légales et aux avertissements de sécurité, établissant la confiance et la transparence réglementaire nécessaire.
**FRs couverts:** FR28, FR29, FR30

## Epic 1: Fondations d'Authentification Anonyme

Les utilisateurs peuvent participer de manière anonyme ou créer un compte selon leur confort, permettant un premier contact sécurisé et flexible pour utilisateurs vulnérables.

### Story 1.1: Session Anonyme Immédiate

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

### Story 1.2: Code Secret pour Utilisateur Anonyme

As a **utilisateur anonyme**,
I want **recevoir un code secret unique après ma première publication**,
So that **je puisse retrouver mes contenus plus tard sans révéler mon identité**.

**Acceptance Criteria:**

**Given** j'ai soumis ma première publication en mode anonyme
**When** la publication est envoyée pour modération
**Then** le système génère un code secret unique de 8-12 caractères
**And** le code secret est affiché clairement avec instructions de sauvegarde
**And** le code est associé à mon userId anonyme dans la base de données
**And** le code secret respecte les exigences d'anonymat (NFR3)

**Given** mon code secret est généré
**When** je consulte l'écran de confirmation
**Then** des instructions claires expliquent comment utiliser le code
**And** je peux copier le code facilement
**And** un avertissement indique l'importance de sauvegarder le code

### Story 1.3: Récupération via Code Secret

As a **utilisateur anonyme avec code secret**,
I want **pouvoir me reconnecter avec mon code secret sur n'importe quel appareil**,
So that **je puisse suivre mes publications et continuer mes interactions**.

**Acceptance Criteria:**

**Given** j'ai un code secret valide d'une session précédente
**When** je saisis mon code secret sur la page de connexion anonyme
**Then** le système me reconnecte à ma session anonyme
**And** je retrouve l'accès à toutes mes publications précédentes
**And** je peux créer de nouvelles publications sous la même identité anonyme

**Given** je saisis un code secret invalide ou inexistant
**When** je tente de me connecter
**Then** le système affiche un message d'erreur clair et bienveillant
**And** aucune information sur la validité des codes n'est révélée
**And** je peux réessayer ou créer une nouvelle session anonyme

### Story 1.4: Inscription avec Email/Pseudonyme

As a **utilisateur (comme Thomas) voulant un compte permanent**,
I want **créer un compte avec pseudonyme et email**,
So that **j'aie un accès plus stable et des fonctionnalités étendues**.

**Acceptance Criteria:**

**Given** je choisis de créer un compte permanent
**When** j'accède au formulaire d'inscription
**Then** je peux saisir un pseudonyme, email et mot de passe
**And** la validation Zod vérifie la sécurité des données côté client et serveur
**And** le système valide l'unicité du pseudonyme et email

**Given** j'ai des publications anonymes existantes
**When** je m'inscris avec un email
**Then** le système propose de lier mes publications anonymes au nouveau compte
**And** le callback `onLinkAccount` migre automatiquement mes contenus
**And** mon code secret devient optionnel mais reste fonctionnel

**Given** mes données d'inscription sont valides
**When** je soumets le formulaire
**Then** mon compte est créé avec le rôle "user" par défaut
**And** je reçois une confirmation d'inscription
**And** toutes les données sont chiffrées selon NFR1

### Story 1.5: Connexion/Déconnexion Utilisateur

As a **utilisateur enregistré**,
I want **me connecter et me déconnecter facilement**,
So that **je puisse gérer ma session de manière sécurisée**.

**Acceptance Criteria:**

**Given** j'ai un compte valide créé
**When** je saisis mes identifiants corrects
**Then** le système me connecte via Better-Auth
**And** ma session JWT est créée et sécurisée
**And** je suis redirigé vers mon tableau de bord utilisateur

**Given** je suis connecté
**When** je clique sur "Déconnexion"
**Then** ma session est invalidée côté serveur
**And** tous les tokens locaux sont supprimés
**And** je suis redirigé vers la page d'accueil publique

**Given** je saisis des identifiants incorrects
**When** je tente de me connecter
**Then** le système affiche une erreur générique sécurisée
**And** aucune information spécifique sur l'échec n'est révélée
**And** je peux réessayer ou réinitialiser mon mot de passe

### Story 1.6: Suppression de Compte et Données

As a **utilisateur enregistré**,
I want **pouvoir supprimer définitivement mon compte et toutes mes données**,
So that **je puisse exercer mon droit à l'effacement des données**.

**Acceptance Criteria:**

**Given** je suis connecté à mon compte
**When** j'accède aux paramètres de suppression de compte
**Then** le système affiche clairement les conséquences de la suppression
**And** une confirmation en deux étapes est requise
**And** je dois saisir mon mot de passe pour confirmer

**Given** je confirme la suppression de mon compte
**When** le processus de suppression s'exécute
**Then** toutes mes données personnelles sont supprimées de la base de données
**And** mes publications sont soit supprimées soit anonymisées selon les règles
**And** tous mes tokens et sessions sont invalidés immédiatement

**Given** ma suppression est terminée
**When** je tente de me reconnecter avec mes anciens identifiants
**Then** le système indique que le compte n'existe plus
**And** aucune trace de mes données personnelles n'est accessible
**And** le processus respecte les exigences RGPD et de confidentialité

## Epic 2: Création et Soumission de Contenu

Les utilisateurs peuvent exprimer leurs expériences via des publications guidées, offrant une expression sécurisée avec guidance appropriée selon la catégorie choisie.

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
**And** la validation Zod s'exécute en temps réel côté client
**And** le format encourage l'expression tout en respectant la sécurité

### Story 2.3: Éditeur de Contenu avec Formatage

As a **utilisateur en train de rédiger**,
I want **pouvoir écrire et formater le contenu de ma publication**,
So that **je puisse exprimer clairement ma situation avec la mise en forme appropriée**.

**Acceptance Criteria:**

**Given** je suis dans l'éditeur de contenu
**When** je tape mon message
**Then** je peux utiliser un formatage de base (gras, italique, listes)
**And** l'éditeur supporte le markdown simple et sécurisé
**And** la validation côté client empêche l'injection de contenu malveillant
**And** l'interface reste simple et accessible (WCAG 2.1 AA)

**Given** je rédige un contenu long
**When** je tape dans l'éditeur
**Then** le texte se sauvegarde automatiquement en local
**And** un indicateur de progression/caractères est visible
**And** l'éditeur reste réactif et mobile-friendly

**Given** j'ai fini de rédiger mon contenu
**When** je révise ma publication
**Then** je peux prévisualiser le rendu final
**And** je peux retourner en édition si nécessaire
**And** tous les champs requis sont validés avant soumission

### Story 2.4: Soumission pour Modération

As a **utilisateur ayant terminé sa publication**,
I want **soumettre ma publication pour validation**,
So that **mon contenu soit révisé avant publication selon les règles de sécurité**.

**Acceptance Criteria:**

**Given** ma publication est complète et validée
**When** je clique sur "Soumettre pour modération"
**Then** le système envoie ma publication dans la queue de modération
**And** un enregistrement est créé avec le statut "en_attente"
**And** la soumission respecte la limite de 3 secondes (NFR6)

**Given** ma soumission est traitée côté serveur
**When** le processus de sauvegarde s'exécute
**Then** la publication est liée à mon userId (anonyme ou enregistré)
**And** toutes les données sont chiffrées selon NFR1
**And** les server functions TanStack gèrent la logique sensible
**And** la validation Zod côté serveur vérifie la sécurité des données

**Given** la soumission est réussie
**When** la confirmation est renvoyée
**Then** je vois un message de confirmation clair et rassurant
**And** je reçois des informations sur les délais de modération
**And** mon code secret est affiché/rappelé si je suis anonyme (FR2)

### Story 2.5: Confirmation et Suivi de Statut

As a **utilisateur ayant soumis une publication**,
I want **pouvoir suivre le statut de ma publication**,
So that **je sache quand mon contenu sera publié ou si des modifications sont nécessaires**.

**Acceptance Criteria:**

**Given** j'ai soumis une publication pour modération
**When** j'accède à mon tableau de bord personnel
**Then** je peux voir le statut actuel de mes publications
**And** les statuts possibles sont clairement indiqués (en_attente, approuvé, rejeté)
**And** je peux filtrer mes publications par statut

**Given** ma publication change de statut
**When** un modérateur traite ma soumission
**Then** le statut est mis à jour en temps réel dans la base de données
**And** si rejetée, un message d'explication bienveillant est fourni
**And** si approuvée, ma publication devient visible publiquement

**Given** je suis un utilisateur anonyme avec code secret
**When** je me reconnecte avec mon code
**Then** je retrouve l'historique complet de mes publications
**And** je peux voir leurs statuts actuels
**And** je peux créer de nouvelles publications sous la même identité anonyme

## Epic 3: Découverte et Consommation Sécurisée

Les utilisateurs peuvent consulter du contenu avec protection appropriée, incluant filtrage par catégorie et contrôles de sécurité émotionnelle avec floutage du contenu sensible.

### Story 3.1: Liste des Publications Publiées

As a **visiteur ou utilisateur de la plateforme**,
I want **voir une liste des publications approuvées et publiées**,
So that **je puisse découvrir du contenu pertinent et des expériences partagées**.

**Acceptance Criteria:**

**Given** je visite la page d'accueil ou de découverte
**When** la liste des publications se charge
**Then** seules les publications avec statut "approuvé" sont affichées
**And** les publications sont triées par ordre chronologique (plus récentes en premier)
**And** chaque publication affiche le titre, catégorie, et extrait sécurisé
**And** les informations personnelles des auteurs ne sont jamais révélées (anonymat respecté)

**Given** la liste contient de nombreuses publications
**When** je fais défiler la page
**Then** le système charge les publications par pagination/lazy loading
**And** les performances restent fluides sur mobile (NFR5)
**And** l'accessibilité clavier est maintenue (NFR8)

**Given** je consulte une publication dans la liste
**When** j'interagis avec l'élément
**Then** je peux cliquer pour lire la publication complète
**And** aucune métrique sociale n'est visible (pas de likes, vues, etc.) selon FR19
**And** l'interface reste calme et non-agressive

### Story 3.2: Filtrage par Catégorie

As a **utilisateur cherchant du contenu spécifique**,
I want **filtrer les publications par catégorie**,
So that **je puisse trouver des expériences similaires à la mienne**.

**Acceptance Criteria:**

**Given** je suis sur la page de découverte
**When** j'accède aux options de filtrage
**Then** toutes les catégories disponibles sont listées
**And** je peux sélectionner une ou plusieurs catégories
**And** le nombre de publications par catégorie est affiché si pertinent

**Given** j'ai sélectionné une catégorie spécifique
**When** j'applique le filtre
**Then** seules les publications de cette catégorie sont affichées
**And** l'URL est mise à jour pour permettre le partage/bookmark du filtre
**And** je peux facilement revenir à la vue complète
**And** le filtrage se fait côté serveur pour optimiser les performances

**Given** une catégorie n'a aucune publication
**When** je sélectionne cette catégorie
**Then** un message bienveillant indique qu'aucun contenu n'est disponible
**And** des suggestions d'autres catégories sont proposées
**And** je peux facilement naviguer vers d'autres sections

### Story 3.3: Avertissements et Floutage Contenu Sensible

As a **utilisateur consultant du contenu potentiellement sensible**,
I want **être averti et voir le contenu flouté par défaut**,
So that **je puisse me préparer émotionnellement avant de lire des expériences difficiles**.

**Acceptance Criteria:**

**Given** une publication est marquée comme "sensible" par un modérateur
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
**And** l'implémentation respecte les standards d'accessibilité

### Story 3.4: Révélation Contrôlée du Contenu

As a **utilisateur face à du contenu flouté/sensible**,
I want **pouvoir choisir consciemment de voir le contenu**,
So that **je garde le contrôle sur mon exposition aux expériences difficiles**.

**Acceptance Criteria:**

**Given** je vois une publication avec contenu flouté/sensible
**When** je décide de révéler le contenu
**Then** un bouton clair "Voir le contenu" ou équivalent est disponible
**And** le bouton est accessible via navigation clavier (WCAG 2.1 AA)
**And** un clic révèle progressivement le contenu sans brutalité

**Given** j'ai cliqué pour révéler le contenu
**When** le contenu se dévoile
**Then** le floutage disparaît graduellement
**And** je peux re-masquer le contenu si nécessaire
**And** mon choix est respecté lors de la navigation dans la même session
**And** aucune donnée personnelle sur mes préférences n'est stockée de manière identifiable

**Given** je révèle du contenu sensible
**When** je lis la publication
**Then** des ressources d'aide restent accessibles en bas de page
**And** je peux facilement retourner à la liste ou naviguer ailleurs
**And** l'expérience reste respectueuse et soutenante

### Story 3.5: Lecture Complète avec Réponses

As a **utilisateur intéressé par une publication**,
I want **lire la publication complète ainsi que toutes ses réponses**,
So that **je puisse comprendre l'expérience complète et les interactions communautaires**.

**Acceptance Criteria:**

**Given** je clique sur une publication depuis la liste
**When** la page de lecture complète se charge
**Then** je vois le contenu intégral de la publication
**And** toutes les réponses approuvées sont affichées en dessous
**And** les réponses sont triées chronologiquement
**And** l'anonymat des auteurs est préservé pour publications et réponses

**Given** la publication a de nombreuses réponses
**When** je consulte la page
**Then** les réponses peuvent être paginées si nécessaire
**And** je peux naviguer facilement entre les réponses
**And** l'interface reste lisible et accessible sur mobile
**And** les performances de chargement restent optimales

**Given** une réponse est également marquée comme sensible
**When** je consulte les réponses
**Then** les mêmes règles de floutage s'appliquent aux réponses
**And** je peux révéler chaque réponse individuellement
**And** la cohérence UX est maintenue entre publications et réponses

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
**And** les modèles de données n'incluent pas de champs pour ces métriques
**And** l'architecture respecte cette philosophie dès la conception

## Epic 4: Interactions et Signalement Communautaire

Les utilisateurs peuvent interagir de manière respectueuse et signaler les problèmes, permettant une participation communautaire sécurisée avec mécanismes de protection.

### Story 4.1: Création de Réponses aux Publications

As a **utilisateur connecté voulant interagir avec une publication**,
I want **pouvoir écrire une réponse respectueuse à une publication existante**,
So that **je puisse partager mon soutien, mon expérience ou des conseils bienveillants**.

**Acceptance Criteria:**

**Given** je lis une publication qui me touche ou m'inspire
**When** je choisis de répondre à cette publication
**Then** un formulaire de réponse s'affiche en bas de la publication
**And** le formulaire utilise les mêmes principes de sécurité que pour les publications
**And** la validation Zod empêche l'injection de contenu malveillant
**And** l'interface encourage la bienveillance et le respect

**Given** je rédige une réponse
**When** je tape dans le formulaire
**Then** des conseils pour une communication respectueuse sont visibles
**And** l'éditeur supporte le formatage de base (markdown sécurisé)
**And** ma réponse est automatiquement liée à ma session (anonyme ou enregistrée)
**And** je peux prévisualiser ma réponse avant soumission

**Given** ma réponse est complète et respectueuse
**When** je soumets ma réponse
**Then** elle est envoyée dans la queue de modération comme les publications
**And** le processus respecte la limite de 3 secondes (NFR6)
**And** ma réponse est associée à la publication parent dans la base de données
**And** je reçois une confirmation de soumission rassurante

**Given** ma réponse est approuvée par un modérateur
**When** elle devient publique
**Then** elle s'affiche sous la publication concernée
**And** l'anonymat est préservé selon les mêmes règles que les publications
**And** elle peut être signalée par d'autres utilisateurs si nécessaire

### Story 4.2: Signalement de Contenu Inapproprié

As a **utilisateur consultant du contenu**,
I want **pouvoir signaler facilement du contenu inapproprié ou préoccupant**,
So that **les modérateurs puissent maintenir un espace sûr pour tous**.

**Acceptance Criteria:**

**Given** je consulte une publication ou réponse qui semble inappropriée
**When** je cherche à la signaler
**Then** un bouton discret "Signaler" est accessible près du contenu
**And** le bouton respecte l'accessibilité (navigation clavier, lecteurs d'écran)
**And** l'action de signalement ne révèle pas mon identité à l'auteur
**And** l'interface reste calme et non-agressive

**Given** je clique sur "Signaler"
**When** le formulaire de signalement s'ouvre
**Then** une liste de raisons prédéfinies est proposée
**And** je peux ajouter un commentaire optionnel et respectueux
**And** les raisons couvrent les violations principales (harcèlement, contenu dangereux, spam)
**And** un avertissement rappelle l'importance de signalements légitimes

**Given** je soumets un signalement
**When** le système traite ma demande
**Then** le signalement est ajouté à la queue des modérateurs
**And** le contenu signalé est marqué dans la base de données
**And** aucune action automatique n'est prise sur le contenu
**And** je reçois une confirmation que mon signalement sera examiné

**Given** plusieurs utilisateurs signalent le même contenu
**When** les signalements s'accumulent
**Then** les modérateurs voient le nombre total de signalements
**And** le contenu peut être temporairement masqué si un seuil critique est atteint
**And** tous les signalements sont conservés pour analyse par les modérateurs
**And** le système empêche les signalements abusifs répétés du même utilisateur

## Epic 5: Modération et Administration Professionnelle

Les modérateurs peuvent maintenir un espace sûr et gérer le contenu via un dashboard complet, assurant un espace sécurisé et bien modéré pour tous les utilisateurs.

### Story 5.1: Dashboard Modérateur avec Queue de Messages

As a **modérateur connecté avec rôles appropriés**,
I want **accéder à un tableau de bord avec une file des messages en attente de validation**,
So that **je puisse examiner et traiter efficacement tous les contenus soumis**.

**Acceptance Criteria:**

**Given** je suis connecté avec le rôle "moderator" ou "admin"
**When** j'accède au dashboard de modération
**Then** je vois une interface d'administration séparée de l'interface utilisateur
**And** une sidebar de navigation affiche les sections principales
**And** la queue de modération affiche tous les messages avec statut "en_attente"
**And** l'authentification RBAC vérifie mes permissions via server functions

**Given** la queue contient des messages en attente
**When** je consulte la liste
**Then** chaque message affiche la date, catégorie, et extrait sécurisé
**And** je peux trier par date, catégorie, ou type de contenu (publication/réponse)
**And** un compteur indique le nombre total de messages en attente
**And** l'interface respecte les principes d'accessibilité (WCAG 2.1 AA)

**Given** je clique sur un message pour l'examiner
**When** la vue détaillée s'ouvre
**Then** je vois le contenu complet sans révéler l'identité de l'auteur
**And** les informations contextuelles (catégorie, date) sont affichées
**And** les actions de modération sont accessibles (approuver/rejeter)
**And** je peux naviguer facilement entre les messages de la queue

### Story 5.2: Gestion des Contenus Signalés

As a **modérateur responsable de la sécurité communautaire**,
I want **voir et traiter une file des contenus signalés par la communauté**,
So that **je puisse réagir rapidement aux violations signalées par les utilisateurs**.

**Acceptance Criteria:**

**Given** des utilisateurs ont signalé du contenu
**When** j'accède à la section "Contenus Signalés" du dashboard
**Then** tous les contenus ayant reçu des signalements sont listés
**And** le nombre de signalements par contenu est visible
**And** la nature des signalements (harcèlement, contenu dangereux, etc.) est affichée
**And** les contenus sont triés par priorité/nombre de signalements

**Given** je consulte un contenu signalé
**When** j'ouvre la vue détaillée
**Then** je vois le contenu original et tous les signalements avec leurs raisons
**And** l'historique des actions de modération précédentes est visible
**And** je peux lire les commentaires anonymisés des utilisateurs signaleurs
**And** le contexte complet (publication parent, réponses) est accessible

**Given** un contenu accumule des signalements critiques
**When** le seuil de signalements est atteint
**Then** le contenu peut être automatiquement masqué temporairement
**And** une notification prioritaire m'alerte de la situation
**And** je peux rapidement confirmer ou infirmer le masquage automatique
**And** toutes ces actions sont auditées dans les logs

### Story 5.3: Actions de Modération (Approuver/Rejeter/Supprimer)

As a **modérateur examinant du contenu**,
I want **pouvoir approuver, rejeter, ou supprimer des publications et réponses**,
So that **je puisse faire respecter les règles communautaires de manière cohérente**.

**Acceptance Criteria:**

**Given** j'examine un message en attente de validation
**When** je décide de l'approuver
**Then** le statut passe à "approuvé" et le contenu devient public
**And** l'auteur peut voir sa publication publiée dans l'interface utilisateur
**And** la publication apparaît dans les flux de découverte appropriés
**And** l'action est enregistrée dans les logs d'audit avec timestamp

**Given** j'examine un contenu problématique
**When** je décide de le rejeter
**Then** le statut passe à "rejeté" et le contenu n'est jamais publié
**And** l'auteur voit un message d'explication bienveillant sur le refus
**And** le contenu reste stocké pour audit mais n'est jamais visible publiquement
**And** je peux sélectionner une raison prédéfinie pour le rejet

**Given** du contenu publié viole les règles après publication
**When** je décide de le supprimer
**Then** le contenu disparaît immédiatement de toutes les interfaces publiques
**And** l'auteur est notifié de la suppression avec explication
**And** le contenu est soft-deleted (deletedAt) pour audit et pas hard-deleted
**And** les réponses liées peuvent être supprimées en cascade si nécessaire

**Given** j'effectue n'importe quelle action de modération
**When** l'action est traitée
**Then** elle respecte le principe de moindre privilège (NFR2)
**And** toutes les actions passent par des server functions sécurisées
**And** l'interface me confirme le succès/échec de l'action
**And** je peux annuler certaines actions si approprié

### Story 5.4: Marquage de Contenu Sensible

As a **modérateur évaluant la sensibilité du contenu**,
I want **pouvoir marquer des messages comme "sensibles" pour déclencher le floutage**,
So that **les utilisateurs soient protégés émotionnellement sans censurer le contenu**.

**Acceptance Criteria:**

**Given** j'examine un contenu qui peut être émotionnellement difficile
**When** je décide qu'il mérite un avertissement de contenu sensible
**Then** je peux marquer le contenu comme "sensible" avec un simple clic
**And** une interface me permet de spécifier le type de sensibilité
**And** le contenu reste approuvé mais se comporte comme "contenu sensible"
**And** l'action est immédiatement effective sur l'interface utilisateur

**Given** un contenu est marqué comme sensible
**When** les utilisateurs le consultent
**Then** le système applique automatiquement le floutage selon Epic 3
**And** les avertissements appropriés s'affichent
**And** les utilisateurs peuvent choisir de révéler le contenu
**And** le marquage n'affecte pas la visibilité générale du contenu

**Given** je révise un contenu précédemment marqué sensible
**When** je décide que le marquage n'est plus nécessaire
**Then** je peux retirer le marquage "sensible"
**And** le contenu redevient affiché normalement
**And** toutes les modifications de sensibilité sont auditées
**And** l'interface permet de voir l'historique des changements de statut

### Story 5.5: Système d'Avertissements aux Utilisateurs

As a **modérateur maintenant la qualité communautaire**,
I want **pouvoir envoyer des avertissements standardisés aux utilisateurs ayant enfreint les règles**,
So that **je puisse éduquer sans bannir et maintenir un dialogue constructif**.

**Acceptance Criteria:**

**Given** un utilisateur a violé les règles de manière mineure
**When** je décide d'envoyer un avertissement éducatif
**Then** je peux sélectionner parmi des templates d'avertissement prédéfinis
**And** les templates couvrent les violations courantes avec un ton bienveillant
**And** je peux personnaliser le message tout en gardant l'esprit constructif
**And** l'avertissement reste respectueux et orienté vers l'amélioration

**Given** j'envoie un avertissement à un utilisateur
**When** l'avertissement est délivré
**Then** l'utilisateur le reçoit via son tableau de bord personnel
**And** l'avertissement explique clairement la règle violée
**And** des ressources pour s'améliorer sont proposées
**And** l'utilisateur peut répondre ou poser des questions si nécessaire

**Given** un utilisateur accumule plusieurs avertissements
**When** je consulte son dossier de modération
**Then** l'historique complet des avertissements est visible
**And** je peux voir l'évolution du comportement dans le temps
**And** des escalations progressives sont suggérées si appropriées
**And** toutes les interactions sont documentées pour cohérence entre modérateurs

### Story 5.6: Interface d'Administration avec RBAC

As a **administrateur du système**,
I want **une interface d'administration complète avec contrôle d'accès par rôles**,
So that **je puisse gérer la plateforme de manière sécurisée avec les bonnes permissions**.

**Acceptance Criteria:**

**Given** je suis connecté avec le rôle "admin"
**When** j'accède au dashboard d'administration
**Then** la sidebar affiche toutes les sections : modération, utilisateurs, statistiques, paramètres
**And** chaque section vérifie mes permissions via RBAC strict
**And** l'interface est séparée complètement de l'interface utilisateur normale
**And** l'accès non-autorisé est bloqué au niveau des server functions

**Given** j'accède à la gestion des utilisateurs
**When** je consulte la liste des comptes
**Then** je peux voir les utilisateurs avec informations anonymisées appropriées
**And** je peux gérer les rôles (promouvoir un modérateur, révoquer des permissions)
**And** je peux voir l'historique des actions de chaque modérateur
**And** les actions sensibles nécessitent une confirmation supplémentaire

**Given** je consulte les statistiques et métriques
**When** j'accède aux tableaux de bord analytics
**Then** je vois des métriques sur la modération (messages traités, temps de réponse)
**And** des statistiques sur la santé communautaire sont disponibles
**And** aucune métrique sociale compétitive n'est présente (cohérence avec FR19)
**And** les données respectent l'anonymat et la confidentialité des utilisateurs

**Given** je configure les paramètres de la plateforme
**When** j'accède aux réglages système
**Then** je peux ajuster les seuils de modération automatique
**And** je peux gérer les catégories de publications et leurs templates
**And** je peux configurer les messages d'avertissement et templates
**And** tous les changements de configuration sont auditées et versionnées

## Epic 6: Conformité et Transparence Légale

Les utilisateurs ont accès aux informations légales et aux avertissements de sécurité, établissant la confiance et la transparence réglementaire nécessaire.

### Story 6.1: Pages Conditions Générales d'Utilisation

As a **utilisateur voulant comprendre mes droits et obligations**,
I want **consulter des Conditions Générales d'Utilisation claires et accessibles**,
So that **je puisse utiliser la plateforme en toute connaissance de cause**.

**Acceptance Criteria:**

**Given** je visite la plateforme en tant qu'utilisateur
**When** je cherche les informations légales
**Then** un lien "Conditions Générales d'Utilisation" est facilement accessible
**And** le lien est présent dans le footer et lors de l'inscription
**And** la page CGU se charge rapidement et est mobile-friendly
**And** le contenu respecte les standards d'accessibilité (WCAG 2.1 AA)

**Given** j'accède à la page des CGU
**When** je consulte le contenu
**Then** les conditions sont rédigées dans un langage clair et compréhensible
**And** les sections importantes sont bien structurées et navigables
**And** les droits et responsabilités des utilisateurs sont clairement définis
**And** les règles spécifiques au contenu sensible sont explicitées

**Given** les CGU mentionnent des aspects critiques
**When** je lis les sections sur la modération et l'anonymat
**Then** la politique de modération est transparente
**And** les garanties et limites de l'anonymat sont clairement expliquées
**And** les procédures de suppression de compte sont détaillées
**And** les droits RGPD sont respectés et expliqués

### Story 6.2: Politique de Confidentialité Accessible

As a **utilisateur soucieux de ma vie privée**,
I want **accéder à une Politique de Confidentialité complète et transparente**,
So that **je comprenne exactement comment mes données sont traitées et protégées**.

**Acceptance Criteria:**

**Given** je m'inquiète de la confidentialité de mes données
**When** je cherche la politique de confidentialité
**Then** un lien "Politique de Confidentialité" est clairement visible
**And** la politique est accessible depuis toutes les pages importantes
**And** le document est structuré de manière logique et compréhensible
**And** l'interface permet une navigation facile entre les sections

**Given** j'examine la politique de confidentialité
**When** je lis les sections sur la collecte de données
**Then** tous les types de données collectées sont listés explicitement
**And** les finalités de chaque collecte sont clairement expliquées
**And** les mesures de chiffrement et sécurité (NFR1) sont documentées
**And** les durées de conservation des données sont spécifiées

**Given** je consulte les droits des utilisateurs
**When** je lis les sections sur mes droits RGPD
**Then** mes droits d'accès, rectification, et suppression sont détaillés
**And** les procédures pour exercer ces droits sont clairement expliquées
**And** les délais de traitement des demandes sont indiqués
**And** les contacts pour les questions de confidentialité sont fournis

### Story 6.3: Avertissements de Sécurité et Limites du Service

As a **utilisateur potentiellement vulnérable consultante la plateforme**,
I want **voir des avertissements clairs que la plateforme n'est pas un service d'urgence**,
So that **je comprenne les limites du service et puisse chercher l'aide appropriée en cas de crise**.

**Acceptance Criteria:**

**Given** je visite la plateforme pour la première fois
**When** j'accède à la page d'accueil
**Then** un avertissement visible indique que la plateforme n'est pas un service d'urgence
**And** l'avertissement est affiché de manière bienveillante mais claire
**And** des numéros d'urgence appropriés sont fournis (ligne de crise, SAMU, etc.)
**And** l'avertissement respecte les principes d'UX empathique

**Given** je créé une publication dans une catégorie sensible
**When** j'utilise le formulaire de création
**Then** un rappel discret des limites du service est affiché
**And** des ressources d'aide professionnelle sont suggérées si appropriées
**And** le ton reste encourageant tout en étant responsable
**And** l'utilisateur n'est pas découragé de s'exprimer

**Given** je consulte du contenu potentiellement préoccupant
**When** je lis des publications sur des situations de crise
**Then** des ressources d'aide sont accessibles en bas de page
**And** les informations de contact des services d'urgence sont disponibles
**And** un disclaimer rappelle la nature d'entraide de la plateforme
**And** les ressources sont mises à jour et géographiquement appropriées

**Given** je suis un développeur implémentant ces avertissements
**When** je construis l'interface
**Then** les avertissements sont intégrés de manière cohérente dans l'UI
**And** ils n'interfèrent pas avec l'expérience utilisateur normale
**And** le contenu des avertissements est configurable via l'interface admin
**And** l'affichage respecte les exigences d'accessibilité et de performance
