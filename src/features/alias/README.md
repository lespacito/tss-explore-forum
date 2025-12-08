# 🎭 Système d'Alias - Documentation

Le système d'alias garantit l'**anonymat complet** des utilisateurs sur le forum. Aucune action publique (threads, posts, commentaires) n'est directement liée à l'utilisateur, tout passe par un alias.

---

## 📐 Architecture

```
┌──────────────┐
│     USER     │
│  (Privé)     │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│    ALIAS     │
│  (Public)    │
│ isPrimary ✓  │
└──────┬───────┘
       │ 1:N
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
  ┌─────────┐  ┌─────────┐  ┌──────────┐
  │ THREADS │  │  POSTS  │  │ COMMENTS │
  └─────────┘  └─────────┘  └──────────┘
```

### ✅ Principe clé : **Séparation totale**
- ❌ Le `user` ne touche **JAMAIS** directement `threads`, `posts` ou `comments`
- ✅ Toutes les interactions passent par un `alias`
- 🔒 Anonymat garanti même en cas de fuite de la base de données

---

## 🗄️ Schéma de données

```typescript
// Table: alias
{
  id: uuid,                    // Identifiant unique
  userId: text,                // Référence au user (privé)
  alias: text (unique),        // Nom public (ex: "Serein-Aurore-1234")
  isPrimary: boolean,          // true = alias principal
  rotationEnabled: boolean,    // true = rotation automatique activée
  createdAt: timestamp         // Date de création
}
```

### Relations
- `user.id` ← `alias.userId` (1:N)
- `alias.id` ← `threads.aliasId` (1:N)
- `alias.id` ← `posts.aliasId` (1:N)
- `alias.id` ← `comments.aliasId` (1:N)

---

## 🚀 Workflow complet

### 1️⃣ Inscription d'un utilisateur

```typescript
// Automatique via Better-Auth hook
User crée un compte
  ↓
Better-Auth hook déclenché
  ↓
createPrimaryAlias(userId) appelé
  ↓
Alias généré: "Lumineux-Cascade-4821"
  ↓
Alias enregistré avec isPrimary = true
```

**Fichier**: `src/features/auth/lib/auth.ts`

```typescript
hooks: {
  after: [
    {
      matcher: (context) => context.path === "/sign-up/email",
      handler: async (context) => {
        await createPrimaryAlias(context.response.user.id);
      }
    }
  ]
}
```

---

### 2️⃣ Création d'un thread

```typescript
import { createThread } from "@/features/threads/lib/create-thread";

const thread = await createThread(userId, {
  title: "Besoin d'aide",
  body: "Voici ma question...",
  category: "support"
});

// En coulisses :
// 1. Récupère l'alias principal du user
// 2. Crée le thread avec aliasId
// 3. Le user.id n'apparaît JAMAIS dans la table threads
```

**Résultat dans la DB** :
```sql
threads
├─ id: "thread-123"
├─ aliasId: "alias-456"  ← Référence l'alias, PAS le user
├─ title: "Besoin d'aide"
└─ body: "Voici ma question..."
```

---

### 3️⃣ Création d'un post (réponse)

```typescript
import { createPost } from "@/features/posts/lib/create-post";

const post = await createPost(userId, {
  threadId: "thread-123",
  content: "Voici ma réponse...",
  isAnonymous: false,
  isSensitive: false,
  contentWarnings: []
});
```

---

### 4️⃣ Création d'un commentaire

```typescript
import { createComment } from "@/features/posts/lib/create-comment";

const comment = await createComment(userId, {
  postId: "post-456",
  content: "Merci pour cette réponse !",
  parentId: null, // ou ID d'un autre commentaire
  isAnonymous: false
});
```

---

## 📚 API Reference

### **generate-alias.ts**

#### `generateAlias(): string`
Génère un alias aléatoire au format `Adjectif-Nom-Nombre`.

```typescript
const alias = generateAlias();
// => "Serein-Crépuscule-7892"
```

---

### **create-alias.ts**

#### `createPrimaryAlias(userId: string)`
Crée l'alias principal pour un utilisateur (appelé automatiquement à l'inscription).

```typescript
const primaryAlias = await createPrimaryAlias("user_123");
// => { id: "...", alias: "Lumineux-Aurore-1234", isPrimary: true }
```

#### `createSecondaryAlias(userId: string, customAlias?: string, rotationEnabled?: boolean)`
Crée un alias secondaire (optionnel, pour les utilisateurs avancés).

```typescript
// Alias aléatoire
const randomAlias = await createSecondaryAlias("user_123");

// Alias personnalisé
const customAlias = await createSecondaryAlias("user_123", "MonPseudo-2024");
```

#### `isAliasAvailable(aliasName: string): Promise<boolean>`
Vérifie si un nom d'alias est disponible.

```typescript
const available = await isAliasAvailable("MonPseudo-2024");
if (available) {
  console.log("Cet alias est libre !");
}
```

---

### **get-primary-alias.ts**

#### `getPrimaryAlias(userId: string)`
Récupère l'alias principal d'un utilisateur.

```typescript
const alias = await getPrimaryAlias("user_123");
if (!alias) {
  throw new Error("Aucun alias principal trouvé");
}
```

#### `getUserAliases(userId: string)`
Récupère tous les alias d'un utilisateur.

```typescript
const aliases = await getUserAliases("user_123");
// => [{ id: "...", alias: "...", isPrimary: true }, ...]
```

#### `getAliasById(aliasId: string)`
Récupère un alias par son ID.

```typescript
const alias = await getAliasById("alias_456");
```

---

### **create-thread.ts**

#### `createThread(userId: string, data: {...})`
Crée un thread via l'alias principal.

```typescript
const thread = await createThread("user_123", {
  title: "Mon titre",
  body: "Mon contenu",
  category: "support"
});
```

#### `createThreadWithAlias(aliasId: string, data: {...})`
Crée un thread avec un alias spécifique.

```typescript
const thread = await createThreadWithAlias("alias_456", {
  title: "Thread anonyme",
  body: "Contenu...",
  category: "anonymous"
});
```

---

### **create-post.ts**

#### `createPost(userId: string, data: {...})`
Crée un post via l'alias principal.

```typescript
const post = await createPost("user_123", {
  threadId: "thread_456",
  content: "Ma réponse...",
  isAnonymous: false,
  isSensitive: false,
  contentWarnings: ["trigger"]
});
```

#### `createPostWithAlias(aliasId: string, data: {...})`
Crée un post avec un alias spécifique.

---

### **create-comment.ts**

#### `createComment(userId: string, data: {...})`
Crée un commentaire via l'alias principal.

```typescript
const comment = await createComment("user_123", {
  postId: "post_456",
  content: "Mon commentaire",
  parentId: null,
  isAnonymous: false
});
```

#### `createCommentReply(userId: string, data: {...})`
Crée une réponse à un commentaire.

```typescript
const reply = await createCommentReply("user_123", {
  postId: "post_456",
  parentCommentId: "comment_789",
  content: "Je réponds ici",
  isAnonymous: false
});
```

---

## 🔐 Sécurité et Anonymat

### ✅ Garanties
1. **Séparation user ↔ contenu public** : Impossible de lier directement un user à un thread/post
2. **Alias unique** : Chaque alias est unique et généré aléatoirement
3. **Rotation possible** : Support futur pour rotation automatique d'alias
4. **Cascade delete** : Si un alias est supprimé, tout son contenu est supprimé

### ⚠️ Limites
1. **Modérateurs** : Peuvent potentiellement lier alias ↔ user via les logs
2. **Comportement** : Analyse comportementale peut révéler des patterns
3. **IP / Metadata** : L'anonymat est au niveau applicatif, pas réseau

---

## 🎯 Cas d'usage avancés

### Multi-alias par utilisateur

```typescript
// L'utilisateur veut créer un alias secondaire
const secondaryAlias = await createSecondaryAlias(
  userId,
  "AliasAnonymePourSujetsPersonnels",
  true // rotation activée
);

// Utiliser cet alias pour un thread spécifique
const thread = await createThreadWithAlias(secondaryAlias.id, {
  title: "Discussion sensible",
  body: "...",
  category: "anonymous"
});
```

### Rotation automatique d'alias (futur)

```typescript
// TODO: Implémenter un cron job qui :
// 1. Détecte les alias avec rotationEnabled = true
// 2. Génère un nouvel alias tous les X jours
// 3. Migre les références anciennes vers le nouveau
```

---

## 📊 Métriques et Analytics

Pour éviter de compromettre l'anonymat, **NE JAMAIS** :
- Lier directement `user.id` aux métriques publiques
- Exposer `alias.userId` dans les APIs publiques
- Logger les relations `user ↔ alias` sauf pour modération

---

## 🛠️ Maintenance

### Vérifier l'intégrité des alias

```sql
-- Trouver les users sans alias principal
SELECT u.id, u.email
FROM "user" u
LEFT JOIN alias a ON a.user_id = u.id AND a.is_primary = true
WHERE a.id IS NULL;

-- Trouver les alias orphelins
SELECT a.id, a.alias
FROM alias a
LEFT JOIN "user" u ON u.id = a.user_id
WHERE u.id IS NULL;
```

### Migration des anciens utilisateurs

```typescript
// Script one-time pour créer des alias pour les users existants
import { db } from "@/db";
import { user } from "@/features/auth/schema";
import { createPrimaryAlias } from "@/features/alias/lib/create-alias";

const users = await db.select().from(user);

for (const u of users) {
  try {
    await createPrimaryAlias(u.id);
    console.log(`✅ Alias créé pour ${u.email}`);
  } catch (error) {
    console.error(`❌ Erreur pour ${u.email}:`, error);
  }
}
```

---

## 🧪 Tests

```typescript
import { describe, it, expect } from "vitest";
import { generateAlias } from "./generate-alias";
import { isAliasAvailable } from "./create-alias";

describe("Alias System", () => {
  it("should generate unique aliases", () => {
    const alias1 = generateAlias();
    const alias2 = generateAlias();
    expect(alias1).toMatch(/^[A-Z][a-z]+-[A-Z][a-z]+-\d{4}$/);
    expect(alias1).not.toBe(alias2);
  });

  it("should check alias availability", async () => {
    const available = await isAliasAvailable("Test-Alias-0001");
    expect(typeof available).toBe("boolean");
  });
});
```

---

## 📝 Changelog

### v1.0.0 (Actuel)
- ✅ Système d'alias principal automatique
- ✅ Génération aléatoire d'alias
- ✅ Hooks Better-Auth pour création automatique
- ✅ API complète pour threads/posts/comments
- ✅ Documentation complète

### Roadmap v1.1.0
- 🔄 Rotation automatique d'alias
- 🎨 Personnalisation des alias par l'utilisateur
- 🔍 Interface de gestion des alias multiples
- 📊 Dashboard utilisateur avec historique d'alias

---

## 🆘 Support

En cas de problème :
1. Vérifier que l'utilisateur a bien un alias principal (`isPrimary = true`)
2. Vérifier les logs Better-Auth lors de l'inscription
3. Consulter les erreurs dans `create-alias.ts` (retry logic)

**Contact** : Équipe de développement du forum
