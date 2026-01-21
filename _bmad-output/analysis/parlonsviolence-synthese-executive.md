# ParlonsViolence - Synthèse Exécutive MVP

**Date:** 2026-01-06  
**Développeur:** Dev-linux (Solo, Temps Plein)  
**Horizon MVP:** 6 semaines (3 sprints × 2 semaines)  
**Document Source:** [Brainstorming Session Complète](./brainstorming-session-2026-01-06.md)

---

## 🎯 Vision Produit

**ParlonsViolence** est un forum de soutien anonyme et modéré dédié aux sujets sensibles (violence, abus, harcèlement, détresse psychologique).

### Principes Fondamentaux

- **Anonymat par défaut** - Protection maximale des utilisateurs
- **Sécurité avant commodité** - Pas de compromis sur la sécurité
- **Modération trauma-informed** - Empathie + protection collective
- **UX calme et empathique** - Design rassurant, non-agressif
- **Mobile-first** - Accessibilité maximale

### Utilisateurs Cibles (Personas Validées)

**Marie (Victime en crise)**
- État: Crise émotionnelle, 2h du matin, besoin urgent de parler
- Besoins: Post immédiat sans friction, anonymat absolu, espace gardé
- Peurs: Être retrouvée par abuseur, laisser traces, personnes malveillantes

**Thomas (Témoin hésitant)**
- État: Réflexion calme, doute sur légitimité, veut aider collègue
- Besoins: Validation qu'il a sa place, conseils pratiques, protéger autrui
- Peurs: Se tromper sur symptômes, attirer problèmes à la personne

---

## 📊 Résultats Session Brainstorming

### Méthodes Utilisées

1. **Role Playing** - Incarnation Marie & Thomas → 20 idées empathiques
2. **SCAMPER** - 7 lentilles créatives → 11 optimisations
3. **Constraint Mapping** - Analyse faisabilité → Priorisation

**Total: 31 idées générées et priorisées**

---

## 🚀 Roadmap MVP - 3 Sprints (6 Semaines)

### Sprint 1 (Semaines 1-2): FONDATIONS CORE

**Objectif:** Utilisateurs peuvent poster avec catégories + sécurité de base

**Features:**
1. ✅ Système de catégories visibles (5 catégories)
2. ✅ Templates guidés par catégorie
3. ✅ Landing page avec 3 chemins différenciés
4. ✅ Messages ultra-courts + bouton urgence 2x gros
5. ✅ Décisions: PAS de compteurs/profils publics/recherche users

**Effort:** ~10-12 jours dev  
**Livrable:** MVP utilisable pour Marie et Thomas

---

### Sprint 2 (Semaines 3-4): MODÉRATION + SÉCURITÉ

**Objectif:** Espace sûr et modéré

**Features:**
6. ✅ Pré-modération (état vérification + dashboard admin)
7. ✅ Boutons signalement posts/réponses
8. ✅ Architecture hybride Niveau 1+2 (Session rapide + Code secret)
9. ✅ Floutage + avertissements spécifiques (4-5 types)

**Effort:** ~13-16 jours dev  
**Livrable:** Plateforme sécurisée et modérée

---

### Sprint 3 (Semaines 5-6): RAFFINEMENT UX

**Objectif:** Expérience optimale + features différenciantes

**Features:**
10. ✅ Bibliothèque de témoignages (lecture thérapeutique)
11. ✅ Catégories → suggestion sécurité renforcée
12. ✅ Conversion progressive session → compte (opt-in)
13. ✅ Landing page immersive (optionnel)
14. ✅ Polish UX général

**Effort:** ~8-14 jours dev  
**Livrable:** MVP complet prêt pour tests utilisateurs

---

## 💎 Décisions Stratégiques Clés

### 1. Architecture "Post First, Register Later"

**Problème résolu:** Marie en crise ne peut pas passer par inscription classique

**Solution: Architecture Hybride 3 Niveaux de Sécurité**

#### Niveau 1: Session Rapide (Par défaut)
- Better Auth anonymous plugin
- Zéro friction, post immédiat
- Cookie local, un seul appareil
- **Pour:** Marie en crise

#### Niveau 2: Code Secret Simple (Upgrade opt-in)
- Code 3-mots: "lune-calme-refuge"
- Multi-appareil, pas de cookies
- Options sauvegarde: screenshot, copie, email (avec warning)
- **Pour:** Marie le lendemain, ou Thomas dès le début

#### Niveau 3: Code Renforcé (Paranoïa élevée)
- Code + Question secrète
- Sécurité maximale
- **Pour:** Utilisateurs ultra-prudents

**Implémentation Sprint 2 (Niveaux 1 + 2)**

---

### 2. Système de Catégories Visibles - PRIORITÉ #1

**Problème résolu:** Thomas ne se sent pas légitime ("pas en droit d'être ici")

**Solution: 5 Catégories Standards**

| Catégorie | Icône | Pour qui | Template |
|-----------|-------|----------|----------|
| Témoignage Victime | 🗣️ | Victimes partageant vécu | Expression libre |
| Témoignage Témoin | 👁️ | Témoins demandant conseil | Guidé (protection autrui) |
| Demande de Soutien | 🆘 | Besoin d'aide immédiat | Urgence |
| Ressources & Conseils | 💡 | Partage d'infos utiles | Structuré |
| Retour d'Expérience | 🤝 | Parcours de guérison | Inspirant |

**Bénéfices:**
- Légitimité explicite pour témoins
- Navigation claire
- Templates adaptés par catégorie
- Base pour suggestion sécurité contextuelle

**Implémentation Sprint 1**

---

### 3. Protection Privacy Radicale - Éliminations Stratégiques

**Décision:** NE PAS implémenter ces features "standard"

❌ **Pas de compteurs** (vues, likes, réponses)
- Évite comparaison/compétition
- Réduit anxiété ("Personne n'a répondu...")

❌ **Pas de profils publics** consultables
- Seulement l'utilisateur voit son espace privé
- Réduit stalking/profiling

❌ **Pas de recherche d'utilisateurs**
- On peut chercher des POSTS, jamais des PERSONNES
- Protection maximale

**Impact:**
- Moins de code = MVP plus rapide
- Différenciation forte vs autres forums
- Alignement total valeurs ParlonsViolence

**Implémentation Sprint 1 (décision de design)**

---

### 4. Modération Trauma-Informed

**Principe:** Protéger l'espace SANS policer l'expression authentique

**Règles claires:**

✅ **Expression victime = PROTÉGÉE**
- Description violence (même langage cru) → Floutée, jamais supprimée
- Pas de jugement sur ton/langage témoignage

❌ **Agression envers autrui = SUPPRIMÉE**
- Victim-blaming, minimisation, moquerie → Suppression immédiate
- Trolling, malveillance → Ban

🔒 **Transparence totale**
- Modérateurs peuvent SUPPRIMER mais JAMAIS MODIFIER
- Construit confiance via transparence

**Flow Pré-modération:**
```
User poste
    ↓
Status "pending" (invisible autres, visible auteur)
    ↓
Modérateur review admin panel
    ↓
[Approuver] → "published" | [Rejeter] → "rejected"
```

**Implémentation Sprint 2**

---

### 5. Floutage Granulaire avec Content Warnings

**Problème résolu:** Lecteurs ont triggers différents

**Solution: Avertissements Spécifiques**

```
⚠️ Ce témoignage contient :
☑️ Descriptions de violence physique
☑️ Langage explicite
☐ Mentions de suicide
☐ Violence sexuelle

[Voir le contenu] [Pourquoi ces avertissements ?]
```

**Types standard MVP (4-5):**
1. Violence physique
2. Langage explicite
3. Mentions suicide
4. Violence sexuelle

**Qui décide:** Modérateur lors review (auteur optionnel v2)

**Implémentation Sprint 2**

---

### 6. Bibliothèque de Témoignages (Innovation Clé)

**Insight:** Certains utilisateurs ne posteront JAMAIS, juste liront

**Concept: "Lire pour Guérir"**

- Section `/library` ou `/temoignages`
- Posts published uniquement
- Lecture seule, pas de compte requis
- Filtrage par catégories
- Reconnaissance que LIRE aide autant que POSTER

**Chemin landing page:** "📚 Explorer les témoignages"

**Implémentation Sprint 3**

---

## 🛠️ Spécifications Techniques

### Stack Validé

- **Framework:** TanStack Start RC (SSR uniquement)
- **Auth:** Better Auth (username, admin, anonymous plugins)
- **Database:** PostgreSQL + Drizzle ORM
- **Forms:** TanStack Form
- **Query:** TanStack Query (minimal, client-side only si nécessaire)
- **Langage:** TypeScript strict
- **Hébergement:** Hetzner VPS (EU, RGPD compliant)

---

### Schema DB Core

#### Table: categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  template_id UUID REFERENCES templates(id),
  security_suggestion VARCHAR(20) CHECK (security_suggestion IN ('high', 'medium', 'none')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: posts

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'flagged')),
  blur_enabled BOOLEAN DEFAULT FALSE,
  blur_warnings JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: anonymous_codes

```sql
CREATE TABLE anonymous_codes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);
```

---

### Plugin Anonymous Better Auth - Setup

**Ajout à `auth.ts`:**

```typescript
import { anonymous } from "better-auth/plugins";

export const auth = betterAuth({
  // ... config existante
  plugins: [
    username(),
    admin({
      defaultRole: "USER",
      adminRole: "ADMIN",
    }),
    anonymous(), // ← AJOUTER ICI
    tanstackStartCookies(),
  ],
  // ... reste config
});
```

**Usage Landing Page:**

```typescript
// Bouton "🆘 J'ai besoin de parler maintenant"
async function handleUrgentPost() {
  await auth.api.signInAnonymous();
  // Session anonyme créée automatiquement
  // Alias principal auto-créé (hook existant)
  navigate('/post/new');
}
```

---

### Génération Codes Secrets

**Format validé:** 3 mots français positifs/neutres

**Exemples:**
- lune-calme-refuge
- étoile-jardin-thé
- livre-silence-doux

**Implémentation:**

```typescript
// Liste de 1000 mots français positifs/neutres (éviter mots triggering)
const WORDS = ['lune', 'calme', 'refuge', 'étoile', 'jardin', /* ... */];

function generateSecretCode(): string {
  const word1 = WORDS[Math.floor(Math.random() * WORDS.length)];
  const word2 = WORDS[Math.floor(Math.random() * WORDS.length)];
  const word3 = WORDS[Math.floor(Math.random() * WORDS.length)];
  return `${word1}-${word2}-${word3}`;
}

async function storeSecretCode(userId: string, code: string) {
  const hash = await bcrypt.hash(code, 10);
  await db.insert(anonymousCodes).values({
    userId,
    codeHash: hash,
  });
}
```

**Stockage:** Hash uniquement (JAMAIS plaintext)

**Récupération:** IMPOSSIBLE (sécurité maximale = prix anonymat)

---

### Landing Page - 3 Chemins Différenciés

```typescript
🌙 ParlonsViolence - Espace sûr et anonyme

Vous êtes victime, témoin, ou cherchez de l'aide ?
Vous êtes au bon endroit. Tous les témoignages sont les bienvenus.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🆘 J'ai besoin de parler maintenant]
→ Session anonyme instantanée
→ Aucune inscription requise
→ CHEMIN MARIE (crise)

[💭 Je cherche des conseils pour aider quelqu'un]
→ Inscription rapide avec pseudo
→ Template guidé pour témoins
→ CHEMIN THOMAS (réflexion)

[📚 Je veux explorer les ressources]
→ Lecture sans compte
→ Découverte libre
→ CHEMIN LURKER (observation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ Modéré 24/7 | 🔒 Aucune donnée collectée
```

---

### Template Guidé "👁️ Témoignage Témoin"

**Objectif:** Aider Thomas à calibrer niveau de détail (protection autrui)

```typescript
interface WitnessTemplate {
  relationship: 'colleague' | 'friend' | 'family' | 'neighbor' | 'other';
  duration: string; // "Depuis combien de temps observez-vous ces signes ?"
  observations: string; // "Quels changements avez-vous remarqués ?" (Hint: Restez général)
  alreadyTalked: boolean;
  talkDetails?: string;
  fears: string; // "Que craignez-vous le plus dans cette situation ?"
}
```

**Affichage UI:**

```
📝 Parlez-nous de ce que vous observez

Votre relation avec la personne :
[ ] Collègue  [ ] Ami(e)  [ ] Famille  [ ] Voisin(e)  [ ] Autre

Depuis combien de temps observez-vous ces signes ?
[Input text]

Quels changements avez-vous remarqués ?
💡 Conseil: Restez général - évitez détails identifiants
[Textarea]

Avez-vous déjà essayé d'en parler avec elle/lui ?
[ ] Oui, et... [details]
[ ] Non, parce que... [details]

Que craignez-vous le plus dans cette situation ?
[Textarea]

💙 Vous n'êtes pas sûr(e) ? C'est normal.
✓ Vous ne serez jamais jugé pour vous tromper
✓ Mieux vaut demander de l'aide par précaution

[Publier mon témoignage]
```

---

## 📋 Plan d'Action Détaillé

### Pré-Sprint 1 (Cette Semaine)

**Setup Technique:**
- [ ] Migrations DB (categories, posts, anonymous_codes)
- [ ] Ajouter plugin `anonymous()` à Better Auth
- [ ] Setup dashboard admin (basique)

**Préparation Design:**
- [ ] Créer liste 1000 mots français pour codes secrets
- [ ] Définir 5 catégories complètes (slug, name, icon, description, template_id, security_suggestion)
- [ ] Wireframes landing page 3 chemins
- [ ] Mockups templates guidés

**Légal:**
- [ ] Rédiger CGU draft
- [ ] Rédiger politique confidentialité draft
- [ ] Compiler numéros urgence (disclaimer landing)

---

### Sprint 1 - Semaine 1 (Jours 1-5)

**Lundi (J1):**
- Migrations DB categories + posts
- Seed 5 catégories standard

**Mardi (J2):**
- API filtrage posts par category
- UI sélecteur catégorie lors création post

**Mercredi (J3):**
- Template système (conditional forms)
- Template "Témoignage Témoin" complet

**Jeudi (J4):**
- Template "Témoignage Victime" (expression libre)
- Template "Demande Soutien" (urgence)

**Vendredi (J5):**
- Landing page structure 3 chemins
- Messages ultra-courts + bouton urgence CSS

---

### Sprint 1 - Semaine 2 (Jours 6-10)

**Lundi (J6):**
- Polish UI landing page
- Responsive mobile

**Mardi (J7):**
- Flow complet: Landing → Choix chemin → Post → Success

**Mercredi (J8):**
- Tests internes (simuler Marie: session anonyme → post immédiat)

**Jeudi (J9):**
- Tests internes (simuler Thomas: inscription → template guidé → post)

**Vendredi (J10):**
- Déploiement staging
- Préparation Sprint 2 (review roadmap)

---

### Sprint 2 - Semaine 3 (Jours 11-15)

**Lundi (J11):**
- Posts status field (pending/published/rejected/flagged)
- UI dashboard admin: liste posts pending

**Mardi (J12):**
- Actions approve/reject (server functions)
- Email notifications modérateurs

**Mercredi (J13):**
- Boutons signalement posts/réponses
- Modal raisons signalement

**Jeudi (J14):**
- Server action signalement → status "flagged"
- Dashboard admin: section "Posts signalés"

**Vendredi (J15):**
- Tests flow modération complet
- Documentation guidelines modérateurs

---

### Sprint 2 - Semaine 4 (Jours 16-20)

**Lundi (J16):**
- Fonction generateSecretCode() (3 mots)
- Stockage hash codes DB

**Mardi (J17):**
- UI upgrade: "Créer code secret" dans profil
- Affichage code avec options sauvegarde

**Mercredi (J18):**
- Page `/access` pour entrer code
- Validation code et restauration session

**Jeudi (J19):**
- Floutage CSS posts sensibles
- UI checkboxes 4-5 types avertissements

**Vendredi (J20):**
- Tests flow sécurité complet (3 niveaux)
- Déploiement staging Sprint 2

---

### Sprint 3 - Semaine 5 (Jours 21-25)

**Lundi (J21):**
- Section `/library` ou `/temoignages`
- Filtrage posts published par catégories

**Mardi (J22):**
- UI cards témoignages (lecture seule)
- Chemin landing "📚 Explorer"

**Mercredi (J23):**
- Logique suggestion sécurité selon catégorie
- UI message "Recommandé: Mode Sécurisé"

**Jeudi (J24):**
- Détection usage (nombre posts, durée)
- Message doux conversion progressive

**Vendredi (J25):**
- Flow upgrade session anonyme → compte registered
- Tests conversion

---

### Sprint 3 - Semaine 6 (Jours 26-30)

**Lundi (J26):**
- Landing page immersive (design calme)
- Témoignage anonymisé exemple

**Mardi (J27):**
- Polish général UX
- Animations subtiles

**Mercredi (J28):**
- Loading states + error handling
- Messages feedback utilisateur

**Jeudi (J29):**
- Tests utilisateurs internes complets
- Corrections bugs critiques

**Vendredi (J30):**
- Déploiement production MVP
- Monitoring + analytics (respectueux privacy)

---

## 🎯 Métriques de Succès MVP

### Objectifs 6 Semaines Post-Lancement

**Adoption:**
- 50+ posts publiés
- 20+ utilisateurs actifs
- 60%+ utilisent catégories correctement

**Sécurité:**
- 0 violation privacy
- <5% posts rejetés modération
- Temps review modération <2h moyenne

**Engagement:**
- 30%+ utilisateurs reviennent (session ou code)
- 20%+ upgrade session → code secret
- 10+ témoignages dans bibliothèque

**UX:**
- Temps moyen premier post <3 minutes (Marie)
- 0 plaintes friction inscription
- Feedback qualitatif positif anonymat

---

## ⚠️ Risques et Mitigations

### Risque #1: Charge Modération Insoutenable

**Risque:** Solo dev ne peut pas modérer 24/7

**Mitigation:**
- Pré-modération réduit spam/trolls dès début
- SLA réaliste: review sous 24h (pas temps réel)
- Phase MVP: volume faible, gérable
- Long-term: recruter modérateurs communauté

---

### Risque #2: Abus Sessions Anonymes

**Risque:** Spam/trolls via sessions anonymes infinies

**Mitigation:**
- Rate limiting (X posts par session par jour)
- Pré-modération filtre abus
- IP tracking léger (détection mass spam uniquement)
- Possibilité ban session anonyme si abus

---

### Risque #3: Perte Codes Secrets

**Risque:** Users perdent code, frustration

**Mitigation:**
- Warnings CLAIRS lors génération
- Options multiples sauvegarde (screenshot, copie, email)
- Accepter: Certains perdront accès (prix anonymat max)
- Session Rapide reste disponible (pas obligation codes)

---

### Risque #4: Complexité Légale (RGPD, Signalement Crimes)

**Risque:** Zones grises légales témoignages violence

**Mitigation:**
- **RECOMMANDÉ:** Consultation avocat spécialisé avant lancement
- CGU claires (plateforme ≠ service urgence)
- Politique confidentialité transparente
- Hébergement EU (Hetzner) = RGPD compliant
- Disclaimer: "Si danger immédiat, contactez [numéros urgence]"

---

## 📚 Ressources et Références

### Documents Projet

- **Session Brainstorming Complète:** `brainstorming-session-2026-01-06.md`
- **Code Auth Existant:** `src/features/auth/lib/auth.ts`
- **Config Better Auth:** Documentation officielle + plugin anonymous

### Numéros Urgence à Inclure (France)

- **Violences Conjugales:** 39 19 (gratuit, 24/7)
- **Violences Sexuelles:** 0 800 05 95 95
- **Suicide:** 31 14 (numéro national de prévention)
- **Urgences:** 112 (numéro européen)

### Associations Partenaires Potentielles

- Fédération Nationale Solidarité Femmes
- Collectif Féministe Contre le Viol
- SOS Homophobie
- SOS Amitié

---

## ✅ Checklist Pré-Lancement

### Technique

- [ ] Toutes features Sprint 1-3 implémentées
- [ ] Tests utilisateurs internes (5-10 personnes)
- [ ] Tests charge/performance
- [ ] Backup automatique DB configuré
- [ ] Monitoring erreurs (Sentry ou équivalent)
- [ ] Analytics respectueux privacy (Plausible ou équivalent)

### Légal

- [ ] CGU finalisées et publiées
- [ ] Politique confidentialité finalisée
- [ ] Consultation avocat spécialisé (RECOMMANDÉ)
- [ ] Disclaimer numéros urgence visible
- [ ] Process signalement contenu illégal défini

### Contenu

- [ ] Guidelines modération documentées
- [ ] Formation modérateurs (si équipe)
- [ ] Messages accueil/rassurants finalisés
- [ ] Page "À propos" expliquant démarche
- [ ] Page "Comment ça marche" (pour nouveaux users)

### Communication

- [ ] Plan communication lancement (soft launch vs public)
- [ ] Partenariats associations (crédibilité + visibilité)
- [ ] Retours presse spécialisée (si pertinent)
- [ ] Community management plan (modération + engagement)

---

## 🌟 Vision Long-Terme (Post-MVP)

### Phase 2 (3-6 mois)

- Équipe modération (recrutement + formation trauma-informed)
- Tags multiples (au-delà catégories fixes)
- Détection IA auto catégorie (OpenAI/Anthropic API)
- Architecture hybride Niveau 3 (Code + Question)
- Safe Spaces thématiques (sous-communautés)

### Phase 3 (6-12 mois)

- Mobile app native (iOS + Android)
- Multilingue (expansion géographique)
- API partenaires (associations, recherche académique)
- Fonctionnalités avancées (messages privés modérés, groupes soutien)

### Phase 4 (12+ mois)

- Modèle économique durable (dons, subventions, partenariats)
- Impact social mesurable (études, publications)
- Réseau international ParlonsViolence
- Plateforme open-source (si mission sociale)

---

## 💬 Contact et Support

**Développeur:** Dev-linux (Solo Developer)  
**Session Facilitée par:** Mary (Agent Analyst - BMAD)  
**Date Session:** 2026-01-06  
**Durée Session:** ~3 heures  

**Pour Questions/Clarifications:**
- Référence document brainstorming complet
- Relire sections pertinentes
- Consulter documentation Better Auth / TanStack

---

**🎉 Vous avez tout ce qu'il faut pour réussir le MVP ParlonsViolence !**

**Prochaine action immédiate:** Démarrer Pré-Sprint 1 (Setup technique + DB migrations)

**Bonne chance ! 💪**

---

_Document généré le 2026-01-06_  
_Basé sur session brainstorming collaborative complète_  
_Toutes les décisions sont validées et prêtes pour implémentation_
