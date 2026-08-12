# Architecture du Système de Logging

**Date:** 2026-01-22
**Module:** `src/lib/logger`
**Technologie:** Winston 3.19.0 + AsyncLocalStorage

---

## Vue d'Ensemble

```mermaid
flowchart TB
    subgraph Application["🎯 Application Layer"]
        Component[React Components]
        ServerFn[Server Functions]
        Services[Services/Utils]
    end

    subgraph Context["📦 Context Layer"]
        AsyncLocal[AsyncLocalStorage]
        Middleware[Logging Middleware]
    end

    subgraph Winston["🔧 Winston Logger"]
        Format[Formatters]
        Redact[Auto-Redaction]
        Transport[Transport Router]
    end

    subgraph Output["📤 Output Destinations"]
        Console[Console<br/>Development]
        RotateFile[Rotating Files<br/>Production]
        External[External Services<br/>Datadog/ELK]
    end

    Component --> ServerFn
    ServerFn --> Middleware
    Services --> AsyncLocal

    Middleware --> AsyncLocal
    AsyncLocal --> Format

    Format --> Redact
    Redact --> Transport


    Transport --> Console
    Transport --> RotateFile
    Transport --> External

    style Application fill:#e1f5ff
    style Context fill:#fff4e1
    style Winston fill:#f0e1ff
    style Output fill:#e8f5e1
```

---

## Flux de Données Détaillé

### 1. Requête HTTP avec Contexte Automatique

```mermaid
sequenceDiagram
    actor User
    participant Request
    participant LMiddleware as Logging Middleware
    participant AsyncLocal as AsyncLocalStorage
    participant Handler as Server Function
    participant Logger as Winston Logger
    participant Transport

    User->>Request: HTTP Request
    Request->>LMiddleware: createServerFn.middleware([loggingMiddleware])

    Note over LMiddleware: Génère correlationId (UUID)
    LMiddleware->>LMiddleware: correlationId = uuid()

    LMiddleware->>AsyncLocal: Store context<br/>{ correlationId, path, method }
    AsyncLocal-->>LMiddleware: Context stored

    LMiddleware->>Handler: context.logger (pre-configured)

    Note over Handler: Business logic
    Handler->>Logger: logger.info("Event", { data })

    Logger->>Logger: Merge context<br/>(correlationId + custom data)
    Logger->>Logger: Auto-redact sensitive fields
    Logger->>Transport: Formatted log

    Transport-->>Handler: Log written
    Handler-->>Request: Response
    Request-->>User: Response + Header<br/>x-correlation-id
```

### 2. Log depuis un Service (sans middleware)

```mermaid
sequenceDiagram
    participant Handler as Server Function
    participant Service as Utility Service
    participant AsyncLocal as AsyncLocalStorage
    participant Logger as Winston Logger

    Handler->>Service: Call service function
    Service->>AsyncLocal: getContext()
    AsyncLocal-->>Service: { correlationId, userId, ... }
    Service->>Logger: getContextLogger()
    Logger->>AsyncLocal: Retrieve context
    AsyncLocal-->>Logger: Context data
    Logger->>Logger: Create child logger<br/>with context
    Logger-->>Service: Contextualized logger
    Service->>Logger: logger.info("Event")

    Note over Logger: Logs include correlationId<br/>automatically
```

---

## Composants du Système

### AsyncLocalStorage - Propagation du Contexte

```mermaid
flowchart TB
    Request[HTTP Request]

    Request --> Store[AsyncLocalStorage.run]
    Store --> Context["Context Object<br/>{correlationId, userId, path}"]

    Context --> Fn1[Handler Function]
    Context --> Fn2[Service Function]
    Context --> Fn3[DB Query Function]

    Fn1 --> Logger1[Logger A]
    Fn2 --> Logger2[Logger B]
    Fn3 --> Logger3[Logger C]

    Logger1 --> Same["Tous ont le même<br/>correlationId"]
    Logger2 --> Same
    Logger3 --> Same

    style Context fill:#fff4e1
    style Same fill:#e8f5e1
```

**Avantage:** Pas besoin de passer le logger en paramètre à chaque fonction!

### Winston Formatters

```mermaid
flowchart LR
    Input[Log Input]

    Input --> Timestamp[Add Timestamp<br/>ISO 8601]
    Timestamp --> Metadata[Add Metadata<br/>service, env, hostname]
    Metadata --> Context[Merge Context<br/>correlationId, userId]
    Context --> Redact[Auto-Redaction<br/>passwords, tokens]
    Redact --> Format{Environment?}

    Format -->|Development| Pretty[Colorized Pretty Print<br/>Human-readable]
    Format -->|Production| JSON[JSON Format<br/>Machine-readable]

    Pretty --> Output[Output]
    JSON --> Output

    style Redact fill:#ffe1e1
    style Pretty fill:#e1f5ff
    style JSON fill:#f0e1ff
```

### Transports (Destinations)

```mermaid
flowchart TB
    Logger[Winston Logger]

    Logger --> Router{Transport Router}

    Router -->|All Levels| Console[Console Transport<br/>Dev + Test]
    Router -->|info+| AppFile[app-YYYY-MM-DD.log<br/>Rotating Daily]
    Router -->|error+| ErrorFile[error-YYYY-MM-DD.log<br/>Rotating Daily]
    Router -->|Optional| Datadog[Datadog Transport]
    Router -->|Optional| ELK[Logstash Transport]

    AppFile --> Compress[Gzip Compression<br/>After 14 days]
    ErrorFile --> Compress2[Gzip Compression<br/>After 30 days]

    style Console fill:#e1f5ff
    style AppFile fill:#fff4e1
    style ErrorFile fill:#ffe1e1
```

---

## Niveaux de Log

### Hiérarchie et Utilisation

```mermaid
flowchart TD
    Error[error<br/>❌ Erreurs bloquantes]
    Warn[warn<br/>⚠️ Avertissements]
    Info[info<br/>ℹ️ Événements métier]
    HTTP[http<br/>🌐 Requêtes HTTP]
    Debug[debug<br/>🔍 Détails dev]
    Verbose[verbose<br/>📝 Très détaillé]
    Silly[silly<br/>🎭 Tout]

    Error --> Warn --> Info --> HTTP --> Debug --> Verbose --> Silly

    style Error fill:#ffe1e1
    style Warn fill:#fff4e1
    style Info fill:#e1f5ff
    style HTTP fill:#f0e1ff
    style Debug fill:#e8f5e1
```

### Configuration par Environnement

| Environnement   | Niveau   | Transports Actifs                 |
| --------------- | -------- | --------------------------------- |
| **Development** | `debug`  | Console (coloré)                  |
| **Test**        | `silent` | Aucun (logs désactivés)           |
| **Production**  | `info`   | Console (JSON) + Files + External |

---

## Auto-Redaction des Données Sensibles

### Champs Redactés Automatiquement

```mermaid
flowchart LR
    Input["Log Object<br/>{<br/>  email: 'user@...',<br/>  password: 'secret123',<br/>  token: 'abc-xyz'<br/>}"]

    Input --> Scan[Scanner Récursif]

    Scan --> Check{Champ Sensible?}

    Check -->|password| Redact1[Remplacer par '[REDACTED]']
    Check -->|token| Redact2[Remplacer par '[REDACTED]']
    Check -->|apiKey| Redact3[Remplacer par '[REDACTED]']
    Check -->|Non| Keep[Conserver valeur]

    Redact1 --> Output
    Redact2 --> Output
    Redact3 --> Output
    Keep --> Output

    Output["Log Sécurisé<br/>{<br/>  email: 'user@...',<br/>  password: '[REDACTED]',<br/>  token: '[REDACTED]'<br/>}"]

    style Input fill:#ffe1e1
    style Output fill:#e8f5e1
```

### Liste des Clés Sensibles

```typescript
const SENSITIVE_KEYS = [
  "password",
  "pass",
  "token",
  "authorization",
  "auth",
  "secret",
  "apikey",
  "apiKey",
  "api_key",
  "bearer",
  "creditcard",
  "ssn",
  "secretCode", // Spécifique au projet
];
```

---

## Rotation des Fichiers

### Politique de Rétention

```mermaid
flowchart TB
    Log[New Log Entry]

    Log --> Check{File Size > 20MB<br/>OR<br/>New Day?}

    Check -->|Non| Append[Append to Current File]
    Check -->|Oui| Rotate[Rotate File]

    Rotate --> Rename["Rename<br/>app.log → app-2026-01-22.log"]
    Rename --> NewFile[Create New app.log]
    Rename --> Compress[Compress Old Files<br/>gzip]

    Compress --> Age{Age > Retention?}
    Age -->|app-*.log > 14d| Delete1[Delete Old File]
    Age -->|error-*.log > 30d| Delete2[Delete Old File]
    Age -->|Non| Keep[Keep File]

    style Rotate fill:#fff4e1
    style Delete1 fill:#ffe1e1
    style Delete2 fill:#ffe1e1
```

### Structure des Fichiers

```
logs/
├── app-2026-01-22.log          ← Aujourd'hui (tous niveaux info+)
├── app-2026-01-21.log.gz       ← Hier (compressé)
├── app-2026-01-20.log.gz
├── ...
├── error-2026-01-22.log        ← Aujourd'hui (erreurs uniquement)
├── error-2026-01-21.log.gz
└── error-2026-01-20.log.gz
```

---

## Exemples d'Intégration

### Server Function avec Middleware

```typescript
import { createServerFn } from "@tanstack/react-start";
import { loggingMiddleware } from "@/lib/logger";

export const createThreadFn = createServerFn({ method: "POST" })
  .middleware([loggingMiddleware])
  .handler(async ({ context, data }) => {
    // context.logger inclut automatiquement:
    // - correlationId (UUID unique)
    // - requestPath (/api/threads)
    // - method (POST)

    context.logger.info("Creating thread", {
      title: data.title,
      category: data.category,
    });

    try {
      const thread = await db.insert(threads).values(data);

      context.logger.info("Thread created", {
        threadId: thread.id,
      });

      return { success: true, thread };
    } catch (error) {
      context.logger.error("Failed to create thread", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  });
```

### Service sans Contexte HTTP

```typescript
import { getContextLogger, withMeta } from '@/lib/logger';

export class NotificationService {
  private logger = withMeta({ service: 'NotificationService' });

  async sendEmail(userId: string, type: string) {
    const emailLogger = withMeta({
      userId,
      notificationType: type,
    });

    emailLogger.info('Sending notification email');

    try {
      await emailService.send({ ... });
      emailLogger.info('Email sent successfully');
    } catch (error) {
      emailLogger.error('Failed to send email', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
```

---

## Formats de Sortie

### Développement (Console Pretty)

```
2026-01-22 10:30:45.123 [info] User created thread {
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "userId": "user_123",
  "threadId": "thread_456",
  "title": "Besoin d'aide"
}
```

### Production (JSON)

```json
{
  "level": "info",
  "message": "User created thread",
  "timestamp": "2026-01-22T10:30:45.123Z",
  "service": "parlons-violence",
  "env": "production",
  "hostname": "app-server-01",
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "userId": "user_123",
  "threadId": "thread_456",
  "title": "Besoin d'aide"
}
```

---

## Intégrations Externes

### Datadog

```mermaid
flowchart LR
    Winston[Winston Logger]

    Winston --> DatadogTransport[Datadog Transport]
    DatadogTransport --> API[Datadog API]
    API --> Datadog[Datadog Platform]

    Datadog --> Dashboard[Dashboards]
    Datadog --> Alerts[Alertes]
    Datadog --> Trace[APM Traces]

    style Datadog fill:#632ca6
    style Dashboard fill:#e1f5ff
```

### ELK Stack

```mermaid
flowchart LR
    Winston[Winston Logger]

    Winston --> Logstash[Logstash Transport]
    Logstash --> Elastic[Elasticsearch]
    Elastic --> Kibana[Kibana Dashboards]

    style Elastic fill:#005571
    style Kibana fill:#e8f5e1
```

---

## Performance et Overhead

### Impact par Niveau de Log

```mermaid
flowchart TB
    App[Application Code]

    App --> Debug{LOG_LEVEL=debug}
    App --> Info{LOG_LEVEL=info}
    App --> Error{LOG_LEVEL=error}

    Debug --> High[Overhead: ÉLEVÉ<br/>Volume: 100%<br/>Disque: 100%]
    Info --> Medium[Overhead: MOYEN<br/>Volume: 30%<br/>Disque: 30%]
    Error --> Low[Overhead: FAIBLE<br/>Volume: 1%<br/>Disque: 1%]

    style High fill:#ffe1e1
    style Medium fill:#fff4e1
    style Low fill:#e8f5e1
```

### Recommandations

| Environnement  | Niveau   | Justification                     |
| -------------- | -------- | --------------------------------- |
| **Dev**        | `debug`  | Tous les détails pour debugger    |
| **Staging**    | `info`   | Événements métier sans spam       |
| **Production** | `info`   | Balance performance/observabilité |
| **Test**       | `silent` | Pas de pollution des logs de test |

---

## Tracing avec Correlation ID

### Traçabilité Complète

```mermaid
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Handler
    participant Service
    participant DB

    Client->>API: Request (no ID)
    Note over API: Generate correlationId<br/>abc-123

    API->>Handler: correlationId: abc-123
    Handler->>Handler: logger.info("Request received")<br/>[abc-123]

    Handler->>Service: Call service
    Service->>Service: logger.info("Processing data")<br/>[abc-123]

    Service->>DB: Query
    DB-->>Service: Result
    Service->>Service: logger.info("Query completed")<br/>[abc-123]

    Service-->>Handler: Data
    Handler->>Handler: logger.info("Response sent")<br/>[abc-123]

    Handler-->>API: Response
    API-->>Client: Response<br/>x-correlation-id: abc-123

    Note over Client,DB: Tous les logs avec le même ID<br/>permet de tracer le flux complet
```

### Recherche dans les Logs

```bash
# Trouver tous les logs d'une requête
grep "abc-123" logs/app-2026-01-22.log

# Avec jq pour JSON
cat logs/app-2026-01-22.log | jq 'select(.correlationId == "abc-123")'
```

---

## Monitoring et Alertes

### Métriques Clés

```mermaid
flowchart TB
    Logs[Log Stream]

    Logs --> Count[Count by Level]
    Logs --> Latency[Response Time]
    Logs --> Errors[Error Rate]

    Count --> Dashboard[Dashboards]
    Latency --> Dashboard
    Errors --> Dashboard

    Errors --> Alert{Error Rate > 5%?}
    Alert -->|Oui| Notify[Send Alert<br/>Slack/Email]
    Alert -->|Non| OK[OK]

    style Alert fill:#ffe1e1
    style Notify fill:#ffe1e1
```

---

## Références

- [Logger README](../../src/lib/logger/README.md) - Documentation complète
- [Logger USAGE](../../src/lib/logger/USAGE.md) - Guide d'utilisation
- [Winston Documentation](https://github.com/winstonjs/winston)
- [AsyncLocalStorage Node.js](https://nodejs.org/api/async_context.html)

---

**Maintenu par:** Équipe Parlons Violence
**Dernière mise à jour:** 2026-01-22
