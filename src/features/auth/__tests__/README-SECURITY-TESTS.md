# Security Tests - Database Setup Required

## Overview

The security tests in `secret-code-security.test.ts` are **integration tests** that require a real database connection and environment variables.

## Why These Tests Require Special Setup

These tests validate critical security requirements (Story 1.2, Task 8):

- **Task 8.1**: Verify secret codes are NOT logged in clear text
- **Task 8.2**: Guarantee codes cannot be enumerated/bruteforced
- **Task 8.3**: Rate limiting on generation
- **Task 8.4**: Complete security audit

Because they:
1. Connect to the real database via Drizzle ORM
2. Create/delete test users
3. Validate actual code generation logic
4. Check rate limiting via Arcjet

## Running Security Tests

### Prerequisites

1. **Database Connection**
   ```bash
   # Ensure DATABASE_URL is set in .env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

2. **Required Environment Variables**
   ```bash
   ARCJET_KEY="your_arcjet_key"
   BETTER_AUTH_SECRET="your_secret_32_chars_minimum"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. **Database Must Be Running**
   ```bash
   # Start your PostgreSQL database
   docker-compose up -d postgres
   # OR
   pg_ctl start
   ```

### Running the Tests

```bash
# With environment variables loaded
npm test -- --run src/features/auth/__tests__/secret-code-security.test.ts

# OR with dotenv
dotenv -e .env.local -- npm test -- --run secret-code-security.test.ts
```

## Test Coverage

When properly configured, these tests provide:

- ✅ 20+ security validation test cases
- ✅ Code logging audit (ensures no plain text codes in logs)
- ✅ Entropy validation (30^12 combinations)
- ✅ Rate limiting verification
- ✅ Database uniqueness constraints
- ✅ Timestamp tracking
- ✅ Error handling security

## Current Status

⚠️ **Note**: These tests are currently **skipped in CI** because they require:
- Live database connection
- Valid Arcjet API key
- Full environment setup

For local development and security audits, run these tests manually with proper setup.

## Alternative: Mock-Based Unit Tests

For CI/CD pipelines without database access, see:
- `generate-secret-code-fn.test.ts` (18 tests, mocked DB)
- These validate core logic without database dependency

## Security Audit Checklist

When running full security audit:

- [ ] Run `secret-code-security.test.ts` with real DB
- [ ] Verify no codes in application logs
- [ ] Check database uniqueness constraint active
- [ ] Validate Arcjet rate limiting configured
- [ ] Review error messages (no internal details exposed)
- [ ] Confirm timestamp tracking works
- [ ] Test collision handling (extremely rare but handled)

## Contact

For issues with security tests setup, see:
- Project documentation: `docs/testing.md`
- Database setup: `docs/database.md`
- Story 1.2 implementation: `_bmad-output/implementation-artifacts/1-2-code-secret-pour-utilisateur-anonyme.md`
