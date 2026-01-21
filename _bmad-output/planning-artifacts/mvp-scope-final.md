---
document_type: mvp-scope-definition
project: tss-explore-forum (ParlonsViolence)
author: John (PM Agent) + Dev-linux
date: 2026-01-07
status: approved
version: 1.0
---

# MVP Scope Final - ParlonsViolence

## Document Purpose

Ce document définit le périmètre précis du MVP (Minimum Viable Product) pour le projet ParlonsViolence, un forum anonyme de soutien pour sujets sensibles (violence, abus, détresse).

**Décision stratégique:** Livrer le MVP en 2 phases distinctes pour valider le core functionality avant d'investir dans le dashboard admin.

---

## Executive Summary

### MVP Goal
Valider que les utilisateurs en détresse peuvent poster anonymement et que les témoins peuvent consulter du contenu de façon sécurisée.

### Success Metric
- **Utilisateur peut poster en < 3 minutes** (GTM critical)
- **50 posts publiés dans les 6 semaines**
- **20% des utilisateurs adoptent le code secret**

### Delivery Strategy
- **Phase 1:** Livrer Epic 1-3 (core user flows) avec modération SQL temporaire
- **Phase 2:** Ajouter dashboard admin (Epic 5.1 simplifié) une fois le core validé

---

## Phase 1: Core Functionality (Epic 1-3)

### Objective
Livrer les flows utilisateurs complets permettant de poster, lire, et interagir de façon anonyme et sécurisée.

### Scope Included

#### Epic 1: Authentification Anonyme (Stories 1.1-1.4)

**User Value:** Permettre participation immédiate sans barrière d'inscription

- ✅ **Story 1.1:** Session Anonyme Immédiate [DONE]
  - Auto-génération d'alias
  - Accès instantané au forum
  - 59 tests passés, 0 erreurs

- 🔨 **Story 1.2:** Code Secret pour Utilisateur Anonyme
  - Génération code unique 8-12 caractères après premier post
  - Stockage sécurisé avec contrainte unique
  - Display avec instructions claires + copy to clipboard
  - UI calme et rassurante

- 🔨 **Story 1.3:** Récupération via Code Secret
  - Form de login acceptant code secret
  - Validation avec protection timing attacks
  - Restoration de session
  - Error handling avec messaging calme

- 🔨 **Story 1.4:** Inscription avec Email/Pseudonyme
  - Form email/password signup
  - Email verification flow
  - Username/pseudonyme field
  - Automatic alias creation (hook déjà existant)
  - Account linking pour utilisateurs anonymes

**Stories EXPLICITEMENT EXCLUES du MVP:**
- ❌ Story 1.5: Connexion/Déconnexion (nice-to-have)
- ❌ Story 1.6: Suppression de Compte (RGPD important mais post-MVP)

#### Epic 2: Création de Contenu (Stories 2.1-2.5)

**User Value:** Expression sécurisée avec guidance appropriée

- 🔨 **Story 2.1:** Choix de Catégorie de Publication
  - Sélection catégorie visible (violence, abus, témoin, etc.)
  - UI claire avec descriptions
  - Validation required

- 🔨 **Story 2.2:** Template Guidé par Catégorie
  - Templates différenciés par catégorie
  - Questions guidées pour structurer le récit
  - Tone empathique et non-jugeant

- 🔨 **Story 2.3:** Éditeur de Contenu avec Formatage
  - Rich text editor (bold, italic, lists)
  - Auto-save draft (localStorage ou DB)
  - Character limits appropriés
  - Accessible (keyboard navigation)

- 🔨 **Story 2.4:** Soumission pour Modération
  - Submit button avec confirmation
  - Status = 'pending' dans DB
  - Server function sécurisée
  - Rate limiting (Arcjet)

- 🔨 **Story 2.5:** Confirmation et Suivi de Statut
  - Page confirmation après submit
  - Display du code secret (trigger Story 1.2)
  - Indication "en attente de modération"
  - Possibilité de voir statut (pending/published/rejected)

#### Epic 3: Découverte et Consommation Sécurisée (Stories 3.1-3.6)

**User Value:** Consultation de contenu avec protection émotionnelle appropriée

- 🔨 **Story 3.1:** Liste des Publications Publiées
  - Affichage threads avec status='published'
  - Tri par date (récents en premier)
  - Preview (titre + excerpt)
  - Pagination ou infinite scroll

- 🔨 **Story 3.2:** Filtrage par Catégorie
  - Filter buttons par catégorie
  - "Tous" pour voir tout
  - URL query params (?category=violence)
  - Persiste selection

- 🔨 **Story 3.3:** Avertissements et Floutage Contenu Sensible
  - Détection content sensible (marqué par modérateur ou auto)
  - Warning banner avant affichage
  - Contenu flouté par défaut
  - Bouton "Révéler le contenu" explicite

- 🔨 **Story 3.4:** Révélation Contrôlée du Contenu
  - User clique "Révéler"
  - Blur removed progressivement
  - Option "Re-flouter" disponible
  - State persiste durant session

- 🔨 **Story 3.5:** Lecture Complète avec Réponses
  - Page thread détail
  - Affichage thread + réponses
  - Nested replies (1 niveau max pour MVP?)
  - Timestamps relatifs ("il y a 2h")

- 🔨 **Story 3.6:** Interface Sans Métriques Sociales
  - AUCUN like/upvote counter
  - AUCUN follower/profile views
  - AUCUN "trending" ou "popular"
  - Focus: chronologique et par catégorie uniquement

### Scope Explicitly EXCLUDED from Phase 1

- ❌ **Epic 4:** Interactions et Signalement Communautaire
  - Story 4.1: Création de Réponses (peut être ajouté en Phase 1.5 si besoin)
  - Story 4.2: Signalement de Contenu (sécurité importante, mais manageable avec modération manuelle)

- ❌ **Epic 5:** Modération et Administration (sauf 5.1 en Phase 2)
  - Stories 5.2-5.6: Dashboard complet avec analytics, RBAC, etc.

- ❌ **Epic 6:** Conformité et Transparence Légale
  - Stories 6.1-6.3: CGU, Privacy Policy, Disclaimers
  - **Note:** Pages statiques temporaires acceptables pour MVP technique

### Estimated Effort (Phase 1)

```
Epic 1 (Stories 1.2-1.4):  3 jours  (1.1 déjà done)
Epic 2 (Stories 2.1-2.5):  5 jours
Epic 3 (Stories 3.1-3.6):  6 jours
-------------------------------------------
TOTAL Phase 1:            14 jours de dev pure

Testing & Bug Fixes:       2-3 jours
-------------------------------------------
Phase 1 Complete:         16-17 jours
```

### Modération Temporaire (Phase 1 Only)

Pendant Phase 1, la modération se fait **directement dans la base de données** via SQL ou scripts Node.

#### Option A: SQL Direct

```sql
-- 1. Voir les posts en attente
SELECT 
  id, 
  title, 
  category, 
  created_at,
  author_alias
FROM threads 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- 2. Lire le contenu complet d'un post
SELECT 
  id,
  title,
  content,
  category,
  created_at,
  author_alias
FROM threads 
WHERE id = 'thread-id-here';

-- 3. Approuver un post
UPDATE threads 
SET 
  status = 'published', 
  moderated_at = NOW(),
  moderated_by = 'dev-linux'
WHERE id = 'thread-id-here';

-- 4. Rejeter un post avec raison
UPDATE threads 
SET 
  status = 'rejected', 
  moderated_at = NOW(),
  moderated_by = 'dev-linux',
  rejection_reason = 'Raison explicite pour l''auteur'
WHERE id = 'thread-id-here';

-- 5. Marquer comme sensible (trigger blur)
UPDATE threads 
SET is_sensitive = true
WHERE id = 'thread-id-here';
```

#### Option B: Script Node CLI (Recommandé)

Créer `scripts/moderate.ts`:

```typescript
// Usage: pnpm tsx scripts/moderate.ts

import { db } from '@/lib/db'

async function listPending() {
  const threads = await db.query.threads.findMany({
    where: eq(threads.status, 'pending'),
    orderBy: desc(threads.createdAt),
  })
  console.table(threads)
}

async function approve(threadId: string) {
  await db.update(threads)
    .set({ 
      status: 'published', 
      moderatedAt: new Date(),
      moderatedBy: 'dev-linux'
    })
    .where(eq(threads.id, threadId))
  console.log(`✅ Thread ${threadId} approved`)
}

// ... reject(), view(), etc.
```

#### Workflow de Modération Temporaire

1. **Notification:** Configurer email/webhook quand nouveau post pending
2. **Review:** Utiliser SQL ou script pour voir contenu
3. **Decision:** Approve/Reject avec raison
4. **Marking:** Marquer is_sensitive si nécessaire
5. **Tracking:** Logger les décisions pour analytics futures

**Fréquence:** Vérifier queue 2-3x par jour minimum (critical pour trust)

---

## Phase 2: Dashboard Admin (Epic 5.1 Simplifié)

### Objective
Une fois Epic 1-3 validés et fonctionnels, ajouter une interface web simple pour modération sans SQL.

### Timing
Débuter Phase 2 quand:
- ✅ Epic 1-3 completed et testés
- ✅ Tests end-to-end passent
- ✅ Au moins 5-10 threads créés en test/beta
- ✅ Modération SQL devient trop lourde

### Scope Phase 2

#### Epic 5: Story 5.1 Simplified - Dashboard Modération Basique

**User Value (Modérateur):** Interface web pour modérer efficacement sans SQL

**Must-Have Features:**

1. **Page `/admin/moderation`**
   - Protected route (auth required + role check)
   - Clean, functional UI (pas besoin de polish excessif)
   - Responsive (desktop first, mobile acceptable)

2. **Liste des Threads Pending**
   - Table affichant: ID, Title, Category, Author Alias, Created At
   - Tri par date (récents en premier)
   - Pagination (20 items/page)

3. **Actions par Thread**
   - 👁️ **View:** Modal/drawer avec contenu complet
   - ✅ **Approve:** Change status → 'published' + confirmation toast
   - ❌ **Reject:** Modal pour entrer rejection_reason → status='rejected'
   - ⚠️ **Mark Sensitive:** Toggle is_sensitive flag

4. **View Thread Modal**
   - Display: Title, Category, Content (formatted), Author Alias, Timestamps
   - Read-only (pas d'édition inline pour MVP)
   - Actions disponibles: Approve / Reject / Mark Sensitive / Close

5. **Reject Thread Modal**
   - Textarea pour rejection_reason (required)
   - Guidelines: "Soyez constructif et empathique"
   - Buttons: Cancel / Confirm Reject

6. **Basic Stats (Nice-to-Have)**
   - Counter "X posts en attente"
   - Counter "X posts modérés aujourd'hui"

**Nice-to-Have (si temps):**
- Filtres (par catégorie, par date range)
- Recherche (par title ou author alias)
- Bulk actions (approve multiple)
- History log (qui a modéré quoi)

**Explicitly OUT OF SCOPE:**
- ❌ Gestion des signalements (Story 5.2)
- ❌ Actions avancées: ban users, warnings (Stories 5.3-5.5)
- ❌ RBAC avec roles multiples (Story 5.6)
- ❌ Analytics dashboard avec charts
- ❌ Audit trail complet
- ❌ Email notifications from UI
- ❌ AI-assisted moderation

### Technical Approach

**Stack:**
- TanStack Start route: `/admin/moderation`
- Server Functions pour actions (approve/reject/view)
- shadcn/ui components (Table, Modal, Button, Toast)
- Better Auth pour protection (role='admin' ou 'moderator')

**Data Flow:**
```
1. Server Function: fetchPendingThreads()
   → Returns threads with status='pending'

2. User clicks "View" 
   → Opens modal with full content

3. User clicks "Approve"
   → Server Function: approveThread(threadId)
   → Updates DB, returns success
   → Refreshes list + shows toast

4. User clicks "Reject"
   → Opens modal with reason textarea
   → Server Function: rejectThread(threadId, reason)
   → Updates DB, optionally notifies author
   → Refreshes list
```

**Security:**
- All server functions protected avec auth check
- Rate limiting sur actions (Arcjet)
- Logging de toutes les actions modération
- RBAC: Only 'admin' or 'moderator' roles

### Estimated Effort (Phase 2)

```
Story 5.1 Simplified:     2 jours
  - Setup route + auth:   2h
  - Fetch & display list: 3h
  - View modal:           2h
  - Approve/Reject logic: 3h
  - Mark sensitive:       1h
  - Testing:              2h
  - Polish & bugs:        3h

Testing & Integration:    0.5 jour
-------------------------------------------
Phase 2 Complete:         2-3 jours
```

---

## MVP Definition of Done

### Phase 1 DoD

- [ ] **Epic 1 (Stories 1.1-1.4) Completed**
  - [ ] All tests passing (100% test pass rate)
  - [ ] Manual testing: Anonymous session → post → retrieve via code
  - [ ] Email signup → post flow working
  - [ ] 0 diagnostic errors/warnings

- [ ] **Epic 2 (Stories 2.1-2.5) Completed**
  - [ ] Category selection working
  - [ ] Templates display per category
  - [ ] Editor saves drafts + submits
  - [ ] Posts go to 'pending' status
  - [ ] Confirmation page shows code secret

- [ ] **Epic 3 (Stories 3.1-3.6) Completed**
  - [ ] Published threads display correctly
  - [ ] Category filtering works
  - [ ] Sensitive content blurred by default
  - [ ] Reveal/blur toggle functional
  - [ ] Thread detail page with replies
  - [ ] NO social metrics visible

- [ ] **End-to-End Flow Validated**
  - [ ] Anonymous user can post → see confirmation → retrieve session via code
  - [ ] Email user can signup → post → see thread published (after moderation)
  - [ ] Moderation via SQL working smoothly

- [ ] **Technical Quality**
  - [ ] 0 TypeScript errors
  - [ ] Test coverage >80% on critical paths
  - [ ] Accessibility WCAG 2.1 AA validated
  - [ ] Performance: Pages load <2s (NFR5)
  - [ ] Security: Rate limiting active, no secrets exposed

### Phase 2 DoD

- [ ] **Story 5.1 Completed**
  - [ ] `/admin/moderation` accessible avec auth
  - [ ] Liste threads pending avec actions
  - [ ] View modal displays full content
  - [ ] Approve/Reject working avec DB updates
  - [ ] Mark sensitive functional
  - [ ] Rejection reason required & stored

- [ ] **Moderation Workflow Validated**
  - [ ] Moderator can process 10 threads in <5 minutes
  - [ ] Actions reflect immediately dans user UI
  - [ ] Rejected threads show reason to author (if logged)

- [ ] **Technical Quality**
  - [ ] All server functions protected by auth
  - [ ] Actions logged for audit
  - [ ] No performance degradation
  - [ ] Mobile-responsive (desktop-first OK)

### Full MVP DoD

- [ ] Phase 1 DoD ✅
- [ ] Phase 2 DoD ✅
- [ ] **User Acceptance Testing**
  - [ ] 5-10 beta users test posting flow
  - [ ] Feedback collected & critical bugs fixed
  - [ ] Moderator (Dev-linux) validates dashboard usability

- [ ] **Deployment Ready**
  - [ ] Environment variables configured
  - [ ] Database migrations run successfully
  - [ ] Monitoring/logging setup (basic)
  - [ ] Backup strategy documented

- [ ] **Documentation**
  - [ ] README updated with setup instructions
  - [ ] Moderation guidelines documented
  - [ ] Known limitations listed
  - [ ] Roadmap for v1.1 (Epic 4, 5, 6) documented

---

## Success Criteria Validation

### How to Measure MVP Success

**Primary Metrics (Phase 1+2):**

1. **Time to First Post** (GTM Critical)
   - Target: <3 minutes from landing to post submitted
   - Measure: Analytics event timestamps
   - Success: 80% users achieve <3min

2. **User Adoption**
   - Target: 50 posts published in 6 weeks
   - Measure: `SELECT COUNT(*) FROM threads WHERE status='published'`
   - Success: ≥50 posts

3. **Code Secret Adoption**
   - Target: 20% anonymous users save their code
   - Measure: Track code generation events
   - Success: ≥20% adoption rate

4. **Moderation Efficiency** (Phase 2)
   - Target: <2 hours average moderation time
   - Measure: `moderated_at - created_at` average
   - Success: Avg <2h during business hours

**Secondary Metrics:**

- User return rate: >30%
- Content quality: <5% posts rejected
- Security: 0 data breaches
- Performance: 99.9% uptime

**Qualitative Validation:**

- Survey 10 beta users: "Do you feel safe using this platform?" (Target: 8/10 yes)
- Survey moderator: "Is moderation manageable?" (Target: yes)

---

## Timeline Summary

### Optimistic Timeline (Full Focus)

```
Week 1:     Epic 1 complete (Stories 1.2-1.4)
Week 2:     Epic 2 complete (Stories 2.1-2.5)
Week 3:     Epic 3 complete (Stories 3.1-3.6)
Week 3-4:   Testing, bug fixes, end-to-end validation
Week 4:     Epic 5.1 (Dashboard admin)
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

## Risk Mitigation

### Phase 1 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Modération SQL devient lourde | Medium | Accélérer Phase 2, ou ajouter script CLI |
| Contenu inapproprié publié | HIGH | Pre-moderation stricte, clear guidelines |
| Anonymous users abuse système | Medium | Rate limiting (Arcjet), code secret validation |
| Performance issues avec croissance | Medium | Pagination, caching, index DB appropriés |

### Phase 2 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dashboard trop basique | Low | Acceptable for MVP, iterate en v1.1 |
| Moderator burnout (solo moderation) | HIGH | Recruit 2-3 moderators post-MVP |
| Missing features bloat scope | Medium | Stick to defined scope, log feature requests |

### General MVP Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low user adoption | HIGH | Marketing plan, closed beta avec target users |
| Legal/GDPR issues | HIGH | Add Epic 6 (CGU/Privacy) before public launch |
| Scope creep | Medium | This document = contract, refer back often |

---

## Post-MVP Roadmap (v1.1)

### Immediately After MVP

1. **Epic 6: Conformité Légale** (Stories 6.1-6.3)
   - CGU, Privacy Policy, Disclaimers
   - Essential avant launch public
   - Estimated: 3-5 jours

2. **Epic 1: Stories 1.5-1.6**
   - Connexion/Déconnexion
   - Suppression de compte (RGPD)
   - Estimated: 3 jours

### v1.1 Features (Prioritized)

1. **Epic 4.1: Réponses aux Publications**
   - Enable community support
   - High user value
   - Estimated: 3 jours

2. **Epic 4.2: Signalement de Contenu**
   - Community-driven moderation
   - Safety critical
   - Estimated: 2 jours

3. **Epic 5: Complete Moderation Dashboard**
   - Stories 5.2-5.6
   - Scale moderation team
   - Estimated: 7-10 jours

### v1.2+ Vision Features

- Bibliothèque de Témoignages (UX spec déjà défini)
- Tags multiples
- Search functionality
- Email notifications
- Mobile app (React Native?)
- Multi-language support

---

## Appendix: Key Documents

### Planning Documents
- PRD: `_bmad-output/planning-artifacts/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Epics: `_bmad-output/planning-artifacts/epics.md`
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Implementation Readiness: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-01-07.md`

### Implementation Documents
- Sprint Status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Story 1.1: `_bmad-output/implementation-artifacts/1-1-session-anonyme-immediate.md`
- Story 1.2: `_bmad-output/implementation-artifacts/1-2-code-secret-pour-utilisateur-anonyme.md`
- Story 1.3: `_bmad-output/implementation-artifacts/1-3-recuperation-via-code-secret.md`
- Story 1.4: `_bmad-output/implementation-artifacts/1-4-inscription-avec-email-pseudonyme.md`

### Reports
- Sprint 1 Report: `_bmad-output/SPRINT-1-REPORT.md`
- Changelog: `_bmad-output/CHANGELOG.md`

---

## Approval & Sign-off

**Document Created:** 2026-01-07  
**Created By:** John (PM Agent) + Dev-linux  
**Status:** ✅ APPROVED  

**Approved By:**
- [x] Dev-linux (Product Owner / Developer)
- [x] John (Product Manager Agent)

**Next Review:** After Phase 1 completion (Epic 1-3 done)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-07 | 1.0 | Initial MVP scope document created | John + Dev-linux |

---

**This document is the source of truth for MVP scope. All implementation decisions should reference this document.**
