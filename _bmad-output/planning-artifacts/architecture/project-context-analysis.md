# Project Context Analysis

## Requirements Overview

**Functional Requirements:**

- FR1-FR3: Anonymous participation without account creation, issuance of a one-time “secret code,” and retrieval of prior posts via this code across devices. Architectural implications: prioritize anonymous session flows, minimal-identification storage, and secure code-based lookup mapped to user-owned content.
- FR4-FR6: Optional registered accounts (pseudonym, email, password), authentication, sign-out, and full account deletion. Architectural implications: Better Auth for all auth flows, hard delete or cryptographic erasure for data subject requests, and strict role-based access.
- FR7-FR13: Content creation (posts), category selection, guided templates by category, formatting, submission to moderation, replies, and reporting. Architectural implications: content schemas, safe markup processing, category taxonomy, server-side validation, and moderation queue integration.
- FR14-FR19: Content discovery, filtering by category, sensitive content warnings with default blur, opt-in reveal, full post thread reading, and no social metrics. Architectural implications: SSR pages for lists and details, content sensitivity flags, UI opt-in gating, and deliberate omission of engagement counters.
- FR20-FR27: Moderator workflows for pending queue and reported content, approval/rejection, deletion, sensitivity marking, and standardized warnings. Architectural implications: privileged server functions, audit logging, immutable moderation decisions ledger, and policy-driven actions.

**Non-Functional Requirements:**

- Security: Data encrypted at rest and in transit, least privilege everywhere, anonymity-by-default for crisis flows, regular dependency audits.
- Performance: Fast load-to-first-post (<2s on mobile) and submission confirmation (<3s).
- Accessibility: WCAG 2.1 AA minimum; full keyboard navigation and screen reader compatibility.
- Reliability: Target 99.9% availability; regular DB backups.
- Scalability: MVP capacity targeting 20+ active users and 50+ posts in first 6 weeks, with a path to growth.

**Scale & Complexity:**

- Primary domain: full-stack web application with SSR-first delivery (TanStack Start).
- Complexity level: medium — driven by anonymity flows, moderation, and safety measures rather than real-time features.
- Estimated architectural components: auth (anonymous + registered), content (posts/replies), moderation, category/taxonomy, sensitivity handling, reporting/abuse workflows, and server-rendered listing/detail views.

## Technical Constraints & Dependencies

- Architecture & Design Philosophy: MPA with SSR using TanStack Start; mobile-first, calm, empathic UX; strong SEO via HTML semantics and metadata.
- Real-time: Out of scope for MVP; asynchronous notifications only.
- Browser Support: Latest Chrome/Firefox/Safari/Edge with mobile-first priority.
- Compliance & Safety: Anonymity-by-default, content sensitivity handling, moderator governance, and clear legal boundaries implied by PRD domain concerns.

## Cross-Cutting Concerns Identified

- Privacy and anonymity: pervasive throughout auth, storage, and presentation layers.
- Accessibility: impacts component design, interactions, and content controls (sensitive blur/reveal).
- Moderation: integrates with content lifecycle, storage, and audit trails; role-based access strictly enforced server-side.
- SEO & SSR: influences routing, metadata generation, and content structure (lists/details).
- Security: encryption, least privilege, dependency audits, and secure server functions for all sensitive logic.
