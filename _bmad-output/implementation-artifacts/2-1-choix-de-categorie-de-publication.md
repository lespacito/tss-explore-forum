# Story 2.1: Choix de Catégorie de Publication

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur connecté (anonyme ou enregistré)**,
I want **choisir une catégorie appropriée pour ma publication**,
so that **je puisse bénéficier de guidance adaptée à ma situation**.

## Acceptance Criteria

### AC1: Affichage de la liste des catégories prédéfinies

**Given** je suis connecté et veux créer une publication
**When** j'accède à la page de création de contenu (`/threads/new/`)
**Then** une liste de catégories prédéfinies est affichée clairement
**And** chaque catégorie a une description courte et empathique
**And** les catégories sont organisées par thématiques sensibles
**And** je peux sélectionner une seule catégorie pour ma publication
**And** un avertissement de sécurité (numéros d'urgence) est visible

**STATUS:** ✅ IMPLÉMENTÉ

- Route `/threads/new/` existe avec composant NewThreadPage
- 5 catégories configurées dans `src/data/threads-categories.ts`
- Descriptions empathiques et helpText par catégorie
- Grille responsive avec sélection unique
- Avertissement de sécurité (17, 3919, 15) affiché

### AC2: Sélection et navigation vers le template correspondant

**Given** j'ai sélectionné une catégorie
**When** je clique sur "Continuer"
**Then** le système enregistre ma sélection
**And** je suis dirigé vers le template correspondant (`/threads/new/$category`)
**And** la catégorie choisie influence le template affiché (FR9 - Story 2.2)

**STATUS:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ

- Sélection de catégorie fonctionne ✅
- Navigation vers `/threads/new/$category` configurée ✅
- **MANQUE:** Route `/threads/new/$category` n'existe pas encore (Story 2.2)
- La navigation échouera actuellement (404)

### AC3: Accessibilité WCAG 2.1 AA

**Given** je navigue sur la page de sélection de catégorie
**When** j'utilise le clavier ou un lecteur d'écran
**Then** tous les éléments interactifs sont accessibles au clavier
**And** les boutons de catégorie ont des états ARIA appropriés
**And** les contrastes respectent le ratio minimum de 4.5:1
**And** la navigation au focus est logique et visible

**STATUS:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ

- `aria-pressed` utilisé pour sélection ✅
- Boutons natifs accessibles au clavier ✅
- **MANQUE:** Tests d'accessibilité automatisés
- **MANQUE:** Vérification des contrastes
- **MANQUE:** Focus visible cohérent

### AC4: Protection de route authentifiée

**Given** je ne suis pas connecté (pas de session)
**When** j'accède à `/threads/new/`
**Then** je suis redirigé vers la page de connexion ou d'authentification anonyme
**And** après connexion, je suis redirigé vers `/threads/new/`

**STATUS:** ❌ NON VÉRIFIÉ

- Aucun loader de route avec vérification de session visible
- La page pourrait être accessible sans authentification

### AC5: Tests et validation

**Given** le composant NewThreadPage est développé
**When** les tests sont exécutés
**Then** tous les tests unitaires passent (render, sélection, navigation)
**And** les tests d'accessibilité passent (axe-core)
**And** les tests E2E valident le flux complet

**STATUS:** ❌ NON IMPLÉMENTÉ

- Aucun test trouvé pour `/threads/new/`
- Aucun test d'accessibilité

## Existing Implementation Analysis

### ✅ What Already Exists

**1. Categories Configuration (`src/data/threads-categories.ts`)**

```typescript
export type ThreadCategory = "VIOLENCE" | "ABUS" | "TEMOIN" | "DETRESSE" | "AUTRE";

export interface CategoryConfig {
  id: ThreadCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  helpText?: string;
}

export const threadCategories: CategoryConfig[] = [
  {
    id: "VIOLENCE",
    label: "Violence",
    description: "Partager une expérience de violence physique ou psychologique",
    icon: "🛡️",
    helpText: "Vous êtes en sécurité ici. Prenez le temps dont vous avez besoin.",
  },
  // ... 4 autres catégories
];
```

**2. Page de Sélection (`src/routes/threads/new/index.tsx`)**

- Composant `NewThreadPage` fonctionnel
- Grille responsive de catégories
- État local pour sélection (`useState`)
- Navigation vers `/threads/new/$category`
- Avertissement de sécurité (numéros d'urgence)
- Texte d'aide contextuel affiché après sélection

**3. Schema DB (`src/db/schemas/thread.ts`)**

- Enum `threadsCategoryEnum` synchronisé avec types TypeScript
- Contrainte de catégorie sur la table `threads`

### ❌ What Needs to Be Added/Enhanced

1. **Route protection (AC4)** - Ajouter loader avec vérification de session
2. **Tests unitaires (AC5)** - Couvrir render, sélection, navigation, états
3. **Tests d'accessibilité (AC3/AC5)** - Intégrer axe-core ou @testing-library/jest-dom
4. **Tests E2E (AC5)** - Flux complet de sélection avec Playwright
5. **Focus management (AC3)** - Focus ring visible sur tous les éléments
6. **Fallback UX (AC2)** - Gestion gracieuse si route cible n'existe pas encore

## Tasks / Subtasks

### Task 1: Ajouter protection de route authentifiée (AC: #4)

- [ ] Subtask 1.1: Ajouter loader à `/threads/new/index.tsx` avec `getAuthSession()`
- [ ] Subtask 1.2: Si pas de session, rediriger vers `/auth/login` avec `redirect` query param
- [ ] Subtask 1.3: Si utilisateur anonyme, permettre l'accès (isAnonymous: true)
- [ ] Subtask 1.4: Si utilisateur enregistré, permettre l'accès (isAnonymous: false)
- [ ] Subtask 1.5: Test: accès sans session → redirection
- [ ] Subtask 1.6: Test: accès avec session anonyme → page affichée
- [ ] Subtask 1.7: Test: accès avec session enregistrée → page affichée

### Task 2: Améliorer l'accessibilité (AC: #3)

- [ ] Subtask 2.1: Ajouter `focus-visible:ring-2 focus-visible:ring-primary` aux boutons catégorie
- [ ] Subtask 2.2: Ajouter `role="group"` au conteneur de catégories avec `aria-label`
- [ ] Subtask 2.3: Ajouter `aria-describedby` pour lier boutons aux descriptions
- [ ] Subtask 2.4: Vérifier contrastes avec outil (ex: axe DevTools)
- [ ] Subtask 2.5: Ajouter heading level approprié (`h1` existe déjà, vérifier hiérarchie)
- [ ] Subtask 2.6: Test manuel avec lecteur d'écran (VoiceOver/NVDA)

### Task 3: Créer tests unitaires du composant (AC: #5)

- [ ] Subtask 3.1: Créer `src/routes/threads/new/__tests__/new-thread-page.test.tsx`
- [ ] Subtask 3.2: Test: render initial - toutes les catégories affichées
- [ ] Subtask 3.3: Test: avertissement de sécurité visible
- [ ] Subtask 3.4: Test: clic sur catégorie → sélection visuelle
- [ ] Subtask 3.5: Test: bouton "Continuer" désactivé sans sélection
- [ ] Subtask 3.6: Test: bouton "Continuer" activé avec sélection
- [ ] Subtask 3.7: Test: clic "Continuer" → navigation appelée avec bons params
- [ ] Subtask 3.8: Test: clic "Annuler" → navigation vers /threads
- [ ] Subtask 3.9: Test: helpText affiché après sélection
- [ ] Subtask 3.10: Test: aria-pressed reflète l'état de sélection
- [ ] Subtask 3.11: Total: ~10 tests unitaires

### Task 4: Créer tests d'accessibilité (AC: #3, #5)

- [ ] Subtask 4.1: Installer `@axe-core/react` ou utiliser `toHaveNoViolations` de jest-axe
- [ ] Subtask 4.2: Créer `src/routes/threads/new/__tests__/new-thread-page.a11y.test.tsx`
- [ ] Subtask 4.3: Test: pas de violations axe-core au render initial
- [ ] Subtask 4.4: Test: pas de violations avec catégorie sélectionnée
- [ ] Subtask 4.5: Test: tous les éléments interactifs focusables
- [ ] Subtask 4.6: Test: ordre de focus logique (haut → bas, gauche → droite)
- [ ] Subtask 4.7: Total: ~5 tests d'accessibilité

### Task 5: Créer tests E2E avec Playwright (AC: #5)

- [ ] Subtask 5.1: Créer `src/routes/threads/new/__tests__/category-selection.e2e.test.ts`
- [ ] Subtask 5.2: Test E2E: utilisateur anonyme → accès page → sélection → continuer
- [ ] Subtask 5.3: Test E2E: utilisateur enregistré → accès page → sélection → continuer
- [ ] Subtask 5.4: Test E2E: navigation clavier seule (Tab + Enter)
- [ ] Subtask 5.5: Test E2E: mobile viewport → layout responsive correct
- [ ] Subtask 5.6: Test E2E: annulation → retour à /threads
- [ ] Subtask 5.7: Test E2E: changement de catégorie avant continuer
- [ ] Subtask 5.8: Total: ~8 tests E2E

### Task 6: Gérer le fallback UX pour route manquante (AC: #2)

- [ ] Subtask 6.1: Créer route placeholder `/threads/new/$category.tsx`
- [ ] Subtask 6.2: Afficher message "Template en construction" avec lien retour
- [ ] Subtask 6.3: Stocker la catégorie dans state pour Story 2.2
- [ ] Subtask 6.4: OU modifier navigation pour créer directement si template unique (optionnel)

### Task 7: Documentation et validation finale (AC: #1-5)

- [ ] Subtask 7.1: Mettre à jour `project-context.md` avec le flux de création
- [ ] Subtask 7.2: Vérifier TypeScript: 0 erreurs diagnostic
- [ ] Subtask 7.3: Exécuter tous les tests: 100% pass rate
- [ ] Subtask 7.4: Vérifier lint/format: `pnpm check`
- [ ] Subtask 7.5: Marquer story comme done dans sprint-status.yaml

## Dev Notes

### Architecture & Patterns

**Structure existante alignée avec architecture.md:**

```
src/
├── data/
│   └── threads-categories.ts    # Configuration des catégories (EXISTE)
├── routes/
│   └── threads/
│       └── new/
│           ├── index.tsx        # Page de sélection (EXISTE)
│           └── $category.tsx    # Template par catégorie (À CRÉER - Story 2.2)
└── features/
    └── threads/
        └── server/
            └── create-thread.ts # Création avec catégorie (EXISTE)
```

**Pattern de navigation TanStack Router:**

```typescript
// Navigation actuelle (correcte)
navigate({
  to: '/threads/new/$category',
  params: { category: selectedCategory },
});

// Route cible à créer (Story 2.2)
export const Route = createFileRoute('/threads/new/$category')({
  component: CategoryTemplateComponent,
  loader: async ({ params }) => {
    return { category: params.category };
  },
});
```

### Considérations de sécurité

1. **Protection de route obligatoire** - Seuls les utilisateurs authentifiés peuvent créer
2. **Validation catégorie** - Enum contraint côté DB, pas d'injection possible
3. **Pas de données sensibles** - Sélection de catégorie ne stocke rien encore

### UX Guidelines respectées

- ✅ Tone calme et empathique (descriptions, helpText)
- ✅ Avertissement de sécurité non-alarmiste
- ✅ Interface responsive mobile-first
- ✅ Feedback visuel sur sélection (ring, couleur)
- ✅ Bouton désactivé tant que pas de sélection

### Dépendances

**Stories prérequises (COMPLÈTES):**

- Story 1.1: Session anonyme immédiate ✅
- Story 1.4: Inscription email ✅
- Story 1.5: Connexion/Déconnexion ✅

**Stories dépendantes:**

- Story 2.2: Template guidé par catégorie (utilise la catégorie sélectionnée)
- Story 2.3: Éditeur de contenu (intégré au template)
- Story 2.4: Soumission pour modération (après rédaction)

### Testing Standards Summary

**Tests requis:**

| Type | Fichier | Tests | Status |
|------|---------|-------|--------|
| Unit | new-thread-page.test.tsx | ~10 | À créer |
| A11y | new-thread-page.a11y.test.tsx | ~5 | À créer |
| E2E | category-selection.e2e.test.ts | ~8 | À créer |
| **Total** | | **~23** | |

**Coverage cibles:**

- Render/affichage: 100%
- Interactions utilisateur: 100%
- Navigation: 100%
- Accessibilité: 0 violations axe-core

### Project Structure Notes

**Fichiers à créer:**

```
src/routes/threads/new/
├── __tests__/
│   ├── new-thread-page.test.tsx         # Task 3
│   ├── new-thread-page.a11y.test.tsx    # Task 4
│   └── category-selection.e2e.test.ts   # Task 5
└── $category.tsx                        # Task 6 (placeholder)
```

**Fichiers à modifier:**

```
src/routes/threads/new/
└── index.tsx                            # Task 1 (loader), Task 2 (a11y)
```

### Git Intelligence

**Commits récents pertinents:**

- `f627b08`: Story 1.6 - refactor validator to inputValidator (pattern à suivre)
- `ee45466`: Story 1.5 - Connexion/Déconnexion (référence auth flow)

**Pattern de loader avec auth (référence Story 1.5):**

```typescript
export const Route = createFileRoute('/threads/new/')({
  component: NewThreadPage,
  loader: async () => {
    const session = await getAuthSession();
    if (!session) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: '/threads/new' },
      });
    }
    return { session };
  },
});
```

### References

- [Source: epics.md#Story-2.1] - User story et acceptance criteria originaux
- [Source: architecture.md#Frontend-Architecture] - Patterns TanStack Form et Router
- [Source: project-context.md#Critical-User-Flows] - Flow 1 comme référence
- [Source: src/routes/threads/new/index.tsx] - Implémentation existante
- [Source: src/data/threads-categories.ts] - Configuration des catégories
- [Source: src/db/schemas/thread.ts] - Schema DB avec enum catégorie
- [WCAG 2.1 AA] - Guidelines accessibilité (https://www.w3.org/WAI/WCAG21/quickref/)
- [TanStack Router Docs] - File-based routing (https://tanstack.com/router)

### Known Constraints & Risks

**Technical Risks:**

1. **Route cible manquante** - `/threads/new/$category` n'existe pas encore
   - Mitigation: Task 6 crée un placeholder ou Story 2.2 est priorisée
2. **Tests E2E sans Playwright setup** - Configuration peut être incomplète
   - Mitigation: `playwright.config.ts` existe déjà dans le projet

**UX Risks:**

1. **Utilisateur clique "Continuer" et voit 404** - Mauvaise expérience
   - Mitigation: Créer placeholder immédiatement (Task 6)

**Scope Note:**

Cette story est la première de l'Epic 2 (Création de Contenu). L'implémentation existante couvre ~70% des besoins. Les tâches restantes sont principalement:

- Protection de route
- Tests complets
- Accessibilité renforcée
- Fallback UX

**Effort estimé:** 0.5-1 jour de développement (beaucoup existe déjà)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

(À remplir pendant l'implémentation)

### Completion Notes List

(À remplir pendant l'implémentation)

### File List

**Files Existing (analyzed):**

- `src/routes/threads/new/index.tsx` - Page de sélection (EXISTE, ~100 lignes)
- `src/data/threads-categories.ts` - Configuration catégories (EXISTE, ~70 lignes)
- `src/db/schemas/thread.ts` - Schema DB (EXISTE, ~50 lignes)

**Files to Create:**

- `src/routes/threads/new/__tests__/new-thread-page.test.tsx`
- `src/routes/threads/new/__tests__/new-thread-page.a11y.test.tsx`
- `src/routes/threads/new/__tests__/category-selection.e2e.test.ts`
- `src/routes/threads/new/$category.tsx` (placeholder)

**Files to Modify:**

- `src/routes/threads/new/index.tsx` (loader auth, a11y improvements)
