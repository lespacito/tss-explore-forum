---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation", "step-05-post-mvp-extraction"]
mvpScope: "Post-MVP (v1.1+)"
dependsOn: "epics-mvp.md completion"
projectStatus: "brownfield"
totalStories: 10
epics:
  - id: 1
    name: "Authentification Anonyme (Extensions)"
    stories: [1.5, 1.6]
    priority: "high"
    version: "v1.1"
  - id: 4
    name: "Interactions et Signalement Communautaire"
    stories: [4.1, 4.2]
    priority: "high"
    version: "v1.1"
  - id: 5
    name: "Modération et Administration (Extensions)"
    stories: [5.2, 5.3, 5.4, 5.5, 5.6]
    priority: "medium"
    version: "v1.2"
  - id: 6
    name: "Conformité et Transparence Légale"
    stories: [6.1, 6.2, 6.3]
    priority: "critical"
    version: "v1.0 (pre-public-launch)"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd/index.md"
  - "_bmad-output/planning-artifacts/architecture/index.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/mvp-scope-final.md"
  - "_bmad-output/planning-artifacts/epics.md (original)"
workflowCompleted: true
completedAt: "2026-01-22"
---

# tss-explore-forum - Post-MVP Epic Breakdown (v1.1+)

## Document Purpose

Ce document contient les **epics et stories Post-MVP** qui seront implémentés après la validation du MVP (Phase 1 + Phase 2). Ces fonctionnalités étendent les capacités de base de la plateforme ParlonsViolence pour offrir une expérience complète et conforme.

**Source de Vérité MVP:** Référez-vous à `mvp-scope-final.md` pour le périmètre exact du MVP.

**Ordre d'Implémentation Recommandé:**

1. **v1.0 (Pre-Public Launch):** Epic 6 (Conformité Légale) - **CRITIQUE avant lancement public**
2. **v1.1 (Community Features):** Epic 1 Extensions + Epic 4 - Fonctionnalités communautaires
3. **v1.2 (Scale Moderation):** Epic 5 Extensions - Dashboard modération complet

---

## Requirements Inventory - Post-MVP

### Functional Requirements (Post-MVP)

**Epic 1 Extensions:**
- **FR5:** Un **utilisateur enregistré** peut se connecter et se déconnecter.
- **FR6:** Un **utilisateur enregistré** peut supprimer son compte et toutes ses données associées.

**Epic 4:**
- **FR12:** Un **utilisateur** peut écrire une réponse à une publication existante.
- **FR13:** Un **utilisateur** peut signaler une publication ou une réponse comme étant inappropriée.

**Epic 5 Extensions:**
- **FR21:** Un **modérateur** peut voir une file des contenus signalés par la communauté.
- **FR22:** Un **modérateur** peut lire le contenu d'un message en attente ou signalé.
- **FR23:** Un **modérateur** peut **approuver** un message, le rendant public.
- **FR24:** Un **modérateur** peut **rejeter** un message, qui ne sera pas publié.
- **FR25:** Un **modérateur** peut **supprimer** une publication ou une réponse qui viole les règles.
- **FR26:** Un **modérateur** peut marquer un message comme "sensible", ce qui déclenchera le floutage.
- **FR27:** Un **modérateur** peut envoyer un avertissement standardisé à un utilisateur ayant enfreint les règles.

**Epic 6:**
- **FR28:** Un **utilisateur** peut consulter les Conditions Générales d'Utilisation (CGU).
- **FR29:** Un **utilisateur** peut consulter la Politique de Confidentialité.
- **FR30:** Le **système** affiche des avertissements clairs indiquant que la plateforme n'est pas un service d'urgence.

### Non-Functional Requirements (All Phases)

Tous les NFRs (NFR1-NFR12) s'appliquent aux fonctionnalités Post-MVP:

- **NFR1-NFR4:** Sécurité (chiffrement, moindre privilège, anonymat, audit dépendances)
- **NFR5-NFR6:** Performance (chargement <2s, confirmation <3s)
- **NFR7-NFR8:** Accessibilité (WCAG 2.1 AA, navigation clavier)
- **NFR9-NFR10:** Fiabilité (99.9% uptime, sauvegardes régulières)
- **NFR11-NFR12:** Scalability (MVP 20+ utilisateurs, architecture évolutive)

### Additional Requirements (Relevant to Post-MVP)

**Authentication Extensions (Epic 1):**
- **AR12:** Email registration via `authClient.signUp.email()`
- **AR13:** Account linking with `onLinkAccount` callback for anonymous to registered migration
- **AR14:** Role-based access control (user/moderator/admin)

**Admin Interface (Epic 5):**
- **AR29:** Separate moderation dashboard with sidebar navigation
- **AR30:** Sidebar structure: moderation queue, flagged content, user management, statistics, settings
- **AR31:** Strict RBAC enforcement on server functions
- **AR32:** UI separation between user and admin interfaces

---

## Epic List - Post-MVP

### Epic 1 Extensions: Authentification Avancée (v1.1)

Permet aux utilisateurs enregistrés de gérer leurs sessions et leurs comptes, ajoutant flexibilité et contrôle RGPD.

**Stories:** 1.5, 1.6
**FRs couverts:** FR5, FR6
**Priority:** High (RGPD compliance pour FR6)

### Epic 4: Interactions et Signalement Communautaire (v1.1)

Les utilisateurs peuvent interagir via réponses et signaler du contenu inapproprié, créant une communauté auto-modérée et soutenante.

**Stories:** 4.1, 4.2
**FRs couverts:** FR12, FR13
**Priority:** High (Community engagement critical)

### Epic 5 Extensions: Modération Avancée (v1.2)

Dashboard modération complet avec gestion des signalements, actions avancées, et RBAC multi-niveaux pour scale moderation team.

**Stories:** 5.2, 5.3, 5.4, 5.5, 5.6
**FRs couverts:** FR21-FR27
**Priority:** Medium (nécessaire pour scale, mais gérable manuellement en MVP)

### Epic 6: Conformité et Transparence Légale (v1.0 - Pre-Public Launch)

Pages légales et avertissements de sécurité essentiels pour conformité RGPD et lancement public responsable.

**Stories:** 6.1, 6.2, 6.3
**FRs couverts:** FR28, FR29, FR30
**Priority:** CRITICAL (obligatoire avant lancement public)

---

## Epic 1 Extensions: Authentification Avancée

### Story 1.5: Connexion/Déconnexion Utilisateur

**Status:** 📋 Pending (v1.1)
**Story Points:** 3
**Priority:** High
**Dependencies:** Story 1.4 (Inscription Email) doit être complété

As a **utilisateur enregistré**,
I want **me connecter et me déconnecter facilement**,
So that **je puisse gérer ma session de manière sécurisée**.

#### Acceptance Criteria

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

#### Technical Notes

- Use Better-Auth `authClient.signIn.email()` for login
- Session tokens managed via Better-Auth JWT
- Implement rate limiting via Arcjet on login endpoint
- Error messages must not reveal if email exists (security)
- Redirect after login: `/dashboard` or original requested page
- Logout clears cookies + localStorage + invalidates session

#### Test Coverage

- Unit: Email/password validation logic
- Integration: Login/logout flow with database
- E2E: Full user journey from signup → login → logout
- Security: Rate limiting test, invalid credentials handling

---

### Story 1.6: Suppression de Compte et Données

**Status:** 📋 Pending (v1.1)
**Story Points:** 5
**Priority:** High (RGPD compliance)
**Dependencies:** Story 1.5 (Connexion) doit être complété

As a **utilisateur enregistré**,
I want **pouvoir supprimer définitivement mon compte et toutes mes données**,
So that **je puisse exercer mon droit à l'effacement des données**.

#### Acceptance Criteria

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

#### Technical Notes

**RGPD Compliance:**
- Right to erasure (Article 17)
- Complete data removal within 30 days
- Audit trail of deletion requests

**Data Handling:**
- User personal data: HARD DELETE (email, password, etc.)
- Posts/threads:
  - Option A: HARD DELETE if no replies
  - Option B: Anonymize (convert to anonymous user) if has replies
- Alias records: Mark as deleted but preserve for foreign key integrity
- Sessions: Invalidate all JWT tokens immediately

**Server Function Pattern:**
```typescript
// src/features/auth/server/delete-account.ts
export const deleteAccountFn = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .validator(z.object({ password: z.string(), confirmText: z.literal('DELETE') }))
  .handler(async ({ context, data }) => {
    // 1. Verify password
    // 2. Soft delete or anonymize posts
    // 3. Hard delete user personal data
    // 4. Invalidate all sessions
    // 5. Log action for audit
    // 6. Send confirmation email (if configured)
  });
```

**UI Flow:**
1. Settings page → "Delete Account" button
2. Warning modal with consequences list
3. Password confirmation field + "DELETE" text confirmation
4. Processing with loading state
5. Redirect to goodbye page with confirmation

#### Test Coverage

- Unit: Deletion logic for different data types
- Integration: Full deletion + anonymization flow
- Security: Password verification, session invalidation
- Compliance: Verify RGPD requirements met

---

## Epic 4: Interactions et Signalement Communautaire

### Story 4.1: Création de Réponses aux Publications

**Status:** 📋 Pending (v1.1)
**Story Points:** 5
**Priority:** High
**Dependencies:** Epic 3 (Lecture Publications) doit être complété

As a **utilisateur connecté voulant interagir avec une publication**,
I want **pouvoir écrire une réponse respectueuse à une publication existante**,
So that **je puisse partager mon soutien, mon expérience ou des conseils bienveillants**.

#### Acceptance Criteria

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

#### Technical Notes

**Database Schema:**
```typescript
// posts table (already exists)
posts: {
  id: uuid,
  threadId: uuid, // FK to threads
  aliasId: uuid, // FK to alias (NOT userId directly!)
  content: text,
  status: enum('pending', 'approved', 'rejected'),
  moderatedAt: timestamp,
  moderatedBy: string,
  isSensitive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp,
}
```

**Server Function Pattern:**
```typescript
// src/features/posts/server/create-post.ts
export const createPostFn = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .validator(createPostSchema.parse) // Zod schema
  .handler(async ({ context, data }) => {
    // 1. Get user's primary alias
    const alias = await getPrimaryAlias(context.user.id);

    // 2. Create post via alias (NOT userId!)
    const post = await db.insert(posts).values({
      threadId: data.threadId,
      aliasId: alias.id,
      content: sanitizeMarkdown(data.content),
      status: 'pending',
    });

    // 3. Return success
    return { success: true, postId: post.id };
  });
```

**UI Components:**
- Reply form at bottom of thread detail page
- Markdown editor with preview (similar to thread creation)
- Guideline box: "Soyez bienveillant et respectueux"
- Confirmation toast after submission
- "En attente de modération" badge on user's replies

#### Test Coverage

- Unit: Post creation logic, markdown sanitization
- Integration: Create post → moderation → approval → display
- E2E: Anonymous user replies to thread
- Security: XSS prevention, rate limiting

---

### Story 4.2: Signalement de Contenu Inapproprié

**Status:** 📋 Pending (v1.1)
**Story Points:** 3
**Priority:** High
**Dependencies:** Story 4.1 (Réponses) recommandé mais pas bloquant

As a **utilisateur consultant du contenu**,
I want **pouvoir signaler facilement du contenu inapproprié ou préoccupant**,
So that **les modérateurs puissent maintenir un espace sûr pour tous**.

#### Acceptance Criteria

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

#### Technical Notes

**Database Schema:**
```typescript
// reports table (new)
reports: {
  id: uuid,
  reporterUserId: uuid, // FK to user (anonymized to moderators)
  reportedContentType: enum('thread', 'post'),
  reportedContentId: uuid,
  reason: enum('harassment', 'dangerous_content', 'spam', 'other'),
  reasonDetails: text, // Optional user comment
  status: enum('pending', 'reviewed', 'dismissed'),
  reviewedBy: uuid, // FK to user (moderator)
  reviewedAt: timestamp,
  createdAt: timestamp,
}
```

**Server Function:**
```typescript
// src/features/moderation/server/create-report.ts
export const createReportFn = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .validator(createReportSchema.parse)
  .handler(async ({ context, data }) => {
    // 1. Check user hasn't already reported this content
    const existingReport = await checkDuplicateReport(
      context.user.id,
      data.contentId
    );
    if (existingReport) {
      throw new Error('Vous avez déjà signalé ce contenu');
    }

    // 2. Create report
    const report = await db.insert(reports).values({
      reporterUserId: context.user.id,
      reportedContentType: data.contentType,
      reportedContentId: data.contentId,
      reason: data.reason,
      reasonDetails: data.details,
      status: 'pending',
    });

    // 3. Check if auto-hide threshold reached
    const reportCount = await getReportCount(data.contentId);
    if (reportCount >= 5) { // Threshold configurable
      await autoHideContent(data.contentId);
    }

    return { success: true };
  });
```

**UI Flow:**
1. "Signaler" icon button next to content (three dots menu)
2. Modal with reason dropdown + optional comment textarea
3. Warning: "Signalements abusifs peuvent entraîner sanctions"
4. Submit → Confirmation toast: "Merci, votre signalement sera examiné"

**Report Reasons:**
- `harassment`: Harcèlement ou comportement abusif
- `dangerous_content`: Contenu dangereux ou incitation à la violence
- `spam`: Spam ou contenu non pertinent
- `other`: Autre raison (détails requis)

#### Test Coverage

- Unit: Report creation, duplicate detection, auto-hide threshold
- Integration: Report submission → moderator queue
- Security: Rate limiting, abuse prevention
- E2E: User reports thread → moderator sees in dashboard

---

## Epic 5 Extensions: Modération Avancée

### Story 5.2: Gestion des Contenus Signalés

**Status:** 📋 Pending (v1.2)
**Story Points:** 3
**Priority:** Medium
**Dependencies:** Story 4.2 (Signalement) + Story 5.1 (Dashboard basique)

As a **modérateur responsable de la sécurité communautaire**,
I want **voir et traiter une file des contenus signalés par la communauté**,
So that **je puisse réagir rapidement aux violations signalées par les utilisateurs**.

#### Acceptance Criteria

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

#### Technical Notes

**Dashboard Section:**
- New sidebar item: "Contenus Signalés" with count badge
- Table columns: Content Type, Title/Excerpt, # Reports, Status, Actions
- Priority sorting: Most reported first, then by date
- Filter by: Content type, report reason, status

**Server Function:**
```typescript
// src/features/moderation/server/get-reported-content.ts
export const getReportedContentFn = createServerFn({ method: 'GET' })
  .middleware([loggingMiddleware, authMiddleware, moderatorAuthMiddleware])
  .handler(async ({ context }) => {
    // Fetch threads/posts with status='pending' OR reportCount > 0
    const reportedContent = await db.query.reports.findMany({
      where: eq(reports.status, 'pending'),
      with: {
        thread: true,
        post: true,
        reporter: { columns: { id: true } }, // Anonymized
      },
      orderBy: [desc(reports.createdAt)],
    });

    return { reportedContent };
  });
```

**Auto-Hide Logic:**
- Threshold: 5 reports from distinct users
- Action: Set `isHidden: true` on content (temporary)
- Notification: Email/toast to moderators
- Reversible: Moderator can un-hide if false positive

---

### Story 5.3: Actions de Modération (Approuver/Rejeter/Supprimer)

**Status:** 📋 Pending (v1.2)
**Story Points:** 5
**Priority:** Medium
**Dependencies:** Story 5.1 (Dashboard basique)

As a **modérateur examinant du contenu**,
I want **pouvoir approuver, rejeter, ou supprimer des publications et réponses**,
So that **je puisse faire respecter les règles communautaires de manière cohérente**.

#### Acceptance Criteria

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

#### Technical Notes

**Enhanced from Story 5.1:**
- Story 5.1 provides basic approve/reject for pending threads
- Story 5.3 extends to:
  - Posts (replies) moderation
  - Bulk actions (approve/reject multiple)
  - Soft delete for published content
  - Rejection reasons + author notification
  - Cascade deletion options

**Rejection Reasons (predefined):**
- Contenu hors-sujet ou spam
- Langage inapproprié ou harcèlement
- Incitation à la violence
- Informations personnelles identifiables
- Autre (texte libre requis)

**Audit Trail:**
```typescript
// moderation_logs table (new)
moderationLogs: {
  id: uuid,
  moderatorId: uuid, // FK to user
  action: enum('approve', 'reject', 'delete', 'mark_sensitive'),
  contentType: enum('thread', 'post'),
  contentId: uuid,
  reason: text,
  timestamp: timestamp,
}
```

---

### Story 5.4: Marquage de Contenu Sensible

**Status:** 📋 Pending (v1.2)
**Story Points:** 2
**Priority:** Medium
**Dependencies:** Story 5.1 (Dashboard basique)

As a **modérateur évaluant la sensibilité du contenu**,
I want **pouvoir marquer des messages comme "sensibles" pour déclencher le floutage**,
So that **les utilisateurs soient protégés émotionnellement sans censurer le contenu**.

#### Acceptance Criteria

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

#### Technical Notes

**UI Element:**
- Toggle switch or checkbox: "Marquer comme sensible"
- Available in: Thread detail modal, Post detail modal
- Icon indicator when content is sensitive
- Tooltip: "Ce contenu sera flouté pour les utilisateurs"

**Sensitivity Types (optional, for future):**
- Violence explicite
- Abus/trauma
- Contenu médical sensible
- Autre

**Database Field:**
- `isSensitive: boolean` on threads and posts tables
- Already implemented in MVP schema

---

### Story 5.5: Système d'Avertissements aux Utilisateurs

**Status:** 📋 Pending (v1.2)
**Story Points:** 5
**Priority:** Medium
**Dependencies:** Story 5.1 (Dashboard) + Story 5.3 (Actions modération)

As a **modérateur maintenant la qualité communautaire**,
I want **pouvoir envoyer des avertissements standardisés aux utilisateurs ayant enfreint les règles**,
So that **je puisse éduquer sans bannir et maintenir un dialogue constructif**.

#### Acceptance Criteria

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

#### Technical Notes

**Database Schema:**
```typescript
// warnings table (new)
warnings: {
  id: uuid,
  userId: uuid, // FK to user
  moderatorId: uuid, // FK to user (moderator)
  contentId: uuid, // Related thread/post that triggered warning
  contentType: enum('thread', 'post'),
  reason: enum('inappropriate_language', 'harassment', 'off_topic', 'other'),
  message: text, // Customizable warning message
  acknowledgedAt: timestamp, // User acknowledged warning
  createdAt: timestamp,
}
```

**Warning Templates:**
1. **Langage Inapproprié:**
   > "Bonjour, nous avons remarqué que votre publication contenait un langage qui pourrait être offensant pour d'autres membres. Nous vous encourageons à reformuler vos messages de manière respectueuse."

2. **Hors Sujet:**
   > "Votre message semble sortir du cadre des discussions de notre communauté. Nous vous invitons à consulter nos directives communautaires."

3. **Comportement Inapproprié:**
   > "Nous avons reçu des signalements concernant votre comportement. Notre objectif est de maintenir un espace sûr pour tous. Merci de respecter nos règles de bienveillance."

**Escalation Levels:**
- 1st warning: Friendly reminder + education
- 2nd warning: Stern warning + temporary restriction (optional)
- 3rd warning: Final warning + account review
- 4+ warnings: Possible suspension (future feature)

---

### Story 5.6: Interface d'Administration avec RBAC

**Status:** 📋 Pending (v1.2)
**Story Points:** 8
**Priority:** Medium
**Dependencies:** All previous Epic 5 stories

As a **administrateur du système**,
I want **une interface d'administration complète avec contrôle d'accès par rôles**,
So that **je puisse gérer la plateforme de manière sécurisée avec les bonnes permissions**.

#### Acceptance Criteria

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

#### Technical Notes

**RBAC Roles:**
```typescript
// user.role enum
enum Role {
  USER = 'user',           // Default role
  MODERATOR = 'moderator', // Can moderate content
  ADMIN = 'admin',         // Full system access
}
```

**Permission Matrix:**

| Action | User | Moderator | Admin |
|--------|------|-----------|-------|
| View dashboard | ❌ | ✅ | ✅ |
| Moderate content | ❌ | ✅ | ✅ |
| View reports | ❌ | ✅ | ✅ |
| Send warnings | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Manage roles | ❌ | ❌ | ✅ |
| View analytics | ❌ | 📊 Limited | ✅ |
| Configure system | ❌ | ❌ | ✅ |

**Dashboard Sections (AR30):**
1. **Modération** (Stories 5.1-5.4)
   - Queue de messages en attente
   - Contenus signalés
   - Historique de modération

2. **Utilisateurs** (Admin only)
   - Liste des utilisateurs (anonymized display)
   - Gestion des rôles
   - Historique des avertissements

3. **Statistiques** (Limited for moderators, full for admins)
   - Messages traités par modérateur
   - Temps moyen de modération
   - Nombre de signalements par type
   - Santé communautaire (acceptance rate, etc.)

4. **Paramètres** (Admin only)
   - Catégories de publications
   - Templates d'avertissement
   - Seuils de modération automatique
   - Configuration des rôles

**Security (AR31):**
- All server functions check `context.user.role`
- Middleware: `moderatorAuthMiddleware`, `adminAuthMiddleware`
- Fail-secure: Default deny, explicit allow
- Audit all admin actions with timestamp + userId

**UI Separation (AR32):**
- Admin dashboard: `/admin/*` routes
- User interface: all other routes
- No admin functionality visible in user UI
- Separate navigation, branding, layout

---

## Epic 6: Conformité et Transparence Légale

### Story 6.1: Pages Conditions Générales d'Utilisation

**Status:** 📋 Pending (v1.0 - Pre-Public Launch)
**Story Points:** 5
**Priority:** CRITICAL
**Dependencies:** None (can be developed in parallel)

As a **utilisateur voulant comprendre mes droits et obligations**,
I want **consulter des Conditions Générales d'Utilisation claires et accessibles**,
So that **je puisse utiliser la plateforme en toute connaissance de cause**.

#### Acceptance Criteria

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

#### Technical Notes

**Required Sections:**

1. **Acceptation des Conditions**
   - En utilisant la plateforme, vous acceptez ces conditions
   - Modifications des CGU et notification

2. **Services Fournis**
   - Description de la plateforme ParlonsViolence
   - Limites du service (pas un service d'urgence)
   - Modération des contenus

3. **Obligations des Utilisateurs**
   - Comportement respectueux et bienveillant
   - Contenu prohibé (harcèlement, violence, etc.)
   - Sanctions en cas de violation

4. **Anonymat et Confidentialité**
   - Garanties d'anonymat pour utilisateurs anonymes
   - Code secret et sécurité du compte
   - Limites techniques de l'anonymat

5. **Modération de Contenu**
   - Tous les contenus sont pré-modérés
   - Délais de modération estimés
   - Droit de refuser ou supprimer du contenu
   - Processus d'appel (si rejeté)

6. **Propriété Intellectuelle**
   - Vous conservez les droits sur votre contenu
   - Licence accordée à la plateforme (affichage, modération)
   - Respect des droits d'auteur

7. **Responsabilité et Limitations**
   - Plateforme d'entraide, pas de conseil médical/légal
   - Limitation de responsabilité
   - Numéros d'urgence disponibles

8. **Suppression de Compte**
   - Procédure de suppression (Story 1.6)
   - Délais de traitement (30 jours RGPD)
   - Données conservées/supprimées

9. **Droit Applicable et Juridiction**
   - Droit français
   - Juridiction compétente

**Implementation:**
- Static page: `/legal/terms` (TanStack route)
- Markdown content stored in `content/legal/terms.md`
- Server function to fetch and render
- Table of contents for navigation
- Last updated date visible

**Signup Flow Integration:**
- Checkbox: "J'accepte les Conditions Générales d'Utilisation"
- Link to open CGU in new tab
- Required to proceed with signup

---

### Story 6.2: Politique de Confidentialité Accessible

**Status:** 📋 Pending (v1.0 - Pre-Public Launch)
**Story Points:** 5
**Priority:** CRITICAL (RGPD compliance)
**Dependencies:** None (parallel development with 6.1)

As a **utilisateur soucieux de ma vie privée**,
I want **accéder à une Politique de Confidentialité complète et transparente**,
So that **je comprenne exactement comment mes données sont traitées et protégées**.

#### Acceptance Criteria

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

#### Technical Notes

**Required Sections (RGPD Article 13-14):**

1. **Responsable du Traitement**
   - Nom et coordonnées
   - DPO (Data Protection Officer) si applicable
   - Contact: privacy@parlonsviolence.fr

2. **Données Collectées**
   - Utilisateurs anonymes: userId, alias, posts, code secret
   - Utilisateurs enregistrés: email, pseudonyme, userId, alias, posts
   - Données techniques: IP (temporaire), logs, sessions
   - Cookies (si utilisés)

3. **Finalités du Traitement**
   - Fourniture du service (forum, modération)
   - Sécurité et prévention abus
   - Amélioration du service (analytics anonymisées)

4. **Base Légale (RGPD Article 6)**
   - Consentement (signup, cookies)
   - Exécution d'un contrat (service)
   - Intérêt légitime (sécurité)

5. **Conservation des Données**
   - Comptes actifs: durée illimitée (ou jusqu'à suppression)
   - Comptes supprimés: 30 jours puis suppression définitive
   - Logs: 12 mois
   - Contenus modérés: conservation pour audit (anonymisés)

6. **Sécurité des Données (NFR1)**
   - Chiffrement au repos (AES-256)
   - Chiffrement en transit (HTTPS/TLS 1.3)
   - Accès restreint (RBAC)
   - Audits de sécurité réguliers

7. **Droits des Utilisateurs (RGPD Article 15-22)**
   - Droit d'accès: Demande via email
   - Droit de rectification: Paramètres compte
   - Droit à l'effacement: Story 1.6
   - Droit à la portabilité: Export JSON via email
   - Droit d'opposition: Opt-out analytics
   - Délais: 30 jours maximum

8. **Partage des Données**
   - Hébergement: Hetzner (UE)
   - Email: Resend (conformité RGPD)
   - Aucune vente de données à des tiers
   - Transferts hors UE: garanties appropriées

9. **Cookies et Technologies Similaires**
   - Cookies strictement nécessaires (session)
   - Cookies analytics (opt-in si utilisés)
   - localStorage (brouillons, préférences)

10. **Modifications de la Politique**
    - Notification 30 jours avant modifications majeures
    - Historique des versions disponible

**Implementation:**
- Static page: `/legal/privacy` (TanStack route)
- Markdown content: `content/legal/privacy.md`
- Table of contents + anchors
- Last updated date + version number
- Download as PDF option (nice-to-have)

---

### Story 6.3: Avertissements de Sécurité et Limites du Service

**Status:** 📋 Pending (v1.0 - Pre-Public Launch)
**Story Points:** 3
**Priority:** CRITICAL
**Dependencies:** None

As a **utilisateur potentiellement vulnérable consultant la plateforme**,
I want **voir des avertissements clairs que la plateforme n'est pas un service d'urgence**,
So that **je comprenne les limites du service et puisse chercher l'aide appropriée en cas de crise**.

#### Acceptance Criteria

**Given** je visite la plateforme pour la première fois
**When** j'accède à la page d'accueil
**Then** un avertissement visible indique que la plateforme n'est pas un service d'urgence
**And** l'avertissement est affiché de manière bienveillante mais claire
**And** des numéros d'urgence appropriés sont fournis (ligne de crise, SAMU, etc.)
**And** l'avertissement respecte les principes d'UX empathique

**Given** je crée une publication dans une catégorie sensible
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

#### Technical Notes

**Key Messages:**

1. **Homepage Banner (dismissible):**
   > ⚠️ **Important:** ParlonsViolence est une plateforme d'entraide communautaire, **pas un service d'urgence**.
   >
   > Si vous êtes en danger immédiat, contactez:
   > - 🚨 **SAMU: 15**
   > - 🚨 **Police/Gendarmerie: 17**
   > - 📞 **Numéro d'urgence européen: 112**
   > - 💬 **SOS Amitié: 09 72 39 40 50**

2. **Post Creation Form (subtle reminder):**
   > 💡 Cette plateforme offre un espace de partage et de soutien communautaire. Pour une aide immédiate ou professionnelle, consultez les [ressources d'urgence](/resources).

3. **Thread Detail Footer (persistent):**
   > **Besoin d'aide immédiate?** Consultez nos [ressources d'aide](/resources) avec numéros d'urgence et services professionnels.

**Resources Page:** `/resources`

Content:
- **Urgences:** Numéros 15/17/112
- **Écoute et Soutien:**
  - SOS Amitié: 09 72 39 40 50 (24/7)
  - Suicide Écoute: 01 45 39 40 00
  - Fil Santé Jeunes: 0 800 235 236
- **Violence et Abus:**
  - 3919: Violences Femmes Info (24/7, gratuit)
  - 119: Allô Enfance en Danger
- **Aide Psychologique:**
  - Psycom: ressources en santé mentale
  - Liste de psychologues/associations locales

**Implementation:**
- Banner component: `<EmergencyBanner />` (dismissible with localStorage)
- Resources page: Static content in `/resources` route
- Footer component: `<HelpResourcesFooter />` (persistent)
- Configurable via admin (Story 5.6) for updating numbers/resources

**Accessibility:**
- ARIA labels for screen readers
- High contrast for emergency numbers
- Keyboard navigation for dismissal
- Clear focus indicators

---

## Post-MVP Completion Checklists

### v1.0 (Pre-Public Launch) - Epic 6 Only

**CRITICAL: Must complete before public launch**

- [ ] **Story 6.1: CGU**
  - [ ] Contenu rédigé et validé (consultation juridique recommandée)
  - [ ] Page `/legal/terms` implémentée et accessible
  - [ ] Intégration dans signup flow (checkbox obligatoire)
  - [ ] Lien dans footer de toutes les pages

- [ ] **Story 6.2: Privacy Policy**
  - [ ] Contenu RGPD-compliant rédigé
  - [ ] Page `/legal/privacy` implémentée
  - [ ] Tous les traitements de données documentés
  - [ ] Contact DPO/privacy visible

- [ ] **Story 6.3: Disclaimers & Resources**
  - [ ] Banner d'avertissement sur homepage
  - [ ] Page `/resources` avec numéros d'urgence
  - [ ] Footer persistent avec lien ressources
  - [ ] Numéros vérifiés et à jour

- [ ] **Legal Review**
  - [ ] Consultation avec avocat spécialisé RGPD (recommandé)
  - [ ] Validation conformité hébergement données (UE)
  - [ ] Vérification responsabilités juridiques

### v1.1 (Community Features) - Epic 1 Extensions + Epic 4

**Target: 2-3 weeks après MVP complet**

- [ ] **Story 1.5: Login/Logout**
  - [ ] Email/password login functional
  - [ ] Session management secure
  - [ ] Rate limiting active
  - [ ] Tests E2E passent

- [ ] **Story 1.6: Account Deletion**
  - [ ] RGPD-compliant deletion flow
  - [ ] Data anonymization logic tested
  - [ ] Confirmation workflow secure
  - [ ] Audit trail implemented

- [ ] **Story 4.1: Replies**
  - [ ] Post creation functional
  - [ ] Replies display under threads
  - [ ] Moderation queue includes posts
  - [ ] Alias system preserved

- [ ] **Story 4.2: Reporting**
  - [ ] Report submission working
  - [ ] Reports visible in moderation dashboard
  - [ ] Auto-hide threshold configurable
  - [ ] Abuse prevention active

### v1.2 (Advanced Moderation) - Epic 5 Extensions

**Target: 4-6 weeks après v1.1**

- [ ] **Story 5.2: Reported Content Management**
  - [ ] Dashboard section "Contenus Signalés"
  - [ ] Report details view functional
  - [ ] Priority sorting working

- [ ] **Story 5.3: Advanced Moderation Actions**
  - [ ] Bulk actions implemented
  - [ ] Rejection reasons + notifications
  - [ ] Soft delete + cascade options
  - [ ] Audit logs complete

- [ ] **Story 5.4: Sensitive Content Marking**
  - [ ] Toggle "Mark Sensitive" functional
  - [ ] Blur applies automatically on user UI
  - [ ] Audit trail for sensitivity changes

- [ ] **Story 5.5: Warning System**
  - [ ] Warning templates created
  - [ ] User notification system working
  - [ ] Warning history tracking
  - [ ] Escalation logic implemented

- [ ] **Story 5.6: Full Admin Dashboard**
  - [ ] User management section
  - [ ] Role management (promote moderators)
  - [ ] Analytics dashboard
  - [ ] System settings configuration
  - [ ] RBAC enforced on all server functions

---

## Success Metrics - Post-MVP

### v1.1 Success Criteria

**Community Engagement:**
- ≥30% threads have at least 1 reply (Story 4.1)
- ≥10 reports submitted per week (Story 4.2 adoption)
- <5% abuse reports (false positives)

**User Retention:**
- ≥50% users with email accounts login again (Story 1.5)
- <1% account deletions (Story 1.6 usage)

**Moderation Efficiency:**
- Reply moderation time <1 hour average
- Report review time <4 hours average

### v1.2 Success Criteria

**Moderation Scale:**
- Support ≥3 active moderators
- Process 100+ items/week per moderator
- <10% moderator burnout signals

**Content Quality:**
- ≥95% legitimate reports acted upon
- <5% false positive auto-hides
- 0 inappropriate content visible >24h

**System Health:**
- All admin actions logged (100% audit coverage)
- 0 RBAC permission violations
- <5 minutes average configuration change time

---

## Timeline Estimates - Post-MVP

### Optimistic Timeline

```
Epic 6 (v1.0):           1 week  (5 business days)
Epic 1 Extensions:       1 week  (5 business days)
Epic 4:                  1.5 weeks (7-8 business days)
Epic 5 Extensions:       3 weeks (15 business days)
---------------------------------------------------
Total Post-MVP:          6.5 weeks
```

### Realistic Timeline

```
Epic 6 (v1.0):           1-2 weeks (legal review delays)
Testing & Launch Prep:   0.5 week
Epic 1 Extensions:       1.5 weeks
Epic 4:                  2 weeks
Testing v1.1:            0.5 week
Epic 5 Extensions:       4 weeks
Testing v1.2:            1 week
---------------------------------------------------
Total Post-MVP:          10-11 weeks
```

---

## Risk Mitigation - Post-MVP

### Epic 6 Risks (v1.0)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Legal review delays launch | HIGH | Start Epic 6 early (parallel with MVP) |
| CGU/Privacy non-compliant | CRITICAL | Consult RGPD lawyer, use templates |
| Emergency numbers outdated | MEDIUM | Verify quarterly, multiple sources |

### Epic 4 Risks (v1.1)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Reply spam/abuse | HIGH | Pre-moderation + rate limiting |
| Report system abused | MEDIUM | Duplicate detection, user limits |
| Moderators overwhelmed | HIGH | Hire more moderators before launch |

### Epic 5 Risks (v1.2)

| Risk | Impact | Mitigation |
|------|--------|------------|
| RBAC permission bugs | CRITICAL | Extensive security testing, fail-secure |
| Dashboard performance issues | MEDIUM | Pagination, caching, DB indexes |
| Feature creep (too complex) | MEDIUM | Stick to defined scope, iterate later |

---

## Appendix: Integration with MVP

### How Post-MVP Extends MVP

**MVP Foundation (Phase 1 + 2):**
- Epic 1: Stories 1.1-1.4 (Anonymous auth + email signup)
- Epic 2: Stories 2.1-2.5 (Content creation)
- Epic 3: Stories 3.1-3.6 (Content discovery)
- Epic 5: Story 5.1 Simplified (Basic moderation dashboard)

**Post-MVP Extensions:**
- Epic 1 Extensions (1.5-1.6): Add login/logout + account deletion
- Epic 4 (4.1-4.2): Enable community interaction (replies + reporting)
- Epic 5 Extensions (5.2-5.6): Scale moderation capabilities
- Epic 6 (6.1-6.3): Legal compliance for public launch

### Migration Path

1. **Complete MVP** (Phase 1 + 2)
2. **Immediate:** Start Epic 6 in parallel with MVP testing
3. **v1.0:** Launch Epic 6 (legal compliance) before going public
4. **v1.1:** Add Epic 1 Extensions + Epic 4 for community features
5. **v1.2:** Implement Epic 5 Extensions when moderator team scales

---

## References

**Source Documents:**
- PRD: `_bmad-output/planning-artifacts/prd/index.md`
- Architecture: `_bmad-output/planning-artifacts/architecture/index.md`
- MVP Scope: `_bmad-output/planning-artifacts/mvp-scope-final.md`
- MVP Epics: `_bmad-output/planning-artifacts/epics-mvp.md`
- Original Epics: `_bmad-output/planning-artifacts/epics.md` (archived)
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Implementation Readiness: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-01-22.md`

**Technical Documentation:**
- CLAUDE.md: `/CLAUDE.md`
- Auth Documentation: `/docs/auth-flows.md`
- Database Schema: `/docs/diagrams/alias-system-erd.md`
- Logging: `/src/lib/logger/README.md`

---

**Document Status:** ✅ Complete
**Created:** 2026-01-22
**Last Updated:** 2026-01-22
**Next Review:** After MVP completion (epics-mvp.md v1.0 done)
