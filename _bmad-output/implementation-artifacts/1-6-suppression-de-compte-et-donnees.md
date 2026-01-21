# Story 1.6: Suppression de Compte et Données

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur enregistré**,
I want **pouvoir supprimer définitivement mon compte et toutes mes données**,
so that **je puisse exercer mon droit à l'effacement des données (RGPD Article 17)**.

## Acceptance Criteria

### AC1: Accès aux paramètres de suppression avec avertissements clairs

**Given** je suis connecté à mon compte enregistré (non-anonyme)
**When** j'accède à l'onglet "Danger" dans les paramètres
**Then** je vois le composant `AccountDeletion` avec bouton "Supprimer le compte définitivement"
**And** je vois un avertissement sur l'irréversibilité de l'action
**And** je comprends ce qui sera supprimé (données personnelles, sessions)
**And** je comprends ce qui sera fait avec mes publications (choix à implémenter)
**And** l'interface respecte un ton calme et non-alarmiste

**STATUS:** ✅ PARTIELLEMENT IMPLÉMENTÉ

- Route `/account/settings/` avec tab "Danger" existe ✅
- Composant `AccountDeletion` existe ✅
- Avertissements basiques via `requireAreYouSure` ✅
- Manque: Explication détaillée des conséquences
- Manque: Information sur le sort des publications

### AC2: Processus de confirmation en deux étapes

**Given** j'ai cliqué sur "Supprimer le compte définitivement"
**When** je confirme ma décision
**Then** une première confirmation me demande de cocher "Je comprends que cette action est irréversible"
**And** une seconde confirmation requiert la saisie de mon mot de passe
**And** le système valide mon mot de passe avant de procéder
**And** je peux annuler à tout moment avant la confirmation finale
**And** chaque étape est accessible (WCAG 2.1 AA)

**STATUS:** ⚠️ PARTIELLEMENT IMPLÉMENTÉ

- Confirmation basique via `requireAreYouSure` existe ✅
- Manque: Saisie mot de passe pour validation
- Manque: Confirmation en deux étapes distinctes

### AC3: Suppression complète des données personnelles

**Given** je confirme la suppression de mon compte avec mot de passe correct
**When** le processus de suppression s'exécute via Better Auth `deleteUser()`
**Then** toutes mes données personnelles sont supprimées de la base de données (email, password hash, username)
**And** mes aliases sont gérés selon la politique de rétention (à implémenter)
**And** mon secretCode est supprimé si présent
**And** tous mes tokens d'authentification sont invalidés immédiatement
**And** toutes mes sessions actives sont terminées sur tous les appareils
**And** un email de confirmation est envoyé avant la suppression définitive

**STATUS:** ✅ IMPLÉMENTÉ (via Better Auth)

- `auth.deleteUser.enabled = true` ✅
- Email verification template existe ✅
- `sendDeleteAccountVerificationEmail` implémenté ✅
- Manque: Gestion explicite des aliases
- Manque: Tests de vérification

### AC4: Gestion des publications selon politique de rétention

**Given** je possède des publications (threads, replies) liées à mes aliases
**When** mon compte est supprimé
**Then** le système me propose deux options avant suppression:

- Option A: Supprimer toutes mes publications
- Option B: Anonymiser mes publications (alias devient "utilisateur-supprimé")
  **And** si je choisis Option A, tous mes threads et replies sont hard-deleted avec CASCADE
  **And** si je choisis Option B, mes publications restent visibles mais l'auteur devient anonyme
  **And** l'option choisie est loggée pour audit trail
  **And** le traitement respecte l'intégrité référentielle de la base de données

**STATUS:** ❌ NON IMPLÉMENTÉ

- Aucune option de rétention actuelle
- Comportement CASCADE inconnu (à vérifier)
- Alias système "utilisateur-supprimé" n'existe pas

### AC5: Confirmation finale et impossibilité de reconnexion

**Given** ma suppression est terminée avec succès
**When** le processus se termine
**Then** je suis immédiatement déconnecté et redirigé via `callbackURL: "/"`
**And** une page confirme que mon compte a été définitivement supprimé
**And** je ne peux plus me reconnecter avec mes anciens identifiants (email/password)
**And** une tentative de connexion retourne "Identifiants invalides" (pas "compte supprimé" pour sécurité)
**And** aucune trace de mes données personnelles n'est accessible via l'API ou l'UI

**STATUS:** ✅ PARTIELLEMENT IMPLÉMENTÉ

- Redirection vers "/" après suppression ✅
- Better Auth gère invalidation sessions ✅
- Manque: Page de confirmation dédiée
- Manque: Tests de reconnexion impossible

### AC6: Conformité RGPD et audit trail

**Given** une suppression de compte est effectuée
**When** l'opération se termine
**Then** un log d'audit est créé avec timestamp, userId (anonymisé), et action effectuée
**And** aucune donnée personnelle identifiable n'est conservée dans les logs
**And** le système respecte le délai de traitement RGPD (30 jours max, mais MVP = immédiat)
**And** la suppression est irréversible et complète (right to erasure)
**And** les backups sont marqués pour purge lors du prochain cycle

**STATUS:** ❌ NON IMPLÉMENTÉ

- Aucun audit trail actuellement
- Logging via `logger.info` dans email send seulement
- Pas de politique backup documentée

## Existing Implementation Analysis

### ✅ What Already Exists

**1. UI Layer (`/account/settings/` route)**

```tsx
// src/routes/account/settings/index.tsx
<TabsContent value="danger">
  <Card className="border-destructive">
    <CardHeader>
      <CardTitle className="text-destructive">Zone de danger</CardTitle>
      <CardDescription>Actions irréversibles sur votre compte.</CardDescription>
    </CardHeader>
    <CardContent>
      <AccountDeletion />
    </CardContent>
  </Card>
</TabsContent>
```

**2. AccountDeletion Component**

```tsx
// src/features/profiles/components/account-deletion.tsx
export const AccountDeletion = () => {
  return (
    <BetterAuthActionButton
      action={() => authClient.deleteUser({ callbackURL: "/" })}
      className="w-full"
      requireAreYouSure
      variant="destructive"
      successMessage="Suppression du compte en cours... Merci de vérifier votre email pour confirmer."
    >
      Supprimer le compté définitivement
    </BetterAuthActionButton>
  );
};
```

**3. Better Auth Configuration**

```typescript
// src/features/auth/lib/auth.ts (lines 20-24)
deleteUser: {
  enabled: true,
  sendDeleteAccountVerification: async ({ user, url }) => {
    await sendDeleteAccountVerificationEmail({ user, url });
  },
}
```

**4. Email Verification Infrastructure**

- ✅ `sendDeleteAccountVerificationEmail` function exists
- ✅ `deleteAccountTemplate` email template exists
- ✅ Better Auth handles email verification flow natively

### ❌ What Needs to Be Added/Enhanced

1. **Enhanced confirmation modal with password validation** (AC2)
2. **Publication retention options UI** (AC4)
3. **Server function to handle publication deletion/anonymization** (AC4)
4. **System alias "utilisateur-supprimé"** (AC4)
5. **Audit trail logging** (AC6)
6. **Comprehensive tests** (all ACs)
7. **Documentation** (RGPD compliance, flow diagrams)

## Tasks / Subtasks

### Task 1: Enhance AccountDeletion component with two-step confirmation (AC: #2)

- [x] Subtask 1.1: Rename/enhance `account-deletion.tsx` to support modal state
- [x] Subtask 1.2: Create multi-step modal (Step 1: Warnings + Options, Step 2: Password)
- [x] Subtask 1.3: Step 1: Display detailed consequences of deletion
- [x] Subtask 1.4: Step 1: Add radio buttons for publication retention (delete_all | anonymize)
- [x] Subtask 1.5: Step 1: Checkbox "Je comprends que cette action est irréversible" (required)
- [x] Subtask 1.6: Step 2: Password input field with validation
- [x] Subtask 1.7: Step 2: "Confirmer la suppression" button (disabled until password entered)
- [x] Subtask 1.8: Integrate TanStack Form for state management
- [x] Subtask 1.9: Accessibility: keyboard navigation, focus management, WCAG 2.1 AA
- [x] Subtask 1.10: Tests composant (10 tests): render, step transitions, validation, accessibility

### Task 2: Create validation schema for deletion options (AC: #2, #4)

- [x] Subtask 2.1: Create `/src/features/profiles/schemas/delete-account-schema.ts`
- [x] Subtask 2.2: Zod schema for password validation (required, matches user's password)
- [x] Subtask 2.3: Zod schema for retention option (enum: "delete_all" | "anonymize")
- [x] Subtask 2.4: Zod schema for confirmation checkbox (boolean, must be true)
- [x] Subtask 2.5: Error messages in French, empathetic tone
- [x] Subtask 2.6: Tests unitaires (7 tests): valid schemas, invalid inputs, edge cases

### Task 3: Create server function for enhanced account deletion (AC: #3, #4)

- [ ] Subtask 3.1: Create `/src/features/profiles/server/delete-account-with-options.ts`
- [ ] Subtask 3.2: Verify user authentication (session required)
- [ ] Subtask 3.3: Validate password matches current user password (prevent unauthorized deletion)
- [ ] Subtask 3.4: Load user's aliases and publications count for processing
- [ ] Subtask 3.5: If retention_option === "delete_all":
  - [ ] Delete threads with CASCADE (if FK constraint configured)
  - [ ] Delete replies with CASCADE
  - [ ] Delete all user aliases
- [ ] Subtask 3.6: If retention_option === "anonymize":
  - [ ] Get or create system alias "utilisateur-supprimé"
  - [ ] UPDATE threads.aliasId to point to system alias
  - [ ] UPDATE replies.aliasId to point to system alias
  - [ ] Mark original aliases as deleted but keep for referential integrity
- [ ] Subtask 3.7: Call Better Auth `auth.api.deleteUser()` to remove user account
- [ ] Subtask 3.8: Log deletion action to audit trail (anonymized userId + timestamp + option)
- [ ] Subtask 3.9: Return success or structured error
- [ ] Subtask 3.10: Tests unitaires (15 tests): password validation, cascade delete, anonymize, session invalidation, errors

### Task 4: Create system alias for anonymized content (AC: #4)

- [ ] Subtask 4.1: Create DB migration `/src/db/migrations/XXXX_create_system_deleted_user.sql`
- [ ] Subtask 4.2: Create system user with id="system-deleted-user", isSystem=true flag
- [ ] Subtask 4.3: Create system alias "utilisateur-supprimé" linked to system user
- [ ] Subtask 4.4: Add constraint: system user/alias cannot be deleted
- [ ] Subtask 4.5: Update seed script to ensure system user exists
- [ ] Subtask 4.6: Create utility function `/src/features/profiles/lib/get-system-deleted-alias.ts`
- [ ] Subtask 4.7: Tests d'intégration (5 tests): system user exists, alias protected, reusable across deletions

### Task 5: Implement audit trail for account deletion (AC: #6)

- [ ] Subtask 5.1: Create NEW schema file `/src/db/schemas/audit.ts` for `account_deletion_logs` table
- [ ] Subtask 5.2: Schema fields: id, anonymized_user_id (hash), retention_option, timestamp, ip_address (optional)
- [ ] Subtask 5.3: **IMPORTANT:** Do NOT use existing `moderationLogs` table - it has `onDelete: "cascade"` which would delete logs when user is deleted (RGPD violation)
- [ ] Subtask 5.4: Ensure NO foreign key references to user table (logs must persist after user deletion)
- [ ] Subtask 5.5: Export table in main schema index
- [ ] Subtask 5.6: Create migration for new table
- [ ] Subtask 5.7: Create `/src/features/profiles/lib/log-account-deletion.ts`
- [ ] Subtask 5.8: Log function accepts userId, retention_option, creates anonymized log entry using SHA256 hash
- [ ] Subtask 5.9: NEVER log email, username, or PII in audit trail
- [ ] Subtask 5.10: Integrate logging into delete-account-with-options server function
- [ ] Subtask 5.11: Tests unitaires (7 tests): log created, anonymization correct, no PII leaked, logs persist after user deletion, no FK constraints

### Task 6: Verify and configure database CASCADE constraints (AC: #3, #4)

- [ ] Subtask 6.1: Review `/src/db/schema.ts` for threads and replies FK constraints
- [ ] Subtask 6.2: Verify current behavior: what happens to threads/replies when alias is deleted?
- [ ] Subtask 6.3: If not configured, add ON DELETE CASCADE or ON DELETE SET NULL as appropriate
- [ ] Subtask 6.4: Create migration if schema changes needed
- [ ] Subtask 6.5: Test cascade behavior with integration tests (8 tests): delete with publications, orphaned content handling

### Task 7: Create confirmation page post-deletion (AC: #5)

- [ ] Subtask 7.1: Create route `/account/deleted` (public, no auth required)
- [ ] Subtask 7.2: Display empathetic message confirming account deletion
- [ ] Subtask 7.3: Explain that user can no longer log in
- [ ] Subtask 7.4: Provide link back to home page or signup if they change their mind
- [ ] Subtask 7.5: Update `callbackURL` in AccountDeletion to redirect to `/account/deleted`
- [ ] Subtask 7.6: Handle edge case: user manually navigating to this page (show generic message)

### Task 8: Tests E2E with Playwright (AC: #1-6)

- [ ] Subtask 8.1: Create `/src/features/profiles/__tests__/delete-account.e2e.test.ts`
- [ ] Subtask 8.2: Test E2E: signup → login → delete account (delete_all) → verify deletion complete
- [ ] Subtask 8.3: Test E2E: signup → create thread → delete account (anonymize) → verify thread anonymized
- [ ] Subtask 8.4: Test E2E: multi-device logout after deletion (session invalidation)
- [ ] Subtask 8.5: Test E2E: attempt login after deletion → should fail with generic error
- [ ] Subtask 8.6: Test E2E: email reusable after deletion (RGPD compliance)
- [ ] Subtask 8.7: Test E2E: password validation prevents unauthorized deletion
- [ ] Subtask 8.8: Test E2E: two-step confirmation flow (cancel at each step)
- [ ] Subtask 8.9: Test accessibility: keyboard navigation, screen reader compatibility
- [ ] Subtask 8.10: Total 15 E2E tests

### Task 9: Security and edge case tests (AC: #2, #3, #5)

- [ ] Subtask 9.1: Test: anonymous user cannot access deletion endpoint (should redirect)
- [ ] Subtask 9.2: Test: incorrect password blocks deletion
- [ ] Subtask 9.3: Test: CSRF protection on delete endpoint
- [ ] Subtask 9.4: Test: rate limiting prevents abuse (Arcjet integration)
- [ ] Subtask 9.5: Test: deletion with orphaned publications (referential integrity maintained)
- [ ] Subtask 9.6: Test: deletion with multiple active sessions (all invalidated)
- [ ] Subtask 9.7: Test: attempt deletion of already-deleted account (graceful failure)
- [ ] Subtask 9.8: Test: user enumeration prevention (generic error messages)
- [ ] Subtask 9.9: Total 10 security tests

### Task 10: Documentation and RGPD compliance (AC: #6)

- [ ] Subtask 10.1: Update `/docs/auth-flows.md` with complete deletion flow diagram
- [ ] Subtask 10.2: Document publication retention policy (delete vs anonymize)
- [ ] Subtask 10.3: Create `/docs/rgpd-compliance.md` detailing right to erasure implementation
- [ ] Subtask 10.4: Document backup purging policy (how to handle backups with deleted user data)
- [ ] Subtask 10.5: Update `project-context.md` with account deletion patterns and standards
- [ ] Subtask 10.6: Add inline code comments explaining RGPD compliance decisions

## Dev Notes

### Existing Infrastructure Leveraged

**Better Auth Native Features:**

- ✅ `auth.deleteUser()` API handles user record deletion
- ✅ Email verification flow already implemented
- ✅ Session invalidation automatic
- ✅ Token cleanup managed by Better Auth

**Existing UI/UX:**

- ✅ Settings page with "Danger" tab at `/account/settings/`
- ✅ `AccountDeletion` component provides base button
- ✅ `BetterAuthActionButton` wrapper with `requireAreYouSure` confirmation

**Existing Auth System:**

- ✅ Password hashing via bcrypt (Better Auth)
- ✅ Session management
- ✅ Email sending infrastructure

### Enhancement Strategy

**Approach:** Enhance existing implementation rather than rebuild from scratch.

**Key Enhancements:**

1. Replace simple `requireAreYouSure` with full two-step modal
2. Add publication retention options UI
3. Implement server-side logic for anonymization
4. Create system alias for anonymized content
5. Add comprehensive audit trail
6. Test exhaustively

**Effort Reduction:** ~50% less work compared to greenfield implementation.

### Architecture Patterns

**Publication Retention Options:**

```typescript
// Option 1: Hard Delete with CASCADE
export const threads = pgTable("threads", {
  aliasId: text("alias_id")
    .references(() => alias.id, { onDelete: "cascade" })
    .notNull(),
});

// Option 2: Anonymization
const SYSTEM_DELETED_ALIAS_ID = "system-deleted-user-alias";

async function anonymizeUserContent(userId: string) {
  const userAliases = await getUserAliases(userId);

  for (const alias of userAliases) {
    await db
      .update(threads)
      .set({ aliasId: SYSTEM_DELETED_ALIAS_ID })
      .where(eq(threads.aliasId, alias.id));

    await db
      .update(replies)
      .set({ aliasId: SYSTEM_DELETED_ALIAS_ID })
      .where(eq(replies.aliasId, alias.id));
  }
}
```

**Audit Trail Pattern:**

```typescript
// Never log PII
async function logAccountDeletion(userId: string, option: RetentionOption) {
  const anonymizedId = createHash("sha256")
    .update(userId + env.AUDIT_SALT)
    .digest("hex");

  await db.insert(accountDeletionLogs).values({
    anonymizedUserId: anonymizedId,
    retentionOption: option,
    timestamp: new Date(),
    // NO email, username, or identifiable data
  });
}
```

### Security Considerations

1. **Password Validation:** Always verify password server-side before deletion
2. **Session Invalidation:** Better Auth handles multi-device logout automatically
3. **User Enumeration Prevention:** Generic "Invalid credentials" error on login attempt
4. **CSRF Protection:** Server functions protected by TanStack Start
5. **Rate Limiting:** Add Arcjet protection to deletion endpoint
6. **Audit Trail:** Log deletions with anonymized identifiers only

### RGPD Compliance Checklist

- [x] Right to Erasure (Article 17): Better Auth deleteUser() implements this
- [ ] Data Minimization: Audit logs must be anonymized (Task 5)
- [ ] Transparency: Enhanced modal explains consequences (Task 1)
- [ ] Right to Rectification: User chooses publication fate (Task 1, 3)
- [x] Processing Lawfulness: Email verification ensures consent
- [ ] Backup Purging: Document policy (Task 10)

**Note:** Email reuse must be possible after deletion (RGPD requirement) - Better Auth supports this natively.

### Testing Standards Summary

**Test Coverage Targets:**

- Unit tests: ~50 tests (schemas, server functions, utilities)
- Component tests: ~10 tests (enhanced AccountDeletion modal)
- E2E tests: ~15 tests (full flows, multi-device, anonymization)
- Security tests: ~10 tests (CSRF, rate limiting, edge cases)

**Total Estimated Tests:** ~85 tests

**Existing Tests to Review:**

```bash
# Check if any deletion tests already exist
grep -r "deleteUser\|deleteAccount" src/**/*.test.ts
```

### Project Structure Notes

**Files to Create:**

```
src/features/profiles/
├── schemas/
│   └── delete-account-schema.ts              # Task 2
├── server/
│   └── delete-account-with-options.ts        # Task 3
├── lib/
│   ├── get-system-deleted-alias.ts           # Task 4
│   └── log-account-deletion.ts               # Task 5
├── components/
│   └── account-deletion.tsx                  # Task 1 (ENHANCE existing)
└── __tests__/
    ├── delete-account-schema.test.ts         # Task 2
    ├── delete-account-with-options.test.ts   # Task 3
    ├── account-deletion.test.tsx             # Task 1
    ├── delete-account-security.test.ts       # Task 9
    └── delete-account.e2e.test.ts            # Task 8

src/routes/
└── account/
    └── deleted.tsx                           # Task 7 (NEW)

src/db/
├── schemas/
│   └── audit.ts                              # Task 5 (NEW - account_deletion_logs)
├── schema.ts                                 # Task 5, 6 (MODIFY - export audit schema)
└── migrations/
    ├── XXXX_create_system_deleted_user.sql   # Task 4
    ├── XXXX_add_account_deletion_logs.sql    # Task 5
    └── XXXX_update_cascade_constraints.sql   # Task 6 (if needed)

docs/
├── auth-flows.md                             # Task 10 (UPDATE)
└── rgpd-compliance.md                        # Task 10 (CREATE)
```

**Files Already Existing (DO NOT RECREATE):**

- ✅ `src/features/profiles/components/account-deletion.tsx` (enhance only)
- ✅ `src/routes/account/settings/index.tsx` (no changes needed)
- ✅ `src/features/auth/lib/auth.ts` (deleteUser already configured)
- ✅ `src/features/auth/server/send-delete-account-verification-email.ts`
- ✅ `src/features/auth/lib/email/templates.ts` (deleteAccountTemplate)
- ✅ `src/db/schemas/moderation.ts` (moderationLogs exists but NOT usable for RGPD audit - has CASCADE)

### Dependencies on Previous Stories

**Story 1.1 (Session Anonyme Immédiate):**

- Alias system established - reuse for system alias creation
- Understanding alias lifecycle critical for deletion/anonymization

**Story 1.2 (Code Secret):**

- secretCode field in user table must be handled during deletion
- Better Auth deleteUser() should cascade or nullify secretCode

**Story 1.3 (Récupération via Code Secret):**

- Test: secret code cannot be used after account deletion
- Ensure findUserBySecretCode() returns null for deleted users

**Story 1.4 (Inscription Email):**

- Email signup creates user + alias
- Deletion is inverse: remove user but optionally keep content anonymized
- Better Auth deleteUser() config already set up in this story ✅

### References

- [Source: epics.md#Story-1.6] - User story and acceptance criteria
- [Source: architecture.md#Security] - Security patterns, encryption requirements
- [Source: prd.md#NFR-Security] - RGPD compliance and data protection
- [Source: src/features/profiles/components/account-deletion.tsx] - Existing implementation ✅
- [Source: src/routes/account/settings/index.tsx] - UI integration point ✅
- [Source: src/features/auth/lib/auth.ts#L20-24] - Better Auth deleteUser config ✅
- [Source: src/features/auth/server/send-delete-account-verification-email.ts] - Email verification ✅
- [RGPD Article 17] - Right to Erasure (https://gdpr-info.eu/art-17-gdpr/)
- [Better Auth deleteUser API] - https://www.better-auth.com/docs/api-reference/user#delete-user

### Existing Infrastructure Note: moderationLogs Table

**Why Not Use Existing `moderationLogs`?**

A `moderationLogs` table already exists in `src/db/schemas/moderation.ts`:

```typescript
export const moderationLogs = pgTable("moderation_logs", {
  id: id(),
  moderatorId: text("moderator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ⚠️ PROBLEM!
  action: text("action").notNull(),
  targetId: uuid("target_id"),
  reason: text("reason"),
  createdAt: createdAt(),
});
```

**Critical Issue:** The `onDelete: "cascade"` constraint means:

1. When user account is deleted
2. All `moderationLogs` entries with that `moderatorId` are CASCADE deleted
3. **Audit trail disappears = RGPD Article 30 violation** (obligation to document data processing)

**Solution:** Create dedicated `account_deletion_logs` table with:

- ✅ No foreign key to user table
- ✅ Anonymized userId (SHA256 hash)
- ✅ Logs persist after user deletion
- ✅ RGPD compliant audit trail

### Known Constraints & Risks

**Technical Risks:**

1. **Referential Integrity:** Must verify cascade behavior for threads/replies/aliases
   - Mitigation: Task 6 explicitly tests and configures FK constraints
2. **Session Race Condition:** Deletion during multi-device active use
   - Mitigation: Better Auth handles atomic session invalidation
3. **Backup Purging:** Backups contain deleted user data temporarily
   - Mitigation: Document policy, consider crypto-shredding for future
4. **Audit Trail Persistence:** Must ensure logs survive user deletion
   - Mitigation: Dedicated table with NO FK to user (Task 5)

**Business Risks:**

1. **Content Loss:** User deletes account with delete_all, regrets immediately
   - Mitigation: Clear warnings + anonymize option as default/recommended
2. **Accidental Deletion:** User deletes by mistake despite confirmations
   - Mitigation: Two-step process with password validation
   - Note: No "soft delete" recovery allowed per RGPD (hard delete required)

**MVP Scope Note:**
This story is **POST-MVP Phase 1** according to `mvp-scope-final.md`.

However, basic deletion functionality already exists via Better Auth. This enhancement adds:

- Better UX (two-step confirmation)
- Publication retention options (critical for user trust)
- RGPD compliance (audit trail, documentation)
- Comprehensive testing

**Recommendation:** Complete this story before public launch for legal compliance and user trust.

### Typo Found in Existing Code

```tsx
// src/features/profiles/components/account-deletion.tsx line 12
"Supprimer le compté définitivement";
//              ^^^^^^ should be "compte"
```

Fix this typo in Task 1 when enhancing the component.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

**Task 1 Implementation (2026-01-10):**

- Enhanced AccountDeletion component with two-step modal flow
- Fixed TanStack Form reactive state management using form.Subscribe
- Resolved test query selector issues (multiple text matches)
- All 10 component tests passing (100% success rate)

### Completion Notes List

**Task 1: Enhanced AccountDeletion Component (COMPLETE)** ✅

- ✅ Two-step modal implemented (Step 1: Options/Warnings, Step 2: Password)
- ✅ Retention options: "anonymize" (recommended) vs "delete_all"
- ✅ Detailed consequence warnings displayed in Step 1
- ✅ Confirmation checkbox with irrevocability warning
- ✅ Password validation in Step 2 (reactive button state)
- ✅ TanStack Form integration with form.Subscribe for reactive state
- ✅ Accessibility: proper ARIA attributes, keyboard navigation
- ✅ Typo fixed: "compté" → "compte"
- ✅ 10/10 component tests passing
- ✅ 0 TypeScript diagnostic errors

**Technical Decisions:**

- Used `form.Subscribe` instead of direct `form.state.values` for reactive button states
- Radio buttons for retention options with detailed UX descriptions
- Password field uses placeholder query in tests (PasswordInput component pattern)
- AlertDialog with proper aria-labelledby and aria-describedby attributes
- Refactored `.validator()` to `.inputValidator()` for TanStack Start standard (2 files)

**Task 2: Validation Schema for Deletion Options (COMPLETE)** ✅

- ✅ Created `delete-account-schema.ts` with comprehensive Zod validation
- ✅ Separate schemas: retentionOption, confirmationCheckbox, password
- ✅ Combined deleteAccountSchema for complete validation
- ✅ French error messages with empathetic tone
- ✅ Password trimming and edge case handling
- ✅ TypeScript types exported: DeleteAccountInput, RetentionOption
- ✅ 11/11 schema tests passing (100% success rate)
- ✅ 0 TypeScript diagnostic errors

**Technical Decisions:**

- Modular schema design: separate schemas can be reused independently
- Password schema uses .trim() to handle whitespace gracefully
- Confirmation checkbox uses .refine() for custom validation logic
- Error messages avoid technical jargon, use supportive language

### File List

**Files Created:**

- `src/features/profiles/__tests__/account-deletion.test.tsx` (10 component tests)
- `src/features/profiles/__tests__/delete-account-schema.test.ts` (11 schema validation tests)
- `src/features/profiles/schemas/delete-account-schema.ts` (Zod validation schemas)
- `src/components/ui/radio-group.tsx` (shadcn component added via CLI)

**Files Modified:**

- `src/features/profiles/components/account-deletion.tsx` (enhanced with two-step modal)
- `package.json` (shadcn radio-group dependency)
- `pnpm-lock.yaml` (dependency lock update)

**Tests Added:**

- 10 component tests in `account-deletion.test.tsx`:
  - 2 initial render tests
  - 4 two-step modal flow tests
  - 2 cancellation flow tests
  - 2 accessibility tests
- 11 schema validation tests in `delete-account-schema.test.ts`:
  - 2 valid schema tests
  - 4 invalid input tests (retention, confirmation, password)
  - 3 edge case tests (long passwords, special chars, whitespace)
- **Total: 21 tests, all passing (100% success rate)**

**Refactoring: .validator() → .inputValidator()** ✅

- ✅ Corrected 2 server functions to use `.inputValidator()` (TanStack Start standard)
- ✅ Files updated: `signup-with-email.ts`, `link-anonymous-account.ts`
- ✅ All tests still passing (21/21)
- ✅ 0 TypeScript diagnostic errors
