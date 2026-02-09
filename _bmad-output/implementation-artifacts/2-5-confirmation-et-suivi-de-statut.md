# Story 2.5: Confirmation et Suivi de Statut

Status: in-progress

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **utilisateur ayant soumis une publication**,
I want **pouvoir suivre le statut de ma publication**,
So that **je sache quand mon contenu sera publié ou si des modifications sont nécessaires**.

## Acceptance Criteria

### AC1: Access Dashboard

**Given** j'ai soumis une publication pour modération
**When** j'accède à mon tableau de bord personnel (route `/account/profile`)
**Then** je peux voir le statut actuel de mes publications
**And** les statuts possibles sont clairement indiqués (pending, published, rejected)
**And** je peux filtrer mes publications par statut

### AC2: Real-time Status Updates

**Given** ma publication change de statut
**When** un modérateur traite ma soumission
**Then** le statut est mis à jour en temps réel dans la base de données
**And** si rejetée, un message d'explication bienveillant est fourni
**And** si approuvée, ma publication devient visible publiquement

### AC3: Anonymous User Session Recovery

**Given** je suis un utilisateur anonyme avec code secret
**When** je me reconnecte avec mon code (Story 1.3)
**Then** je retrouve l'historique complet de mes publications
**And** je peux voir leurs statuts actuels
**And** je peux créer de nouvelles publications sous la même identité anonyme

## 🚨 CRITICAL MISSION CONTEXT

**Purpose:** This story creates the **user accountability and transparency layer** that allows users to track their submissions through the moderation workflow. You are implementing the **trust bridge** between content submission and publication, giving users visibility and control while maintaining the safety of the moderation system.

**Common LLM Developer Mistakes to PREVENT:**

1. ❌ **Creating new routes without auth protection** - Dashboard must require authentication
2. ❌ **Exposing userId in public views** - MUST use alias system (AR25)
3. ❌ **Forgetting to handle anonymous users** - Anonymous users with secret codes must see their content
4. ❌ **Hard-coding status labels** - Use i18n-ready status mapping
5. ❌ **Ignoring soft delete** - Filter `deletedAt IS NULL` (AR7)
6. ❌ **Breaking existing confirmation page** - Story 2.4 confirmation must still work
7. ❌ **Skipping rejection message display** - Users need empathetic feedback
8. ❌ **Not testing status filtering** - Critical UX feature
9. ❌ **Forgetting mobile responsiveness** - Primary user base is mobile
10. ❌ **Skipping accessibility** - WCAG 2.1 AA compliance mandatory (NFR7)

## 🔬 EXHAUSTIVE CONTEXT ANALYSIS

### Previous Story Intelligence (Story 2.4 - REVIEW)

**Key Learnings from Story 2.4 (Status: review):**

1. **Database Schema Extended:**
   - Added `status` enum: `pending`, `published`, `rejected`
   - Added `isSensitive` boolean (for Story 3.3)
   - Added `moderatedAt` timestamp (nullable)
   - Added `moderatorId` text reference (nullable, FK to user.id)
   - Added `rejectionReason` text (nullable) - **CRITICAL for AC2**
   - Added `deletedAt` timestamp (nullable) - AR7 soft delete
   - File: `src/db/schemas/thread.ts`

2. **createThreadFn Updated:**
   - All new threads created with `status: "pending"`
   - Existing logic intact: alias system, sanitization, secret code generation
   - Performance maintained: 250-500ms (well under NFR6 3s limit)
   - File: `src/features/threads/server/create-thread.ts`

3. **get-threads Filter Added:**
   - Filter: `where(and(eq(threads.status, "published"), isNull(threads.deletedAt)))`
   - Pending threads excluded from public list
   - Soft-deleted threads excluded
   - File: `src/features/threads/server/get-threads.ts`

4. **Confirmation Page Updated:**
   - Added moderation info banner with Clock icon
   - Explained 24-48 hour timeline
   - Empathetic messaging: "garantit un espace sûr et bienveillant"
   - Updated navigation: "Retourner à l'accueil"
   - File: `src/routes/threads/confirmation.tsx`

**What Story 2.5 MUST Build Upon:**
- ✅ Status field exists and is populated
- ✅ rejectionReason field available for AC2
- ✅ moderatedAt timestamp available for sorting
- ✅ Soft delete pattern (deletedAt) must be respected

**What Story 2.5 MUST NOT Touch:**
- ✅ createThreadFn (complete, tested, working)
- ✅ get-threads public filter (complete, tested, working)
- ✅ Confirmation page (complete, tested, working)
- ✅ Tiptap editor (Story 2.3 - complete)

**What Story 2.5 MUST Create:**
- 🔨 User dashboard route `/account/profile`
- 🔨 Server function to fetch user's threads with status
- 🔨 UI components for status display
- 🔨 Filter UI for status filtering
- 🔨 Rejection message display (empathetic)

---

### 🏗️ Architecture Compliance (AR Requirements)

**AR20: Feature Module Structure**

New feature module structure for user profile/dashboard:

```
src/features/profiles/
├── components/
│   ├── UserThreadsList.tsx          # NEW - List of user's threads
│   ├── ThreadStatusBadge.tsx        # NEW - Status indicator badge
│   ├── ThreadStatusFilter.tsx       # NEW - Filter by status
│   └── RejectionMessage.tsx         # NEW - Empathetic rejection display
├── server/
│   └── actions/
│       └── get-user-threads.ts      # NEW - Fetch user's threads
└── __tests__/
    ├── user-threads-list.test.tsx   # NEW - Component tests
    ├── thread-status-badge.test.tsx # NEW - Badge tests
    └── get-user-threads.test.ts     # NEW - Server function tests
```

**AR25: Alias System for Anonymity**

✅ CRITICAL: Dashboard queries MUST use alias system:
- Query threads via `aliasId`, NOT `userId`
- Use `getPrimaryAlias(userId)` to get user's alias
- Never expose `userId` in public views
- Anonymous users see content linked to their alias

**Pattern:**
```typescript
// CORRECT ✅
const primaryAlias = await getPrimaryAlias(session.user.id);
const userThreads = await db.select()
  .from(threads)
  .where(eq(threads.aliasId, primaryAlias.id)); // Via alias!

// WRONG ❌
const userThreads = await db.select()
  .from(threads)
  .where(eq(threads.userId, session.user.id)); // Column doesn't exist!
```

**AR7: Soft Delete Implementation**

✅ MUST filter soft-deleted threads:
```typescript
.where(and(
  eq(threads.aliasId, primaryAlias.id),
  isNull(threads.deletedAt) // Exclude deleted threads
))
```

**AR21: Server Function Naming**

Follow existing patterns:
- `getUserThreadsFn` - Fetch user's threads
- `getThreadBySlugFn` - Fetch single thread (exists)
- `createThreadFn` - Create thread (exists)

**AR13: RBAC Integration**

✅ Dashboard accessible to both:
- Anonymous users (with secret code login)
- Registered users (with email/password)
- NO moderator-specific features in user dashboard

---

### 📊 Database Schema (Story 2.4 Foundation)

**threads table (complete schema):**

```typescript
export const threadsColumns = {
  id: id(),                           // UUID primary key
  aliasId: uuid("alias_id")           // FK to alias (NOT user!)
    .notNull()
    .references(() => alias.id, { onDelete: "cascade" }),
  title: varchar("title").notNull().unique(),
  body: text("body").notNull(),
  slug: varchar("slug").notNull().unique(),
  category: varchar("category").notNull(),

  // Story 2.4 additions (READY FOR USE):
  status: threadStatus("status")       // "pending" | "published" | "rejected"
    .notNull()
    .default("pending"),
  isSensitive: boolean("is_sensitive") // For Story 3.3
    .notNull()
    .default(false),
  moderatedAt: timestamp("moderated_at", { withTimezone: true }), // Nullable
  moderatorId: text("moderator_id")    // FK to user.id, nullable
    .references(() => user.id, { onDelete: "set null" }),
  rejectionReason: text("rejection_reason"), // Nullable - AC2 requirement
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // AR7 soft delete

  createdAt: createdAt(),
  updatedAt: updatedAt(),
};
```

**Key Fields for Story 2.5:**
- `status` - For filtering and display (AC1)
- `rejectionReason` - For AC2 empathetic feedback
- `moderatedAt` - For sorting (most recent actions first)
- `deletedAt` - Must filter `IS NULL` (AR7)

---

### 🎨 UX Design & Status Display

**Status Badge Design (Trauma-Informed):**

```typescript
// Status color mapping (OKLCH - from UX design spec)
const statusStyles = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-200",
    icon: Clock,
    label: "En attente de modération"
  },
  published: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-200",
    icon: CheckCircle,
    label: "Publié"
  },
  rejected: {
    bg: "bg-orange-50 dark:bg-orange-900/20", // Orange tempéré (NOT red)
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-800 dark:text-orange-200",
    icon: AlertCircle,
    label: "Modifications nécessaires"
  }
};
```

**Design Principles:**
- ✅ No aggressive colors (orange instead of red for rejection)
- ✅ Icons for visual recognition
- ✅ Dark mode support (all variants)
- ✅ Semantic labels (not technical jargon)
- ✅ Empathetic language ("Modifications nécessaires" vs "Rejeté")

**Rejection Message Display:**

```typescript
// Empathetic rejection feedback (AC2)
<div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
  <div className="flex gap-3">
    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
    <div>
      <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
        Pourquoi des modifications sont nécessaires
      </h4>
      <p className="text-sm text-orange-800 dark:text-orange-200">
        {thread.rejectionReason || "Votre message ne respecte pas nos règles de bienveillance. Veuillez revoir le contenu et soumettre à nouveau."}
      </p>
      <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
        Notre équipe est là pour vous aider. N'hésitez pas à nous contacter si vous avez des questions.
      </p>
    </div>
  </div>
</div>
```

---

### 🔐 Server Function Architecture

**New Server Function: getUserThreadsFn**

```typescript
// src/features/profiles/server/actions/get-user-threads.ts

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getAuthSession } from '@/features/auth/server/get-auth-session';
import { getPrimaryAlias } from '@/features/alias/lib/get-primary-alias';
import { db } from '@/db';
import { threads } from '@/db/schemas/thread';
import { eq, and, isNull, desc } from 'drizzle-orm';

const getUserThreadsSchema = z.object({
  statusFilter: z.enum(['all', 'pending', 'published', 'rejected']).optional(),
});

export const getUserThreadsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => getUserThreadsSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Authentication check (CRITICAL)
    const session = await getAuthSession();
    if (!session?.user) {
      throw new Error('Unauthorized - Must be authenticated to view dashboard');
    }

    // 2. Get user's primary alias (AR25 - NEVER use userId directly!)
    const primaryAlias = await getPrimaryAlias(session.user.id);
    if (!primaryAlias) {
      throw new Error('No alias found for user');
    }

    // 3. Build query with filters
    const conditions = [
      eq(threads.aliasId, primaryAlias.id),  // Via alias (AR25)
      isNull(threads.deletedAt),             // Exclude soft-deleted (AR7)
    ];

    // 4. Apply status filter if specified (AC1)
    if (data.statusFilter && data.statusFilter !== 'all') {
      conditions.push(eq(threads.status, data.statusFilter));
    }

    // 5. Fetch threads (most recent first)
    const userThreads = await db
      .select({
        id: threads.id,
        title: threads.title,
        slug: threads.slug,
        category: threads.category,
        status: threads.status,
        isSensitive: threads.isSensitive,
        moderatedAt: threads.moderatedAt,
        rejectionReason: threads.rejectionReason,
        createdAt: threads.createdAt,
      })
      .from(threads)
      .where(and(...conditions))
      .orderBy(desc(threads.createdAt)); // Most recent first

    return {
      success: true,
      threads: userThreads,
      totalCount: userThreads.length,
    };
  });
```

**Performance Considerations:**
- Index on `aliasId` already exists (foreign key)
- Index on `status` created in Story 2.4
- Index on `deletedAt` created in Story 2.4
- Expected query time: <100ms for typical user (5-20 threads)

---

### 📱 UI Component Architecture

**Component 1: UserThreadsList**

```typescript
// src/features/profiles/components/UserThreadsList.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserThreadsFn } from '../server/actions/get-user-threads';
import { ThreadStatusFilter } from './ThreadStatusFilter';
import { ThreadStatusBadge } from './ThreadStatusBadge';
import { RejectionMessage } from './RejectionMessage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';

export function UserThreadsList() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');

  // Fetch user's threads with TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-threads', statusFilter],
    queryFn: () => getUserThreadsFn({ data: { statusFilter } }),
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement de vos publications...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Erreur lors du chargement. Veuillez réessayer.
      </div>
    );
  }

  const threads = data?.threads || [];

  return (
    <div className="space-y-6">
      {/* Filter UI (AC1) */}
      <ThreadStatusFilter value={statusFilter} onChange={setStatusFilter} />

      {/* Thread count */}
      <p className="text-sm text-muted-foreground">
        {threads.length} {threads.length === 1 ? 'publication' : 'publications'}
      </p>

      {/* Threads list */}
      {threads.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Aucune publication trouvée.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Card key={thread.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to="/threads/$slug"
                      params={{ slug: thread.slug }}
                      className="hover:underline"
                    >
                      <CardTitle className="text-lg">{thread.title}</CardTitle>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Créé le {new Date(thread.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <ThreadStatusBadge status={thread.status} />
                </div>
              </CardHeader>

              {/* Rejection message (AC2) */}
              {thread.status === 'rejected' && thread.rejectionReason && (
                <CardContent>
                  <RejectionMessage reason={thread.rejectionReason} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Component 2: ThreadStatusBadge**

```typescript
// src/features/profiles/components/ThreadStatusBadge.tsx

import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { ThreadStatus } from '@/db/schemas/thread';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
  },
  published: {
    label: 'Publié',
    icon: CheckCircle,
    className: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200',
  },
  rejected: {
    label: 'Modifications nécessaires',
    icon: AlertCircle,
    className: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200',
  },
} as const;

interface ThreadStatusBadgeProps {
  status: ThreadStatus;
  className?: string;
}

export function ThreadStatusBadge({ status, className }: ThreadStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium',
        config.className,
        className
      )}
      role="status"
      aria-label={`Statut: ${config.label}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{config.label}</span>
    </div>
  );
}
```

**Component 3: RejectionMessage**

```typescript
// src/features/profiles/components/RejectionMessage.tsx

import { AlertCircle } from 'lucide-react';

interface RejectionMessageProps {
  reason: string;
}

export function RejectionMessage({ reason }: RejectionMessageProps) {
  return (
    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <h4 className="font-semibold text-orange-900 dark:text-orange-100">
            Pourquoi des modifications sont nécessaires
          </h4>
          <p className="text-sm text-orange-800 dark:text-orange-200">
            {reason}
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter si vous avez des questions.
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Component 4: ThreadStatusFilter**

```typescript
// src/features/profiles/components/ThreadStatusFilter.tsx

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ThreadStatusFilterProps {
  value: 'all' | 'pending' | 'published' | 'rejected';
  onChange: (value: 'all' | 'pending' | 'published' | 'rejected') => void;
}

export function ThreadStatusFilter({ value, onChange }: ThreadStatusFilterProps) {
  return (
    <Tabs value={value} onValueChange={onChange as (value: string) => void}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          Toutes
        </TabsTrigger>
        <TabsTrigger value="pending">
          En attente
        </TabsTrigger>
        <TabsTrigger value="published">
          Publiées
        </TabsTrigger>
        <TabsTrigger value="rejected">
          À modifier
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

---

### 🛣️ Route Implementation

**Route: /account/profile**

```typescript
// src/routes/account/profile.tsx

import { createFileRoute } from '@tanstack/react-router';
import { getAuthSession } from '@/features/auth/server/get-auth-session';
import { UserThreadsList } from '@/features/profiles/components/UserThreadsList';

export const Route = createFileRoute('/account/profile')({
  // Loader: Verify authentication (AC1 - auth required)
  loader: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: '/account/profile',
        },
      });
    }
    return { user: session.user };
  },

  // Component: User dashboard
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useLoaderData();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mon tableau de bord
          </h1>
          <p className="text-muted-foreground mt-2">
            Suivez le statut de vos publications
          </p>
        </div>

        {/* Threads list with status (AC1, AC2) */}
        <UserThreadsList />
      </div>
    </div>
  );
}
```

---

### 🧪 Testing Requirements

**Test Coverage Targets:**

1. **Server Function Tests (getUserThreadsFn):**
   - Authentication required (unauthorized = error)
   - Returns user's threads via alias (AR25)
   - Excludes soft-deleted threads (AR7)
   - Status filtering works (all, pending, published, rejected)
   - Returns most recent first (orderBy createdAt DESC)
   - Returns empty array if no threads
   - Performance < 200ms

2. **Component Tests (UserThreadsList):**
   - Renders loading state
   - Renders error state
   - Renders empty state (no threads)
   - Renders threads list with correct count
   - Status badges displayed correctly
   - Rejection messages shown for rejected threads
   - Filter changes trigger refetch
   - Links to thread detail pages work

3. **Component Tests (ThreadStatusBadge):**
   - Renders correct icon for each status
   - Renders correct label for each status
   - Applies correct styles for each status
   - ARIA label present for accessibility
   - Dark mode styles work

4. **Component Tests (RejectionMessage):**
   - Renders rejection reason
   - Renders empathetic helper text
   - Accessible structure (icon + text)
   - Responsive layout (mobile + desktop)

5. **E2E Tests (Dashboard Flow):**
   - Anonymous user login → dashboard shows threads
   - Registered user login → dashboard shows threads
   - Filter by pending → only pending threads shown
   - Filter by published → only published threads shown
   - Filter by rejected → only rejected threads with messages
   - Click thread title → navigate to thread detail

**Test File Locations:**

```
src/features/profiles/
├── server/
│   └── __tests__/
│       └── get-user-threads.test.ts         # 15 tests
└── components/
    └── __tests__/
        ├── user-threads-list.test.tsx       # 20 tests
        ├── thread-status-badge.test.tsx     # 12 tests
        ├── thread-status-filter.test.tsx    # 8 tests
        └── rejection-message.test.tsx       # 6 tests

src/routes/account/
└── __tests__/
    └── profile.e2e.test.ts                  # 10 E2E tests
```

**Total Estimated Tests:** 71 tests

---

### 🔗 Dependencies & Story Sequence

**Completed Dependencies (DONE):**
- ✅ Story 1.2: Secret code generation (AC3)
- ✅ Story 1.3: Secret code login (AC3)
- ✅ Story 2.4: Moderation status field (CRITICAL - in review)

**Story 2.5 Blocks:**
- 📋 Story 3.1: List published threads (public view)
- 📋 Story 5.1: Moderation dashboard (moderator changes status)

**Story 2.5 Enables:**
- Users can track submission progress
- Anonymous users verify secret code works across sessions
- Foundation for notification system (future)

**Critical Path:**
Story 2.5 completes the **user feedback loop** for content submission. Users can now:
1. Submit content (Story 2.4)
2. See confirmation (Story 2.4)
3. Track status (Story 2.5) ← **This story**
4. See published content (Story 3.1 - next)

---

## Tasks / Subtasks

### Task 1: Create Server Function (AC: #1, #2, #3)

**Priority:** HIGH - Foundation for all UI

- [ ] Subtask 1.1: Create `src/features/profiles/server/actions/get-user-threads.ts`
- [ ] Subtask 1.2: Import dependencies: `createServerFn`, `getAuthSession`, `getPrimaryAlias`, `db`, `threads`
- [ ] Subtask 1.3: Define Zod schema: `getUserThreadsSchema` with optional `statusFilter`
- [ ] Subtask 1.4: Add authentication check (throw if no session)
- [ ] Subtask 1.5: Get primary alias via `getPrimaryAlias(session.user.id)` (AR25)
- [ ] Subtask 1.6: Build query conditions: `aliasId`, `deletedAt IS NULL`
- [ ] Subtask 1.7: Add status filter if specified (AC1)
- [ ] Subtask 1.8: Execute query with `orderBy(desc(threads.createdAt))`
- [ ] Subtask 1.9: Return threads with all required fields (AC2: include `rejectionReason`)
- [ ] Subtask 1.10: Add JSDoc documentation
- [ ] Subtask 1.11: Export `getUserThreadsFn`

### Task 2: Create UserThreadsList Component (AC: #1, #2)

**Priority:** HIGH - Main dashboard UI

- [ ] Subtask 2.1: Create `src/features/profiles/components/UserThreadsList.tsx`
- [ ] Subtask 2.2: Import dependencies: `useQuery`, `getUserThreadsFn`, child components
- [ ] Subtask 2.3: Add state for `statusFilter` (default: 'all')
- [ ] Subtask 2.4: Implement `useQuery` with queryKey `['user-threads', statusFilter]`
- [ ] Subtask 2.5: Handle loading state (spinner or skeleton)
- [ ] Subtask 2.6: Handle error state (empathetic error message)
- [ ] Subtask 2.7: Render `ThreadStatusFilter` component
- [ ] Subtask 2.8: Render thread count (AC1)
- [ ] Subtask 2.9: Handle empty state (no threads found)
- [ ] Subtask 2.10: Map threads to Card components with status badge
- [ ] Subtask 2.11: Render `RejectionMessage` for rejected threads (AC2)
- [ ] Subtask 2.12: Add Link to thread detail page
- [ ] Subtask 2.13: Ensure mobile responsive (grid/flex layout)
- [ ] Subtask 2.14: Add dark mode support (all color variants)

### Task 3: Create ThreadStatusBadge Component (AC: #1)

**Priority:** MEDIUM - Visual indicator

- [ ] Subtask 3.1: Create `src/features/profiles/components/ThreadStatusBadge.tsx`
- [ ] Subtask 3.2: Import icons: `Clock`, `CheckCircle`, `AlertCircle` from lucide-react
- [ ] Subtask 3.3: Define `STATUS_CONFIG` object with styles for each status
- [ ] Subtask 3.4: Use trauma-informed colors (orange for rejected, NOT red)
- [ ] Subtask 3.5: Implement component with icon + label
- [ ] Subtask 3.6: Add ARIA label: `role="status" aria-label="Statut: {label}"`
- [ ] Subtask 3.7: Support dark mode (all status variants)
- [ ] Subtask 3.8: Export `ThreadStatusBadge`

### Task 4: Create RejectionMessage Component (AC: #2)

**Priority:** HIGH - Critical UX for rejected threads

- [ ] Subtask 4.1: Create `src/features/profiles/components/RejectionMessage.tsx`
- [ ] Subtask 4.2: Import `AlertCircle` icon
- [ ] Subtask 4.3: Accept `reason` prop (string)
- [ ] Subtask 4.4: Render empathetic container (orange theme, NOT red)
- [ ] Subtask 4.5: Display icon + heading "Pourquoi des modifications sont nécessaires"
- [ ] Subtask 4.6: Display rejection reason
- [ ] Subtask 4.7: Add helper text: "Notre équipe est là pour vous aider"
- [ ] Subtask 4.8: Ensure accessible structure (semantic HTML)
- [ ] Subtask 4.9: Support dark mode
- [ ] Subtask 4.10: Mobile responsive layout
- [ ] Subtask 4.11: Export `RejectionMessage`

### Task 5: Create ThreadStatusFilter Component (AC: #1)

**Priority:** MEDIUM - Filter UI

- [ ] Subtask 5.1: Create `src/features/profiles/components/ThreadStatusFilter.tsx`
- [ ] Subtask 5.2: Import Shadcn `Tabs` components
- [ ] Subtask 5.3: Accept `value` and `onChange` props
- [ ] Subtask 5.4: Implement tabs: "Toutes", "En attente", "Publiées", "À modifier"
- [ ] Subtask 5.5: Use semantic labels (not technical: "rejected" → "À modifier")
- [ ] Subtask 5.6: Ensure keyboard navigable (Tab key)
- [ ] Subtask 5.7: Add ARIA labels for accessibility
- [ ] Subtask 5.8: Mobile responsive (grid layout)
- [ ] Subtask 5.9: Export `ThreadStatusFilter`

### Task 6: Create Profile Route (AC: #1, #3)

**Priority:** HIGH - Entry point for dashboard

- [ ] Subtask 6.1: Create `src/routes/account/profile.tsx`
- [ ] Subtask 6.2: Import `createFileRoute`, `getAuthSession`, `UserThreadsList`
- [ ] Subtask 6.3: Implement loader: check authentication
- [ ] Subtask 6.4: If not authenticated → redirect to `/auth/login` with `redirect` search param
- [ ] Subtask 6.5: Return user data from loader
- [ ] Subtask 6.6: Implement component: render page header
- [ ] Subtask 6.7: Render `UserThreadsList` component
- [ ] Subtask 6.8: Add container max-width (4xl) for readability
- [ ] Subtask 6.9: Ensure padding on mobile (px-4)
- [ ] Subtask 6.10: Export route

### Task 7: Server Function Tests (AC: #1, #2, #3)

**Priority:** HIGH - Critical logic

- [ ] Subtask 7.1: Create `src/features/profiles/server/__tests__/get-user-threads.test.ts`
- [ ] Subtask 7.2: Mock `getAuthSession` (authenticated + unauthenticated)
- [ ] Subtask 7.3: Mock `getPrimaryAlias` (returns test alias)
- [ ] Subtask 7.4: Mock database (in-memory or mocked queries)
- [ ] Subtask 7.5: Test: Unauthorized throws error
- [ ] Subtask 7.6: Test: Returns user's threads via alias (AR25)
- [ ] Subtask 7.7: Test: Excludes soft-deleted threads (deletedAt IS NOT NULL)
- [ ] Subtask 7.8: Test: Filter by "pending" status
- [ ] Subtask 7.9: Test: Filter by "published" status
- [ ] Subtask 7.10: Test: Filter by "rejected" status
- [ ] Subtask 7.11: Test: Filter "all" returns all statuses
- [ ] Subtask 7.12: Test: Returns most recent first (createdAt DESC)
- [ ] Subtask 7.13: Test: Returns empty array if no threads
- [ ] Subtask 7.14: Test: Performance < 200ms
- [ ] Subtask 7.15: Run tests: `pnpm test get-user-threads`

### Task 8: Component Tests (UserThreadsList)

**Priority:** MEDIUM - UI verification

- [ ] Subtask 8.1: Create `src/features/profiles/components/__tests__/user-threads-list.test.tsx`
- [ ] Subtask 8.2: Mock `useQuery` hook
- [ ] Subtask 8.3: Test: Renders loading state
- [ ] Subtask 8.4: Test: Renders error state
- [ ] Subtask 8.5: Test: Renders empty state (no threads)
- [ ] Subtask 8.6: Test: Renders threads list
- [ ] Subtask 8.7: Test: Displays correct thread count
- [ ] Subtask 8.8: Test: Status badges rendered for each thread
- [ ] Subtask 8.9: Test: Rejection message shown for rejected threads
- [ ] Subtask 8.10: Test: No rejection message for pending/published
- [ ] Subtask 8.11: Test: Filter changes trigger refetch
- [ ] Subtask 8.12: Test: Links to thread detail pages
- [ ] Subtask 8.13: Run tests: `pnpm test user-threads-list`

### Task 9: Component Tests (ThreadStatusBadge)

**Priority:** LOW - Simple component

- [ ] Subtask 9.1: Create `src/features/profiles/components/__tests__/thread-status-badge.test.tsx`
- [ ] Subtask 9.2: Test: Renders "pending" with Clock icon
- [ ] Subtask 9.3: Test: Renders "published" with CheckCircle icon
- [ ] Subtask 9.4: Test: Renders "rejected" with AlertCircle icon
- [ ] Subtask 9.5: Test: Displays correct label for each status
- [ ] Subtask 9.6: Test: Applies correct styles (colors, borders)
- [ ] Subtask 9.7: Test: ARIA label present and correct
- [ ] Subtask 9.8: Test: Icon has aria-hidden="true"
- [ ] Subtask 9.9: Test: Dark mode classes applied
- [ ] Subtask 9.10: Run tests: `pnpm test thread-status-badge`

### Task 10: Component Tests (RejectionMessage)

**Priority:** MEDIUM - Critical UX

- [ ] Subtask 10.1: Create `src/features/profiles/components/__tests__/rejection-message.test.tsx`
- [ ] Subtask 10.2: Test: Renders rejection reason prop
- [ ] Subtask 10.3: Test: Renders empathetic heading
- [ ] Subtask 10.4: Test: Renders helper text
- [ ] Subtask 10.5: Test: AlertCircle icon present
- [ ] Subtask 10.6: Test: Accessible structure (semantic HTML)
- [ ] Subtask 10.7: Test: Dark mode styles applied
- [ ] Subtask 10.8: Run tests: `pnpm test rejection-message`

### Task 11: Component Tests (ThreadStatusFilter)

**Priority:** LOW - Simple component

- [ ] Subtask 11.1: Create `src/features/profiles/components/__tests__/thread-status-filter.test.tsx`
- [ ] Subtask 11.2: Test: Renders 4 tabs (Toutes, En attente, Publiées, À modifier)
- [ ] Subtask 11.3: Test: Correct tab selected based on value prop
- [ ] Subtask 11.4: Test: onChange called on tab click
- [ ] Subtask 11.5: Test: Keyboard navigation works (Tab key)
- [ ] Subtask 11.6: Test: ARIA labels present
- [ ] Subtask 11.7: Test: Mobile responsive layout
- [ ] Subtask 11.8: Run tests: `pnpm test thread-status-filter`

### Task 12: E2E Tests (Dashboard Flow)

**Priority:** MEDIUM - Full flow validation

- [ ] Subtask 12.1: Create `src/routes/account/__tests__/profile.e2e.test.ts`
- [ ] Subtask 12.2: Setup Playwright (if not already)
- [ ] Subtask 12.3: Test: Unauthenticated redirect to login
- [ ] Subtask 12.4: Test: Anonymous user login → dashboard shows threads (AC3)
- [ ] Subtask 12.5: Test: Registered user login → dashboard shows threads
- [ ] Subtask 12.6: Test: Filter by pending → only pending threads visible
- [ ] Subtask 12.7: Test: Filter by published → only published threads visible
- [ ] Subtask 12.8: Test: Filter by rejected → rejection messages visible
- [ ] Subtask 12.9: Test: Click thread title → navigate to thread detail
- [ ] Subtask 12.10: Test: Mobile responsive layout (viewport: 375px)
- [ ] Subtask 12.11: Test: Accessibility (keyboard navigation, WCAG 2.1 AA)
- [ ] Subtask 12.12: Run E2E tests: `pnpm test:e2e profile`

### Task 13: Documentation Updates

**Priority:** LOW - Maintain docs

- [ ] Subtask 13.1: Update `project-context.md` with dashboard route
- [ ] Subtask 13.2: Document status tracking feature
- [ ] Subtask 13.3: Update user flows with dashboard step
- [ ] Subtask 13.4: Add screenshots (optional)
- [ ] Subtask 13.5: Update CLAUDE.md if needed (route reference)

### Task 14: Manual Testing & Validation

**Priority:** HIGH - Final verification

- [ ] Subtask 14.1: Start dev server: `pnpm dev`
- [ ] Subtask 14.2: Login as anonymous user (with secret code)
- [ ] Subtask 14.3: Navigate to `/account/profile`
- [ ] Subtask 14.4: Verify threads list displays
- [ ] Subtask 14.5: Verify status badges show correctly
- [ ] Subtask 14.6: Test filter: "En attente" → only pending threads
- [ ] Subtask 14.7: Test filter: "Publiées" → only published threads
- [ ] Subtask 14.8: Test filter: "À modifier" → rejected threads with messages
- [ ] Subtask 14.9: Click thread title → verify navigation works
- [ ] Subtask 14.10: Test mobile responsive (Chrome DevTools, 375px)
- [ ] Subtask 14.11: Test dark mode (all status colors correct)
- [ ] Subtask 14.12: Test screen reader (VoiceOver/NVDA)
- [ ] Subtask 14.13: Logout → login as registered user → verify same functionality
- [ ] Subtask 14.14: Performance test: Dashboard load < 2s (NFR5)

---

## Dev Notes

### Architecture Patterns & Constraints

**Key Architecture Requirements:**

1. **AR20 (Feature Module Structure):**
   - ✅ New `profiles` feature follows pattern
   - Components in `components/`
   - Server functions in `server/actions/`
   - Tests in `__tests__/`

2. **AR25 (Alias System for Anonymity):**
   - ✅ CRITICAL: Query via `aliasId`, NOT `userId`
   - ✅ Use `getPrimaryAlias(userId)` to get alias
   - ✅ Never expose `userId` in dashboard
   - 🔒 Anonymous users see content via their alias

3. **AR7 (Soft Delete Implementation):**
   - ✅ MUST filter `deletedAt IS NULL`
   - Dashboard shows only non-deleted threads
   - Moderators can soft-delete threads (Story 5.1)

4. **AR13 (RBAC Integration):**
   - ✅ Dashboard accessible to all authenticated users
   - NO moderator features in user dashboard
   - Separate moderator dashboard (Story 5.1)

5. **AR21 (Server Function Naming):**
   - ✅ Follow pattern: `getUserThreadsFn`
   - Keep consistent with existing functions

**Performance Constraints:**

- **NFR5:** Dashboard load < 2 seconds
- Expected query time: <100ms (indexed queries)
- Use TanStack Query caching (5 minutes default)
- Pagination recommended if user has >50 threads (future)

**Security Constraints:**

- **NFR1:** All data encrypted at rest/transit
- **NFR3:** Anonymity maintained (alias system)
- Authentication required (redirect to login if not authenticated)
- Rate limiting on dashboard route (Arcjet)

**UX Constraints:**

- **NFR7:** WCAG 2.1 AA compliance mandatory
- Trauma-informed design (empathetic language, no aggressive colors)
- Mobile-first responsive design
- Dark mode support (all components)
- Loading states for async operations

---

### Source Tree Components to Touch

**Files to CREATE:**

1. `src/features/profiles/server/actions/get-user-threads.ts` - Server function
2. `src/features/profiles/components/UserThreadsList.tsx` - Main dashboard component
3. `src/features/profiles/components/ThreadStatusBadge.tsx` - Status indicator
4. `src/features/profiles/components/RejectionMessage.tsx` - Rejection feedback
5. `src/features/profiles/components/ThreadStatusFilter.tsx` - Filter UI
6. `src/routes/account/profile.tsx` - Dashboard route
7. `src/features/profiles/server/__tests__/get-user-threads.test.ts` - Server tests
8. `src/features/profiles/components/__tests__/user-threads-list.test.tsx` - Component tests
9. `src/features/profiles/components/__tests__/thread-status-badge.test.tsx` - Badge tests
10. `src/features/profiles/components/__tests__/rejection-message.test.tsx` - Message tests
11. `src/features/profiles/components/__tests__/thread-status-filter.test.tsx` - Filter tests
12. `src/routes/account/__tests__/profile.e2e.test.ts` - E2E tests

**Files to NOT TOUCH:**

- ❌ `src/db/schemas/thread.ts` - Story 2.4 complete (status field exists)
- ❌ `src/features/threads/server/create-thread.ts` - Story 2.4 complete
- ❌ `src/features/threads/server/get-threads.ts` - Story 2.4 complete (public filter)
- ❌ `src/routes/threads/confirmation.tsx` - Story 2.4 complete
- ❌ `src/components/tiptap/*` - Story 2.3 complete
- ❌ `src/hooks/useAutoSaveDraft.ts` - Story 2.3 complete

**Files to OPTIONALLY MODIFY:**

- 📝 `project-context.md` - Add dashboard route documentation
- 📝 `CLAUDE.md` - Add route reference (optional)

---

### Testing Standards Summary

**Test Framework:** Vitest + jsdom + Playwright

**Coverage Targets:**
- Server functions: >90%
- Components: >80%
- E2E: Critical paths (login → dashboard → filter)
- Accessibility: WCAG 2.1 AA compliance

**Test Execution:**

```bash
# Run all tests
pnpm test

# Run specific test files
pnpm test get-user-threads
pnpm test user-threads-list
pnpm test thread-status-badge

# Run E2E tests (Playwright)
pnpm test:e2e profile

# Watch mode (development)
pnpm test --watch
```

**Test Data Strategy:**
- Mock `getAuthSession` for authentication
- Mock `getPrimaryAlias` for alias resolution
- Mock database queries (in-memory or mocked)
- Create test threads with various statuses
- Clean up test data after each test

**Accessibility Testing:**
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility (ARIA labels)
- Focus management (visible focus indicators)
- Color contrast (4.5:1 minimum)
- Semantic HTML (proper heading hierarchy)

---

### Project Structure Notes

**Alignment with Unified Structure:**

✅ **Feature Structure (AR20):**
```
src/features/profiles/
├── components/         # UI components
│   ├── UserThreadsList.tsx
│   ├── ThreadStatusBadge.tsx
│   ├── RejectionMessage.tsx
│   └── ThreadStatusFilter.tsx
├── server/
│   └── actions/        # Server functions
│       └── get-user-threads.ts
└── __tests__/          # Tests
    ├── user-threads-list.test.tsx
    ├── thread-status-badge.test.tsx
    ├── rejection-message.test.tsx
    └── thread-status-filter.test.tsx
```

✅ **Routes Structure:**
```
src/routes/
├── account/
│   ├── profile.tsx     # 🔨 Create here
│   └── __tests__/
│       └── profile.e2e.test.ts  # E2E tests
```

✅ **Database Structure:**
```
src/db/
├── schemas/
│   └── thread.ts       # ✅ Status field exists (Story 2.4)
```

**Detected Conflicts/Variances:**
- None. Story 2.5 follows established patterns from Stories 1.x and 2.x.

---

### References

**Epic & Story Source:**
- [Source: _bmad-output/planning-artifacts/epics-mvp.md, Lines 492-517] - Story 2.5 acceptance criteria
- [Source: _bmad-output/planning-artifacts/epics-mvp.md, Lines 217-256] - Epic 2 overview

**Previous Story Implementation:**
- [Source: _bmad-output/implementation-artifacts/2-4-soumission-pour-moderation.md] - Story 2.4 complete context
- [Source: _bmad-output/implementation-artifacts/2-3-editeur-de-contenu-avec-formatage.md] - Story 2.3 Tiptap
- [Source: _bmad-output/implementation-artifacts/2-2-template-guide-par-categorie.md] - Story 2.2 templates

**Architecture Documentation:**
- [Source: project-context.md, Lines 60-91] - Tech stack overview
- [Source: project-context.md, Lines 166-218] - Database schema
- [Source: CLAUDE.md, Lines 92-119] - Project structure
- [Source: CLAUDE.md, Lines 123-164] - Authentication & alias system
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md] - AR requirements

**Database Schema:**
- [Source: src/db/schemas/thread.ts] - threads table (Story 2.4 additions)
- [Source: src/db/schemaHelpers.ts] - Standard column helpers (AR6)

**Server Function Pattern:**
- [Source: src/features/threads/server/create-thread.ts] - createThreadFn reference
- [Source: CLAUDE.md, Lines 296-342] - Server function pattern documentation

**Alias System:**
- [Source: src/features/alias/lib/get-primary-alias.ts] - Get user's alias (AR25)
- [Source: project-context.md, Lines 165-218] - Alias system documentation

**UX Design:**
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] - Color system (OKLCH)
- [Source: project-context.md, Lines 450-476] - UX guidelines

**Testing Strategy:**
- [Source: project-context.md, Lines 221-297] - Testing strategy overview
- [Source: _bmad-output/implementation-artifacts/2-4-soumission-pour-moderation.md, Lines 59-70] - Test patterns

**Authentication:**
- [Source: src/features/auth/server/get-auth-session.ts] - Session validation
- [Source: project-context.md, Lines 123-164] - Auth flows

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) — Implementation
Claude Opus 4.6 (claude-opus-4-6) — Code Review (2026-02-09)

### Debug Log References

- Code review executed on 2026-02-09: 11 issues found (2C, 3H, 4M, 2L)
- 5 issues fixed automatically (H1, H2, H3, M2, M3)

### Completion Notes List

- Implementation exists but story was never updated (all tasks still [ ])
- Server function placed in `threads/server/actions/` (not `profiles/server/actions/` as story planned)
- Uses button groups instead of nested Tabs (avoids Radix SSR bug)
- Bonus feature: also shows user's posts (réponses) tab
- Zero tests exist for Story 2.5 features (C2 - CRITICAL)

### Code Review (2026-02-09) — Fixes Applied

| ID | Severity | Issue | Fix |
|----|----------|-------|-----|
| H1 | HIGH | `getUserPosts` missing `isNull(posts.deletedAt)` filter (AR7 violation) | Added soft-delete filter to WHERE clause |
| H2 | HIGH | `getUserThreads` missing `isSensitive` field; `UserThreadCard` hardcoded `false` | Added field to SELECT + fixed `getAuthorDisplayName` call |
| H3 | HIGH | Login redirect missing `redirect` search param | Added `search: { redirect: "/account/profile" }` |
| M2 | MEDIUM | `StatusFilterButton` missing ARIA attributes | Added `role="group"`, `aria-label`, `aria-pressed` |
| M3 | MEDIUM | `getCategoryColor` duplicated in 2 files | Extracted to `thread-utils.ts`, updated imports |

### Code Review (2026-02-09) — Outstanding Issues

| ID | Severity | Issue | Status |
|----|----------|-------|--------|
| C1 | CRITICAL | Story file never updated after implementation | Fixed in this review |
| C2 | CRITICAL | Zero tests for Story 2.5 features (71+ planned) | OPEN - needs implementation |
| M1 | MEDIUM | Story File List incorrect vs actual implementation | Fixed in this review |
| M4 | MEDIUM | Date serialization inconsistency between queries | OPEN - low risk |
| L1 | LOW | `UserThreadCard` type manually defined vs inferred | OPEN |
| L2 | LOW | Label inconsistency badge vs filter | OPEN |

### File List

**Files Created (Implementation):**

1. `src/routes/account/profile/index.tsx` — Dashboard route (directory-based)
2. `src/features/profiles/components/ThreadStatusBadge.tsx` — Status badge component
3. `src/features/profiles/components/RejectionMessage.tsx` — Rejection message component
4. `src/features/threads/server/actions/get-user-threads.ts` — Server function
5. `src/features/threads/server/db/thread-queries.ts` — `getUserThreads()` DB query (added)
6. `src/features/posts/server/actions/get-user-posts.ts` — Posts server function (bonus)
7. `src/features/posts/server/db/post-queries.ts` — `getUserPosts()` DB query (added)

**Files Modified (Code Review 2026-02-09):**

1. `src/features/posts/server/db/post-queries.ts` — H1: Added soft-delete filter
2. `src/features/threads/server/db/thread-queries.ts` — H2: Added `isSensitive` to SELECT
3. `src/routes/account/profile/index.tsx` — H2: Fixed isSensitive, H3: redirect param, M2: ARIA
4. `src/lib/utils/thread-utils.ts` — M3: Added shared `getCategoryColor()`
5. `src/features/threads/components/thread-card.tsx` — M3: Use shared `getCategoryColor()`

---

## 🎯 Success Criteria Checklist

Before marking this story as DONE, verify:

- [ ] Server function `getUserThreadsFn` created and working
- [ ] Authentication required (redirect to login if not authenticated)
- [ ] User's threads fetched via alias (AR25 - NOT userId)
- [ ] Soft-deleted threads excluded (AR7 - deletedAt IS NULL)
- [ ] Status filtering works (all, pending, published, rejected)
- [ ] Dashboard route `/account/profile` created
- [ ] `UserThreadsList` component renders threads
- [ ] `ThreadStatusBadge` shows correct status (AC1)
- [ ] `RejectionMessage` displays empathetic feedback (AC2)
- [ ] `ThreadStatusFilter` allows filtering by status (AC1)
- [ ] Anonymous users can see their threads (AC3)
- [ ] Registered users can see their threads
- [ ] Threads ordered by most recent first
- [ ] Mobile responsive (all components)
- [ ] Dark mode support (all components)
- [ ] WCAG 2.1 AA compliant (accessibility)
- [ ] All tests passing (71+ tests)
- [ ] Performance < 2 seconds (NFR5)
- [ ] Documentation updated (project-context.md)
- [ ] Manual testing completed (14 scenarios)
- [ ] sprint-status.yaml updated to "ready-for-dev"

---

## 🚨 Common Pitfalls to Avoid

1. **Querying by userId:** MUST use alias system (AR25) - query via `aliasId`
2. **Forgetting soft delete:** Filter `deletedAt IS NULL` (AR7)
3. **Skipping authentication:** Dashboard MUST require login
4. **Using aggressive colors:** Orange for rejection (NOT red) - trauma-informed
5. **Hard-coding labels:** Use semantic labels ("À modifier" not "Rejeté")
6. **Ignoring mobile:** Mobile-first design mandatory
7. **Skipping dark mode:** All components need dark mode support
8. **Missing accessibility:** WCAG 2.1 AA compliance mandatory
9. **Not testing filters:** Status filtering is critical UX
10. **Breaking Story 2.4:** Confirmation page must still work

---

**END OF STORY 2.5 - ULTIMATE CONTEXT GUIDE**

*This story file contains EVERYTHING the dev agent needs for flawless implementation. No guessing, no reinventing wheels, no disasters.*
