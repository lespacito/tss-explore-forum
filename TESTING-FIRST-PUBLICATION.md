# Manual Testing Guide: First Publication Secret Code Flow

**Story:** 1.2 - Code Secret pour Utilisateur Anonyme  
**Last Updated:** 2026-01-08  
**Status:** Ready for Testing

---

## 📋 Overview

This guide provides step-by-step instructions for manually testing the secret code generation feature for anonymous users' first publication.

**What we're testing:**
- Secret code is generated after first anonymous publication
- Code is displayed clearly with instructions
- Copy button works correctly
- Second publication does NOT generate a new code
- Registered users do NOT receive secret codes

---

## 🎯 Test Prerequisites

### Environment Setup

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Verify database is running:**
   ```bash
   # Check PostgreSQL is running
   psql -U your_user -d your_db -c "SELECT 1"
   ```

3. **Clear test data (optional):**
   ```bash
   # Remove previous test users if needed
   tsx scripts/debug-user-threads.ts <aliasId>
   ```

### Test User Requirements

You will need:
- ✅ An anonymous user (created via "Publier Anonymement" button)
- ✅ NO previous publications
- ✅ Valid session/authentication

---

## 🧪 Test Cases

### Test Case 1: First Publication Generates Secret Code

**Objective:** Verify that the first anonymous publication generates a unique secret code.

**Steps:**

1. Navigate to the home page: http://localhost:3000

2. Click the **"Publier Anonymement"** button
   - ⚠️ **Critical:** Do NOT use email signup
   - This creates an anonymous session with `isAnonymous: true`

3. You should be redirected to the thread creation page: `/threads/new`

4. Fill in the form:
   - **Titre:** "Ma première publication anonyme"
   - **Catégorie:** Select "Support" (or any category)
   - **Contenu:** "Ceci est ma première publication. J'ai besoin d'aide."

5. Click **"Publier"** or **"Soumettre"**

6. **Expected Result:**
   - ✅ Redirected to `/threads/confirmation`
   - ✅ Secret code displayed in format: `XXXX-XXXX-XXXX`
   - ✅ Code contains only uppercase letters and numbers (no 0, O, I, 1, l)
   - ✅ Clear instructions displayed
   - ✅ Warning about saving the code
   - ✅ Copy button visible

**Pass Criteria:**
- [ ] Redirect to confirmation page successful
- [ ] Secret code visible and properly formatted
- [ ] Instructions clear and helpful
- [ ] Warning message visible

---

### Test Case 2: Copy Button Functionality

**Objective:** Verify that the copy button works correctly.

**Steps:**

1. On the `/threads/confirmation` page (after Test Case 1)

2. Locate the **"Copier"** (Copy) button next to the secret code

3. Click the copy button

4. **Expected Result:**
   - ✅ Button text changes to "Copié!" or shows success indicator
   - ✅ Toast notification appears (if implemented)
   - ✅ Code is in clipboard

5. Verify clipboard contents:
   - Open a text editor (Notepad, VS Code, etc.)
   - Paste (Ctrl+V / Cmd+V)
   - Code should match the displayed format: `XXXX-XXXX-XXXX`

**Pass Criteria:**
- [ ] Copy button responds to click
- [ ] Visual feedback shown
- [ ] Code successfully copied to clipboard
- [ ] Pasted code matches displayed code

---

### Test Case 3: Code Persisted in Database

**Objective:** Verify that the secret code is saved in the database.

**Steps:**

1. After completing Test Case 1, note the displayed secret code

2. Run the diagnostic script:
   ```bash
   tsx scripts/debug-user-threads.ts <your-alias-id>
   ```
   
   **Finding your alias ID:**
   - Check the browser console: `localStorage` or session info
   - Or use: `SELECT id, name FROM alias WHERE name LIKE 'Anonymous%' ORDER BY created_at DESC LIMIT 1;`

3. **Expected Output:**
   ```
   User Info:
   - isAnonymous: true
   - secretCode: XXXX-XXXX-XXXX
   - secretCodeGeneratedAt: <timestamp>
   
   Threads: 1
   ```

**Pass Criteria:**
- [ ] `secretCode` field is populated
- [ ] Code matches the displayed code
- [ ] `secretCodeGeneratedAt` timestamp is recent
- [ ] `isAnonymous` is `true`

---

### Test Case 4: Second Publication Does NOT Generate New Code

**Objective:** Verify that subsequent publications do not regenerate the secret code.

**Steps:**

1. After completing Test Case 1, click **"Continuer"** or navigate to `/threads/new`

2. Create a second thread:
   - **Titre:** "Deuxième publication"
   - **Catégorie:** Any category
   - **Contenu:** "Ceci est ma deuxième publication."

3. Click **"Publier"**

4. **Expected Result:**
   - ✅ Redirected to `/threads` (thread list) **NOT** `/threads/confirmation`
   - ✅ No secret code displayed
   - ✅ Thread successfully created

5. Verify in database:
   ```bash
   tsx scripts/debug-user-threads.ts <alias-id>
   ```
   
   - `secretCode` should be **unchanged** (same as before)
   - `secretCodeGeneratedAt` should be **unchanged**
   - Thread count should be **2**

**Pass Criteria:**
- [ ] No redirect to confirmation page
- [ ] No secret code shown
- [ ] Original secret code unchanged in DB
- [ ] Second thread successfully created

---

### Test Case 5: Registered Users Do NOT Get Secret Codes

**Objective:** Verify that only anonymous users receive secret codes.

**Steps:**

1. Log out from any current session

2. Create a registered account:
   - Navigate to `/auth/signup`
   - Fill in email, password, username
   - Complete registration and email verification

3. Create a thread as a registered user:
   - Navigate to `/threads/new`
   - Fill in thread details
   - Click **"Publier"**

4. **Expected Result:**
   - ✅ Redirected to `/threads` (not confirmation page)
   - ✅ NO secret code displayed
   - ✅ Thread created successfully

5. Verify in database:
   ```sql
   SELECT isAnonymous, secretCode FROM "user" WHERE email = 'your-test-email@example.com';
   ```
   
   - `isAnonymous` should be `false`
   - `secretCode` should be `NULL`

**Pass Criteria:**
- [ ] No confirmation page shown
- [ ] No secret code in database
- [ ] `isAnonymous` is `false`
- [ ] Thread created successfully

---

### Test Case 6: Code Format Validation

**Objective:** Verify the secret code meets format requirements.

**Steps:**

1. Generate a secret code (Test Case 1)

2. Inspect the generated code format

**Expected Characteristics:**
- ✅ Length: 12 characters + 2 dashes = 14 characters total
- ✅ Format: `XXXX-XXXX-XXXX`
- ✅ Character set: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (30 chars)
- ✅ Excludes ambiguous: `0`, `O`, `I`, `1`, `l`
- ✅ Uppercase only

**Examples of Valid Codes:**
- `K7MN-P8QR-3T4V`
- `X4BT-9C2W-H5JK`
- `A2BC-D3FG-H4JK`

**Examples of Invalid Codes:**
- `K7MN-P8QR-O000` (contains O and 0)
- `k7mn-p8qr-3t4v` (lowercase)
- `K7MNP8QR3T4V` (missing dashes)

**Pass Criteria:**
- [ ] Code matches format specification
- [ ] No ambiguous characters present
- [ ] All uppercase
- [ ] Dashes in correct positions

---

### Test Case 7: Accessibility Testing

**Objective:** Verify WCAG 2.1 AA compliance.

**Steps:**

1. Navigate to `/threads/confirmation` (after first publication)

2. **Keyboard Navigation:**
   - Press `Tab` to navigate to copy button
   - Press `Enter` to activate copy
   - Verify focus indicators are visible

3. **Screen Reader Test:**
   - Enable screen reader (NVDA, JAWS, VoiceOver)
   - Navigate to page
   - Verify code is announced
   - Verify instructions are announced
   - Verify copy button has proper label

4. **Color Contrast:**
   - Use browser DevTools or Axe extension
   - Check contrast ratio of:
     - Secret code text
     - Warning message
     - Button text

**Pass Criteria:**
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announces all content
- [ ] Color contrast meets WCAG AA (4.5:1)

---

## 🐛 Troubleshooting

### Issue: No Secret Code Generated

**Symptoms:** First publication redirects to `/threads` instead of `/threads/confirmation`

**Possible Causes:**
1. User is not anonymous (`isAnonymous: false`)
2. User already has a secret code
3. Thread creation integration issue

**Debug Steps:**
```bash
# Check user status
tsx scripts/debug-user-threads.ts <alias-id>

# Expected output for anonymous user:
# isAnonymous: true
# secretCode: null (before first publication)
```

**Solution:**
- Ensure you clicked **"Publier Anonymement"** not regular signup
- Clear cookies and start fresh session
- Check server logs for errors

---

### Issue: Copy Button Doesn't Work

**Symptoms:** Clicking copy button has no effect

**Possible Causes:**
1. Clipboard permissions denied
2. Browser doesn't support Clipboard API
3. JavaScript error

**Debug Steps:**
1. Open browser console (F12)
2. Look for errors when clicking copy
3. Check clipboard permissions in browser settings

**Solution:**
- Grant clipboard permissions
- Use modern browser (Chrome, Firefox, Safari)
- Check console for JavaScript errors

---

### Issue: Second Publication Shows Code Again

**Symptoms:** Every publication shows the confirmation page

**Possible Causes:**
1. First publication detection logic broken
2. Database not persisting thread count correctly

**Debug Steps:**
```bash
# Check thread count for alias
tsx scripts/debug-user-threads.ts <alias-id>

# Should show: Threads: 2 (or more)
```

**Solution:**
- Verify `existingThreads` query in `create-thread.ts`
- Check database for orphaned threads
- Review server logs for errors

---

### Issue: Code Format Invalid

**Symptoms:** Code doesn't match `XXXX-XXXX-XXXX` format

**Possible Causes:**
1. Code generation logic broken
2. Database constraint issue

**Debug Steps:**
```bash
# Check code in database directly
psql -d your_db -c "SELECT secret_code FROM \"user\" WHERE is_anonymous = true ORDER BY created_at DESC LIMIT 1;"
```

**Solution:**
- Review `generateSecretCode()` function
- Check for recent code changes
- Verify character set configuration

---

## 📊 Test Results Template

Copy and fill out this template for your test run:

```
Test Run: [Date]
Tester: [Your Name]
Environment: [local/staging/production]
Browser: [Chrome/Firefox/Safari + version]

Test Case 1: First Publication Generates Code
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

Test Case 2: Copy Button Functionality
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

Test Case 3: Code Persisted in Database
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

Test Case 4: Second Publication No Code
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

Test Case 5: Registered Users No Code
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

Test Case 6: Code Format Validation
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

Test Case 7: Accessibility Testing
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

Overall Result: [ ] ALL PASS [ ] SOME FAIL
Issues Found: _________________________________
```

---

## 🔍 Additional Verification

### Database Queries

```sql
-- Find all anonymous users with secret codes
SELECT id, name, secret_code, secret_code_generated_at, is_anonymous
FROM "user"
WHERE is_anonymous = true AND secret_code IS NOT NULL
ORDER BY secret_code_generated_at DESC;

-- Count threads per anonymous user
SELECT u.id, u.secret_code, COUNT(t.id) as thread_count
FROM "user" u
LEFT JOIN alias a ON a.user_id = u.id
LEFT JOIN threads t ON t.alias_id = a.id
WHERE u.is_anonymous = true
GROUP BY u.id;

-- Find users with duplicate codes (should be 0)
SELECT secret_code, COUNT(*)
FROM "user"
WHERE secret_code IS NOT NULL
GROUP BY secret_code
HAVING COUNT(*) > 1;
```

### Performance Check

```bash
# Measure code generation time
time tsx -e "import { generateSecretCode } from './src/features/auth/lib/generate-secret-code'; console.log(generateSecretCode());"

# Should be < 100ms
```

---

## ✅ Sign-Off

**Test Completed By:** _______________  
**Date:** _______________  
**Result:** [ ] APPROVED [ ] NEEDS FIXES  
**Notes:** _______________

---

## 📚 References

- Story 1.2: `/code/tss-explore-forum/_bmad-output/implementation-artifacts/1-2-code-secret-pour-utilisateur-anonyme.md`
- Code Generation: `src/features/auth/lib/generate-secret-code.ts`
- Thread Creation: `src/features/threads/server/create-thread.ts`
- Confirmation Page: `src/routes/threads/confirmation.tsx`
- Debug Script: `scripts/debug-user-threads.ts`
