# 📝 Système de Logging Winston

Documentation complète du système de logging pour Parlons Violence, basé sur Winston 3.19.0.

## 📚 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation basique](#utilisation-basique)
- [Utilisation avancée](#utilisation-avancée)
- [Intégration avec TanStack Start](#intégration-avec-tanstack-start)
- [Niveaux de logs](#niveaux-de-logs)
- [Contexte de corrélation](#contexte-de-corrélation)
- [Redaction de données sensibles](#redaction-de-données-sensibles)
- [Rotation des fichiers](#rotation-des-fichiers)
- [Bonnes pratiques](#bonnes-pratiques)
- [Exemples concrets](#exemples-concrets)

---

## Vue d'ensemble

Le système de logging intègre :

- **Winston 3.19.0** : Logger structuré et extensible
- **AsyncLocalStorage** : Propagation automatique du contexte (correlationId, userId...)
- **TanStack Start Middleware** : Logging automatique des requêtes HTTP
- **Redaction automatique** : Masquage des données sensibles (passwords, tokens...)
- **Rotation quotidienne** : Archivage automatique des logs en production
- **TypeScript-first** : Typage complet pour une meilleure DX

### Architecture

```
src/lib/logger/
├── logger.ts           # Configuration Winston (formats, transports, redaction)
├── context.ts          # AsyncLocalStorage pour propagation du contexte
├── middleware.ts       # Middleware TanStack Start
├── index.ts            # Exports publics
└── README.md           # Cette documentation
```

---

## Installation

Les dépendances sont déjà installées :

```json
{
  "winston": "^3.19.0",
  "winston-daily-rotate-file": "^5.0.0",
  "uuid": "^13.0.0"
}
```

---

## Configuration

### Variables d'environnement

Ajoutez ces variables optionnelles dans votre `.env` :

```bash
# Niveau de log (optionnel, défaut: 'debug' en dev, 'info' en prod)
LOG_LEVEL=info

# Répertoire des logs (optionnel, défaut: ./logs)
LOG_DIR=/var/log/parlons-violence

# Nom du service (optionnel, défaut: 'parlons-violence')
SERVICE_NAME=parlons-violence
```

### Niveaux disponibles

Par ordre de priorité décroissante :
- `error` - Erreurs bloquantes
- `warn` - Avertissements non bloquants
- `info` - Événements métier importants
- `http` - Requêtes HTTP (logs de requêtes)
- `debug` - Détails de débogage
- `verbose` - Détails très verbeux
- `silly` - Tout et n'importe quoi

---

## Utilisation basique

### Import et utilisation simple

```typescript
import { logger } from '@/lib/logger';

// Logs simples
logger.info('Application démarrée');
logger.warn('Quota presque atteint', { usage: 95 });
logger.error('Connexion DB échouée', new Error('Connection timeout'));

// Avec metadata structurée
logger.info('Utilisateur créé', {
  userId: '123',
  email: 'user@example.com',
  role: 'admin'
});
```

### Logs avec contexte

```typescript
import { withMeta } from '@/lib/logger';

// Créer un child logger avec metadata par défaut
const jobLogger = withMeta({ jobId: 'email-batch-001', type: 'email' });

jobLogger.info('Job démarré');
jobLogger.info('Emails envoyés', { count: 150 });
jobLogger.info('Job terminé', { duration: 4500 });

// Tous les logs auront automatiquement jobId et type
```

### Logger une erreur avec helper

```typescript
import { logError } from '@/lib/logger';

try {
  await riskyOperation();
} catch (error) {
  logError('Operation failed', error, {
    userId: '123',
    operation: 'payment'
  });
}
```

---

## Utilisation avancée

### Contexte de corrélation (AsyncLocalStorage)

Le contexte permet de propager des métadonnées à travers toute la chaîne d'exécution sans les passer explicitement.

```typescript
import { runWithContext, getContext, getContextLogger } from '@/lib/logger';

// Définir un contexte pour une opération
runWithContext({ correlationId: 'abc-123', userId: '42' }, () => {
  // Tout le code ici a accès au contexte
  
  someFunction();
  anotherFunction();
});

function someFunction() {
  const ctx = getContext();
  console.log(ctx.correlationId); // 'abc-123'
  console.log(ctx.userId); // '42'
  
  // Récupérer un logger avec le contexte automatique
  const log = getContextLogger();
  log.info('Function called'); // Inclut automatiquement correlationId et userId
}
```

### Enrichir le contexte

```typescript
import { updateContext, enrichLogContextWithUser } from '@/lib/logger';

// Méthode générique
updateContext({ customField: 'value' });

// Helper spécifique pour les utilisateurs (utilisé dans authMiddleware)
enrichLogContextWithUser('user-123', 'john_doe');
```

---

## Intégration avec TanStack Start

### Middleware de logging

Le `loggingMiddleware` génère automatiquement un `correlationId` par requête et injecte un logger contextualisé.

```typescript
import { createServerFn } from '@tanstack/react-start';
import { loggingMiddleware } from '@/lib/logger';

export const myServerFn = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware])
  .handler(async ({ context }) => {
    // context.logger est un logger avec correlationId automatique
    context.logger.info('Request received');
    
    // context.correlationId est l'ID unique de cette requête
    console.log(context.correlationId); // 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    
    // context.logContext contient toutes les métadonnées
    console.log(context.logContext); // { correlationId, requestPath, method, ... }
    
    return { success: true };
  });
```

### Combiner avec authMiddleware

```typescript
import { createServerFn } from '@tanstack/react-start';
import { loggingMiddleware } from '@/lib/logger';
import { authMiddleware } from '@/features/auth/lib/auth-middleware';

export const protectedServerFn = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .handler(async ({ context }) => {
    // context.logger contient maintenant correlationId + userId + username
    context.logger.info('Protected action called');
    
    if (!context.isAuthenticated) {
      context.logger.warn('Unauthorized access attempt');
      throw new Error('Unauthorized');
    }
    
    context.logger.info('User action successful', {
      action: 'data_export',
      recordCount: 42
    });
    
    return { success: true };
  });
```

### Utilisation sans middleware

Si vous êtes dans du code qui n'a pas accès au `context`, utilisez `getContextLogger()` :

```typescript
import { getContextLogger } from '@/lib/logger';

export async function someUtilityFunction(data: any) {
  const log = getContextLogger();
  
  log.info('Processing data', { size: data.length });
  
  try {
    const result = await processData(data);
    log.info('Data processed successfully', { resultId: result.id });
    return result;
  } catch (error) {
    log.error('Failed to process data', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
```

---

## Niveaux de logs

### Quand utiliser chaque niveau ?

#### ❌ `error` - Erreurs bloquantes
Utilisez pour les erreurs qui empêchent l'exécution normale.

```typescript
logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack,
  host: dbHost
});

logger.error('Payment processing failed', {
  orderId: '123',
  amount: 99.99,
  reason: 'Card declined'
});
```

#### ⚠️ `warn` - Avertissements non bloquants
Situations anormales mais gérables.

```typescript
logger.warn('Rate limit approaching', {
  current: 95,
  limit: 100,
  userId: '123'
});

logger.warn('Deprecated API called', {
  endpoint: '/v1/users',
  deprecatedSince: '2024-01-01'
});
```

#### ℹ️ `info` - Événements métier importants
Actions significatives dans l'application.

```typescript
logger.info('User registered', {
  userId: '123',
  email: 'user@example.com',
  provider: 'email'
});

logger.info('Order completed', {
  orderId: '456',
  amount: 149.99,
  paymentMethod: 'card'
});
```

#### 🌐 `http` - Requêtes HTTP
Logs de requêtes (automatique avec le middleware).

```typescript
logger.http('Request completed', {
  method: 'POST',
  path: '/api/users',
  statusCode: 201,
  durationMs: 145
});
```

#### 🔍 `debug` - Détails de débogage
Informations utiles pour le développement.

```typescript
logger.debug('Cache hit', {
  key: 'user:123',
  ttl: 3600
});

logger.debug('Query executed', {
  sql: 'SELECT * FROM users WHERE id = $1',
  params: [123],
  durationMs: 12
});
```

---

## Contexte de corrélation

### Qu'est-ce qu'un correlationId ?

Un `correlationId` est un identifiant unique (UUID) généré pour chaque requête HTTP. Il permet de **retracer tout le flux d'exécution** d'une requête à travers tous les logs.

### Propagation automatique

Le `loggingMiddleware` :
1. Lit le header `x-correlation-id` (si fourni par un client ou un reverse proxy)
2. Sinon, génère un nouvel UUID
3. Stocke ce correlationId dans AsyncLocalStorage
4. Injecte un logger contextualisé dans tous les handlers
5. Ajoute le header `x-correlation-id` dans la réponse

### Exemple de flux

```
Client Request → [correlationId: abc-123]
  ↓
  Middleware logging → Log: "Request started" (correlationId: abc-123)
  ↓
  Auth middleware → Log: "User authenticated" (correlationId: abc-123)
  ↓
  Handler → Log: "Processing data" (correlationId: abc-123)
  ↓
  DB call → Log: "Query executed" (correlationId: abc-123)
  ↓
  Email service → Log: "Email sent" (correlationId: abc-123)
  ↓
  Response → Header: x-correlation-id: abc-123
```

Tous les logs ont le même `correlationId`, permettant de filtrer facilement :

```bash
# Dans vos logs JSON (production)
cat app-2024-01-15.log | grep "abc-123"
```

### Utilisation manuelle

```typescript
import { v4 as uuidv4 } from 'uuid';
import { runWithContext, withMeta } from '@/lib/logger';

// Background job sans requête HTTP
export async function sendNewsletterJob() {
  const correlationId = uuidv4();
  const jobLogger = withMeta({ correlationId, jobType: 'newsletter' });
  
  jobLogger.info('Newsletter job started');
  
  runWithContext({ correlationId }, async () => {
    await processRecipients();
    // Toutes les fonctions appelées auront accès au correlationId
  });
  
  jobLogger.info('Newsletter job completed');
}
```

---

## Redaction de données sensibles

Le système redacte **automatiquement** les champs sensibles dans les logs.

### Champs redactés par défaut

```typescript
const SENSITIVE_KEYS = [
  'password',
  'pass',
  'token',
  'authorization',
  'auth',
  'secret',
  'apikey',
  'apiKey',
  'api_key',
  'bearer',
  'creditcard',
  'ssn',
];
```

### Exemples

```typescript
// ❌ Sans redaction (DANGEREUX)
logger.info('User login', {
  email: 'user@example.com',
  password: 'mySecretPassword123' // EXPOSÉ !
});

// ✅ Avec redaction automatique
logger.info('User login', {
  email: 'user@example.com',
  password: 'mySecretPassword123'
});
// Log effectif: { email: 'user@example.com', password: '[REDACTED]' }
```

### Ajouter des clés personnalisées

Modifiez `src/lib/logger/logger.ts` :

```typescript
const SENSITIVE_KEYS = [
  // ... clés existantes
  'pin',
  'cvv',
  'cardNumber',
  'iban',
];
```

### Redaction dans les objets imbriqués

```typescript
logger.info('Payment processed', {
  orderId: '123',
  user: {
    id: '456',
    email: 'user@example.com'
  },
  payment: {
    method: 'card',
    token: 'tok_abc123', // Sera redacté
    last4: '4242'
  }
});
// Log: payment.token sera '[REDACTED]'
```

---

## Rotation des fichiers

### Configuration par défaut (production)

En production (`NODE_ENV=production`), les logs sont automatiquement écrits dans des fichiers avec rotation quotidienne :

```
logs/
├── app-2024-01-15.log          # Tous les logs (niveau info+)
├── app-2024-01-14.log.gz       # Archives compressées
├── error-2024-01-15.log        # Uniquement les erreurs
└── error-2024-01-14.log.gz
```

### Politiques de rétention

| Type | Taille max | Durée | Compression |
|------|-----------|-------|-------------|
| **app-*.log** | 20 MB | 14 jours | Oui (gzip) |
| **error-*.log** | 20 MB | 30 jours | Oui (gzip) |

### Désactiver la rotation

Si vous utilisez un système externe (Datadog, ELK, Loki...), la rotation de fichiers n'est pas nécessaire. Commentez les transports `DailyRotateFile` dans `src/lib/logger/logger.ts` :

```typescript
// Commentez ces lignes
// if (isProd) {
//   baseTransports.push(
//     new DailyRotateFile({ ... }),
//     new DailyRotateFile({ ... }),
//   );
// }
```

### Personnaliser la rotation

```typescript
new DailyRotateFile({
  dirname: logDir,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '50m',        // Taille max avant rotation
  maxFiles: '30d',       // Rétention de 30 jours
  level: 'info',
})
```

---

## Bonnes pratiques

### ✅ DO

1. **Utilisez le bon niveau de log**
   ```typescript
   logger.info('User action'); // ✅
   logger.debug('Variable value:', { x }); // ✅
   logger.error('Critical error', error); // ✅
   ```

2. **Passez des objets structurés**
   ```typescript
   logger.info('Order created', { orderId, amount, userId }); // ✅
   ```

3. **Incluez le contexte pertinent**
   ```typescript
   logger.error('Payment failed', {
     orderId: '123',
     amount: 99.99,
     provider: 'stripe',
     error: err.message,
     stack: err.stack
   }); // ✅
   ```

4. **Utilisez le middleware dans les server functions**
   ```typescript
   .middleware([loggingMiddleware, authMiddleware]) // ✅
   ```

5. **Loggez les actions métier importantes**
   ```typescript
   logger.info('User registered', { userId, email }); // ✅
   logger.info('Password changed', { userId }); // ✅
   logger.info('Article published', { articleId, authorId }); // ✅
   ```

### ❌ DON'T

1. **Ne loggez pas dans des boucles serrées**
   ```typescript
   for (let i = 0; i < 10000; i++) {
     logger.debug('Processing item', { i }); // ❌ TROP de logs
   }
   
   // Préférez un log agrégé
   logger.info('Processed items', { count: 10000 }); // ✅
   ```

2. **Ne concaténez pas de strings complexes**
   ```typescript
   logger.info(`User ${userId} created order ${orderId}`); // ❌
   logger.info('Order created', { userId, orderId }); // ✅ Structuré
   ```

3. **Ne loggez pas de données sensibles manuellement**
   ```typescript
   logger.info('Login attempt', { password: 'xxx' }); // ❌ Toujours risqué
   // Laissez la redaction automatique gérer
   ```

4. **N'utilisez pas `console.log` directement**
   ```typescript
   console.log('Something happened'); // ❌ Pas structuré, pas de contexte
   logger.info('Something happened'); // ✅
   ```

5. **N'oubliez pas le middleware**
   ```typescript
   export const myFn = createServerFn()
     .handler(async () => {
       logger.info('No context here'); // ❌ Pas de correlationId
     });
   
   export const myFn = createServerFn()
     .middleware([loggingMiddleware])
     .handler(async ({ context }) => {
       context.logger.info('Has context'); // ✅
     });
   ```

---

## Exemples concrets

### Exemple 1 : Server function complète

```typescript
import { createServerFn } from '@tanstack/react-start';
import { loggingMiddleware, getContextLogger } from '@/lib/logger';
import { authMiddleware } from '@/features/auth/lib/auth-middleware';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  content: z.string(),
});

export const createPostServerFn = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .validator(schema.parse)
  .handler(async ({ context, data }) => {
    if (!context.isAuthenticated) {
      context.logger.warn('Unauthorized post creation attempt');
      throw new Error('Unauthorized');
    }
    
    context.logger.info('Creating post', {
      userId: context.user.id,
      titleLength: data.title.length,
      contentLength: data.content.length,
    });
    
    try {
      const post = await db.post.create({
        data: {
          ...data,
          authorId: context.user.id,
        },
      });
      
      context.logger.info('Post created successfully', {
        postId: post.id,
        userId: context.user.id,
      });
      
      return { success: true, postId: post.id };
    } catch (error) {
      context.logger.error('Failed to create post', {
        userId: context.user.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  });
```

### Exemple 2 : Service avec contexte

```typescript
import { getContextLogger, withMeta } from '@/lib/logger';
import { sendEmail } from './email-service';

export class NotificationService {
  private logger = getContextLogger();
  
  async notifyUser(userId: string, type: string, data: any) {
    const notifLogger = withMeta({ userId, notificationType: type });
    
    notifLogger.info('Sending notification');
    
    try {
      await sendEmail({
        to: data.email,
        subject: data.subject,
        html: data.html,
      });
      
      notifLogger.info('Notification sent successfully');
    } catch (error) {
      notifLogger.error('Failed to send notification', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
```

### Exemple 3 : Background job

```typescript
import { v4 as uuidv4 } from 'uuid';
import { runWithContext, withMeta } from '@/lib/logger';

export async function cleanupExpiredSessionsJob() {
  const correlationId = uuidv4();
  const jobLogger = withMeta({ 
    correlationId, 
    jobType: 'cleanup-sessions',
    jobId: `cleanup-${Date.now()}`
  });
  
  jobLogger.info('Job started');
  
  return runWithContext({ correlationId }, async () => {
    try {
      const result = await db.session.deleteMany({
        where: { expiresAt: { lt: new Date() } }
      });
      
      jobLogger.info('Job completed', { 
        deletedCount: result.count,
        durationMs: Date.now() - startTime
      });
      
      return result;
    } catch (error) {
      jobLogger.error('Job failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  });
}
```

### Exemple 4 : Hooks better-auth

Déjà intégré dans `src/features/auth/lib/auth.ts` :

```typescript
import { logger } from '@/lib/logger';

export const auth = betterAuth({
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        logger.info('User signed up', {
          userId: ctx.context.newSession?.user?.id,
          email: ctx.context.newSession?.user?.email,
          provider: 'email',
        });
      }
      
      if (ctx.path?.startsWith('/callback/')) {
        logger.info('OAuth callback', {
          provider: ctx.path.split('/')[2],
          userId: ctx.context.newSession?.user?.id,
        });
      }
    }),
  },
});
```

---

## Formats de sortie

### Développement (lisible)

```
2024-01-15 14:32:15.123 [info] User registered {"userId":"123","email":"user@example.com"}
2024-01-15 14:32:15.456 [warn] Rate limit approaching {"current":95,"limit":100}
2024-01-15 14:32:15.789 [error] Payment failed {"orderId":"456","error":"Card declined"}
```

### Production (JSON structuré)

```json
{
  "timestamp": "2024-01-15T14:32:15.123Z",
  "level": "info",
  "message": "User registered",
  "service": "parlons-violence",
  "env": "production",
  "hostname": "app-server-01",
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "userId": "123",
  "metadata": {
    "email": "user@example.com"
  }
}
```

Ce format JSON est idéal pour l'ingestion par des systèmes d'agrégation (ELK, Datadog, Loki, CloudWatch, etc.).

---

## Intégrations externes

### Datadog

```typescript
// À ajouter dans logger.ts
import { datadog } from 'winston-datadog';

baseTransports.push(
  new datadog({
    apiKey: env.DATADOG_API_KEY,
    hostname: os.hostname(),
    service: serviceName,
    ddsource: 'nodejs',
    ddtags: `env:${env.NODE_ENV}`,
  })
);
```

### Logstash (ELK)

```typescript
import { LogstashTransport } from 'winston-logstash-transport';

baseTransports.push(
  new LogstashTransport({
    host: env.LOGSTASH_HOST,
    port: env.LOGSTASH_PORT,
  })
);
```

### Loki (Grafana)

```typescript
import LokiTransport from 'winston-loki';

baseTransports.push(
  new LokiTransport({
    host: env.LOKI_HOST,
    labels: { app: serviceName },
    json: true,
  })
);
```

---

## Troubleshooting

### Les logs ne s'affichent pas

1. Vérifiez le niveau de log : `LOG_LEVEL=debug`
2. En test, les logs sont désactivés par défaut (voir `logger.silent`)
3. Vérifiez que vous n'êtes pas en dessous du niveau configuré

### Les fichiers de logs ne sont pas créés

1. Vérifiez que `NODE_ENV=production`
2. Vérifiez les permissions du répertoire `LOG_DIR`
3. Vérifiez que les transports `DailyRotateFile` ne sont pas commentés

### Le correlationId n'apparaît pas

1. Vérifiez que vous utilisez `loggingMiddleware`
2. Utilisez `context.logger` au lieu de `logger` directement
3. Ou utilisez `getContextLogger()` dans les fonctions utilitaires

### Performances dégradées

1. Réduisez le niveau de log en production : `LOG_LEVEL=info`
2. Évitez de logger dans des boucles serrées
3. Utilisez des logs agrégés plutôt que détaillés

---

## Ressources

- [Winston Documentation](https://github.com/winstonjs/winston)
- [TanStack Start Middleware](https://tanstack.com/start/latest/docs/framework/react/middleware)
- [AsyncLocalStorage Node.js](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
- [Structured Logging Best Practices](https://betterstack.com/community/guides/logging/log-formatting/)

---

**Maintenu par l'équipe Parlons Violence** 🚀
