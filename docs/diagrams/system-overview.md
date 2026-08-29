# Vue d'Ensemble du Système - Parlons Violence

**Date:** 2026-01-22
**Version:** 1.0

---

## Architecture Globale

```mermaid
flowchart TB
    subgraph Client["🌐 Client (Browser)"]
        UI[React 19 UI]
        Router[TanStack Router]
        Query[TanStack Query]
        Form[TanStack Form]
    end

    subgraph Server["⚙️ Server (Node.js + Nitro)"]
        SSR[TanStack Start SSR]
        ServerFn[Server Functions]
        Auth[Better Auth]
        Middleware[Middlewares]
    end

    subgraph Database["💾 Database"]
        PG[(PostgreSQL)]
        Drizzle[Drizzle ORM]
    end

    subgraph External["🔌 Services Externes"]
        Arcjet[Arcjet<br/>Rate Limiting]
        Email[Email Service<br/>Resend]
    end

    UI --> Router
    Router --> Query
    Query --> ServerFn
    Form --> ServerFn

    ServerFn --> Middleware
    Middleware --> Auth
    ServerFn --> Drizzle

    Auth --> PG
    Drizzle --> PG

    Middleware --> Arcjet
    ServerFn --> Email

    style Client fill:#e1f5ff
    style Server fill:#fff4e1
    style Database fill:#f0e1ff
    style External fill:#e8f5e1
```

---

## Stack Détaillé

### Frontend

```mermaid
flowchart LR
    subgraph UI["UI Layer"]
        Shadcn[Shadcn/UI<br/>+ Radix]
        Tailwind[Tailwind CSS 4]
    end

    subgraph State["State Management"]
        TQ[TanStack Query<br/>Server State]
        TF[TanStack Form<br/>Form State]
        Local[React State<br/>Local State]
    end

    subgraph Routing["Routing"]
        FileRoutes[File-based Routes<br/>src/routes/]
        TRouter[TanStack Router]
    end

    UI --> State
    State --> Routing
    Routing --> SSR[Server-Side Rendering]

    style UI fill:#e1f5ff
    style State fill:#fff4e1
    style Routing fill:#f0e1ff
```

### Backend

```mermaid
flowchart TB
    subgraph Auth["Authentication"]
        BA[Better Auth]
        Anonymous[Anonymous Auth]
        Email[Email/Password]
        SecretCode[Secret Code Login]
    end

    subgraph Data["Data Layer"]
        Drizzle[Drizzle ORM]
        Schemas[DB Schemas]
        Migrations[Migrations]
    end

    subgraph Security["Security"]
        Arcjet[Arcjet Protection]
        RateLimit[Rate Limiting]
        BotProtect[Bot Protection]
    end

    Auth --> Data
    Data --> Security

    style Auth fill:#ffe1e1
    style Data fill:#f0e1ff
    style Security fill:#fff4e1
```

---

## Flux de Données

### Lecture de Données (Query)

```mermaid
sequenceDiagram
    actor User
    participant UI as React Component
    participant TQ as TanStack Query
    participant ServerFn as Server Function
    participant DB as Database

    User->>UI: Action (ex: voir threads)
    UI->>TQ: useQuery('threads')
    TQ->>ServerFn: getThreadsFn()
    ServerFn->>DB: SELECT * FROM threads
    DB-->>ServerFn: Données
    ServerFn-->>TQ: { threads: [...] }
    TQ-->>UI: Données + Cache
    UI-->>User: Affichage
```

### Écriture de Données (Mutation)

```mermaid
sequenceDiagram
    actor User
    participant UI as React Component
    participant TF as TanStack Form
    participant TM as TanStack Mutation
    participant ServerFn as Server Function
    participant Auth as Auth Middleware
    participant DB as Database

    User->>UI: Soumet formulaire
    UI->>TF: form.handleSubmit()
    TF->>TF: Validation Zod
    TF->>TM: useMutation()
    TM->>ServerFn: createThreadFn(data)
    ServerFn->>Auth: Vérifier session
    Auth-->>ServerFn: User autorisé
    ServerFn->>DB: INSERT thread
    DB-->>ServerFn: Thread créé
    ServerFn-->>TM: { success: true }
    TM->>TM: Invalidate cache
    TM-->>UI: Succès
    UI-->>User: Feedback
```

---

## Modèle de Données Simplifié

```mermaid
erDiagram
    USER ||--o{ ALIAS : "has many"
    USER ||--o{ SESSION : "has many"
    ALIAS ||--o{ THREAD : "creates"
    ALIAS ||--o{ POST : "writes"
    THREAD ||--o{ POST : "contains"
    POST ||--o{ COMMENT : "has"
    THREAD ||--o{ MODERATION : "moderated"
    USER ||--o{ NOTIFICATION : "receives"

    USER {
        string id PK
        boolean isAnonymous
        string email
        string secretCode
        timestamp createdAt
    }

    ALIAS {
        string id PK
        string userId FK
        string alias
        boolean isPrimary
        timestamp createdAt
    }

    THREAD {
        string id PK
        string aliasId FK
        string title
        text body
        string category
        string status
        timestamp createdAt
    }

    POST {
        string id PK
        string threadId FK
        string aliasId FK
        text content
        boolean isSensitive
        timestamp createdAt
    }
```

---

## Flux Utilisateur Principal

```mermaid
journey
    title Parcours Utilisateur Complet
    section Arrivée
      Visite le site: 5: User
      Découvre le feed public: 4: User
    section Première Action
      Clique "Publier Anonymement": 5: User
      Session anonyme créée: 3: System
      Crée premier thread: 5: User
      Reçoit code secret: 5: User, System
    section Utilisation Continue
      Crée d'autres threads: 5: User
      Répond à des threads: 5: User
      Lit contenu: 4: User
    section Migration (optionnelle)
      Décide de créer compte email: 4: User
      Lie ses publications: 5: User
      Compte permanent actif: 5: System
```

---

## Sécurité et Anonymat

### Couches de Protection

```mermaid
flowchart TD
    Input[Entrée Utilisateur]

    Input --> L1[Couche 1: Client Validation<br/>TanStack Form + Zod]
    L1 --> L2[Couche 2: Server Validation<br/>Server Function + Zod]
    L2 --> L3[Couche 3: Rate Limiting<br/>Arcjet]
    L3 --> L4[Couche 4: Authentication<br/>Better Auth]
    L4 --> L5[Couche 5: Authorization<br/>Middleware Checks]
    L5 --> L6[Couche 6: Anonymat<br/>Alias System]
    L6 --> L7[Couche 7: Redaction<br/>Logger Auto-redact]
    L7 --> DB[(Database)]

    style L1 fill:#e1f5ff
    style L2 fill:#ffe1e1
    style L3 fill:#fff4e1
    style L4 fill:#f0e1ff
    style L5 fill:#e8f5e1
    style L6 fill:#ffe1e1
    style L7 fill:#e1f5ff
```

### Anonymat Garanti

```mermaid
flowchart LR
    User[👤 User<br/>Privé]
    Alias[🎭 Alias<br/>Public]
    Thread[📝 Thread<br/>Public]

    User -.->|Jamais lié directement| Thread
    User -->|Crée| Alias
    Alias -->|Crée| Thread

    style User fill:#ffe1e1
    style Alias fill:#fff4e1
    style Thread fill:#e1f5ff
```

---

## Performance et Scalabilité

### Stratégie de Cache

```mermaid
flowchart TB
    Request[Request]

    Request --> Cache{Cache Hit?}
    Cache -->|Oui| Return[Return Cached]
    Cache -->|Non| DB[Query Database]
    DB --> Store[Store in Cache]
    Store --> Return

    Return --> User[User]

    subgraph TanStack["TanStack Query Cache"]
        Cache
        Return
    end

    subgraph Database["PostgreSQL"]
        DB
    end

    style TanStack fill:#e1f5ff
    style Database fill:#f0e1ff
```

### Optimisations

```mermaid
flowchart LR
    subgraph SSR["Server-Side Rendering"]
        Initial[First Load SSR]
        Hydrate[Hydration]
    end

    subgraph CSR["Client-Side Rendering"]
        Navigate[Navigation CSR]
        Prefetch[Prefetch Links]
    end

    subgraph Data["Data Fetching"]
        Parallel[Parallel Queries]
        Dedup[Deduplication]
        Stale[Stale-While-Revalidate]
    end

    SSR --> CSR
    CSR --> Data

    style SSR fill:#e1f5ff
    style CSR fill:#fff4e1
    style Data fill:#f0e1ff
```

---

## Monitoring et Observabilité

### Architecture de Logging

```mermaid
flowchart TB
    subgraph App["Application"]
        Code[Application Code]
        Middleware[Logging Middleware]
    end

    subgraph Winston["Winston Logger"]
        Format[Formatter<br/>JSON + Redaction]
        Transport[Transports]
    end

    subgraph Output["Outputs"]
        Console[Console<br/>Dev]
        Files[Rotating Files<br/>Prod]
        External[External Services<br/>Datadog/ELK]
    end

    Code --> Middleware
    Middleware --> Format
    Format --> Transport
    Transport --> Console
    Transport --> Files
    Transport --> External

    style App fill:#e1f5ff
    style Winston fill:#fff4e1
    style Output fill:#f0e1ff
```

### Contexte de Corrélation

```mermaid
sequenceDiagram
    participant Request
    participant Middleware
    participant Handler
    participant Service
    participant DB

    Request->>Middleware: correlationId: abc-123
    Middleware->>Handler: context.logger (with ID)
    Handler->>Service: calls service
    Service->>DB: query
    DB-->>Service: result
    Service-->>Handler: data
    Handler-->>Request: response + header

    Note over Request,DB: Tous les logs ont le même correlationId<br/>permettant de tracer le flux complet
```

---

## Déploiement

### Pipeline CI/CD (Futur)

```mermaid
flowchart LR
    Git[Git Push]

    Git --> Build[Build<br/>pnpm build]
    Build --> Lint[Lint<br/>Biome]
    Lint --> Test[Tests<br/>Vitest]
    Test --> E2E[E2E Tests<br/>Playwright]
    E2E --> Deploy[Deploy<br/>Production]

    Deploy --> Health[Health Check]
    Health --> Monitor[Monitoring]

    style Git fill:#e1f5ff
    style Build fill:#fff4e1
    style Deploy fill:#e8f5e1
```

---

## Références

- [Project Context](../project-context.md) - Contexte complet du projet
- [Architecture Flows](./architecture-flux-threads-posts.md) - Détail des flux
- [Auth Flows](./auth-flows.md) - Flux d'authentification détaillés
- [Documentation Validation Report](./DOCUMENTATION-VALIDATION-REPORT.md) - Rapport de validation

---

**Maintenu par:** Équipe Parlons Violence
**Dernière mise à jour:** 2026-01-22
