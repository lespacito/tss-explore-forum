# Story 2.3: Éditeur de contenu avec formatage

Status: ready-for-dev

<!-- Story ready for implementation with comprehensive context -->

## ⚠️ IMPORTANT: Recommandation mise à jour (2026-02-05)

**Changement:** @uiw/react-md-editor → **Tiptap (WYSIWYG)**

**Raison:** Après recherche approfondie et comparaison Tiptap vs Markdown:

- ✅ **WYSIWYG élimine friction cognitive** pour utilisateurs en détresse
- ✅ **Courbe d'apprentissage: 30 sec** (toolbar) vs 2-5 min (syntaxe markdown)
- ✅ **Trauma-informed design:** Feedback visuel immédiat sans syntaxe à mémoriser
- ✅ **Sécurité:** CVE-2025-14284 patchée (Tiptap) vs XSS non fixés (markdown editor)
- ⚠️ **Trade-off bundle:** 50 KB vs 4.6 KB (acceptable, lazy-load possible)

**Principe clé:** Pour un forum trauma, réduire la charge cognitive > minimiser bundle size.

---

## Story

As a **utilisateur en train de rédiger**,
I want **pouvoir écrire et formater le contenu de ma publication avec sauvegarde automatique**,
So that **je puisse exprimer clairement ma situation sans risquer de perdre mon contenu émotionnellement coûteux**.

## Acceptance Criteria

### AC1: Formatage de base disponible

**Given** je suis sur le formulaire de création de thread (`/threads/new/$category`)
**When** je tape mon message dans l'éditeur
**Then** je peux utiliser un formatage de base (gras, italique, listes)
**And** l'éditeur supporte le markdown simple et sécurisé
**And** une barre d'outils simple affiche les options de formatage disponibles
**And** l'interface reste simple et non-intimidante

**STATUS:** ❌ NON IMPLÉMENTÉ

**Implementation Note:**

- Remplacer le `<Textarea>` actuel par un éditeur markdown lightweight
- Formatage limité à: **gras**, _italique_, listes (ul, ol), citations
- Pas d'images, pas d'HTML brut, pas de liens (sécurité + simplicité)

### AC2: Sauvegarde automatique du brouillon

**Given** je tape du contenu dans l'éditeur
**When** je fais une pause dans ma rédaction
**Then** mon brouillon est automatiquement sauvegardé (localStorage ou DB)
**And** un indicateur visuel confirme "Brouillon sauvegardé"
**And** si je reviens plus tard, mon contenu est restauré
**And** le brouillon est effacé après soumission réussie

**STATUS:** ❌ NON IMPLÉMENTÉ

**Implementation Note:**

- Auto-save déclenché après 1.5 secondes d'inactivité (debounce)
- Stockage localStorage (clé: `draft-thread-${category}`)
- Fallback DB si authentifié (optionnel pour MVP)
- Afficher toast/badge "Brouillon sauvegardé automatiquement"

### AC3: Validation sécurisée côté client

**Given** je soumets le formulaire
**When** la validation s'exécute
**Then** le contenu markdown est validé côté client
**And** la validation empêche l'injection de contenu malveillant
**And** les balises HTML brutes sont désactivées
**And** les messages d'erreur sont clairs et empathiques

**STATUS:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ

**Existant:**

- Validation longueur titre (3-200 caractères) ✅
- Validation longueur corps (10-10000 caractères) ✅
- Toast error messages ✅

**Manquant:**

- Validation markdown spécifique ❌
- Sanitization avant envoi ❌
- Whitelist d'éléments markdown autorisés ❌

### AC4: Prévisualisation du rendu markdown

**Given** je tape du contenu formaté en markdown
**When** je bascule en mode prévisualisation
**Then** je vois comment mon message sera affiché
**And** le rendu utilise les mêmes styles que l'affichage public
**And** je peux basculer entre édition et prévisualisation

**STATUS:** ❌ NON IMPLÉMENTÉ

**Implementation Note:**

- Tab system ou toggle button (Édition | Aperçu)
- Utiliser `react-markdown` pour le rendu
- Appliquer les mêmes classes CSS que dans `/threads/$threadId`
- Preview read-only (pas d'édition dans preview mode)

### AC5: Accessibilité WCAG 2.1 AA

**Given** j'utilise un lecteur d'écran ou la navigation clavier
**When** j'interagis avec l'éditeur
**Then** tous les éléments sont accessibles au clavier
**And** la barre d'outils a des labels ARIA appropriés
**And** les contrastes respectent le ratio minimum de 4.5:1
**And** le focus est visible et logique

**STATUS:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ

**Existant:**

- Labels sur champs (titre, corps) ✅
- Textarea accessible au clavier ✅

**Manquant:**

- ARIA labels sur barre outils markdown ❌
- Keyboard shortcuts documentés ❌
- Tests accessibilité automatisés ❌
- Focus management dans toolbar ❌

### AC6: Sécurité côté serveur (sanitization)

**Given** le serveur reçoit le contenu markdown
**When** le serveur traite la soumission
**Then** le markdown est sanitizé côté serveur
**And** seuls les éléments whitelistés sont autorisés
**And** aucun script ou HTML dangereux n'est persisté
**And** le contenu est stocké comme markdown brut

**STATUS:** ⚠️ VALIDATION EXISTANTE, SANITIZATION MANQUANTE

**Existant:**

- Validation Zod côté serveur (longueurs) ✅
- Stockage en base de données ✅

**Manquant:**

- Sanitization markdown côté serveur ❌
- Whitelist éléments markdown (h2, h3, p, ul, ol, li, em, strong, blockquote) ❌
- Protection XSS dans markdown ❌

## Current Implementation Analysis

### ✅ What Exists (Baseline)

**1. Route `/threads/new/$category.tsx`** (Story 2.2)

Composant actuel avec Textarea basique:

```typescript
<form.Field name="body">
  {(field) => (
    <Textarea
      id={field.name}
      name={field.name}
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      placeholder={categoryConfig.bodyPlaceholder}
      className="min-h-[300px]"
    />
  )}
</form.Field>
```

**Fonctionnalités existantes:**

- TanStack Form integration ✅
- Validation longueur (10-10000 caractères) ✅
- Placeholders personnalisés par catégorie ✅
- Compteur de caractères temps réel ✅
- Toast error messages ✅

**2. Composant `src/components/ui/textarea.tsx`**

Textarea Shadcn standard:

- Styling basique
- ARIA support minimal
- Pas de formatage markdown

**3. Server function `createThreadFn`**

Server function existante:

- Validation Zod (titre, body, category)
- Création thread en DB
- Secret code generation (première pub)
- Navigation vers confirmation

### ❌ What Needs to Be Added

**1. Rich Text Editor Component (WYSIWYG)**

Remplacer Textarea par éditeur WYSIWYG:

- **Recommandation:** `Tiptap` (~50 kB gzipped, optimisable à ~30-40 kB)
- **Pourquoi WYSIWYG > Markdown:** Utilisateurs en détresse cognitive ont besoin de **feedback visuel immédiat** sans syntaxe à apprendre
- Alternative légère si bundle critique: `@uiw/react-md-editor` (4.6 kB, mais markdown = friction cognitive)
- TanStack Form compatible
- Toolbar simple (Bold, Italic, Lists, Blockquote)
- Pas de preview mode nécessaire (WYSIWYG = ce que tu vois est ce que tu obtiens)

**2. Auto-Save System**

Implémenter sauvegarde automatique:

- Debounce onChange (1500ms recommandé)
- localStorage storage avec clé `draft-thread-${category}`
- Restauration au mount du composant
- Clear draft après submit réussi
- Visual feedback (toast ou badge "Brouillon sauvegardé")

**3. Security Layer (Client)**

Validation HTML côté client (Tiptap génère HTML):

- Whitelist éléments HTML autorisés
- Désactiver scripts, iframes, images (pour MVP)
- Configure Tiptap pour limiter extensions dangereuses
- Validation avant submit

**4. Security Layer (Server)**

Sanitization côté serveur:

- **Package:** `sanitize-html` (recommandé pour Tiptap) ou `isomorphic-dompurify`
- Whitelist: `p`, `h2`, `h3`, `ul`, `ol`, `li`, `em`, `strong`, `blockquote`, `br`
- Blacklist: `img`, `iframe`, `script`, `style`, `link`, `a` (optionnel: ajouter `a` avec validation URL)
- XSS protection (CVE-2025-14284 mitigée avec sanitization)

**5. HTML Rendering (Display)**

Composant pour afficher HTML sanitizé:

- **Package:** Tiptap peut aussi render (via `generateHTML()`) ou utiliser `dangerouslySetInnerHTML` après sanitization
- Alternative: `react-markdown` si conversion HTML → Markdown souhaité
- Utiliser dans `/threads/$threadId` pour afficher threads
- Appliquer même sécurité (sanitize-html)
- Styling cohérent design system

**6. Tests**

Suite de tests complète:

- Tests unitaires éditeur
- Tests auto-save (debounce, restore, clear)
- Tests validation markdown
- Tests accessibilité (keyboard, ARIA)
- Tests E2E (création thread avec formatage)
- Tests sécurité (XSS, injection)

## Tasks / Subtasks

### Task 1: Installer et configurer Tiptap (AC: #1, #4)

- [ ] Subtask 1.1: `pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder sanitize-html`
- [ ] Subtask 1.2: Créer wrapper component `RichTextEditor.tsx` (ou `TiptapEditor.tsx`)
- [ ] Subtask 1.3: Configurer extensions minimales (Document, Paragraph, Text, Bold, Italic, BulletList, OrderedList, ListItem, Blockquote, HardBreak)
- [ ] Subtask 1.4: Désactiver extensions dangereuses (Image, CodeBlock, Table pour MVP)
- [ ] Subtask 1.5: Créer toolbar simple avec boutons (Bold, Italic, Lists, Blockquote)
- [ ] Subtask 1.6: Styling cohérent avec design system (Tailwind classes sur editor)

### Task 2: Intégrer Tiptap dans TanStack Form (AC: #1)

- [ ] Subtask 2.1: Remplacer `<Textarea>` par `<RichTextEditor>` dans `$category.tsx`
- [ ] Subtask 2.2: Connecter editor.getHTML() à TanStack Form field via onUpdate callback
- [ ] Subtask 2.3: Utiliser `Placeholder` extension pour placeholder personnalisé par catégorie
- [ ] Subtask 2.4: Implémenter compteur de caractères (editor.getText().length, limite 10-10000)
- [ ] Subtask 2.5: Tester que validation existante fonctionne (longueur HTML < longueur texte, ajuster limites)

### Task 3: Implémenter auto-save localStorage (AC: #2)

- [ ] Subtask 3.1: Créer hook `useAutoSaveDraft(key, value, delay)`
- [ ] Subtask 3.2: Implémenter debounce onChange (1500ms)
- [ ] Subtask 3.3: Sauvegarder dans localStorage avec clé `draft-thread-${category}`
- [ ] Subtask 3.4: Restaurer draft au mount si existe
- [ ] Subtask 3.5: Afficher toast "Brouillon sauvegardé" après save
- [ ] Subtask 3.6: Clear draft après submit réussi
- [ ] Subtask 3.7: Ajouter badge/indicator "Brouillon restauré" si draft chargé

### Task 4: Sécurité côté client (AC: #3)

- [ ] Subtask 4.1: Configurer Tiptap sans extensions dangereuses (pas Image, CodeBlock, Table)
- [ ] Subtask 4.2: Configurer Link extension avec validation URL (bloquer javascript:, data:)
- [ ] Subtask 4.3: Client-side validation HTML avant submit (optional, serveur est critique)
- [ ] Subtask 4.4: Messages d'erreur empathiques si contenu invalide

### Task 5: Sécurité côté serveur (AC: #6)

- [ ] Subtask 5.1: Installer `sanitize-html` pour server-side sanitization
- [ ] Subtask 5.2: Créer fonction `sanitizeHtml(content)` dans `/lib/security/`
- [ ] Subtask 5.3: Whitelist tags autorisés: `p`, `h2`, `h3`, `ul`, `ol`, `li`, `em`, `strong`, `blockquote`, `br`
- [ ] Subtask 5.4: Blacklist tags dangereux: `script`, `iframe`, `style`, `link`, `img` (optionnel: ajouter `a` avec allowedSchemes: ['http', 'https'])
- [ ] Subtask 5.5: Appliquer sanitization dans `createThreadFn` avant DB insert
- [ ] Subtask 5.6: Test: XSS attempts rejected (script tags, javascript: URLs, CVE-2025-14284)
- [ ] Subtask 5.7: Test: valid HTML accepted (bold, italic, lists)

### Task 6: Composant HtmlDisplay pour rendering (AC: #4, #6)

- [ ] Subtask 6.1: Créer composant `SafeHtmlDisplay.tsx` qui utilise `dangerouslySetInnerHTML` APRÈS sanitization
- [ ] Subtask 6.2: Appliquer `sanitizeHtml()` avant rendering
- [ ] Subtask 6.3: Alternative: Utiliser Tiptap en read-only mode avec `generateHTML()` pour rendering
- [ ] Subtask 6.4: Styling HTML (p, h2, h3, ul, ol, blockquote) avec design system
- [ ] Subtask 6.5: Intégrer dans `/threads/$threadId` pour afficher threads
- [ ] Subtask 6.6: Test: HTML sanitizé affiché correctement

### Task 7: Accessibilité WCAG 2.1 AA (AC: #5)

- [ ] Subtask 7.1: Ajouter ARIA labels sur toolbar buttons
- [ ] Subtask 7.2: Documenter keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- [ ] Subtask 7.3: Tester navigation clavier complète
- [ ] Subtask 7.4: Tester avec lecteur d'écran (VoiceOver/NVDA)
- [ ] Subtask 7.5: Vérifier contrastes toolbar (ratio 4.5:1 minimum)
- [ ] Subtask 7.6: Focus visible sur tous éléments toolbar

### Task 8: Tests unitaires (AC: #1-6)

- [ ] Subtask 8.1: Créer `src/routes/threads/new/__tests__/markdown-editor.test.tsx`
- [ ] Subtask 8.2: Test: render markdown editor
- [ ] Subtask 8.3: Test: onChange triggered correctly
- [ ] Subtask 8.4: Test: toolbar buttons work
- [ ] Subtask 8.5: Test: preview mode toggle
- [ ] Subtask 8.6: Test: validation longueur
- [ ] Subtask 8.7: Test: placeholder affiché
- [ ] Subtask 8.8: Total: ~10 tests

### Task 9: Tests auto-save (AC: #2)

- [ ] Subtask 9.1: Créer `src/routes/threads/new/__tests__/auto-save.test.tsx`
- [ ] Subtask 9.2: Test: draft saved after 1.5s inactivity
- [ ] Subtask 9.3: Test: draft restored on mount
- [ ] Subtask 9.4: Test: draft cleared after submit
- [ ] Subtask 9.5: Test: toast "Brouillon sauvegardé" displayed
- [ ] Subtask 9.6: Test: multiple drafts per category
- [ ] Subtask 9.7: Total: ~6 tests

### Task 10: Tests sécurité (AC: #3, #6)

- [ ] Subtask 10.1: Créer `src/lib/security/__tests__/sanitize-markdown.test.ts`
- [ ] Subtask 10.2: Test: script tags rejected
- [ ] Subtask 10.3: Test: iframe tags rejected
- [ ] Subtask 10.4: Test: img tags rejected
- [ ] Subtask 10.5: Test: valid markdown accepted (bold, italic, lists)
- [ ] Subtask 10.6: Test: XSS via markdown links rejected
- [ ] Subtask 10.7: Test: HTML entities escaped
- [ ] Subtask 10.8: Total: ~8 tests

### Task 11: Tests accessibilité (AC: #5)

- [ ] Subtask 11.1: Créer `src/routes/threads/new/__tests__/markdown-editor.a11y.test.tsx`
- [ ] Subtask 11.2: Test: no axe-core violations
- [ ] Subtask 11.3: Test: keyboard navigation works
- [ ] Subtask 11.4: Test: toolbar focusable with Tab
- [ ] Subtask 11.5: Test: ARIA labels present
- [ ] Subtask 11.6: Total: ~5 tests

### Task 12: Tests E2E Playwright (AC: #1-6)

- [ ] Subtask 12.1: Créer `src/routes/threads/new/__tests__/markdown-creation.e2e.test.ts`
- [ ] Subtask 12.2: Test E2E: create thread with bold text
- [ ] Subtask 12.3: Test E2E: create thread with lists
- [ ] Subtask 12.4: Test E2E: preview mode works
- [ ] Subtask 12.5: Test E2E: auto-save restores draft
- [ ] Subtask 12.6: Test E2E: submit clears draft
- [ ] Subtask 12.7: Test E2E: formatted content displayed correctly
- [ ] Subtask 12.8: Total: ~8 tests

### Task 13: Documentation et validation finale (AC: #1-6)

- [ ] Subtask 13.1: Mettre à jour `project-context.md` avec markdown usage
- [ ] Subtask 13.2: Documenter whitelist markdown dans CLAUDE.md
- [ ] Subtask 13.3: Créer guide utilisateur markdown (optionnel)
- [ ] Subtask 13.4: Vérifier TypeScript: 0 erreurs diagnostic
- [ ] Subtask 13.5: Exécuter tous les tests: 100% pass rate
- [ ] Subtask 13.6: Vérifier lint/format: `pnpm check`
- [ ] Subtask 13.7: Marquer story comme done dans sprint-status.yaml

## Dev Notes

### Architecture & Patterns

**Recommended Package Choice:**

```
@uiw/react-md-editor (4.6 kB gzipped)
+ react-markdown (42.6 kB gzipped)
+ isomorphic-dompurify (sanitization)
```

**Total bundle impact:** ~50 kB (acceptable for MVP)

**Alternative (si WCAG 2.1 AA certification critique):**

- Lexical (~40-50 kB) - Explicitly WCAG 2.1 AA compliant
- Trade-off: Larger bundle, steeper learning curve

**Pattern: Edit → Store → Render**

```
1. Editor (lightweight)
   @uiw/react-md-editor → plain markdown string

2. Storage (database)
   threads.body: TEXT (markdown brut)

3. Security (server)
   sanitizeMarkdown() → whitelist éléments

4. Display (rendering)
   react-markdown + DOMPurify → HTML sécurisé
```

**Structure implémentée:**

```
src/
├── components/
│   └── markdown/
│       ├── MarkdownEditor.tsx        # À CRÉER (wrapper @uiw)
│       └── MarkdownDisplay.tsx       # À CRÉER (react-markdown)
├── hooks/
│   └── useAutoSaveDraft.ts           # À CRÉER (auto-save logic)
├── lib/
│   └── security/
│       ├── sanitize-markdown.ts      # À CRÉER (server sanitization)
│       └── __tests__/
│           └── sanitize-markdown.test.ts  # À CRÉER
├── routes/
│   └── threads/
│       ├── new/
│       │   ├── $category.tsx         # À MODIFIER (use MarkdownEditor)
│       │   └── __tests__/
│       │       ├── markdown-editor.test.tsx      # À CRÉER
│       │       ├── auto-save.test.tsx            # À CRÉER
│       │       ├── markdown-editor.a11y.test.tsx # À CRÉER
│       │       └── markdown-creation.e2e.test.ts # À CRÉER
│       └── $threadId.tsx             # À MODIFIER (use MarkdownDisplay)
```

### Considérations de sécurité

**1. XSS Protection (Defense in Depth)**

Layer 1 - Client validation:

- Désactiver HTML brut dans @uiw editor
- Whitelist éléments markdown autorisés

Layer 2 - Server sanitization:

- `isomorphic-dompurify` sanitization
- Whitelist strict avant DB insert

Layer 3 - Rendering protection:

- `react-markdown` avec `allowedElements`
- `DOMPurify` avant React rendering

**2. Whitelist Éléments Markdown**

```typescript
const ALLOWED_MARKDOWN_ELEMENTS = [
  "h2",
  "h3", // Headings (pas h1 pour hiérarchie)
  "p", // Paragraphes
  "ul",
  "ol",
  "li", // Listes
  "em",
  "strong", // Formatage (italique, gras)
  "blockquote", // Citations
];

const BLOCKED_ELEMENTS = [
  "img", // Images (optionnel pour MVP)
  "a", // Links (risque phishing)
  "iframe", // Embeds dangereux
  "script",
  "style", // Code injection
  "link",
  "meta", // Metadata manipulation
];
```

**3. Storage Security**

- Stocker HTML **sanitizé** (Tiptap génère HTML nativement)
- Sanitization AVANT insert DB (critique)
- `dangerouslySetInnerHTML` UNIQUEMENT après sanitization
- Audit logs pour contenu modéré
- Alternative: Stocker HTML + markdown avec `@tiptap/extension-markdown` si portabilité nécessaire

### UX Guidelines respectées

**Tone empathique pour utilisateurs en détresse:**

- ✅ Interface simple, pas intimidante
- ✅ Formatage limité (pas de surcharge cognitive)
- ✅ Auto-save automatique (zéro perte de contenu émotionnel)
- ✅ Preview optionnel (pas obligatoire)
- ✅ Messages d'erreur bienveillants

**Auto-Save UX Pattern:**

```typescript
// Debounce 1.5s (équilibre entre sauvegarde fréquente et performance)
const handleAutoSave = useCallback(
  debounce((markdown: string) => {
    localStorage.setItem(`draft-thread-${category}`, markdown);
    toast.success("Brouillon sauvegardé automatiquement", { duration: 2000 });
  }, 1500),
  [category],
);
```

**Design apaisant:**

- Toolbar subtile, pas agressive
- Icons empathiques (lucide-react)
- Contrastes WCAG 2.1 AA
- Focus ring visible mais doux

**Performance:**

- Editor léger (4.6 kB)
- Lazy load preview mode
- Debounced auto-save
- SSR rendering pour affichage threads

### Dépendances

**Stories prérequises (COMPLÈTES):**

- Story 2.1: Choix de catégorie ✅
- Story 2.2: Template guidé ✅

**Stories dépendantes (FUTURES):**

- Story 2.4: Soumission pour modération (utilisera markdown sanitizé)
- Story 3.5: Lecture complète avec réponses (utilisera MarkdownDisplay)
- Story 4.1: Création de réponses (réutilisera MarkdownEditor)

**Packages à installer:**

```bash
pnpm add @uiw/react-md-editor react-markdown rehype-sanitize isomorphic-dompurify
pnpm add -D @types/dompurify
```

### Testing Standards Summary

**Tests requis:**

| Type      | Fichier                       | Tests   | Priority |
| --------- | ----------------------------- | ------- | -------- |
| Unit      | markdown-editor.test.tsx      | ~10     | HIGH     |
| Unit      | auto-save.test.tsx            | ~6      | HIGH     |
| Unit      | sanitize-markdown.test.ts     | ~8      | CRITICAL |
| A11y      | markdown-editor.a11y.test.tsx | ~5      | HIGH     |
| E2E       | markdown-creation.e2e.test.ts | ~8      | MEDIUM   |
| **Total** |                               | **~37** |          |

**Coverage cibles:**

- Editor component: 100%
- Auto-save logic: 100%
- Sanitization security: 100%
- Accessibilité: 0 violations axe-core
- E2E critical path: Thread création avec markdown

### Project Structure Notes

**Fichiers à créer:**

```
src/components/markdown/
├── MarkdownEditor.tsx                # Wrapper @uiw, TanStack Form compatible
└── MarkdownDisplay.tsx               # react-markdown + security

src/hooks/
└── useAutoSaveDraft.ts               # Auto-save hook with debounce

src/lib/security/
├── sanitize-markdown.ts              # Server-side sanitization
└── __tests__/
    └── sanitize-markdown.test.ts     # Security tests

src/routes/threads/new/__tests__/
├── markdown-editor.test.tsx          # Component tests
├── auto-save.test.tsx                # Auto-save tests
├── markdown-editor.a11y.test.tsx     # Accessibility tests
└── markdown-creation.e2e.test.ts     # E2E tests
```

**Fichiers à modifier:**

```
src/routes/threads/new/
└── $category.tsx                     # Replace Textarea with MarkdownEditor

src/routes/threads/
└── $threadId.tsx                     # Add MarkdownDisplay for thread body

src/features/threads/server/
└── create-thread.ts                  # Add sanitizeMarkdown() before insert
```

### Web Research Intelligence

**Source: Web research agent (2026-02-05) - UPDATED with Tiptap comparison**

**Editor Comparison (WYSIWYG vs Markdown):**

| Editor               | Bundle Size | Maintenance     | Accessibility  | Security               | Learning Curve | Cognitive Load         |
| -------------------- | ----------- | --------------- | -------------- | ---------------------- | -------------- | ---------------------- |
| **Tiptap** ✅        | ~50 kB      | Very active ✅  | Keyboard + SR  | CVE-2025-14284 patched | 30 sec         | **Zero friction** ✅   |
| @uiw/react-md-editor | 4.6 kB      | Active ✅       | Custom needed  | XSS unfixed #56, #249  | 2-5 min        | **Syntax friction** ❌ |
| Lexical              | ~40-50 kB   | Very active ✅  | WCAG 2.1 AA ✅ | Manual                 | Medium         | Low friction           |
| react-simplemde      | N/A         | Unmaintained ❌ | Limited        | Requires layer         | Medium         | Syntax friction        |

**Recommendation rationale (UPDATED):**

- **Tiptap** chosen despite larger bundle because:
  - ✅ **WYSIWYG = Zero cognitive friction** (critical for trauma survivors)
  - ✅ **30-second learning curve** (click Bold button vs learning `**bold**` syntax)
  - ✅ **Trauma-informed design:** Immediate visual feedback, no mental translation
  - ✅ **Active security patches:** CVE-2025-14284 addressed in v2.10.4+
  - ✅ **Better accessibility:** Keyboard nav + screen reader support
  - ✅ **Familiar metaphor:** Feels like Word/Google Docs
  - ⚠️ **Bundle trade-off:** 50 KB vs 4.6 KB acceptable (1-2 sec on 3G), lazy-load possible

- **Why NOT @uiw/react-md-editor:**
  - ❌ Markdown syntax adds cognitive friction for distressed users
  - ❌ Split pane (edit | preview) = visual complexity
  - ❌ Unpatched XSS vulnerabilities (#56, #249)
  - ❌ Users must learn: `**bold**`, `*italic*`, `- lists`, etc.

**Research insight (2026 UX):**

> "Users under cognitive load need immediate visual feedback. Markdown notation requires learning and remembering syntax rules—a barrier when processing emotional distress."

**Security Strategy (Defense in Depth) - UPDATED for Tiptap:**

```
Editor (Tiptap) → HTML via editor.getHTML()
    ↓
Client config (no dangerous extensions: Image, CodeBlock, Table)
    ↓
Server sanitization (sanitize-html + whitelist)
    ↓
Database (HTML TEXT sanitized)
    ↓
Rendering (dangerouslySetInnerHTML après sanitization OU Tiptap read-only)
    ↓
HTML output (secured)
```

**Auto-Save Pattern (Research-backed):**

```typescript
// 1500ms debounce optimal for UX
// - Not too frequent (performance)
// - Not too slow (data loss risk)
// - User typing speed: ~60-80 WPM = ~1 word/second

const AUTOSAVE_DELAY = 1500; // ms
```

### References

- [Source: FR10 dans epics.md] - "Un utilisateur peut écrire et formater le contenu de sa publication"
- [Source: Story 2.3 dans epics-mvp.md] - Requirements détaillés et AC
- [Source: Web research agent #1] - Initial @uiw/react-md-editor research (4.6 kB)
- [Source: Web research agent #2] - **Tiptap vs @uiw comparison (UPDATED recommendation)**
- [Source: Web research agent] - Security strategy (sanitize-html for Tiptap)
- [Source: Web research agent] - Auto-save pattern (1500ms debounce)
- [Source: Web research agent] - WYSIWYG better for cognitive load (2026 UX research)
- [Source: src/routes/threads/new/$category.tsx] - Current Textarea implementation
- [Source: project-context.md#Core-Principles] - "reduce friction, vulnerable users, mobile-first"
- [Source: architecture.md#Frontend-Architecture] - TanStack Form patterns
- [Tiptap Docs](https://tiptap.dev/) - WYSIWYG editor documentation
- [Tiptap Security](https://tiptap.dev/security) - CVE-2025-14284 and security practices
- [sanitize-html Docs](https://www.npmjs.com/package/sanitize-html) - HTML sanitization library
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
- [Trauma-Informed Design](https://www.holstarc.com/research-development/trauma-informed-design/) - Design principles for vulnerable users

### Known Constraints & Risks

**Technical Constraints:**

- Bundle size: Maintain <100 kB total for editor + security + rendering
- TanStack Form: Must integrate seamlessly with existing form logic
- Mobile: Editor must work on small screens (trauma users often mobile)
- Performance: Auto-save must not lag typing experience

**Risks & Mitigations:**

1. **Risk: XSS via markdown injection**
   - Mitigation: Defense in depth (client + server sanitization)
   - Priority: CRITICAL

2. **Risk: Auto-save fails silently**
   - Mitigation: Visual feedback (toast + badge)
   - Fallback: localStorage always available
   - Priority: HIGH

3. **Risk: Accessibility not WCAG 2.1 AA compliant**
   - Mitigation: Custom ARIA labels, keyboard testing
   - Alternative: Use Lexical if certification needed
   - Priority: HIGH

4. **Risk: Markdown too complex for distressed users**
   - Mitigation: Limit formatage (gras, italique, listes only)
   - Toolbar buttons (pas de syntax markdown requis)
   - Priority: MEDIUM

5. **Risk: Data loss during long editing sessions**
   - Mitigation: Auto-save every 1.5s, localStorage persistent
   - Priority: HIGH (critical for trauma content)

6. **Risk: Bundle size bloat**
   - Mitigation: @uiw chosen for minimal footprint (4.6 kB)
   - Lazy load preview mode
   - Priority: MEDIUM

**UX Considerations:**

- Users en détresse cognitive: Interface DOIT rester simple
- Formatage limité intentionnellement (pas de surcharge)
- Auto-save automatique (pas de bouton "Sauvegarder" à cliquer)
- Preview optionnel (pas obligatoire pour submit)

**Scope Note:**

Story 2.3 est une story **moyenne-lourde** en complexité:

- Nouveau package (markdown editor)
- Nouveau pattern (auto-save)
- Sécurité critique (XSS protection)
- Accessibilité importante (WCAG 2.1 AA)
- Tests exhaustifs requis (~37 tests)

**Effort estimé:** 2-3 jours développement

- Jour 1: Editor integration + auto-save
- Jour 2: Security (client + server) + rendering
- Jour 3: Tests complets + accessibilité

## Dev Agent Record

### Agent Model Used

SM Agent: Claude Sonnet 4.5

### Debug Log References

(À remplir pendant l'implémentation)

### Completion Notes List

**2026-02-05 (SM Documentation):**

- 📝 Story file créé avec contexte complet
- 🔬 Web research completed (@uiw/react-md-editor recommended)
- 📐 Architecture patterns définis (Edit → Store → Render)
- 🔒 Security strategy documented (defense in depth)
- ♿ Accessibility requirements clarified (WCAG 2.1 AA)
- ✅ 37 tests planifiés (unit, integration, a11y, E2E)
- 📦 Package recommendations: @uiw (4.6 kB) + react-markdown (42.6 kB)
- 💾 Auto-save pattern: 1500ms debounce, localStorage primary
- 🎯 Ready for Dev agent implementation

### File List

**Files to Create (Story 2.3):**

- `src/components/markdown/MarkdownEditor.tsx` (~100 lignes estimées)
- `src/components/markdown/MarkdownDisplay.tsx` (~50 lignes estimées)
- `src/hooks/useAutoSaveDraft.ts` (~60 lignes estimées)
- `src/lib/security/sanitize-markdown.ts` (~40 lignes estimées)
- `src/lib/security/__tests__/sanitize-markdown.test.ts` (~150 lignes estimées)
- `src/routes/threads/new/__tests__/markdown-editor.test.tsx` (~180 lignes estimées)
- `src/routes/threads/new/__tests__/auto-save.test.tsx` (~120 lignes estimées)
- `src/routes/threads/new/__tests__/markdown-editor.a11y.test.tsx` (~100 lignes estimées)
- `src/routes/threads/new/__tests__/markdown-creation.e2e.test.ts` (~200 lignes estimées)

**Files to Modify:**

- `src/routes/threads/new/$category.tsx` (~30 lignes changées - replace Textarea)
- `src/routes/threads/$threadId.tsx` (~20 lignes ajoutées - add MarkdownDisplay)
- `src/features/threads/server/create-thread.ts` (~10 lignes ajoutées - sanitization)
- `package.json` (+4 dependencies)

**Total estimation:** ~1020 lignes de code nouveau + tests

---

## 🎯 Story Readiness Summary

**Status:** ✅ **READY-FOR-DEV**

**Context Completeness:** 100%

- Requirements clarified from epics ✅
- Current baseline documented ✅
- Web research completed ✅
- Architecture patterns defined ✅
- Security strategy detailed ✅
- Testing plan comprehensive ✅

**Implementation Confidence:** HIGH

- Clear package recommendations (@uiw + react-markdown)
- Patterns documented (auto-save, sanitization, TanStack Form)
- 13 tasks with 90+ subtasks (actionable)
- File structure planned
- Effort estimated (2-3 days)

**Recommendation:** Story ready for Dev agent. All context provided for flawless implementation.
