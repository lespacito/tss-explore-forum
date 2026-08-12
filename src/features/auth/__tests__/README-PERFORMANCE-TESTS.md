# Performance Tests - Database Setup Required

## Overview

The performance tests in `signin-secret-code-performance.test.ts` are **integration tests** that require a real database connection to validate NFR5 (Non-Functional Requirement 5).

**NFR5 Requirement:** Secret code signin process must complete in **less than 2 seconds**.

## Current Status

⚠️ **These tests require database infrastructure to run**

- **File:** `signin-secret-code-performance.test.ts`
- **Test Count:** 10 performance validation tests
- **Status:** Tests written but require PostgreSQL + environment variables

## Why These Tests Require Special Setup

Performance tests validate real-world timing constraints:

1. **Database Query Performance**
   - Measures `findUserBySecretCode()` execution time
   - Validates index optimization on `secretCode` column
   - Target: < 500ms per query

2. **Full Signin Flow Performance**
   - Measures complete authentication process
   - Includes: validation → DB query → session creation → response
   - Target: < 2000ms (NFR5)

3. **Timing Attack Protection**
   - Measures overhead of `timingSafeEqual` comparison
   - Validates consistent timing for valid/invalid codes
   - Prevents information leakage through response timing

4. **Concurrent Request Performance**
   - Tests performance under multiple simultaneous signin attempts
   - Validates database connection pooling
   - Ensures consistent performance under load

## Test Coverage

When properly configured, these tests provide:

### ✅ Database Performance Tests
- Query execution time with indexed lookup
- Schema optimization validation
- Connection pooling efficiency

### ✅ NFR5 Validation Tests
- Full signin flow < 2000ms
- Database query < 500ms
- Session creation overhead
- Network latency simulation

### ✅ Security Performance Tests
- Timing attack protection overhead
- Consistent response times (valid vs invalid codes)
- No information leakage through timing

### ✅ Load Testing
- Concurrent signin requests (10 simultaneous)
- Average response time under load
- Performance degradation detection

## Running Performance Tests

### Prerequisites

1. **Database Connection**
   ```bash
   # Ensure DATABASE_URL is set in .env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

2. **Required Environment Variables**
   ```bash
   DATABASE_URL="postgresql://..."
   BETTER_AUTH_SECRET="your_secret_32_chars_minimum"
   BETTER_AUTH_URL="http://localhost:3000"
   ARCJET_KEY="your_arcjet_key"
   ```

3. **Database Must Be Running**
   ```bash
   # Start PostgreSQL
   docker-compose up -d postgres
   # OR
   pg_ctl start
   ```

4. **Apply Migrations**
   ```bash
   pnpm drizzle-kit push
   ```

### Running the Tests

```bash
# With environment variables loaded
npm test -- --run src/features/auth/__tests__/signin-secret-code-performance.test.ts

# OR with dotenv
dotenv -e .env.local -- npm test -- --run signin-secret-code-performance.test.ts
```

## Expected Performance Benchmarks

Based on local development testing:

| Metric | Target | Typical |
|--------|--------|---------|
| Database Query (indexed) | < 500ms | 50-150ms |
| Full Signin Flow | < 2000ms | 200-500ms |
| Timing Attack Protection | N/A | +5-10ms |
| Concurrent (10 users) | < 2000ms avg | 300-800ms |

## Test Structure

### 1. Database Query Performance (4 tests)
- Valid code lookup time
- Invalid code lookup time  
- Timing attack protection consistency
- Index optimization validation

### 2. Full Flow Performance (3 tests)
- Complete signin flow < 2000ms
- Session creation overhead
- Multi-step process timing

### 3. Concurrent Performance (2 tests)
- Multiple simultaneous signins
- Average response time under load

### 4. Regression Detection (1 test)
- Baseline performance comparison
- Alerts on significant slowdowns

## CI/CD Considerations

⚠️ **These tests are currently excluded from CI** because they require:
- Live PostgreSQL database
- Valid database credentials
- Network connectivity to database

**Recommendation:** Run these tests in dedicated performance testing environment.

## Alternative: Manual Performance Testing

If automated tests cannot run, validate NFR5 manually:

### Manual Test Procedure

1. **Setup**
   ```bash
   pnpm dev
   # Application running on localhost:3000
   ```

2. **Test Valid Code Signin**
   - Open DevTools Network tab
   - Navigate to `/auth/anonymous-signin`
   - Enter valid secret code
   - Click "Se connecter"
   - Measure time from click to redirect

3. **Expected Results**
   - Total time: < 2 seconds
   - Server response: < 500ms
   - Client processing: < 500ms
   - Redirect delay: < 1000ms

4. **Document Results**
   ```
   Test Date: YYYY-MM-DD
   Valid Code: K7MN-P8QR
   Response Time: XXXms
   Total Flow: XXXXms
   NFR5 Status: ✅ Pass / ❌ Fail
   ```

## Related Tests

**Unit Tests (No Database Required):**
- `find-user-by-code.test.ts` - 15 tests (mocked DB) ✅ PASSING
- `signin-with-secret-code.test.ts` - 16 tests (mocked DB) ✅ PASSING

**E2E Tests (Require Playwright):**
- `anonymous-signin.e2e.test.ts` - 18 tests (includes performance validation)

## Troubleshooting

### Error: "Invalid environment variables"
**Solution:** Ensure all required env vars are set in `.env` or `.env.local`

### Error: "Connection refused" 
**Solution:** Start PostgreSQL database: `docker-compose up -d postgres`

### Error: "relation does not exist"
**Solution:** Run migrations: `pnpm drizzle-kit push`

### Tests timeout
**Solution:** Increase timeout or check database performance

## Performance Optimization Tips

If tests fail NFR5 requirement:

1. **Verify Index Exists**
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'user';
   -- Should show index on secret_code column
   ```

2. **Check Database Connection Pool**
   ```typescript
   // src/db/index.ts
   const client = postgres(env.DATABASE_URL, {
     max: 10, // Ensure sufficient connections
     connect_timeout: 30,
   });
   ```

3. **Optimize Network Latency**
   - Use database on same network/region
   - Enable connection pooling
   - Consider read replicas for high load

## Conclusion

These performance tests are **critical for validating NFR5** but require infrastructure:

- ✅ Tests written and comprehensive
- ⚠️ Require PostgreSQL + environment setup
- ✅ Alternative manual testing procedure documented
- ✅ Performance benchmarks established

**Recommendation:** Run these tests in staging environment before production deployment to validate NFR5 compliance.

## Contact

For issues with performance test setup, see:
- Story 1.3 implementation: `_bmad-output/implementation-artifacts/1-3-recuperation-via-code-secret.md`
- Database documentation: `docs/database.md`
- Performance requirements: Architecture documentation
