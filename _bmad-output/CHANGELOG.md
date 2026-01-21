# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Epic 1: Accès et Authentification (In Progress)

#### [1.1.0] - 2026-01-07 - ✅ COMPLETED

**Story 1.1: Session Anonyme Immédiate**

##### Added
- Anonymous session creation with Better Auth `anonymous()` plugin
- `AnonymousPostButton` component with full accessibility (WCAG 2.1 AA)
- Server function `createAnonymousSessionFn` for anonymous session management
- Automatic primary alias creation for anonymous users on session creation
- Comprehensive test suite (59 tests total):
  - 7 tests for auth configuration
  - 12 tests for anonymous session creation
  - 15 tests for component behavior
  - 15 tests for performance validation (NFR5)
  - 10 tests for auth hook alias creation logic
- Winston logging for session creation and alias generation
- Database migration adding `is_anonymous` boolean field to user table

##### Changed
- Extended auth hook in `src/features/auth/lib/auth.ts` to detect anonymous users via `isAnonymous` flag
- Auth hook now creates primary alias for: email signup, OAuth callbacks, AND anonymous sessions
- Updated Story 1.2 scope to focus only on secret code generation (alias pre-exists)

##### Fixed
- **Critical Fix**: Thread creation now works for anonymous users (alias auto-generated on session creation)
- Resolved architectural inconsistency where anonymous users couldn't create content without alias

##### Technical Details
- **Performance**: Session creation completes in <2s (NFR5 validated)
- **Security**: Rate limiting via Arcjet, no sensitive data logged
- **UX**: Mobile-first, calm design, single-click anonymous access
- **Testing**: TDD cycle (RED → GREEN → REFACTOR) with 100% test pass rate
- **Architecture**: Maintains coherence with existing alias system

##### Files Modified
- `src/features/auth/lib/auth.ts` - Extended auth hook for anonymous alias creation
- `src/features/auth/__tests__/auth-hook-alias-creation.test.ts` - New test suite (10 tests)
- `_bmad-output/implementation-artifacts/1-1-session-anonyme-immediate.md` - Completion documentation
- `_bmad-output/implementation-artifacts/1-2-code-secret-pour-utilisateur-anonyme.md` - Updated prerequisites

##### Commit
- `0d3833a` - fix: auto-create alias for anonymous users on session creation

---

## Story Status Legend

- ✅ **COMPLETED**: Story fully implemented, tested, and validated
- 🚧 **IN PROGRESS**: Story currently being developed
- 📋 **READY FOR DEV**: Story file created, ready for implementation
- 📝 **BACKLOG**: Story exists in epic but not yet started

---

## Testing Metrics

- **Total Tests**: 59 passing
- **Code Coverage**: Comprehensive (unit + integration + component)
- **Performance**: All NFR5 requirements validated (<2s)
- **Accessibility**: WCAG 2.1 AA compliance verified
- **Diagnostic Status**: 0 errors, 0 warnings

---

## Notes

This changelog tracks implementation progress for the **Parlons Violence** anonymous support forum.
Each story completion includes:
- Feature additions and changes
- Bug fixes and architectural improvements
- Testing metrics and validation
- Git commit references
- Documentation updates

For detailed technical specifications, see individual story files in `_bmad-output/implementation-artifacts/`.
