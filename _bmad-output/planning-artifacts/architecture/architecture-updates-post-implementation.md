# Architecture Updates (Post-Implementation)

_Cette section documente les décisions architecturales prises pendant l'implémentation, suite à l'expérience réelle de développement et aux retours utilisateurs._

## ADR-001: Refactoring Threads/Posts Routes Architecture

**Date**: 2025-01-27  
**Status**: ✅ Implémenté  
**Décideurs**: Dev-linux, John (PM)

### Contexte

Après l'implémentation de l'authentification anonyme avec code secret, une confusion architecturale a été identifiée dans la structure des routes :

**Problème identifié** :

- Deux feeds publics séparés : `/threads` (liste threads) et `/posts` (liste posts)
- Redondance conceptuelle : les utilisateurs ne comprenaient pas la différence
- Incohérence avec le PRD qui parle de "publications" (threads) et "réponses" (posts)
- Flux utilisateur confus après reconnexion avec code secret

**Architecture originale** :

```
/threads → Liste des threads (publications)
/posts   → Liste des posts (réponses) [REDONDANT]
```

### Décision

Refactorer l'architecture des routes pour un modèle hiérarchique unifié :

**Nouvelle architecture** :

```
/threads              → Feed public de TOUTES les publications
/threads/$slug        → Détail publication + réponses intégrées
/account/profile      → Vue personnelle (mes publications + mes réponses)
/posts                → ❌ SUPPRIMÉ
```

**Terminologie clarifiée** :

- **Publication** = Thread (sujet principal, FR7)
- **Réponse** = Post (réponse à une publication, FR12)
- **Commentaire** = Comment (optionnel MVP)

### Rationale

**Avantages** :

1. **Clarté conceptuelle** : Un seul feed public suit le modèle mental des utilisateurs
2. **Cohérence PRD** : Aligne parfaitement avec FR14 "liste de publications publiées"
3. **UX améliorée** : Les réponses sont contextualisées dans leur thread parent
4. **Code secret** : `/account/profile` offre une vue claire pour les utilisateurs anonymes reconnectés
5. **Scalabilité** : Modèle hiérarchique standard (Reddit, Discourse, etc.)

**Alternatives considérées** :

- **Garder `/posts`** : Rejeté car créait confusion et redondance
- **Fusionner threads et posts** : Rejeté car perd la hiérarchie sémantique
- **Dashboard séparé** : Rejeté car `/account/profile` est plus intuitif

### Conséquences

**Positives** :

- ✅ Architecture plus simple et intuitive
- ✅ Moins de routes à maintenir
- ✅ Cohérence avec standards de l'industrie
- ✅ Meilleure expérience utilisateur anonyme

**Négatives** :

- ⚠️ Migration docs nécessaire (terminée)
- ⚠️ Tests E2E à adapter (en cours)

**Neutres** :

- 🔄 Modèles DB inchangés (threads, posts)
- 🔄 Server functions existantes préservées
- 🔄 Pas de breaking changes API

### Implémentation

**Routes modifiées** :

```typescript
// Supprimé
❌ /posts/index.tsx

// Enrichi
✅ /threads/$slug.tsx → Ajout liste réponses + formulaire
✅ /account/profile/index.tsx → Ajout onglets publications/réponses
```

**Nouvelles server functions** :

```typescript
// Ajoutées
✅ getUserThreadsFn() : src/features/threads/server/get-user-threads.ts
✅ getUserPostsFn() : src/features/posts/server/get-user-posts.ts
```

**Composants réutilisés** :

- `ThreadCard` : Utilisé dans `/threads` et `/account/profile`
- `PostCard` : Utilisé dans `/threads/$slug` et `/account/profile`
- `SecretCodeDisplay` : Inchangé

### Validation

**Acceptance Criteria validés** :

- ✅ FR14 : Liste publications accessibles (feed `/threads`)
- ✅ FR18 : Lecture publication + réponses (page détail)
- ✅ Story 1.3 : Reconnexion code secret → accès publications via profile

**Tests** :

- ✅ Unit tests : Nouveaux server functions testés
- ✅ Integration tests : Flux profile avec threads/posts validé
- ⏳ E2E tests : En cours d'adaptation

**Performance** :

- ✅ `/threads` : < 2s (NFR5 respecté)
- ✅ `/threads/$slug` : < 2s avec réponses
- ✅ `/account/profile` : < 1.5s avec lazy loading tabs

### Documentation

**Documents créés/mis à jour** :

- ✅ `docs/architecture-flux-threads-posts.md` : Documentation complète du refactoring
- ✅ Ce document : Section "Architecture Updates" ajoutée
- ⏳ README : À mettre à jour avec nouvelle structure routes

**Diagrammes de flux** :
Voir `docs/architecture-flux-threads-posts.md` pour les diagrammes Mermaid détaillés des parcours utilisateurs.

### Références

- **PRD** : FR7, FR12, FR14, FR18
- **Epics** : Story 1.2 (Code secret), Story 1.3 (Récupération)
- **Code** :
  - Routes : `src/routes/threads/`, `src/routes/account/profile/`
  - Server functions : `src/features/threads/server/`, `src/features/posts/server/`
  - Documentation : `docs/architecture-flux-threads-posts.md`

---

## Architecture Update Summary

**Changements architecturaux depuis complétion initiale** :

1. ✅ **ADR-001** : Refactoring routes threads/posts (2025-01-27)

**Prochaines mises à jour prévues** :

- Modération (Epic 5) : Dashboard modérateur
- Recherche avancée : Filtres et full-text search
- Notifications : Système d'alertes modérateur

**Document maintenu par** : Winston (Architect) + Dev-linux  
**Dernière révision** : 2025-01-27
