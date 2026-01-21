# Story 1.5: Connexion/Déconnexion Tests

## 📊 Test Coverage Summary

**Total Tests Created:** 58+ tests  
**Test Status:** ⚠️ **CREATED BUT NOT YET RUN**  
**Priority:** 🔴 **HIGH - Required before Story 1.5 can be marked "done"**

---

## 🧪 Test Suites Overview

### 1. Schema Validation Tests ✅ CREATED
**File:** `src/features/auth/schemas/__tests__/sign-in-schema.test.ts`  
**Tests:** 24 tests  
**Framework:** Vitest  
**Status:** Created, ready to run

**Coverage:**
- ✅ Valid inputs (6 tests)
- ✅ Invalid inputs (8 tests)
- ✅ Type coercion and whitespace (4 tests)
- ✅ Edge cases (6 tests)

**Run Command:**
```bash
pnpm test sign-in-schema.test
```

---

### 2. Signin Flow Integration Tests ✅ CREATED
**File:** `src/features/auth/__tests__/signin-flow.integration.test.ts`  
**Tests:** 19 tests  
**Framework:** Vitest  
**Status:** Created, ready to run (requires mocks)

**Coverage:**
- ✅ Successful signin (2 tests)
- ✅ Failed signin (2 tests)
- ✅ Email not verified (3 tests)
- ✅ Error handling (3 tests)
- ✅ CallbackURL validation (2 tests)
- ✅ Username format handling (2 tests)

**Run Command:**
```bash
pnpm test signin-flow.integration.test
```

**⚠️ Prerequisites:**
- Better-Auth client mocked
- Server functions mocked
- Test scenarios cover all error paths

---

### 3. Signout Flow Integration Tests ✅ CREATED
**File:** `src/features/auth/__tests__/signout-flow.integration.test.ts`  
**Tests:** 15 tests  
**Framework:** Vitest  
**Status:** Created, ready to run (requires mocks)

**Coverage:**
- ✅ Successful signout (3 tests)
- ✅ Signout when already signed out (2 tests)
- ✅ Signout with errors (3 tests)
- ✅ Session cleanup (2 tests)
- ✅ Redirect after signout (2 tests)
- ✅ Multi-device signout (2 tests)
- ✅ Signout without options (2 tests)

**Run Command:**
```bash
pnpm test signout-flow.integration.test
```

**⚠️ Prerequisites:**
- Better-Auth signOut mocked
- Router navigation mocked

---

### 4. E2E Playwright Tests ✅ SKELETON CREATED
**File:** `src/features/auth/__tests__/authentication.e2e.test.ts`  
**Tests:** 15+ tests  
**Framework:** Playwright  
**Status:** Skeleton created, needs implementation

**Coverage:**
- ✅ Signin flow (7 tests)
- ✅ Signout flow (3 tests)
- ✅ Tab navigation (1 test)
- ✅ Social authentication (1 test)
- ✅ Accessibility (3 tests)
- ✅ CallbackURL redirect (1 test)

**Run Command:**
```bash
pnpm playwright test authentication.e2e
```

**⚠️ Prerequisites:**
- Playwright installed: `pnpm add -D @playwright/test`
- Test database with fixture users
- Dev server running on http://localhost:3000
- Email service configured (or mocked)

---

## 🚀 Quick Start: Running All Tests

### Run Unit + Integration Tests (Vitest)
```bash
# All auth tests
pnpm test src/features/auth/__tests__/

# Specific test suite
pnpm test sign-in-schema
pnpm test signin-flow.integration
pnpm test signout-flow.integration

# Watch mode (useful during development)
pnpm test --watch src/features/auth/__tests__/

# Coverage report
pnpm test --coverage src/features/auth/__tests__/
```

### Run E2E Tests (Playwright)
```bash
# All E2E tests
pnpm playwright test

# Specific file
pnpm playwright test authentication.e2e

# Headed mode (see browser)
pnpm playwright test --headed

# Debug mode (step through)
pnpm playwright test --debug

# UI mode (interactive)
pnpm playwright test --ui
```

---

## 📋 Test Setup Instructions

### 1. Install Dependencies

```bash
# If Playwright not installed
pnpm add -D @playwright/test

# Install Playwright browsers
pnpm playwright install
```

### 2. Configure Test Database

Create test fixtures in `tests/fixtures/users.ts`:

```typescript
export const testUsers = [
  {
    id: "test-user-1",
    username: "testuser",
    email: "test@example.com",
    password: "Password123!", // Will be hashed
    emailVerified: true,
  },
  {
    id: "test-user-2",
    username: "unverifieduser",
    email: "unverified@example.com",
    password: "Password123!",
    emailVerified: false,
  },
];
```

### 3. Seed Test Database

Create `tests/setup/seed-db.ts`:

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schemas/user";
import { testUsers } from "../fixtures/users";
import { hashPassword } from "@/features/auth/lib/password";

export async function seedTestDatabase() {
  // Clear existing test data
  await db.delete(users).where(/* test users only */);

  // Insert test fixtures
  for (const user of testUsers) {
    await db.insert(users).values({
      ...user,
      password: await hashPassword(user.password),
    });
  }
}
```

### 4. Configure Playwright

Update `playwright.config.ts`:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  testMatch: "**/*.e2e.test.ts",
  fullyParallel: false, // Authentication tests should run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  globalSetup: "./tests/setup/playwright-global-setup.ts",
  globalTeardown: "./tests/setup/playwright-global-teardown.ts",
});
```

### 5. Global Setup for E2E

Create `tests/setup/playwright-global-setup.ts`:

```typescript
import { seedTestDatabase } from "./seed-db";

export default async function globalSetup() {
  console.log("🌱 Seeding test database...");
  await seedTestDatabase();
  console.log("✅ Test database ready");
}
```

---

## ✅ Expected Test Results

### All Tests Should Pass ✅

```
 ✓ src/features/auth/schemas/__tests__/sign-in-schema.test.ts (24)
 ✓ src/features/auth/__tests__/signin-flow.integration.test.ts (19)
 ✓ src/features/auth/__tests__/signout-flow.integration.test.ts (15)

Test Files  3 passed (3)
     Tests  58 passed (58)
```

### Playwright Tests Should Pass ✅

```
Running 15 tests using 1 worker

  ✓  authentication.e2e.test.ts:26:5 › should signin successfully (2s)
  ✓  authentication.e2e.test.ts:47:5 › should show error for invalid credentials (1s)
  ✓  authentication.e2e.test.ts:64:5 › should show error for non-existent username (1s)
  ... (12 more tests)

  15 passed (45s)
```

---

## 🐛 Troubleshooting

### Issue: Vitest tests fail with "Cannot find module"

**Solution:**
```bash
# Check tsconfig paths are correct
# Ensure vitest.config.ts has proper alias resolution
```

### Issue: Playwright tests timeout

**Solution:**
```bash
# Increase timeout in test
test.setTimeout(30000); // 30 seconds

# Or in playwright.config.ts
timeout: 30000,
```

### Issue: Mock functions not working

**Solution:**
```typescript
// Clear mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Reset modules if needed
beforeEach(() => {
  vi.resetModules();
});
```

### Issue: E2E tests can't find elements

**Solution:**
```typescript
// Use more robust selectors
await page.getByRole("button", { name: /Se connecter/i });

// Add data-testid attributes
<button data-testid="signin-button">Se connecter</button>

// Wait for elements
await page.waitForSelector('[data-testid="signin-button"]');
```

---

## 📊 Test Metrics & Coverage

### Current Status
- **Unit Tests:** 24/24 created ✅
- **Integration Tests:** 34/34 created ✅
- **E2E Tests:** 15+ created (skeleton) ⚠️
- **Total:** 58+ tests

### Coverage Goals
- **Schema validation:** 100% ✅
- **Signin flow:** 95%+ (mocked) ✅
- **Signout flow:** 95%+ (mocked) ✅
- **E2E user journeys:** 80%+ ⚠️ (needs implementation)

### Missing Coverage
- ❌ Component unit tests (sign-in-tab.tsx)
  - Reason: Complex TanStack Form integration, mocking required
  - Alternative: E2E tests cover component behavior
- ❌ Rate limiting tests
  - Reason: Requires Arcjet mock or test environment
  - Alternative: Manual testing or integration test with mock
- ❌ Social auth tests
  - Reason: OAuth flow requires provider mocks
  - Alternative: E2E tests verify buttons exist

---

## 🎯 Next Steps

### Before Marking Story 1.5 "Done"

1. **Run All Unit/Integration Tests** ✅
   ```bash
   pnpm test src/features/auth/__tests__/ --run
   ```
   - Expected: 58/58 tests pass
   - Fix any failures

2. **Implement E2E Test Setup** ⚠️
   - Install Playwright
   - Configure test database
   - Seed test fixtures
   - Run E2E tests

3. **Verify Test Coverage** ⚠️
   ```bash
   pnpm test --coverage src/features/auth/
   ```
   - Goal: >80% coverage
   - Focus on critical paths

4. **Update Story File** ⚠️
   - Mark Task 6 subtasks as `[x]` when tests pass
   - Update test_count in sprint-status.yaml
   - Document test results in story file

5. **Final Code Review** ⚠️
   - All tests passing
   - No TypeScript errors
   - Documentation complete

---

## 📚 Additional Resources

### Testing Best Practices
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)

### Project-Specific
- Story file: `_bmad-output/implementation-artifacts/1-5-connexion-deconnexion-utilisateur.md`
- Auth flows diagram: `docs/auth-flows.md`
- Better-Auth docs: `https://better-auth.com/docs`

---

## 👤 Maintainers

- **Story Owner:** Story 1.5 - Connexion/Déconnexion Utilisateur
- **Test Author:** Dev Agent (Amelia) - Code Review Phase B
- **Review Date:** 2026-01-10
- **Status:** Tests created, ready to run

---

## 📝 Notes

- Tests use mocked Better-Auth client (not real API calls)
- E2E tests require real database with fixtures
- Rate limiting tests not included (covered by manual testing)
- Social auth tests verify UI only (OAuth flow not tested)
- Component tests deferred to E2E (complex TanStack Form mocking)

**IMPORTANT:** These tests MUST pass before Story 1.5 can be marked "done" in sprint-status.yaml.
