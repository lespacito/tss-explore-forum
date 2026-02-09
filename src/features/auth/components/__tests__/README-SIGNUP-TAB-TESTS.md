# SignUpTab Component Tests - Known Issues

## Overview

The `sign-up-tab.test.tsx` file contains 17 tests for the SignUpTab component.

**Current Status:** 9/17 passing (8 failures)

## Test Results Summary

**Passing Tests (9):**
- Component renders all form fields
- Submit and cancel buttons present
- Enable submit when fields filled
- signUp.email called with correct data
- Email verification tab opened on success
- Form reset after success
- Generic errors handled gracefully
- Cancel resets form
- Proper labels for accessibility

**Failing Tests (8):**
- Submit button disabled initially (component `canSubmit` behavior)
- Validation error for invalid email (error shown via toast, not inline)
- Validation error for short password (message text mismatch)
- Welcome email sending (async mock timing)
- Duplicate email error display (toast vs inline text)
- Duplicate username error display (toast vs inline text)
- Cancel button disabled when pristine (component behavior)
- aria-invalid attribute on validation errors

## Root Causes of Failures

### 1. Error Display: Toast vs Inline
The component uses `sonner` toast for errors, not inline `role="alert"` elements. Tests expect inline error messages but the component shows them as toast notifications.

### 2. Form State Behavior
`canSubmit` from TanStack Form starts as `true` for empty forms (since no validation errors exist yet). Tests expect `disabled` initially.

### 3. Validation Strategy
The component uses `onSubmit` and `onBlur` validators, not `onChange`. Tests for real-time validation may not trigger correctly.

## Related Files

- **Component:** `src/features/auth/components/sign-up-tab.tsx`
- **Link Tests:** `src/features/auth/server/__tests__/link-anonymous-account.test.ts` (9/9 passing)
- **E2E Tests:** `src/features/auth/__tests__/email-signup.e2e.test.ts` (requires Playwright)

## Test Coverage Summary

**Story 1.4 Test Results (after code review round 3):**
- link-anonymous-account tests: 9/9 passing (100%)
- Component tests: 9/17 passing (52.9%)
- E2E tests: 14 written (require Playwright)

**Last Updated:** 2026-02-09
**Status:** 9/17 passing, 8 failing due to test/component behavior mismatches
