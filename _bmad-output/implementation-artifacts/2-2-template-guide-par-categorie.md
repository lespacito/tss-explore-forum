# Story 2.2: Template guidé par catégorie

Status: done

<!-- Story was implemented in commits 2934523, 01b6293, and subsequent refinements -->

## Story

As a **utilisateur connecté (anonyme ou enregistré)**,
I want **un template de rédaction personnalisé selon la catégorie choisie**,
so that **je reçois de la guidance empathique adaptée à ma situation**.

## Acceptance Criteria

### AC1: Affichage du template guidé selon la catégorie

**Given** j'ai sélectionné une catégorie sur `/threads/new/`
**When** je navigue vers `/threads/new/$category`
**Then** un template de rédaction adapté à ma catégorie est affiché
**And** le template inclut des questions guidantes spécifiques à la catégorie
**And** les placeholders (titre, corps) sont contextuels et empathiques
**And** un texte d'aide rassurant est visible

**STATUS:** ✅ IMPLÉMENTÉ (commit 2934523)

**Implémentation:**
- Route `/threads/new/$category.tsx` créée (258 lignes)
- Configuration centralisée dans `src/data/threads-categories.ts`
- 5 templates complets : VIOLENCE, ABUS, TEMOIN, DETRESSE, AUTRE
- Chaque catégorie a :
  - `guidingQuestions`: 2-3 questions empathiques
  - `titlePlaceholder`: exemple de titre contextuel
  - `bodyPlaceholder`: guidance pour le contenu
  - `helpText`: message rassurant personnalisé
  - `color`: classe Tailwind du design system

### AC2: Questions guidantes contextuelles

**Given** je suis sur le template d'une catégorie
**When** je lis les questions guidantes
**Then** les questions sont adaptées à ma situation (violence, abus, témoin, détresse, autre)
**And** les questions sont optionnelles et non-intrusives
**And** le ton est empathique et trauma-informed

**STATUS:** ✅ IMPLÉMENTÉ (commit 2934523)

**Exemples de questions par catégorie:**

- **VIOLENCE:**
  - "Que s'est-il passé ? (optionnel, partagez uniquement ce qui vous semble confortable)"
  - "Comment vous sentez-vous maintenant ?"
  - "Y a-t-il quelque chose de spécifique avec lequel vous aimeriez de l'aide ?"

- **ABUS:**
  - "Quelle est la nature de la situation ?"
  - "Depuis combien de temps cela dure-t-il ?"
  - "Avez-vous déjà parlé de cette situation à quelqu'un ?"

- **TEMOIN:**
  - "Quelle est votre relation avec la personne concernée ?"
  - "Quels changements ou signes avez-vous observés ?"
  - "Qu'espérez-vous accomplir en partageant ceci ?"

- **DETRESSE:**
  - "Comment vous sentez-vous en ce moment ?"
  - "Qu'est-ce qui vous a amené(e) à chercher du soutien aujourd'hui ?"
  - "Y a-t-il quelque chose de spécifique qui pourrait vous aider maintenant ?"

- **AUTRE:**
  - "De quoi souhaitez-vous parler ?"
  - "Qu'espérez-vous en partageant cette expérience ?"

### AC3: Aide contextuelle pendant la rédaction

**Given** je remplis le formulaire de création de thread
**When** j'interagis avec les champs titre et corps
**Then** les placeholders guident ma rédaction
**And** un compteur de caractères est affiché (0-10000)
**And** la validation s'exécute en temps réel

**STATUS:** ✅ IMPLÉMENTÉ (commit 2934523, dd5c935)

**Fonctionnalités:**
- Validation client-side avec TanStack Form
- Titre : min 3 caractères, max 200 caractères
- Corps : min 10 caractères, max 10000 caractères
- Compteur de caractères en temps réel
- Messages d'erreur contextuels via toast
- Champs requis marqués avec astérisque rouge

### AC4: TanStack Form avec Zod validation

**Given** je soumets le formulaire
**When** les données sont invalides
**Then** des messages d'erreur clairs s'affichent
**And** la soumission est bloquée jusqu'à correction
**And** les erreurs Zod sont affichées de manière empathique

**STATUS:** ✅ IMPLÉMENTÉ (commit 2934523, dd5c935)

**Validation côté client:**
```typescript
// Client-side validation dans $category.tsx
if (value.title.trim().length < 3) {
  toast.error("Le titre doit contenir au moins 3 caractères");
}
if (value.body.trim().length < 10) {
  toast.error("Le contenu doit contenir au moins 10 caractères");
}
```

**Note:** Validation côté serveur existe dans `createThreadFn` avec Zod.

### AC5: Design empathique et accessible

**Given** je visualise le template
**When** je lis les éléments d'interface
**Then** le design est calme et rassurant
**And** les couleurs respectent le design system (OKLCH)
**And** les contrastes respectent WCAG 2.1 AA
**And** les avertissements de sécurité sont visibles mais non-alarmistes

**STATUS:** ✅ IMPLÉMENTÉ (commits 2460645, f903f26, 88a8388)

**Design system appliqué:**
- Couleurs par catégorie (border + bg avec opacité)
- Icônes empathiques (🛡️, 💔, 👁️, 🆘, 💬)
- Warning box avec border-2 et bg-warning/30
- Contrastes fixés pour accessibilité (commit f903f26)
- Border radius 1.25rem (douceur visuelle)
- Spacing généreux, layout responsive

### AC6: Navigation et soumission

**Given** j'ai complété le formulaire
**When** je clique sur "Soumettre pour modération"
**Then** le thread est créé via `createThreadFn`
**And** si c'est ma première publication, je reçois un code secret
**And** je suis redirigé vers `/threads/confirmation` avec le code
**And** sinon, je suis redirigé vers `/threads`

**STATUS:** ✅ IMPLÉMENTÉ (commit 2934523)

**Navigation implémentée:**
```typescript
// Première publication → confirmation + code secret
navigate({
  to: "/threads/confirmation",
  search: {
    secretCode: result.secretCode,
    threadSlug: result.thread.slug,
    isFirstPublication: true,
  },
});

// Publications suivantes → retour threads
navigate({ to: "/threads", search: { openDialog: false } });
```

## Existing Implementation Analysis

### ✅ What Exists (Fully Implemented)

**1. Route `/threads/new/$category.tsx`** (258 lignes)

Composant `NewThreadFormPage` avec:
- Extraction du paramètre `category` depuis TanStack Router
- Récupération du `categoryConfig` via `getCategoryConfig()`
- TanStack Form avec `defaultValues` et `onSubmit`
- Validation client-side complète
- Gestion des erreurs avec toast notifications
- Navigation vers confirmation ou threads selon contexte

**2. Configuration centralisée `src/data/threads-categories.ts`** (107 lignes)

Interface `CategoryConfig`:
```typescript
export interface CategoryConfig {
  id: ThreadCategory;
  label: string;
  description: string;
  icon: string;
  color: string; // Tailwind class
  helpText: string;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  guidingQuestions: string[];
}
```

Fonction utilitaire:
```typescript
export function getCategoryConfig(
  categoryId: ThreadCategory,
): CategoryConfig | undefined
```

**3. Layout du template**

- Header avec icône catégorie + titre + description
- Bouton retour (`ArrowLeft` icon)
- Card colorée avec helpText
- Card "Questions pour vous guider" avec liste bullet
- Formulaire TanStack Form (title + body fields)
- Labels avec astérisques pour champs requis
- Placeholders personnalisés par catégorie
- Compteur de caractères temps réel
- Footer avec avertissement sécurité (numéros d'urgence)
- Boutons "Retour" et "Soumettre pour modération"

**4. Intégration server function**

- Appel de `createThreadFn` avec `{ title, body, category }`
- Gestion du résultat avec secret code (première publication)
- Router invalidation après soumission
- Toast feedback pour succès/erreur

**5. UX refinements**

- Redirect si catégorie invalide (commit 53126ec)
- Numéros d'urgence corrigés (commit dd5c935)
- Contrastes améliorés pour a11y (commits f903f26, 88a8388)
- Templates consolidés en config centrale (commit 01b6293)

### ⚠️ Gap Identifié: Tests

**Aucun test trouvé pour cette story.**

Tests manquants:
- ❌ Tests unitaires du composant `NewThreadFormPage`
- ❌ Tests de validation TanStack Form
- ❌ Tests d'accessibilité (axe-core)
- ❌ Tests E2E Playwright du flux complet
- ❌ Tests de navigation (catégorie invalide → redirect)
- ❌ Tests de soumission (première pub vs pubs suivantes)

**Dette technique à adresser:**
- Créer suite de tests pour Story 2.2
- Couvrir tous les AC avec tests automatisés
- Valider accessibilité WCAG 2.1 AA

## Tasks / Subtasks

### ✅ Task 1: Créer route template par catégorie (DONE)
- [x] Subtask 1.1: Créer `/threads/new/$category.tsx` route
- [x] Subtask 1.2: Extraire paramètre `category` via TanStack Router
- [x] Subtask 1.3: Récupérer config via `getCategoryConfig()`
- [x] Subtask 1.4: Redirect si catégorie invalide

### ✅ Task 2: Configuration centralisée des templates (DONE)
- [x] Subtask 2.1: Ajouter `titlePlaceholder` à `CategoryConfig`
- [x] Subtask 2.2: Ajouter `bodyPlaceholder` à `CategoryConfig`
- [x] Subtask 2.3: Ajouter `guidingQuestions` à `CategoryConfig`
- [x] Subtask 2.4: Créer fonction utilitaire `getCategoryConfig()`
- [x] Subtask 2.5: Définir questions empathiques pour chaque catégorie

### ✅ Task 3: Implémenter formulaire TanStack Form (DONE)
- [x] Subtask 3.1: Créer form avec `useForm()` hook
- [x] Subtask 3.2: Définir `defaultValues` (title, body)
- [x] Subtask 3.3: Créer champs avec `form.Field` components
- [x] Subtask 3.4: Ajouter validation client-side (min/max lengths)
- [x] Subtask 3.5: Afficher erreurs avec toast notifications
- [x] Subtask 3.6: Implémenter `onSubmit` avec `createThreadFn`

### ✅ Task 4: Design empathique et accessible (DONE)
- [x] Subtask 4.1: Appliquer couleurs design system par catégorie
- [x] Subtask 4.2: Créer card helpText avec border colorée
- [x] Subtask 4.3: Créer card questions guidantes
- [x] Subtask 4.4: Ajouter icônes catégorie dans header
- [x] Subtask 4.5: Créer warning footer avec numéros d'urgence
- [x] Subtask 4.6: Fixer contrastes pour WCAG 2.1 AA (f903f26)
- [x] Subtask 4.7: Ajouter compteur caractères temps réel

### ✅ Task 5: Navigation et soumission (DONE)
- [x] Subtask 5.1: Gérer navigation vers confirmation (première pub)
- [x] Subtask 5.2: Gérer navigation vers threads (pubs suivantes)
- [x] Subtask 5.3: Invalider router après soumission
- [x] Subtask 5.4: Ajouter bouton "Retour" vers `/threads/new`
- [x] Subtask 5.5: Désactiver bouton submit pendant soumission

### ❌ Task 6: Tests complets (NOT DONE - Technical Debt)
- [ ] Subtask 6.1: Créer tests unitaires composant
- [ ] Subtask 6.2: Créer tests validation form
- [ ] Subtask 6.3: Créer tests accessibilité axe-core
- [ ] Subtask 6.4: Créer tests E2E Playwright
- [ ] Subtask 6.5: Créer tests navigation (redirect catégorie invalide)
- [ ] Subtask 6.6: Créer tests soumission (première pub vs suivantes)

### ✅ Task 7: Refinements post-implementation (DONE)
- [x] Subtask 7.1: Consolider templates en config centrale (01b6293)
- [x] Subtask 7.2: Fixer numéros d'urgence (dd5c935)
- [x] Subtask 7.3: Améliorer contrastes warning boxes (f903f26)
- [x] Subtask 7.4: Améliorer visibilité texte warnings (88a8388)

## Dev Notes

### Architecture & Patterns

**Structure implémentée:**

```
src/
├── data/
│   └── threads-categories.ts        # ✅ Config centralisée (107 lignes)
├── routes/
│   └── threads/
│       └── new/
│           ├── index.tsx            # ✅ Sélection catégorie (Story 2.1)
│           └── $category.tsx        # ✅ Template par catégorie (Story 2.2)
└── features/
    └── threads/
        └── server/
            └── create-thread.ts     # ✅ Server function (Story 1.1)
```

**Pattern TanStack Form utilisé:**

```typescript
const form = useForm({
  defaultValues: { title: "", body: "" },
  onSubmit: async ({ value }) => {
    // Validation client
    if (value.title.trim().length < 3) { /* error */ }

    // Server function call
    const result = await createThreadFn({ data: { ...value, category } });

    // Navigation conditionnelle
    if (result.secretCode) {
      navigate({ to: "/threads/confirmation", search: { ... } });
    }
  },
});
```

**Pattern de config centralisée:**

Toutes les données spécifiques aux catégories sont dans `threads-categories.ts`:
- Labels, descriptions, icônes
- Couleurs design system
- Help text empathique
- Placeholders personnalisés
- Questions guidantes

Avantages:
- Single source of truth
- Facile à maintenir et étendre
- Type-safe avec TypeScript
- Réutilisable dans d'autres composants

### Considérations de sécurité

1. **Validation côté serveur obligatoire** - Client-side validation n'est pas suffisante
   - `createThreadFn` valide avec Zod côté serveur
   - Protection contre injection et données malicieuses

2. **Catégorie validée** - Enum TypeScript + DB constraint empêchent catégories invalides

3. **Authentification requise** - Seuls utilisateurs avec session peuvent créer threads
   - Vérifié dans `createThreadFn` via `getAuthSession()`

### UX Guidelines respectées

**Tone empathique et trauma-informed:**
- ✅ Questions optionnelles et non-intrusives
- ✅ Placeholders rassurants et chaleureux
- ✅ Help text adapté à chaque situation
- ✅ Avertissements de sécurité sans alarmisme
- ✅ Feedback positif ("Votre expérience est valide")

**Design apaisant:**
- ✅ Couleurs douces avec opacité réduite
- ✅ Border radius généreux (1.25rem)
- ✅ Spacing généreux, jamais de densité oppressante
- ✅ Icônes empathiques et non-menaçantes
- ✅ Transitions douces

**Performance:**
- ✅ SSR par défaut (TanStack Start)
- ✅ Validation client avant appel serveur
- ✅ Feedback immédiat avec toast
- ✅ Loading states pendant soumission

### Dépendances

**Stories prérequises (COMPLÈTES):**
- Story 1.1: Session anonyme immédiate ✅
- Story 1.2: Code secret première publication ✅
- Story 2.1: Choix de catégorie ✅

**Stories dépendantes (FUTURES):**
- Story 2.3: Éditeur de contenu avec formatage (optionnel, textarea basic suffit MVP)
- Story 2.4: Soumission pour modération (déjà intégré)
- Story 2.5: Confirmation et suivi de statut (partiellement intégré)

### Testing Standards Summary

**Tests requis (NON IMPLÉMENTÉS):**

| Type | Fichier | Tests | Status |
|------|---------|-------|--------|
| Unit | new-thread-form.test.tsx | ~15 | ❌ À créer |
| A11y | new-thread-form.a11y.test.tsx | ~5 | ❌ À créer |
| E2E | category-template.e2e.test.ts | ~10 | ❌ À créer |
| **Total** | | **~30** | ❌ Gap identifié |

**Coverage cibles:**
- Render avec chaque catégorie: 5 tests
- Validation form (title, body): 4 tests
- Navigation (submit, back, invalid category): 3 tests
- Placeholders et helpText: 3 tests
- Accessibilité WCAG 2.1 AA: 5 tests
- E2E flux complet: 10 tests

### Project Structure Notes

**Fichiers créés (Story 2.2):**

```
src/routes/threads/new/
└── $category.tsx                     # 258 lignes (commit 2934523)
```

**Fichiers modifiés (Story 2.2):**

```
src/data/
└── threads-categories.ts             # +48 lignes (commit 01b6293)
                                      # Ajout titlePlaceholder, bodyPlaceholder, guidingQuestions
```

**Fichiers à créer (Tests - Dette technique):**

```
src/routes/threads/new/__tests__/
├── new-thread-form.test.tsx          # Tests unitaires
├── new-thread-form.a11y.test.tsx     # Tests accessibilité
└── category-template.e2e.test.ts     # Tests E2E Playwright
```

### Git Intelligence

**Commits pertinents (ordre chronologique):**

1. **2460645** - `feat(theme): add warning color to design system`
   - Ajout de la couleur warning pour avertissements sécurité

2. **2934523** - `feat(threads): implement Story 2.2 - category-specific guided templates`
   - Implémentation complète de la story
   - Route $category.tsx créée
   - Templates avec questions guidantes
   - TanStack Form + validation client
   - Navigation vers confirmation

3. **dd5c935** - `fix(threads): correct form validation and emergency contact numbers`
   - Correction des numéros d'urgence (117, 143, 147)
   - Amélioration validation form

4. **53126ec** - `feat(threads): redirect to guided category workflow`
   - Redirect si catégorie invalide

5. **88a8388** - `a11y(threads): improve warning text contrast and visibility`
   - Amélioration contraste texte warnings

6. **f903f26** - `fix(a11y): use high-contrast text for warning boxes`
   - Fix contrastes pour WCAG 2.1 AA

7. **01b6293** - `refactor(threads): consolidate category templates in central config`
   - Refactoring pour centraliser templates
   - Migration config vers threads-categories.ts
   - Réduction duplication code (-75 lignes dans $category.tsx, +48 dans config)

**Pattern de développement observé:**
- Feature implementation → refinements → refactoring
- Focus sur UX empathique et accessibilité
- Commits atomiques et bien documentés
- Messages de commit clairs avec contexte

### References

- [Source: FR9 dans epics.md] - "Le système affiche un template de publication guidé basé sur la catégorie choisie"
- [Source: commit 2934523] - Implémentation complète de Story 2.2
- [Source: src/routes/threads/new/$category.tsx] - Template component
- [Source: src/data/threads-categories.ts] - Configuration centralisée
- [Source: project-context.md#Core-Principles] - Mission anonymat et empathie
- [Source: architecture.md#Frontend-Architecture] - Patterns TanStack Form
- [TanStack Form Docs](https://tanstack.com/form) - Form state management
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines

### Known Constraints & Risks

**Technical Constraints:**
- ✅ RÉSOLU: Template devait supporter 5 catégories distinctes → Config centralisée
- ✅ RÉSOLU: Placeholders devaient être empathiques et contextuels → Définis par catégorie
- ✅ RÉSOLU: Validation client et serveur nécessaires → TanStack Form + Zod server-side

**Risks Mitigated:**
- ✅ Duplication de code entre catégories → Refactoring en config centrale (01b6293)
- ✅ Contrastes insuffisants → Fixes accessibilité (f903f26, 88a8388)
- ✅ Numéros d'urgence incorrects → Correction (dd5c935)
- ✅ Catégorie invalide cause erreur → Redirect gracieux (53126ec)

**Remaining Technical Debt:**
- ⚠️ **Tests manquants** - Aucun test automatisé pour cette story
  - Impact: Risque de régression lors de modifications futures
  - Priorité: MEDIUM (feature fonctionne, mais non testée)
  - Recommendation: Créer suite de tests avant modifications majeures

**UX Considerations:**
- Questions guidantes sont optionnelles (mention explicite dans UI)
- Tone empathique et trauma-informed validé
- Avertissements sécurité visibles mais non-alarmistes
- Mobile-first responsive confirmé

**Scope Note:**

Story 2.2 est 100% implémentée fonctionnellement. L'effort de développement a été complété en plusieurs commits avec refinements successifs. La dette technique identifiée (tests) n'affecte pas la fonctionnalité actuelle mais devrait être adressée avant modifications futures du template system.

**Effort total:** ~4-6 heures développement + refinements (estimation basée sur commits)

## Dev Agent Record

### Agent Model Used

**Implementation:** Human Developer (lespacito)

**SM Documentation:** Claude Sonnet 4.5

### Completion Notes List

**2026-02-04 (commit 2934523):**
- ✅ Story 2.2 implémentée complètement
- ✅ 5 catégories avec templates personnalisés
- ✅ TanStack Form avec validation client
- ✅ Navigation vers confirmation avec secret code
- ✅ Design empathique et accessible

**2026-02-04 (commits dd5c935, 53126ec):**
- ✅ Numéros d'urgence corrigés (117, 143, 147)
- ✅ Validation form améliorée
- ✅ Redirect gracieux pour catégorie invalide

**2026-02-04 (commits 88a8388, f903f26):**
- ✅ Contrastes améliorés pour WCAG 2.1 AA
- ✅ Visibilité texte warnings optimisée

**2026-02-04 (commit 01b6293):**
- ✅ Refactoring majeur: templates consolidés en config centrale
- ✅ Réduction duplication code (-75 lignes)
- ✅ Maintenabilité améliorée

**2026-02-05 (SM Documentation):**
- 📝 Story file créé avec analyse exhaustive
- 📝 Gap tests identifié comme dette technique
- 📝 Tous les commits documentés
- 📝 Architecture patterns expliqués
- 📝 Status: done (implémentation complète)

### File List

**Files Created:**
- `src/routes/threads/new/$category.tsx` (258 lignes) - Template component

**Files Modified:**
- `src/data/threads-categories.ts` (+48 lignes) - Config centralisée avec templates

**Files Referenced:**
- `src/features/threads/server/create-thread.ts` - Server function existante
- `src/routes/threads/new/index.tsx` - Page sélection catégorie (Story 2.1)
- `src/routes/threads/confirmation.tsx` - Page confirmation après publication

**Tests Missing (Technical Debt):**
- `src/routes/threads/new/__tests__/new-thread-form.test.tsx` (❌ à créer)
- `src/routes/threads/new/__tests__/new-thread-form.a11y.test.tsx` (❌ à créer)
- `src/routes/threads/new/__tests__/category-template.e2e.test.ts` (❌ à créer)

---

## 🎉 Story Completion Summary

**Status:** ✅ **DONE**

**Implementation Date:** 2026-02-04

**Functional Completeness:** 100%

**Test Coverage:** 0% (Technical Debt identified)

**Recommendation:** Story can be marked as done. Tests should be created in a future sprint or as separate technical debt story.
