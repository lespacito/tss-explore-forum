# Guide d'utilisation du Logger

## 📋 Vue d'ensemble

Ce projet utilise **deux systèmes de logging différents** selon l'environnement :

- **Côté Client (Browser)** : Logger console simple et léger
- **Côté Serveur (Node.js)** : Winston avec logs structurés, rotation de fichiers, etc.

## 🖥️ Utilisation Côté Client

Pour les composants React, hooks, et tout code qui s'exécute dans le navigateur :

```typescript
import { logger } from "@/lib/logger";

export function MyComponent() {
  const handleClick = () => {
    logger.info("Bouton cliqué");
    logger.error("Une erreur est survenue", error);
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Méthodes disponibles côté client

```typescript
logger.debug("Message de debug");    // Visible uniquement en dev
logger.info("Information");          // Toujours visible
logger.warn("Avertissement");        // Toujours visible
logger.error("Erreur", error);       // Toujours visible
```

## 🔧 Utilisation Côté Serveur

Pour les server functions, API routes, middlewares, et jobs backend :

```typescript
import { logger } from "@/lib/logger/server";

export const myServerFn = createServerFn({ method: "POST" })
  .handler(async ({ request }) => {
    logger.info("Requête reçue", { 
      method: request.method,
      url: request.url 
    });

    try {
      const result = await processData();
      logger.info("Traitement réussi", { resultId: result.id });
      return result;
    } catch (error) {
      logger.error("Échec du traitement", { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  });
```

### Méthodes avancées côté serveur

#### Logger avec contexte (`withMeta`)

Créer un logger avec des métadonnées par défaut :

```typescript
import { withMeta } from "@/lib/logger/server";

export async function processEmailJob(jobId: string) {
  const jobLogger = withMeta({ 
    jobId, 
    jobType: "email-batch" 
  });

  jobLogger.info("Job démarré");
  jobLogger.info("Emails envoyés", { count: 150 });
  jobLogger.info("Job terminé");
  
  // Tous les logs incluent automatiquement jobId et jobType
}
```

#### Helper d'erreur (`logError`)

Pour logger des erreurs avec contexte enrichi :

```typescript
import { logError } from "@/lib/logger/server";

try {
  await dangerousOperation();
} catch (error) {
  logError("Operation échouée", error, {
    userId: user.id,
    operation: "payment",
    amount: 100
  });
}
```

#### Middleware de logging

Pour les server functions avec correlation IDs automatiques :

```typescript
import { createServerFn } from "@tanstack/react-start";
import { loggingMiddleware, getContextLogger } from "@/lib/logger/server";

export const myServerFn = createServerFn({ method: "POST" })
  .middleware([loggingMiddleware])
  .handler(async ({ context }) => {
    // context.logger inclut automatiquement un correlationId
    context.logger.info("Traitement de la requête");
    
    // Utiliser le logger contextuel dans les fonctions appelées
    await processData();
    
    return { success: true };
  });

// Dans une fonction utilitaire
async function processData() {
  const logger = getContextLogger();
  logger.info("Processing data");
}
```

## ⚠️ Règles Importantes

### ❌ À NE JAMAIS FAIRE

```typescript
// ❌ N'IMPORTEZ JAMAIS le logger serveur côté client !
import { logger } from "@/lib/logger/server"; // ERREUR : Winston ne fonctionne pas dans le navigateur
```

### ✅ À FAIRE

```typescript
// ✅ Côté client : utiliser @/lib/logger
import { logger } from "@/lib/logger";

// ✅ Côté serveur : utiliser @/lib/logger/server
import { logger } from "@/lib/logger/server";
```

## 🎯 Exemples Pratiques

### Composant avec gestion d'erreur

```typescript
// src/components/UserProfile.tsx
import { logger } from "@/lib/logger";

export function UserProfile() {
  const handleSave = async () => {
    try {
      logger.info("Sauvegarde du profil");
      await saveProfile();
      logger.info("Profil sauvegardé avec succès");
    } catch (error) {
      logger.error("Échec de la sauvegarde", error);
      toast.error("Impossible de sauvegarder");
    }
  };

  return <button onClick={handleSave}>Sauvegarder</button>;
}
```

### Server Function avec logging enrichi

```typescript
// src/features/posts/server/create-post.ts
import { createServerFn } from "@tanstack/react-start";
import { loggingMiddleware } from "@/lib/logger/server";
import { authMiddleware } from "@/features/auth/lib/auth-middleware";

export const createPostFn = createServerFn({ method: "POST" })
  .middleware([loggingMiddleware, authMiddleware])
  .handler(async ({ context, data }) => {
    // Logger avec correlationId + userId automatique
    context.logger.info("Création d'un post", {
      title: data.title,
      contentLength: data.content.length
    });

    const post = await db.insert(posts).values({
      ...data,
      authorId: context.user.id
    });

    context.logger.info("Post créé", { postId: post.id });

    return post;
  });
```

### Background Job avec contexte

```typescript
// src/jobs/cleanup-sessions.ts
import { v4 as uuidv4 } from "uuid";
import { runWithContext, withMeta } from "@/lib/logger/server";

export async function cleanupSessionsJob() {
  const correlationId = uuidv4();
  const jobLogger = withMeta({ 
    correlationId,
    jobType: "cleanup-sessions"
  });

  jobLogger.info("Job démarré");

  runWithContext({ correlationId }, async () => {
    const deleted = await deleteExpiredSessions();
    jobLogger.info("Sessions nettoyées", { count: deleted });
  });

  jobLogger.info("Job terminé");
}
```

## 📊 Format des Logs

### Développement (console colorée)

```
2024-01-15 10:30:45.123 [INFO] User logged in { userId: '123', email: 'user@example.com' }
2024-01-15 10:30:46.456 [ERROR] Payment failed { error: 'Insufficient funds', amount: 100 }
```

### Production (JSON structuré)

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "service": "parlons-violence",
  "env": "production",
  "hostname": "app-server-01",
  "metadata": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

## 🔒 Sécurité

Les données sensibles sont automatiquement masquées :

```typescript
logger.info("User created", {
  email: "user@example.com",
  password: "secret123",      // ← Sera remplacé par [REDACTED]
  apiKey: "sk-123456",         // ← Sera remplacé par [REDACTED]
  token: "jwt-token"           // ← Sera remplacé par [REDACTED]
});

// Output:
// { email: "user@example.com", password: "[REDACTED]", apiKey: "[REDACTED]", token: "[REDACTED]" }
```

## 🔧 Configuration

Variables d'environnement (serveur uniquement) :

```env
NODE_ENV=production          # dev | production | test
LOG_LEVEL=info              # debug | info | warn | error
LOG_DIR=/var/log/app        # Répertoire des logs (prod)
SERVICE_NAME=parlons-violence
```

## 📚 Ressources

- [Documentation Winston](https://github.com/winstonjs/winston)
- [AsyncLocalStorage](https://nodejs.org/api/async_context.html)
- [TanStack Start Middleware](https://tanstack.com/router/latest/docs/framework/react/guide/middleware)
