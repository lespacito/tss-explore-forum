# Project Context - Parlons Violence Forum

**Project Name:** Parlons Violence  
**Type:** Anonymous Support Forum for Sensitive Topics  
**Stack:** TanStack Start (RC), TypeScript, Better Auth, PostgreSQL, Drizzle ORM  
**Last Updated:** 2026-01-09  
**Status:** Active Development

---

## 🎯 Mission Statement

An anonymous support forum addressing violence, abuse, and distress. Trust, anonymity, and safety are critical success factors. The primary GTM (Go-To-Market) goal is **reducing friction to first participation**.

### Core Principles
- Users must read and participate with minimal barriers
- Never assume users are comfortable sharing personal data
- Design for hesitant, vulnerable, and mobile-first users
- Trust and psychological safety over technical elegance
- Anonymous-first, registration optional

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- TanStack Start RC (SSR by default)
- React 19
- TanStack Router (file-based routing)
- TanStack Query (client state caching)
- TanStack Form (form state & validation)
- Shadcn UI + Radix UI
- Tailwind CSS 4.x
- TypeScript (strict mode)

**Backend:**
- TanStack Start Server Functions
- Better Auth (authentication)
- Drizzle ORM
- PostgreSQL
- Nitro (SSR engine)

**Security & Moderation:**
- Arcjet (rate limiting, bot protection)
- Custom moderation workflows
- Role-based access (user, moderator, admin)

**Development:**
- Vite 7.x
- Vitest 3.x (testing)
- Biome (linting & formatting)
- pnpm (package manager)

### Project Structure

```
src/
├── actions/          # Server actions
├── components/       # Shared UI components
├── data/            # Static data, constants
├── db/              # Database schemas and migrations
│   ├── schemas/     # Drizzle schemas (user, post, thread, etc.)
│   └── migrations/  # Database migrations
├── features/        # Feature modules
│   ├── alias/       # Anonymous alias management
│   ├── auth/        # Authentication (Better Auth integration)
│   ├── moderation/  # Content moderation
│   ├── notifications/ # User notifications
│   ├── posts/       # Post creation, editing
│   ├── profiles/    # User profiles
│   ├── resources/   # Resource management
│   ├── threads/     # Thread management
│   └── users/       # User management
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations
│   └── tanstack-query/ # Query client configuration
├── lib/             # Utility libraries
│   ├── logger/      # Winston logging
│   └── utils/       # Helper functions
└── routes/          # TanStack Router file-based routes
```

---

## 🔐 Authentication & Authorization

### Authentication Provider
**Better Auth** (v1.3.34+)

### User Types

1. **Anonymous Users**
   - Created via "Publier Anonymement" button
   - `isAnonymous: true` in database
   - Receive secret code after first publication
   - Can link to email account later
   - No email required initially

2. **Registered Users**
   - Email + password authentication
   - `isAnonymous: false`
   - No secret codes
   - Full profile capabilities

### Secret Code System

**Purpose:** Allow anonymous users to recover their session across devices.

**Format:** `XXXX-XXXX-XXXX` (12 characters + 2 dashes)
- Character set: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (excludes ambiguous: 0, O, I, 1, l)
- Generated only after first publication
- Stored in `user.secret_code` field
- Used for session recovery

**Implementation:**
- Generation: `src/features/auth/lib/generate-secret-code.ts`
- Server function: `src/features/auth/server/generate-secret-code-fn.ts`
- Sign-in: `src/features/auth/server/signin-with-secret-code.ts`
- Confirmation page: `src/routes/threads/confirmation.tsx`

### Roles
- `user` - Default role for all users
- `moderator` - Content moderation capabilities
- `admin` - Full system access

---

## 📊 Database Schema

### Core Entities

**user**
- Authentication and profile data
- `isAnonymous`, `secretCode`, `secretCodeGeneratedAt`
- Relations: aliases, sessions

**alias**
- Anonymous identities for posting
- One user can have multiple aliases
- Relations: threads, posts, user

**threads**
- Top-level discussions
- Categories: support, témoignage, questions, ressources
- Relations: posts, alias

**post**
- Replies within threads
- Nested structure support
- Relations: thread, alias

**moderation**
- Content moderation records
- Status tracking, reviewer assignments

**notification**
- User notifications
- Types: reply, mention, moderation

**ressource**
- External resources (helplines, guides)
- Categorized and curated

### ORM
Drizzle ORM with PostgreSQL adapter

**Key Files:**
- Schema definitions: `src/db/schemas/*.ts`
- Main export: `src/db/schema.ts`
- DB client: `src/db/index.ts`
- Migrations: `src/db/migrations/`

**Commands:**
```bash
pnpm db:generate   # Generate migrations
pnpm db:migrate    # Run migrations
pnpm db:push       # Push schema changes
pnpm db:studio     # Open Drizzle Studio
```

---

## 🧪 Testing Strategy

### Current State
- **Framework:** Vitest 3.x
- **Environment:** jsdom
- **Coverage:** v8 provider
- **Test Location:** `**/*.{test,spec}.{js,ts,tsx}`

### Testing Principles (Risk-Based)

1. **Critical Path First**
   - Anonymous user flow (session creation → first post → secret code)
   - Secret code generation and validation
   - Authentication flows (anonymous, email, secret code login)
   - Content moderation workflows

2. **High-Risk Areas**
   - Authentication and session management
   - Secret code security (uniqueness, format, timing)
   - Database transactions (post creation, user linking)
   - Server functions (all mutations, sensitive reads)

3. **Medium-Risk Areas**
   - Form validation (client + server)
   - UI component behavior
   - Navigation and routing
   - Notifications

4. **Low-Risk Areas**
   - Static content rendering
   - Styling and layouts
   - Non-critical utilities

### Test Types Needed

**Unit Tests**
- Pure functions (secret code generation, validators)
- Data transformations
- Utility functions
- Schema helpers

**Integration Tests**
- Server functions with database
- Authentication flows
- API endpoints
- Form submission + validation

**Component Tests**
- Form components (TanStack Form)
- Auth components (anonymous button, login forms)
- Thread/post components
- Moderation UI

**E2E Tests (Priority)**
- Anonymous user journey:
  1. Click "Publier Anonymement"
  2. Create first thread
  3. Receive secret code
  4. Copy code
  5. Create second thread (no code shown)
  6. Logout → login with secret code
- Registered user signup and first post (no secret code)
- Moderation workflow
- Thread creation and reply flow

### Test Data Strategy
- Use factories for generating test data
- API seeding for database setup
- Cleanup discipline (tear down after tests)
- Isolated test databases for E2E

### CI/CD Considerations
- Run on every PR
- Parallel execution (sharding)
- Fail fast on critical path failures
- Artifact collection (screenshots, traces, logs)

---

## 🚨 Critical User Flows

### Flow 1: Anonymous First Publication (HIGHEST PRIORITY)

**Steps:**
1. User lands on homepage
2. Clicks "Publier Anonymement" button
3. System creates anonymous session (`isAnonymous: true`)
4. User redirected to `/threads/new`
5. User fills thread form (title, category, content)
6. User submits form
7. System creates thread in database
8. System detects first publication (no previous threads for this alias)
9. System generates secret code
10. System stores code in `user.secret_code`
11. User redirected to `/threads/confirmation`
12. Secret code displayed with copy button and instructions
13. User copies code (optional but encouraged)
14. User clicks "Continuer"

**Test Coverage Required:**
- ✅ Anonymous session creation
- ✅ Secret code generation (format, uniqueness)
- ✅ First publication detection
- ✅ Code persistence in database
- ✅ Confirmation page rendering
- ✅ Copy button functionality
- ✅ Second publication does NOT generate new code
- ✅ Registered users do NOT get codes

**Reference:** `/TESTING-FIRST-PUBLICATION.md`

### Flow 2: Secret Code Recovery

**Steps:**
1. User lost session (cleared cookies, new device)
2. User navigates to login page
3. User selects "Se connecter avec code secret"
4. User enters code (format: XXXX-XXXX-XXXX)
5. System validates code
6. System creates new session
7. User redirected to dashboard/threads

**Test Coverage Required:**
- Valid code authentication
- Invalid code rejection
- Format validation
- Rate limiting (Arcjet integration)

### Flow 3: Anonymous Account Linking

**Steps:**
1. Anonymous user wants to register email
2. User navigates to profile/settings
3. User clicks "Lier un email"
4. User enters email + password
5. System sends verification email
6. User verifies email
7. System updates `isAnonymous: false`
8. Secret code remains valid (for backwards compatibility)
9. User can now login with email OR secret code

**Test Coverage Required:**
- Email linking without losing data
- Verification email delivery
- Dual authentication methods
- Data integrity (threads, posts preserved)

---

## 🔥 Known Risks & Constraints

### Technical Risks

1. **TanStack Start RC Stability**
   - Using RC version (not stable)
   - API changes possible
   - Limited production examples
   - **Mitigation:** Pin versions, extensive E2E tests

2. **Secret Code Security**
   - Brute force attacks possible
   - 30^12 combinations = secure but must rate-limit
   - **Mitigation:** Arcjet rate limiting, monitoring

3. **Anonymous Session Management**
   - Session loss = user loses access (if no code saved)
   - **Mitigation:** Clear UX warnings, multiple save prompts

4. **Server Function Security**
   - All sensitive logic in server functions
   - Must never leak tokens/secrets to client
   - **Mitigation:** Code reviews, security audits

### UX Risks

1. **First-Time User Friction**
   - Too many steps = abandonment
   - **Mitigation:** Minimize required fields, clear progress

2. **Secret Code Loss**
   - User forgets to save code = permanent account loss
   - **Mitigation:** Multiple warnings, email linking option

3. **Mobile Experience**
   - Primary user base on mobile
   - **Mitigation:** Mobile-first design, touch-friendly UI

---

## 🎨 UX Guidelines

### Design for Vulnerability

1. **Language:**
   - Calm, non-judgmental tone
   - Avoid pressure ("You must", "You should")
   - Use supportive language ("Vous pouvez", "À votre rythme")

2. **Interactions:**
   - Clear feedback on all actions
   - Undo options where possible
   - No dark patterns

3. **Accessibility (WCAG 2.1 AA):**
   - Keyboard navigation mandatory
   - Screen reader compatible
   - 4.5:1 contrast minimum
   - Focus indicators visible
   - Clear error messages

4. **Mobile-First:**
   - Touch targets ≥ 44x44px
   - One-handed operation
   - Minimal scrolling
   - Fast loading (< 3s)

---

## 📦 Dependencies

### Critical Dependencies
- `@tanstack/react-start`: ^1.132.0
- `better-auth`: ^1.3.34
- `drizzle-orm`: ^0.44.7
- `react`: 19
- `zod`: ^4.1.11

### Development Dependencies
- `vitest`: ^3.0.5
- `@testing-library/react`: ^16.2.0
- `@testing-library/jest-dom`: ^6.9.1
- `jsdom`: ^27.0.0

### Commands

```bash
# Development
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm start            # Start production server

# Testing
pnpm test             # Run Vitest tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Generate coverage

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Biome linting
pnpm format           # Biome formatting
pnpm check            # Full check
```

---

## 🚀 Deployment

### Environments
- **Local:** http://localhost:3000
- **Production:** parlonsviolence.ch, www.parlonsviolence.ch

### Infrastructure
- PostgreSQL database
- Node.js server (Nitro preset)
- Docker Compose for local development

### Environment Variables (Required)
- Database connection strings
- Better Auth secrets
- Email service credentials
- Arcjet API keys

---

## 📝 Testing Implementation Notes

### What Exists Today
- Vitest configured with jsdom
- Basic test setup in `vitest.config.ts`
- Some unit tests in feature folders (`__tests__/`)
- Manual testing guide for secret code flow

### What's Missing (CRITICAL)
1. **E2E Test Framework**
   - No Playwright/Cypress setup
   - No browser-based testing
   - No visual regression testing

2. **Test Data Management**
   - No factories or fixtures
   - No database seeding utilities
   - No cleanup automation

3. **CI/CD Pipeline**
   - No automated test runs
   - No quality gates
   - No coverage enforcement

4. **Component Tests**
   - Limited component test coverage
   - No accessibility test automation
   - No visual snapshot testing

### Recommended Next Steps
1. Initialize Playwright for E2E tests
2. Create test data factories
3. Implement CI pipeline with quality gates
4. Add accessibility test automation (axe-core)
5. Set up visual regression testing
6. Create component test harness

---

## 🧩 Integration Points

### Better Auth
- Anonymous authentication
- Email/password authentication
- Session management
- Custom secret code authentication

### Arcjet
- Rate limiting
- Bot protection
- Request inspection

### Email Service (Nodemailer)
- Verification emails
- Password reset
- Welcome emails
- Account deletion verification

### Logging (Winston)
- Structured logging
- Daily rotation
- Error tracking

---

## 🎯 GTM Success Metrics

### Primary KPIs
1. **Time to First Post** (target: < 2 minutes)
2. **Anonymous Conversion Rate** (anonymous posts / total visitors)
3. **Secret Code Save Rate** (users who copy code / users who receive code)
4. **Session Recovery Success** (successful logins with secret code)

### Quality Gates
1. **Code Coverage:** Minimum 80% for critical paths
2. **E2E Test Pass Rate:** 100% on main branch
3. **Performance:** First Contentful Paint < 1.5s
4. **Accessibility:** Zero critical violations (WCAG AA)

---

## 📚 Documentation References

### External
- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router Docs](https://tanstack.com/router)
- [TanStack Query Docs](https://tanstack.com/query)
- [TanStack Form Docs](https://tanstack.com/form)
- [Better Auth Docs](https://www.better-auth.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)

### Internal
- Manual Testing Guide: `/TESTING-FIRST-PUBLICATION.md`
- Implementation Artifacts: `/_bmad-output/implementation-artifacts/`
- Planning Artifacts: `/_bmad-output/planning-artifacts/`

---

## 🔒 Security Considerations

### Authentication
- Never expose Better Auth internals to client
- All session validation in server functions
- CSRF protection enabled
- Secure cookie settings (httpOnly, secure, sameSite)

### Data Protection
- Secret codes hashed before storage (TODO: verify implementation)
- Rate limiting on authentication endpoints
- Input validation (client + server)
- SQL injection prevention (Drizzle parameterized queries)

### Content Moderation
- Abuse reporting mechanism
- Moderator role enforcement
- Audit logs for moderation actions

---

## ⚠️ Testing Anti-Patterns to Avoid

1. **Don't test implementation details**
   - Test behavior, not internal state
   - Avoid mocking excessively

2. **Don't skip server-side validation**
   - Client validation is UX, not security
   - Always validate in server functions

3. **Don't test third-party libraries**
   - Trust Better Auth, Drizzle, etc.
   - Test YOUR integration logic

4. **Don't write flaky tests**
   - Use deterministic waits
   - Avoid hard-coded delays
   - Clean up properly

5. **Don't ignore accessibility**
   - Screen reader testing mandatory
   - Keyboard navigation required

---

## 🎬 Quick Start for Testing

### Run Existing Tests
```bash
pnpm test
```

### Add New Test
```typescript
// src/features/auth/__tests__/generate-secret-code.test.ts
import { describe, it, expect } from 'vitest';
import { generateSecretCode } from '../lib/generate-secret-code';

describe('generateSecretCode', () => {
  it('generates code in correct format', () => {
    const code = generateSecretCode();
    expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it('excludes ambiguous characters', () => {
    const code = generateSecretCode();
    expect(code).not.toMatch(/[0OI1l]/);
  });
});
```

### Debug Existing Flow
```bash
# Check user threads and secret code status
tsx scripts/debug-user-threads.ts <alias-id>
```

---

**End of Project Context**

This document is the single source of truth for testing strategy and implementation. Update as the project evolves.
