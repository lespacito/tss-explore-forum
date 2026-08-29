---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: "ParlonsViolence - Optimisation des parcours critiques et mécanismes de sécurité"
session_goals: "Identifier et prioriser les fonctionnalités essentielles, améliorer le workflow d inscription/onboarding, et concevoir des mécanismes de modération et système de signalement efficaces"
selected_approach: "ai-recommended"
techniques_used: ["Role Playing", "SCAMPER Method", "Constraint Mapping"]
ideas_generated: 31
context_file: "tss-explore-forum/_bmad/bmm/data/project-context-template.md"
session_complete: true
---

# Brainstorming Session Results

**Facilitateur:** Dev-linux
**Date:** 2026-01-06

## Session Overview

**Sujet:** ParlonsViolence - Optimisation des parcours critiques et mécanismes de sécurité

**Objectifs:**

- Identifier et prioriser les fonctionnalités essentielles pour le MVP ou phase suivante
- Améliorer le workflow d'inscription général pour réduire friction et anxiété
- Concevoir des mécanismes de modération et système de signalement efficaces et empathiques

### Contexte du projet

**ParlonsViolence** est un forum de soutien anonyme et modéré dédié aux sujets sensibles (violence, abus, harcèlement, détresse psychologique).

**Principes fondamentaux:**

- Anonymat par défaut
- Sécurité avant commodité
- Design orienté modération
- UX calme et empathique
- Accessibilité et mobile-first

**Utilisateurs cibles:**

- Victimes ou témoins de violence
- Personnes cherchant conseil ou soutien émotionnel
- Utilisateurs nécessitant anonymat et sécurité psychologique

**Stack technique:** TanStack Start RC (SSR), Better Auth (incluant utilisateurs anonymes), TanStack Form, TanStack Query

### Domaines d'exploration

1. **Fonctionnalités prioritaires** - Identification des features essentielles alignées avec objectifs de confiance et sécurité
2. **Workflow d'inscription** - Réduction friction, équilibre anonymat/engagement, parcours rassurant
3. **Modération et signalement** - Outils admin efficaces, systèmes de signalement clairs et non-stigmatisants

### Session Setup

Session initialisée avec contexte complet du projet. Objectif: générer des idées concrètes et priorisées pour les trois domaines critiques identifiés.

## Technique Selection

**Approche :** Techniques Recommandées par l'IA

**Contexte d'Analyse :** ParlonsViolence - Optimisation des parcours critiques et mécanismes de sécurité avec focus sur fonctionnalités prioritaires, workflow d'inscription, et modération/signalement

**Techniques Recommandées :**

- **Jeux de Rôle (Role Playing):** Recommandé pour comprendre en profondeur les besoins et peurs des utilisateurs vulnérables en incarnant différentes personas (victime, témoin, personne en crise). Résultat attendu : insights empathiques sur les barrières psychologiques.

- **SCAMPER Method:** Recommandé pour explorer systématiquement les améliorations aux workflows d'inscription et systèmes de signalement via 7 lentilles créatives (Substituer/Combiner/Adapter/Modifier/Put/Éliminer/Renverser). Résultat attendu : liste structurée d'améliorations concrètes.

- **Cartographie des Contraintes (Constraint Mapping):** Recommandé pour identifier toutes les contraintes réelles vs imaginées et trouver des chemins réalistes de solution. Résultat attendu : plan d'action réaliste avec fonctionnalités priorisées.

**Rationale de l'IA :** Cette séquence équilibre empathie profonde, innovation structurée, et réalisme pragmatique pour un projet nécessitant sécurité maximale et friction minimale pour utilisateurs vulnérables.

---

## Technique Execution: Jeux de Rôle (Role Playing)

### Persona 1: Marie - La Victime Hésitante (2h du matin, crise)

**Contexte d'incarnation:**
Marie, 28 ans, vient de vivre un incident violent avec son partenaire. Elle ne peut pas dormir. Sur son téléphone, en mode navigation privée, elle tape "forum violence anonyme" dans Google. Elle tombe sur ParlonsViolence.

#### Insights Empathiques Clés

**1. Besoin d'Expression Immédiate > Inscription**

_État émotionnel:_ Crise émotionnelle, besoin urgent de parler, incapacité d'attendre

_Insight principal:_ "Je voudrais déjà me sentir rassuré et me sentir au bon endroit en ressentant une écoute active de la part des autres membres, pouvoir directement demander de l'aide en postant un message et voir pour s'inscrire plus tard - besoin d'expression imminente"

_Barrières identifiées:_

- Tout processus d'inscription = friction psychologique inacceptable pendant la crise
- Penser aux "données personnelles" = impossible en état de détresse
- Le funnel traditionnel (inscription → post) est INVERSÉ pour utilisateurs en crise

_Implication produit:_ Architecture "Post First, Register Later" (Trust Ladder)

---

**2. Terreur de la Traçabilité**

_Peur primaire:_ "Ce qui me retiendrait de cliquer sur créer un compte ou poster c'est déjà l'idée que mon mari puisse retrouver mon message et aussi je ne devrais pas réfléchir à mes données personnelles à inclure pour l'inscription de suite"

_Peurs spécifiques identifiées:_

- Être retrouvée par l'abuseur via le forum
- Laisser des traces numériques
- Devoir fournir des informations personnelles (email, nom, etc.)

_Besoin critique:_ Anonymat absolu au moment du post, sans compromis

_Implication produit:_ Session anonyme instantanée sans aucune donnée personnelle requise

---

**3. Peur des Malveillants dans la Communauté**

_Insight:_ "Les peurs qui me paralyseraient serait de me faire retrouver via ce forum ou que des personnes soient malveillantes avec moi"

_Besoin de signaux de sécurité AVANT de poster:_

- Modération visible et active
- Preuve que l'espace est "gardé"
- Protection contre membres toxiques ou prédateurs

_Implication produit:_ Signaux de confiance omniprésents sur la landing page et dans l'interface

---

**4. Contrôle, Réversibilité et Liberté d'Expression**

_Insight:_ "L'aspect d'anonyme mis en avant, la possibilité de pouvoir poster son message sans pour autant s'inscrire quitte à pouvoir modifier mon choix plus tard en incluant mes informations par la suite"

_Architecture psychologique:_ Trust Ladder

- Chaque engagement est opt-in
- Jamais de pression ou d'obligation
- "Poster d'abord, s'engager après si je veux"
- Liberté d'expression sans jugement

---

### Solutions Techniques Connectées aux Insights

#### 1. Architecture "Post Immédiat Anonyme"

**Implémentation Better Auth:**

- Utilisation du plugin anonymous de Better Auth
- Clic sur "Poster maintenant" → session anonyme créée automatiquement
- Message rassurant affiché: "Votre session est totalement anonyme. Aucune donnée personnelle requise."
- Marie peut poster IMMÉDIATEMENT sans friction

**Lien technique:** https://www.better-auth.com/docs/plugins/anonymous

---

#### 2. Profil Anonyme avec Continuité

**Solution technique:**

- Session anonyme = profil temporaire automatique
- Sauvegarde de brouillons dans ce profil anonyme
- Marie peut retrouver ses posts via la session (cookie/token local)
- Option de "convertir" la session anonyme en compte permanent plus tard

**Flux utilisateur:**

1. Marie poste anonymement (session auto-créée)
2. Posts visibles dans son "profil anonyme temporaire"
3. Si elle revient: session reconnue → accès à ses posts
4. Option douce: "Voulez-vous sauvegarder cet espace de manière permanente ?" (opt-in)

---

#### 3. Signaux de Sécurité Visibles

**Landing Page:**

- Badge: "🛡️ Modéré 24/7"
- Timestamp dynamique: "Dernière modération: il y a 3 minutes"
- Message de bienvenue d'un modérateur visible
- Politique de modération claire et rassurante

**Dans l'interface:**

- Boutons "Signaler" visibles et accessibles sur chaque post
- Badges modérateurs clairement identifiables
- Transparence totale: "Les modérateurs peuvent supprimer du contenu mais ne peuvent jamais le modifier" (confiance)

---

#### 4. Mock-up Conceptuel: Landing Page

```
🌙 ParlonsViolence - Espace sûr et anonyme

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Vous avez besoin de parler maintenant ?
   Postez de manière totalement anonyme.
   Aucune inscription requise.

   [Écrire mon message maintenant →]

   ━ ou ━

👤 Vous préférez créer un espace personnel ?
   [Créer un compte anonyme] (optionnel)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ Modéré 24/7 | 🔒 Aucune donnée collectée
📊 Dernière modération : il y a 3 minutes

💙 Message du modérateur: "Bienvenue dans cet espace
   bienveillant. Vous êtes en sécurité ici."
```

---

### Système de Modération et Catégorisation de Contenu

#### Architecture de Protection par Floutage

**Innovation clé:** Système de floutage avec opt-in pour contenu sensible

**Fonctionnement:**

- Contenu potentiellement difficile = flouté par défaut
- Bouton "Voir le contenu" pour opt-in conscient
- Respect simultané de:
  - ✅ Liberté d'expression authentique de la victime
  - ✅ Protection des lecteurs vulnérables
  - ✅ Contrôle individuel ("Je choisis quand je suis prêt")

**Expérience utilisateur du contenu flouté:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━
🌫️ Contenu sensible masqué

Ce témoignage contient des descriptions
de violence qui peuvent être difficiles.

[Voir le contenu] [En savoir plus]
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### Catégories de Contenu (Proposition)

**1. Témoignage Brut / Expression Authentique (PROTÉGÉ)**

_Description:_

- Description de violence vécue (même avec langage cru)
- Expression de détresse, pensées sombres, émotions intenses
- Langage fort utilisé par la victime pour décrire son vécu

_Action modération:_

- Flouté par défaut via système automatique
- JAMAIS supprimé sauf danger immédiat
- Protection totale de l'expression authentique

_Principe:_ "Liberté d'expression sans jugement sur la façon dont les victimes s'expriment"

---

**2. Soutien et Conseils Bienveillants (ENCOURAGÉ)**

_Description:_

- Messages d'empathie, validation, soutien
- Partage d'expériences similaires (non-compétitives)
- Ressources utiles (numéros d'aide, associations)

_Action modération:_

- Visible normalement (pas de floutage)
- Encouragé activement
- Mis en avant si particulièrement aidant

---

**3. Contenu à Supprimer Immédiatement**

_Types identifiés:_

- ❌ Victim-blaming ("C'est de ta faute si...")
- ❌ Minimisation ("C'est pas si grave...")
- ❌ Agression envers membres ("Tu es stupide de...")
- ❌ Trolling, moquerie, jugement
- ❌ Contenu malveillant ou prédateur

_Action modération:_

- Suppression immédiate
- Avertissement ou ban de l'auteur selon gravité
- Notification à l'utilisateur ciblé (si applicable)

---

**4. Contenu Nécessitant Intervention Urgente**

_Types:_

- Menaces de suicide imminentes
- Danger immédiat pour soi ou autrui
- Situations nécessitant services d'urgence

_Action modération:_

- Alerte modérateur prioritaire
- Ressources d'urgence affichées automatiquement
- Possible contact avec services d'urgence selon protocole
- Suivi rapproché

---

#### Formation et Guidelines pour Modérateurs

**Texte informatif - Options d'implémentation:**

**Option A: Dashboard Admin (in-app)**

- Guidelines de modération visibles en permanence
- Exemples concrets pour chaque catégorie
- Flowchart de décision rapide
- Accès rapide pendant la modération

**Option B: Email / Formation initiale**

- Formation complète pour nouveaux modérateurs
- Rappels périodiques des principes
- Études de cas et discussions
- Mises à jour de politique

**Principes Clés de Formation:**

1. **Trauma-Informed Moderation**
   - Comprendre que les victimes s'expriment différemment
   - Pas de jugement sur le ton, le langage, ou l'émotion
   - Focus: protéger l'espace collectif, pas policer l'expression individuelle

2. **Distinction Critique**
   - "Expression de la victime" (PROTÉGÉ) vs "Agression envers autrui" (SUPPRIMÉ)
   - La victime peut être crue, directe, en colère dans SON récit
   - MAIS personne ne peut attaquer, blâmer, ou minimiser AUTRUI

3. **Transparence et Confiance**
   - Modérateurs peuvent SUPPRIMER mais jamais MODIFIER
   - Raison: préserver la confiance et l'authenticité
   - Logs de modération accessibles (pour accountability)

---

### Questions de Design Ouvertes (à explorer)

**1. Détection du contenu sensible - qui décide du floutage ?**

Options possibles:

- [ ] Marie coche "Contenu sensible" en postant (auto-déclaration)
- [ ] Système automatique (IA/mots-clés) détecte et floute
- [ ] Modérateur ajoute le floutage après review
- [ ] Combinaison des approches

**2. Notification à l'auteur**

Si le post de Marie est flouté automatiquement, reçoit-elle un message ?

Exemple possible:

> "Votre post a été marqué comme contenu sensible et sera flouté par défaut pour protéger les lecteurs. Il reste totalement visible pour ceux qui choisissent de le voir. Merci de partager votre vérité."

**3. Catégories visibles ou backend uniquement ?**

- Les catégories sont-elles visibles aux utilisateurs ?
- Ou seulement en backend pour modérateurs ?
- Tags optionnels type "Témoignage" / "Demande de soutien" / "Ressources" ?

**4. Gestion de la session anonyme - persistance**

- Combien de temps la session anonyme persiste ?
- Cookie local ? Token ? Expiration ?
- Message de rappel : "Sauvegardez ce lien pour retrouver vos posts" ?

---

### Idées Générées (Persona Marie)

**IDÉE #1: Architecture "Post First, Register Later"**

- Session anonyme instantanée via Better Auth anonymous plugin
- Inversion du funnel traditionnel
- Réduction friction maximale pour utilisateurs en crise

**IDÉE #2: Système de Floutage avec Opt-In**

- Protection des lecteurs + liberté d'expression des auteurs
- Contenu sensible flouté par défaut
- Bouton "Voir le contenu" pour consentement actif

**IDÉE #3: Signaux de Sécurité Omniprésents**

- Badge "Modéré 24/7" sur landing page
- Timestamp de dernière modération (preuve d'activité)
- Message de bienvenue modérateur visible
- Boutons "Signaler" bien visibles

**IDÉE #4: Transparence de Modération**

- Modérateurs peuvent supprimer mais JAMAIS modifier
- Construit la confiance via transparence
- Prévient la manipulation de contenu

**IDÉE #5: Catégorisation de Contenu (4 types)**

- Témoignage Brut (protégé, flouté)
- Soutien (encouragé, visible)
- Toxique (supprimé)
- Urgence (intervention)

**IDÉE #6: Trauma-Informed Moderation Training**

- Formation spécifique pour modérateurs
- Distinction "expression victime" vs "agression autrui"
- Pas de jugement sur ton ou langage de témoignage

**IDÉE #7: Profil Anonyme avec Continuité**

- Session anonyme = profil temporaire auto-créé
- Sauvegarde brouillons
- Option de conversion en compte permanent (opt-in)

**IDÉE #8: Landing Page Rassurante**

- Bouton principal: "Écrire mon message maintenant"
- Pas de friction, pas de formulaire
- Message clair: "Aucune inscription requise"

**IDÉE #9: Mock-up Contenu Flouté**

- Design calme et non-alarmant
- Message informatif sans dramatisation
- Options: "Voir" ou "En savoir plus"

**IDÉE #10: Guidelines Modération Accessibles**

- Dashboard admin avec guidelines permanentes
- Flowchart de décision rapide
- Exemples concrets

**IDÉE #11: Système de Signalement Prioritaire**

- Pré-modération nouveaux commentaires (optionnel)
- Signalement prioritaire pour contenu violent
- Protection proactive

**IDÉE #12: Contrôle Utilisateur Total**

- Marie choisit quelles infos exposer
- Pseudo par défaut, rien d'autre
- Opt-in progressif pour engagement accru

---

### Insights Méthodologiques

**Force de la technique:**
L'incarnation de Marie a permis de connecter directement les besoins émotionnels aux solutions techniques. La pensée empathique a révélé des barrières psychologiques invisibles dans une approche purement analytique.

**Breakthrough moment:**
La révélation que le funnel d'inscription traditionnel est un OBSTACLE (pas une feature) pour utilisateurs en crise. Cette inversion de paradigme ("Post First, Register Later") est directement issue de l'incarnation empathique.

**Connexion technique réussie:**
Better Auth anonymous plugin identifié comme solution technique parfaite pour les besoins émotionnels de Marie. Bridge réussi entre empathie et implémentation.

---

---

### Persona 2: Thomas - Le Témoin Hésitant

**Contexte d'incarnation:**
Thomas, 35 ans, collègue de bureau. Depuis 3 mois, il remarque des changements inquiétants chez sa collègue Sophie : bleus cachés, excuses constantes, sursauts, refus d'afterworks, pleurs dans les toilettes. Il suspecte fortement violence conjugale mais n'est pas certain. Il ne sait pas comment l'aider et a peur de mal faire. C'est dimanche soir, 21h, il tape "que faire si je pense qu'une collègue est victime de violence" dans Google et tombe sur ParlonsViolence.

#### Insights Empathiques Clés

**1. Besoin de Légitimité et Inclusion Explicite**

_État émotionnel:_ Doute sur sa légitimité à être là, sentiment de ne pas avoir "le droit"

_Insight principal:_ "À première vue je me sentirais pas en droit [d'être ici]. Je voudrais pouvoir avoir une catégorie témoignage pour mon post. Inclure une petite phrase que les témoignages sont les bienvenus dans la landing pourrait aider je pense."

_Besoin critique:_ Validation EXPLICITE que les témoins sont bienvenus, pas seulement les victimes

_Contraste avec Marie:_

- Marie = Victime, légitimité évidente pour elle
- Thomas = Témoin, sent qu'il "envahit" un espace qui n'est pas pour lui

_Implication produit:_ Landing page doit activement inviter les témoins, pas présumer que seules les victimes viennent

---

**2. Système de Catégories Visibles - BESOIN CRITIQUE**

_Insight principal:_ "Je voudrais pouvoir avoir une catégorie témoignage pour mon post"

_Fonction multiple:_

- ✅ Légitimité ("Ma place ici est reconnue par le système")
- ✅ Découvrabilité ("Je peux trouver d'autres témoins comme moi")
- ✅ Navigation ("Je peux filtrer par type de contenu")
- ✅ Guidage ("Template adapté à mon besoin spécifique")

_Implication produit:_ Catégories ne sont PAS juste pour modération backend - c'est une **feature utilisateur essentielle**

**Proposition de Catégories Visibles:**

| Catégorie                | Pour qui                  | Icône | Fonction                   |
| ------------------------ | ------------------------- | ----- | -------------------------- |
| 🗣️ Témoignage Victime    | Victimes partageant vécu  | 🗣️    | Expression authentique     |
| 👁️ Témoignage Témoin     | Témoins demandant conseil | 👁️    | Demande d'aide pour autrui |
| 🆘 Demande de Soutien    | Besoin d'aide immédiat    | 🆘    | Crise/urgence              |
| 💡 Ressources & Conseils | Partage d'infos utiles    | 💡    | Éducation/prévention       |
| 🤝 Retour d'Expérience   | Parcours de guérison      | 🤝    | Inspiration/espoir         |

**Priorité #1 identifiée:** Système de catégories visibles (pas juste backend)

---

**3. Peur Inversée: Protéger AUTRUI (pas soi)**

_Insight:_ "J'aurais peur de lui attirer des problèmes si son mari tombe sur mon post"

_Différence critique avec Marie:_

- Marie = Peur de SE faire retrouver (protection de soi)
- Thomas = Peur de FAIRE retrouver Sophie (protection d'autrui)

_Solutions différentes nécessaires:_

**Pour Thomas (protection d'autrui):**

- Guidelines claires sur anonymisation d'autrui
- Checklist avant publication (proposée mais rejetée pour MVP - trop intrusive)
- Template guidé pour calibrer niveau de détail

**Checklist conceptuelle (non-implémentée MVP):**

```
⚠️ Avant de poster sur quelqu'un d'autre :

✓ Évitez noms, lieux de travail précis, détails identifiants
✓ Changez les détails non-essentiels (âge approximatif, etc.)
✓ Concentrez-vous sur les symptômes généraux
✓ Si vous mentionnez un contexte, restez vague
```

**Décision MVP:** Pas de validation automatique AI (trop intrusive), mais guidelines textuelles claires

---

**4. Peur de Se Tromper - Besoin de Validation Non-Judgmental**

_Insight:_ "J'aurais la peur d'être dans le faux par rapport aux symptômes que j'ai observé chez Sophie"

_Besoin:_ Rassurance qu'il ne sera pas jugé s'il se trompe

**Solution validée - Contenu rassurant dans section "👁️ Témoignage Témoin":**

```
💙 Vous n'êtes pas sûr(e) ? C'est normal.

✓ Vous ne serez jamais jugé pour vous tromper
✓ Mieux vaut demander de l'aide par précaution
✓ Votre intuition compte - faites-vous confiance
✓ La communauté est là pour vous guider

[Poster mon observation →]
```

**Validation:** "Oui ça rassurerait Thomas"

---

**5. Parcours d'Inscription Différent - Pas de Crise**

_Insight:_ "Quitte à m'inscrire ça me pose pas de problème" + "avec pseudo oui sans problème je pense"

_Contraste avec Marie:_

- Marie = CRISE émotionnelle → post immédiat obligatoire → session anonyme
- Thomas = RÉFLEXION calme → inscription OK → pseudo acceptable

_Implication produit:_ Parcours différenciés selon type d'utilisateur

**Architecture de Landing Page - Chemins Différenciés (Validée):**

```
🌙 ParlonsViolence - Espace sûr et anonyme

Vous êtes victime, témoin, ou cherchez de l'aide ?
Vous êtes au bon endroit. Tous les témoignages
sont les bienvenus.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🆘 J'ai besoin de parler maintenant]
→ Session anonyme instantanée
→ Aucune inscription requise
→ Chemin Marie (crise)

[💭 Je cherche des conseils pour aider quelqu'un]
→ Inscription rapide avec pseudo
→ Template guidé pour témoins
→ Chemin Thomas (réflexion)

[📚 Je veux explorer les ressources]
→ Lecture sans compte
→ Découverte libre
→ Chemin Lurker (observation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Validation:** "Les chemins sur la landing page permettraient à l'utilisateur d'être mieux redirigé oui"

---

**6. Niveau de Détail Calibré - Template Guidé**

_Insight:_ "Avec un niveau de détail ne permettant pas directement de retrouver Sophie dans mon post"

_Besoin:_ Donner ASSEZ de détails pour recevoir bons conseils, mais PAS TROP pour protéger Sophie

**Solution validée - Template Guidé pour Catégorie "👁️ Témoignage Témoin":**

```
📝 Parlez-nous de ce que vous observez

Votre relation avec la personne :
[ ] Collègue  [ ] Ami(e)  [ ] Famille  [ ] Voisin(e)  [ ] Autre

Depuis combien de temps observez-vous ces signes ?
[Réponse libre]

Quels changements avez-vous remarqués ?
(Restez général - évitez détails identifiants)
[Réponse libre]

Avez-vous déjà essayé d'en parler avec elle/lui ?
[ ] Oui, et... [détails]
[ ] Non, parce que... [détails]

Que craignez-vous le plus dans cette situation ?
[Réponse libre]
```

**Validation:** "Oui c'est une bonne template"

**Fonction:** Structure la pensée de Thomas tout en le guidant vers le bon niveau de détail (protection d'autrui)

---

### Solutions Techniques Connectées aux Insights (Thomas)

#### 1. Système de Catégories Visibles - PRIORITÉ #1

**Implémentation:**

- Sélecteur de catégorie lors de la création de post
- Filtrage par catégorie dans la navigation
- Badge de catégorie visible sur chaque post
- Template adapté selon catégorie sélectionnée

**Flow utilisateur:**

1. Thomas arrive → clique "💭 Je cherche des conseils pour aider quelqu'un"
2. Inscription rapide (pseudo + mot de passe)
3. Création de post → sélectionne "👁️ Témoignage Témoin"
4. Template guidé s'affiche automatiquement
5. Message rassurant: "Vous n'êtes pas sûr ? C'est normal..."
6. Publication → badge "👁️ Témoin" visible sur le post

---

#### 2. Landing Page Inclusive avec Chemins Différenciés

**Messages clés:**

- "Vous êtes victime, témoin, ou cherchez de l'aide ? Vous êtes au bon endroit."
- "Tous les témoignages sont les bienvenus" (inclusion explicite)
- Trois chemins clairement différenciés selon besoin

**Validation utilisateur:** "Oui c'est okay comme ça"

---

#### 3. Templates Guidés par Catégorie

**Principe:**

- Chaque catégorie = template spécifique
- Aide à structurer la pensée
- Guide vers le bon niveau de détail
- Questions adaptées au type d'utilisateur

**Catégorie "👁️ Témoignage Témoin":**

- Focus: Observation, relation, actions déjà tentées
- Guidelines: "Restez général - évitez détails identifiants"
- Validation émotionnelle intégrée

---

#### 4. Guidelines de Protection d'Autrui (pas juste de soi)

**Nouveau besoin identifié:**

- Marie = Guidelines pour se protéger SOI (anonymat, session)
- Thomas = Guidelines pour protéger AUTRUI (anonymisation dans récit)

**Implémentation (textuelle, pas AI pour MVP):**

- Texte d'aide visible pendant rédaction
- Rappels sur anonymisation
- Pas de validation automatique (rejeté: "trop intrusif")

---

### Idées Générées (Persona Thomas)

**IDÉE #13: Système de Catégories Visibles Utilisateurs**

- Catégories ne sont pas juste backend/modération
- Sélecteur lors création de post
- Filtrage/navigation par catégorie
- Badges visibles sur posts
- **PRIORITÉ #1 identifiée par utilisateur**

**IDÉE #14: Landing Page avec Chemins Différenciés**

- Trois parcours distincts selon type d'utilisateur
- 🆘 Crise (Marie) → anonyme instant
- 💭 Témoin (Thomas) → inscription + template
- 📚 Découverte → lecture libre
- Meilleure redirection selon besoin

**IDÉE #15: Inclusion Explicite des Témoins**

- Message clair: "Témoins bienvenus"
- Validation de légitimité dès landing page
- Combat le sentiment "je n'ai pas le droit d'être ici"

**IDÉE #16: Templates Guidés par Catégorie**

- Template spécifique pour "Témoignage Témoin"
- Questions structurées
- Guidelines intégrées (niveau de détail)
- Aide à calibrer protection d'autrui

**IDÉE #17: Contenu Rassurant pour Doutes**

- "Vous n'êtes pas sûr ? C'est normal."
- Validation non-judgmental
- Encourage précaution vs inaction
- Réduit peur de se tromper

**IDÉE #18: Guidelines Protection d'Autrui**

- Distinct des guidelines protection de soi
- Focus: anonymiser personnes mentionnées
- Textuelles (pas AI validation pour MVP)
- Éducation vs enforcement

**IDÉE #19: Parcours d'Inscription Adaptatif**

- Pas de friction pour crise (Marie)
- Inscription acceptable pour réflexion (Thomas)
- Lecture libre pour découverte
- Architecture modulaire selon contexte

**IDÉE #20: Proposition 5 Catégories Standards**

- 🗣️ Témoignage Victime
- 👁️ Témoignage Témoin
- 🆘 Demande de Soutien
- 💡 Ressources & Conseils
- 🤝 Retour d'Expérience

---

### Insights Méthodologiques (Thomas vs Marie)

**Comparaison des Personas:**

| Dimension            | Marie (Victime Crise)    | Thomas (Témoin Réflexion)    |
| -------------------- | ------------------------ | ---------------------------- |
| État émotionnel      | Crise, urgence           | Réflexion, doute             |
| Besoin principal     | Expression immédiate     | Conseil pour agir            |
| Friction inscription | INACCEPTABLE             | Acceptable                   |
| Anonymat             | Absolu (session anonyme) | Pseudo OK                    |
| Peur primaire        | Se faire retrouver       | Faire retrouver autrui       |
| Légitimité           | Évidente                 | Douteuse (besoin validation) |
| Timing               | 2h du matin, crise       | Dimanche soir, planification |

**Révélation clé:**
Un seul parcours ne peut pas servir ces deux utilisateurs. Architecture différenciée nécessaire.

**Priorisation utilisateur:**
Système de catégories visibles = Feature #1 (choix A sur A/B/C)

---

---

## Technique Execution: SCAMPER Method

### Objectif SCAMPER

Améliorer systématiquement les 20 concepts générés via Role Playing en appliquant 7 lentilles créatives pour générer des variations et optimisations.

### Approche de Facilitation

Exploration collaborative de chaque lentille SCAMPER avec focus sur applicabilité MVP et faisabilité technique.

---

### Lentille #1: SUBSTITUTE (Substituer)

**Question centrale:** Que pourrions-nous substituer dans nos concepts existants pour créer quelque chose de nouveau ou meilleur ?

#### Substitutions Explorées et Validées

**SUBSTITUTION #1: Architecture Hybride 3 Niveaux de Sécurité ✅**

**Concept:** Substituer la session unique par un système graduel de sécurité

**Niveaux validés:**

1. **Niveau 1 "Session Rapide" (Par défaut pour crise)**
   - Session cookie classique (Better Auth anonymous plugin)
   - Zéro friction pour Marie en crise
   - Message clair sur limitations (un seul appareil)
   - Option upgrade visible mais non-intrusive

2. **Niveau 2 "Code Secret Simple" (Upgrade opt-in)**
   - Code 3-mots mémorisable: "lune-calme-refuge"
   - Génération après premier post ou lors upgrade volontaire
   - Options de sauvegarde: capture d'écran, copie, email (avec warning)
   - Multi-appareil, pas de cookies
   - Aucune récupération si perte (sécurité maximale)

3. **Niveau 3 "Code Secret Renforcé" (Paranoïa élevée)**
   - Code + Question secrète
   - Double sécurité
   - Pour utilisateurs ultra-prudents

**Avantages:**

- ✅ Zéro friction pour utilisateurs en crise (Niveau 1 par défaut)
- ✅ Sécurité maximale pour qui en a besoin (Niveaux 2 & 3 opt-in)
- ✅ Trust ladder progressive
- ✅ Techniquement faisable avec Better Auth

**Implémentation technique:**

- Niveau 1: Better Auth anonymous plugin
- Niveau 2: Custom code generation + hash storage
- Niveau 3: Code + additional secret question field

**Format code validé:** 3 mots français positifs/neutres tirés d'une liste de 1000 mots (éviter mots triggering)

**Placement sur Landing Page:**

- Bouton "🆘 J'ai besoin de parler maintenant" → `auth.api.signInAnonymous()`
- Session créée automatiquement
- User redirigé vers `/post/new`
- Upgrade proposé APRÈS premier post (pas de pression)

**DÉCISION: Priorité Implémentation Sprint 2 (Niveaux 1 + 2 pour MVP)**

---

### Lentille #2: COMBINE (Combiner)

**Question centrale:** Quelles fonctionnalités ou concepts pourrions-nous combiner pour créer quelque chose de plus puissant ?

#### Combinaisons Explorées et Validées

**COMBINAISON #1: Catégories + Niveaux de Sécurité ✅**

**Concept:** Suggestion automatique de sécurité renforcée selon type de contenu

**Flow:**

```
Utilisateur sélectionne "🆘 Demande de Soutien Urgente"
    ↓
Système suggère automatiquement:
"Pour ce type de contenu, nous recommandons
le Mode Sécurisé avec code secret."
    ↓
[Activer Mode Sécurisé] [Continuer en Session Rapide]
```

**Logique contextuelle:**

- Catégorie urgence/danger → suggestion sécurité renforcée
- Catégorie ressources/conseils → session standard suffit
- Non-intrusif: suggestion, jamais obligation

**DÉCISION: Sprint 2 (après implémentation catégories + codes secrets)**

---

**COMBINAISON #2: Floutage + Avertissements Spécifiques ✅**

**Concept:** Granularité dans les content warnings

**Actuellement (baseline):**

```
🌫️ Contenu sensible masqué
[Voir le contenu]
```

**Amélioré avec typologie:**

```
⚠️ Ce témoignage contient :
☑️ Descriptions de violence physique
☑️ Langage explicite
☐ Mentions de suicide
☐ Violence sexuelle

[Voir le contenu] [Pourquoi ces avertissements ?]
```

**Avantages:**

- Lecteurs choisissent précisément ce qu'ils peuvent gérer
- Victimes de violence sexuelle peuvent éviter ces contenus spécifiquement
- Protection ciblée vs floutage générique

**Implémentation:**

- Posts table: `blur_warnings` (JSON array)
- UI: Checkboxes multiples lors détection/modération
- Qui décide: Auteur (optionnel) + Modérateur (review)

**DÉCISION: Sprint 2 (version simple avec 4-5 types d'avertissements standards)**

---

**COMBINAISON #3: Session Anonyme + Conversion Progressive ✅**

**Concept:** Gamification douce de l'engagement (sans pression)

**Flow:**

```
Session Anonyme (Niveau 1)
    ↓
Après 3 posts OU 1 semaine usage
    ↓
Message doux:
"Vous êtes revenu(e) plusieurs fois.
Cela nous touche.

Voulez-vous créer un espace plus permanent ?
- Pseudo personnalisé (au lieu de "Anonyme_5829")
- Code secret pour multi-device
- Sauvegarde automatique de brouillons

[Créer mon espace] [Rester anonyme]"
```

**Principes:**

- Trust ladder naturelle
- Engagement organique basé sur usage
- Jamais forcé, toujours opt-in
- Reconnaissance émotionnelle ("Vous êtes revenu(e), cela nous touche")

**DÉCISION: Sprint 3 (raffinement UX après MVP core)**

---

### Lentille #3: ADAPT (Adapter)

**Conclusion:** Pas pertinent pour MVP

Idées explorées (Stories éphémères 24h, Trigger warnings standards académiques) rejetées pour focus MVP.

---

### Lentille #4: MODIFY (Modifier)

**Question centrale:** Comment modifier/amplifier/réduire des éléments existants ?

#### Modifications Validées

**MODIFICATION #1: Bouton Urgence 2x Plus Gros ✅**

**Concept:** Modifier taille des boutons selon urgence/importance

**Implémentation:**

- Bouton "🆘 J'ai besoin de parler maintenant" = 2x plus gros
- Plus facile à cliquer en situation stress/tremblements
- Hiérarchie visuelle claire

**DÉCISION: Sprint 1 (pure CSS/UI)**

---

**MODIFICATION #2: Messages Ultra-Courts ✅**

**Concept:** Réduire longueur des messages rassurants

**Avant:**

```
Bienvenue sur ParlonsViolence. Cet espace est dédié
au soutien et à l'écoute bienveillante. Vous pouvez
partager votre vécu en toute sécurité et anonymat...
```

**Après:**

```
Vous êtes en sécurité.
Aucun jugement.
Parlez librement.
```

**Principe:** Phrases ultra-courtes pour charge cognitive minimale

**DÉCISION: Sprint 1 (copywriting)**

---

### Lentille #5: PUT TO OTHER USES (Réaffecter)

**Conclusion:** Rejeté pour MVP

Idée "Safe Spaces thématiques avec modérateurs spécialisés" = bonne idée long-terme mais nécessite équipe. Pas viable solo dev MVP.

---

### Lentille #6: ELIMINATE (Éliminer)

**Question centrale:** Que peut-on supprimer complètement pour simplifier ?

#### Éliminations Validées - Protection Privacy Radicale

**ÉLIMINATION #1: Compteurs (vues, likes, réponses) ✅**

**Rationale:**

- Évite comparaison/compétition
- Réduit anxiété ("Personne n'a répondu...")
- Pas de metrics sociales = pas de pression
- Soutien authentique vs popularité

**DÉCISION: Sprint 1 (décision de design - NE PAS implémenter ces features)**

---

**ÉLIMINATION #2: Profil Public ✅**

**Rationale:**

- Pas de page profil consultable par autres utilisateurs
- Seulement l'utilisateur voit son propre espace privé
- Protection privacy maximale
- Réduit risque de stalking/profiling

**DÉCISION: Sprint 1 (architecture simplifiée)**

---

**ÉLIMINATION #3: Recherche d'Utilisateurs ✅**

**Rationale:**

- On peut chercher des POSTS (par catégorie, mots-clés)
- Mais JAMAIS des PERSONNES/PROFILS
- Réduit risque harassment/stalking
- Aligné avec principe anonymat

**DÉCISION: Sprint 1 (feature search posts only, no user search)**

**Impact des 3 éliminations:**

- Moins de code à écrire = MVP plus rapide
- Protection privacy radicale différenciante
- Alignement total avec valeurs ParlonsViolence

---

### Lentille #7: REVERSE (Renverser)

**Question centrale:** Et si on inversait complètement des concepts ?

#### Inversions Validées

**INVERSION #1: "Lire pour Guérir" - Bibliothèque Témoignages ✅**

**Concept:** Inverser "Poster pour recevoir" en "Lire pour guérir"

**Idée:**

- Mode "Bibliothèque de Témoignages" où lecture de récits d'autres aide processus de guérison
- Pas d'obligation de poster pour bénéficier
- Reconnaissance que LIRE peut être thérapeutique
- Certains utilisateurs ne posteront jamais, juste liront

**Implémentation:**

- Section `/library` ou `/temoignages`
- Filtrage par catégories
- Lecture seule (pas d'interaction nécessaire)
- Accessible sans compte (chemin "📚 Explorer" sur landing)

**DÉCISION: Sprint 3 (valeur ajoutée pour utilisateurs hésitants)**

---

**INVERSION #2: Landing Page Immersive vs Informative ✅**

**Concept:** Inverser logique d'explication intellectuelle

**Avant (informatif):**

```
ParlonsViolence est un forum...
Notre mission est de...
Nous offrons...
```

**Après (immersif):**

```
[Landing page = ambiance immédiate]
- Témoignage anonymisé court (2-3 phrases)
- Design calme, couleurs apaisantes
- Ressenti AVANT compréhension intellectuelle
- Boutons d'action immédiats
```

**Principe:** Plonger utilisateur dans l'ambiance plutôt qu'expliquer

**DÉCISION: Sprint 3 (design/UX avancé, non-bloquant MVP)**

---

**INVERSION #3: Pré-modération ❌ REJETÉE**

Idée "Approbation douce avant publication" explorée mais rejetée.

**Rationale du rejet:**

- Marie en crise a besoin d'expression IMMÉDIATE
- Attendre validation modérateur = friction psychologique inacceptable
- Contradiction avec "Post First" architecture

**Solution alternative déjà prévue:**

- Post immédiat en status "pending"
- Invisible aux autres MAIS visible à l'auteur
- Validation rapide modérateur ensuite
- Balance entre sécurité et expression immédiate

---

### Récapitulatif SCAMPER - Idées Validées

**Total: 11 nouvelles idées/optimisations générées**

**Par lentille:**

- SUBSTITUTE: 1 idée (Architecture 3 niveaux)
- COMBINE: 3 idées (Catégories+Sécurité, Floutage+Warnings, Session+Conversion)
- ADAPT: 0 (non pertinent MVP)
- MODIFY: 2 idées (Bouton gros, Messages courts)
- PUT: 0 (rejeté MVP)
- ELIMINATE: 3 idées (Compteurs, Profils publics, Recherche users)
- REVERSE: 2 idées (Bibliothèque, Landing immersive)

**Total session: 20 idées (Role Playing) + 11 idées (SCAMPER) = 31 IDÉES**

---

## Technique Execution: Constraint Mapping

### Objectif Constraint Mapping

Identifier toutes les contraintes (techniques, ressources, légales, utilisateurs) pour distinguer contraintes réelles vs imaginées et prioriser intelligemment les 31 idées générées.

---

### Contexte Projet - Contraintes Identifiées

**Stack Technique:**

- TanStack Start RC (SSR uniquement)
- Better Auth (avec plugins: username, admin, tanstackStartCookies)
- Drizzle ORM + PostgreSQL
- TanStack Form
- TanStack Query (client-side minimal)
- TypeScript strict

**Ressources:**

- Solo développeur temps plein
- Timeline flexible
- Hébergement: Hetzner VPS (EU)

**Légal/Éthique:**

- RGPD: Suppression de compte déjà implémentée
- Pré-modération prévue (posts → état vérification → validation admin)
- Boutons signalement à implémenter
- Hébergement EU compliant

**Système existant:**

- Système d'alias principal déjà en place (voir `auth.ts`)
- Hooks after middleware fonctionnels
- Base auth solide avec email/password + OAuth (GitHub, Google)

---

### Catégorie 1: Contraintes Techniques

#### Évaluation Faisabilité par Idée

**🟢 FACILES (Implémentation directe, <1 semaine):**

1. Système de catégories visibles - Table séparée + filtrage server-side
2. Templates guidés par catégorie - Conditional rendering + TanStack Form
3. Landing page 3 chemins - Routing + UI simple
4. Boutons signalement - Server action + flag DB
5. Messages ultra-courts - Copywriting/CSS
6. Bouton urgence 2x gros - CSS pure
7. Éliminations (compteurs/profils/search) - NE PAS implémenter = 0 effort
8. Bibliothèque témoignages - Section séparée, lecture seule

**🟡 MOYENNES (Quelques défis, 1-2 semaines):**

9. Architecture hybride Niveau 1+2 - Better Auth anonymous plugin + custom code generation
10. Floutage + avertissements - CSS + taxonomy + UI
11. Pré-modération workflow - Status states + dashboard admin
12. Catégories → suggestion sécurité - Logique conditionnelle
13. Conversion progressive session - Détection usage + migration

**🔴 COMPLEXES (>2 semaines ou post-MVP):**

14. Détection IA auto catégorie - API externe, coûts récurrents → **MVP PLUS TARD**
15. Architecture hybride Niveau 3 - Code + question secrète → **Post-MVP**
16. Landing immersive - Design custom, illustrations → **Sprint 3 optionnel**
17. Safe Spaces thématiques - Nécessite équipe modérateurs → **Post-MVP**

---

### Catégorie 2: Contraintes Ressources

**Horizon MVP:** ~6 semaines (3 sprints de 2 semaines)

**Capacité:** Solo dev temps plein = ~40h/semaine disponibles

**Priorisation basée sur:**

- Impact utilisateur (Marie/Thomas)
- Dépendances techniques
- Quick wins vs long-term investments

---

### Catégorie 3: Contraintes Légales/Éthiques

**RGPD - Compliant:**

- ✅ Suppression de compte implémentée
- ✅ Hébergement EU (Hetzner)
- ✅ Données sensibles (témoignages violence) = anonymisation par alias
- ⚠️ À ajouter: Politique de confidentialité + CGU

**Modération - Responsable:**

- ✅ Pré-modération prévue (posts status: pending → published)
- ✅ Signalement par utilisateurs prévu
- ✅ Dashboard admin pour review
- ⚠️ Guidelines modération à documenter

**Obligation de signalement:**

- ⚠️ Si contenu révèle crime en cours = zone grise légale
- Recommandation: Consulter avocat spécialisé
- MVP: Focus modération contenu toxique, pas responsabilité légale crime

---

### Catégorie 4: Contraintes Utilisateurs (Friction Adoption)

**Friction ACCEPTABLE:**

- Inscription simple pour Thomas (témoin) - pas en crise
- Sélection catégorie lors post - aide à structurer
- Templates guidés - supportent plutôt que freinent

**Friction INACCEPTABLE:**

- Inscription obligatoire pour Marie en crise → Session anonyme résout
- Codes secrets obligatoires → Opt-in résout
- Validation pré-publication avec attente → Status pending invisible aux autres mais visible à auteur résout

**Décisions validées minimisent friction:**

- Post First, Register Later
- Anonymat par défaut
- Upgrade progressif opt-in

---

### Matrice de Priorisation MVP

#### Critères de Priorisation

1. **Impact Utilisateur** (Répond aux besoins Marie/Thomas ?)
2. **Faisabilité Technique** (Effort dev solo)
3. **Dépendances** (Bloque d'autres features ?)
4. **Différenciation** (Unique à ParlonsViolence ?)

---

### 🎯 ROADMAP 3 SPRINTS (6 semaines)

---

## SPRINT 1 (Semaines 1-2): FONDATIONS CORE

**Objectif:** Utilisateurs peuvent poster avec catégories + sécurité de base

### Features Prioritaires Sprint 1

**1. Système de Catégories Visibles (PRIORITÉ #1 utilisateur)**

**Implémentation:**

- Table `categories` séparée (scalable)
- 5 catégories standard:
  - 🗣️ Témoignage Victime
  - 👁️ Témoignage Témoin
  - 🆘 Demande de Soutien
  - 💡 Ressources & Conseils
  - 🤝 Retour d'Expérience

**Schema DB:**

```sql
categories:
  - id
  - slug
  - name
  - icon
  - description
  - template_id (référence templates)
  - security_suggestion ("high", "medium", "none")
  - created_at

posts:
  - id
  - category_id (FK → categories)
  - user_id
  - content
  - status ("draft", "pending", "published", "rejected", "flagged")
  - blur_enabled (boolean)
  - blur_warnings (jsonb)
  - created_at
  - updated_at
```

**Effort estimé:** 3-5 jours

---

**2. Templates Guidés par Catégorie**

**Implémentation:**

- Conditional rendering selon category_id
- TanStack Form avec champs dynamiques
- Template "👁️ Témoignage Témoin":
  ```
  - Votre relation avec la personne: [select]
  - Depuis combien de temps: [text]
  - Changements observés: [textarea avec hint "Restez général"]
  - Avez-vous essayé d'en parler: [yes/no + details]
  - Que craignez-vous: [textarea]
  ```

**Effort estimé:** 2-3 jours

---

**3. Landing Page avec 3 Chemins Différenciés**

**Implémentation:**

- 3 boutons principaux avec routing:
  - 🆘 Crise → `/post/new` (anonymous session)
  - 💭 Témoin → `/sign-up` (registration)
  - 📚 Explorer → `/library` (no auth)
- Messages ultra-courts validés
- Bouton urgence 2x plus gros (CSS)
- Inclusion explicite: "Victimes, témoins, proches: vous êtes les bienvenus"

**Effort estimé:** 2-3 jours

---

**4. Décisions de Design - Éliminations**

**À NE PAS implémenter:**

- ❌ Compteurs (vues, likes, réponses)
- ❌ Profils publics consultables
- ❌ Recherche d'utilisateurs

**Ces décisions = 0 effort mais impact privacy majeur**

---

**5. UI/UX Basique**

- Messages rassurants ultra-courts
- Design calme (couleurs apaisantes)
- Mobile-first responsive
- Accessibilité (labels, focus states)

**Effort estimé:** 2-3 jours (parallèle autres tasks)

---

### Livrables Sprint 1

✅ MVP utilisable pour Marie et Thomas  
✅ Posting fonctionnel avec catégories  
✅ Landing page claire avec chemins différenciés  
✅ Templates guidés pour témoins  
✅ Protection privacy de base (éliminations)

**Effort total Sprint 1:** ~10-12 jours de dev

---

## SPRINT 2 (Semaines 3-4): MODÉRATION + SÉCURITÉ

**Objectif:** Espace sûr et modéré

### Features Prioritaires Sprint 2

**6. Pré-modération avec État de Vérification**

**Workflow confirmé:**

```
User poste
    ↓
Status: "pending" (invisible autres users, visible auteur)
    ↓
Notification admin (email + dashboard badge)
    ↓
Modérateur review dans admin panel
    ↓
Action: [Approuver] → "published" | [Rejeter] → "rejected"
    ↓
Si published → visible forum
Si rejected → invisible + notification optionnelle auteur
```

**Implémentation:**

- Posts status field (enum)
- Dashboard admin: liste posts pending
- Actions approve/reject (server functions)
- Email notifications modérateurs

**Effort estimé:** 3-5 jours

---

**7. Boutons Signalement Posts/Réponses**

**Implémentation:**

- Bouton "🚩 Signaler" visible sur chaque post/reply
- Modal avec raisons: victim-blaming, agression, spam, autre
- Server action → posts status "flagged"
- Dashboard admin: section "Posts signalés" avec priorité

**Effort estimé:** 2-3 jours

---

**8. Architecture Hybride Niveaux 1 + 2**

**Niveau 1: Session Rapide (Better Auth Anonymous)**

**Implémentation:**

- Ajouter `anonymous()` plugin à Better Auth config
- Bouton "🆘 J'ai besoin de parler maintenant" → `auth.api.signInAnonymous()`
- Alias principal auto-créé (hook existant réutilisé)
- Message après premier post: option upgrade vers code secret

**Effort estimé:** 2-3 jours

---

**Niveau 2: Code Secret Simple**

**Implémentation:**

- Génération code 3-mots depuis liste 1000 mots français positifs
- Fonction `generateSecretCode()`: "lune-calme-refuge"
- Stockage hash en DB (pas plaintext)
- UI: affichage code avec options sauvegarde (capture, copie, email avec warning)
- Page `/access` pour entrer code et retrouver posts

**Schema DB:**

```sql
anonymous_codes:
  - id
  - user_id (FK)
  - code_hash
  - created_at
  - last_used_at
```

**Effort estimé:** 3-4 jours

---

**9. Floutage + Avertissements Spécifiques (Version Simple)**

**Implémentation:**

- CSS blur sur contenu sensible
- 4-5 types d'avertissements standards:
  - Violence physique
  - Langage explicite
  - Mentions suicide
  - Violence sexuelle
  - Autre
- Posts table: `blur_warnings` (jsonb array)
- UI avant contenu flouté: checkboxes warnings + bouton "Voir le contenu"
- Qui décide: Modérateur lors review (auteur optionnel en v2)

**Effort estimé:** 3-4 jours

---

### Livrables Sprint 2

✅ Plateforme sécurisée et modérée  
✅ Anonymat renforcé (codes secrets)  
✅ Pré-modération active  
✅ Signalement fonctionnel  
✅ Protection lecteurs (floutage granulaire)

**Effort total Sprint 2:** ~13-16 jours de dev

---

## SPRINT 3 (Semaines 5-6): RAFFINEMENT UX

**Objectif:** Expérience optimale + features différenciantes

### Features Prioritaires Sprint 3

**10. Bibliothèque de Témoignages (Lecture Thérapeutique)**

**Implémentation:**

- Section `/library` ou `/temoignages`
- Filtrage par catégories
- Posts published uniquement
- Lecture seule (pas de compte requis)
- UI: cards avec extraits + "Lire le témoignage complet"

**Effort estimé:** 2-3 jours

---

**11. Catégories → Suggestion Sécurité Renforcée**

**Implémentation:**

- Logique conditionnelle: si category.security_suggestion === "high"
- Afficher message: "Pour ce type de contenu, nous recommandons Mode Sécurisé"
- Boutons: [Activer Code Secret] [Continuer Session Rapide]
- Non-intrusif, jamais forcé

**Effort estimé:** 1-2 jours

---

**12. Conversion Progressive Session → Compte**

**Implémentation:**

- Détection: nombre posts (>=3) OU durée usage (>=1 semaine)
- Message doux dans dashboard:

  ```
  "Vous êtes revenu(e) plusieurs fois. Cela nous touche.

  Créer un espace permanent ?
  - Pseudo personnalisé
  - Code secret multi-device
  - Brouillons sauvegardés

  [Créer mon espace] [Rester anonyme]"
  ```

- Migration session anonyme → compte registered

**Effort estimé:** 3-4 jours

---

**13. Landing Page Immersive (Optionnel)**

**Implémentation:**

- Design/illustrations calmes
- Témoignage anonymisé court (2-3 phrases)
- Ambiance > explication
- Non-bloquant si manque de temps

**Effort estimé:** 3-5 jours (optionnel)

---

**14. Polish UX Général**

- Affinage copy
- Animations subtiles
- Loading states
- Error handling gracieux
- Feedback utilisateur

**Effort estimé:** 2-3 jours

---

### Livrables Sprint 3

✅ MVP complet prêt pour premiers utilisateurs tests  
✅ Features différenciantes (bibliothèque, conversion progressive)  
✅ UX polie et empathique  
✅ Système de sécurité complet (3 niveaux)

**Effort total Sprint 3:** ~8-14 jours de dev

---

## Spécifications Techniques Clés

### Plugin Anonymous Better Auth - Utilisation Optimale

**Ajout à auth.ts:**

```typescript
import { anonymous } from "better-auth/plugins";

plugins: [
  username(),
  admin({
    defaultRole: "USER",
    adminRole: "ADMIN",
  }),
  anonymous(), // ← Ajouter ici
  tanstackStartCookies(),
],
```

**Placement Landing Page:**

- Bouton "🆘 J'ai besoin de parler maintenant"
- onClick: `await auth.api.signInAnonymous()`
- Session anonyme créée automatiquement
- Alias principal auto-créé (hook existant)
- Redirection: `/post/new`
- User peut poster immédiatement

**Upgrade vers Code Secret:**

- Après premier post, dans profil/dashboard
- Message: "Mode Session Rapide actif. Créer code secret ?"
- Bouton [Créer un code secret]
- Génération + affichage + options sauvegarde

---

### Structure DB Categories - Option A Validée

**Table categories:**

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

**Table posts:**

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

**Avantages:**

- Scalable (nouvelles catégories sans migration)
- Métadonnées riches (icône, template, suggestion sécurité)
- Évolution vers tags multiples possible

---

### Flow Pré-modération Confirmé

```
┌─────────────────────────────────────┐
│ User crée post                      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Status: "pending"                   │
│ - Invisible autres users            │
│ - Visible auteur (draft view)       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Notification admin                  │
│ - Email                             │
│ - Badge dashboard                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Modérateur review admin panel       │
│ - Lit contenu                       │
│ - Vérifie guidelines                │
└──────────────┬──────────────────────┘
               ↓
         ┌─────┴─────┐
         ↓           ↓
┌────────────┐  ┌────────────┐
│ Approuver  │  │ Rejeter    │
└─────┬──────┘  └─────┬──────┘
      ↓               ↓
┌────────────┐  ┌────────────┐
│ Status:    │  │ Status:    │
│ "published"│  │ "rejected" │
│            │  │            │
│ Visible    │  │ Invisible  │
│ forum      │  │ + notif    │
│            │  │ auteur     │
└────────────┘  └────────────┘
```

**États additionnels:**

- `draft`: Brouillon utilisateur (pas fini)
- `flagged`: Signalé par community (priority review)

---

## Décisions de Design Validées

### 1. Protection Privacy Radicale

**Éliminations stratégiques:**

- ❌ Pas de compteurs (vues, likes, réponses)
- ❌ Pas de profils publics consultables
- ❌ Pas de recherche d'utilisateurs

**Impact:**

- Différenciation forte vs autres forums
- Sécurité psychologique maximale
- Moins de code = MVP plus rapide
- Alignement total valeurs ParlonsViolence

---

### 2. Architecture "Post First, Register Later"

**Principe:** Trust Ladder progressive

**Flow Marie (crise):**

1. Landing → Bouton urgence
2. Session anonyme auto (Better Auth)
3. Post immédiat
4. Upgrade code secret (opt-in après)

**Flow Thomas (réflexion):**

1. Landing → Bouton témoin
2. Registration simple (pseudo + password)
3. Template guidé
4. Post avec catégorie

**Deux chemins, deux besoins, une plateforme**

---

### 3. Modération Trauma-Informed

**Principes:**

- Expression victime = PROTÉGÉE (floutée mais jamais supprimée)
- Agression envers autrui = SUPPRIMÉE immédiatement
- Modérateurs peuvent supprimer mais JAMAIS modifier (transparence)
- Pas de jugement sur ton/langage témoignage

**Formation modérateurs:**

- Guidelines accessibles dashboard admin
- Distinction "expression" vs "agression"
- Flowchart décision rapide

---

### 4. Floutage Granulaire

**Principe:** Content warnings spécifiques

**Types standard (MVP):**

1. Violence physique
2. Langage explicite
3. Mentions suicide
4. Violence sexuelle

**Qui décide:** Modérateur lors review (auteur optionnel v2)

**UI:** Checkboxes multiples avant contenu + bouton "Voir"

---

### 5. Codes Secrets - Format Validé

**Format:** 3 mots français positifs/neutres

**Exemples:**

- lune-calme-refuge
- étoile-jardin-thé
- livre-silence-doux

**Liste:** 1000 mots sélectionnés (éviter mots triggering/violents)

**Stockage:** Hash uniquement (pas plaintext)

**Récupération:** IMPOSSIBLE (sécurité maximale = zéro récupération)

---

## Métriques de Succès MVP

### Objectifs Mesurables (6 semaines post-lancement)

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

## Risques Identifiés et Mitigations

### Risque #1: Charge Modération Insoutenable

**Risque:** Solo dev ne peut pas modérer 24/7

**Mitigation:**

- Pré-modération réduit spam/trolls dès début
- SLA réaliste: review sous 24h (pas temps réel)
- Phase MVP: volume faible, gérable
- Long-term: recruter modérateurs communauté

---

### Risque #2: Abus Session Anonyme

**Risque:** Spam/trolls via sessions anonymes infinies

**Mitigation:**

- Rate limiting (X posts par session par jour)
- Pré-modération filtre abus
- IP tracking léger (détection mass spam, pas tracking user)
- Possibilité ban session anonyme si abus

---

### Risque #3: Perte Codes Secrets

**Risque:** Users perdent code, frustration

**Mitigation:**

- Warnings CLAIRS lors génération
- Options multiples sauvegarde (screenshot, copie, email)
- Accept: Certains perdront accès (prix anonymat max)
- Session Rapide reste disponible (pas obligation codes)

---

### Risque #4: Complexité Légale (RGPD, Signalement Crimes)

**Risque:** Zones grises légales témoignages violence

**Mitigation:**

- Consultation avocat spécialisé (recommandé avant lancement)
- CGU claires (plateforme ≠ service urgence)
- Politique confidentialité transparente
- Hébergement EU (Hetzner) = RGPD compliant
- Disclaimer: "Si danger immédiat, contactez [numéros urgence]"

---

## Prochaines Actions Immédiates

### Cette Semaine (Pré-Sprint 1)

1. **Setup technique:**
   - Finaliser schema DB (categories, posts, anonymous_codes)
   - Migrations Drizzle
   - Ajouter plugin anonymous Better Auth

2. **Design système:**
   - Liste 1000 mots français pour codes secrets
   - Définir 5 catégories standard (slug, name, icon, description)
   - Wireframes landing page 3 chemins

3. **Préparation légale:**
   - Rédiger CGU draft
   - Politique confidentialité draft
   - Liste numéros urgence (à afficher disclaimer)

---

### Semaine 1 Sprint 1 (Jours 1-5)

**Lundi-Mardi:** Système catégories (DB + UI + filtrage)

**Mercredi-Jeudi:** Templates guidés (conditional forms)

**Vendredi:** Landing page 3 chemins + messages courts

---

### Semaine 2 Sprint 1 (Jours 6-10)

**Lundi-Mardi:** Polish UI/UX landing + posting flow

**Mercredi-Jeudi:** Tests utilisateurs internes (simuler Marie/Thomas)

**Vendredi:** Déploiement staging + préparation Sprint 2

---

## Synthèse Finale Session

### Techniques Utilisées

1. **Role Playing (Jeux de Rôle)**
   - Persona Marie (Victime en crise)
   - Persona Thomas (Témoin hésitant)
   - 20 idées générées via empathie profonde

2. **SCAMPER Method**
   - 7 lentilles créatives appliquées
   - 11 idées/optimisations générées
   - Focus faisabilité MVP

3. **Constraint Mapping**
   - 4 catégories contraintes analysées
   - Distinctions réel vs perçu
   - Priorisation intelligente

---

### Total Idées Générées: 31

**Breakdown:**

- Role Playing: 20 idées
- SCAMPER: 11 idées
- Toutes mappées aux contraintes réelles
- Priorisées en 3 sprints (6 semaines)

---

### Décisions Stratégiques Clés

1. **Architecture hybride 3 niveaux** (Session/Code/Code+Q) - résout tension friction vs sécurité

2. **Système catégories PRIORITÉ #1** - légitimité utilisateurs (notamment témoins)

3. **Éliminations radicales** (compteurs/profils/search) - protection privacy différenciante

4. **Pré-modération responsable** - balance expression immédiate et sécurité collective

5. **Bibliothèque témoignages** - reconnaissance que LIRE aide autant que POSTER

---

### Impact Attendu

**Pour Marie (Victime en crise):**

- ✅ Post immédiat sans friction (session anonyme)
- ✅ Sécurité maximale (codes secrets opt-in)
- ✅ Expression authentique protégée (floutage, pas suppression)
- ✅ Espace gardé (modération visible)

**Pour Thomas (Témoin hésitant):**

- ✅ Légitimité explicite (catégorie dédiée)
- ✅ Template guidé (protection autrui via niveau détail calibré)
- ✅ Validation émotionnelle ("Vous n'êtes pas sûr ? C'est normal")
- ✅ Inscription OK (pas de friction excessive pour lui)

**Pour ParlonsViolence:**

- ✅ Différenciation forte (anonymat radical + modération trauma-informed)
- ✅ MVP faisable solo 6 semaines
- ✅ Fondations solides scalabilité future
- ✅ Alignement total valeurs éthiques

---

### Recommandations Finales

**Avant Lancement MVP:**

1. **Consultation légale** - Avocat spécialisé RGPD + responsabilité contenus sensibles

2. **Partenariats associations** - Numéros urgence, ressources, crédibilité

3. **Tests utilisateurs réels** - 5-10 personnes profil Marie/Thomas avant lancement public

4. **Plan modération** - Processus clairs, temps dédié quotidien, formation continue

5. **Métriques tracking** - Analytics respectueux privacy pour mesurer succès objectifs

---

**Croissance Post-MVP:**

1. **Équipe modération** - Recruter modérateurs formés trauma-informed

2. **Features avancées** - Tags multiples, IA détection catégorie, Safe Spaces thématiques

3. **Multilingue** - Expansion géographique avec respect contextes culturels

4. **Mobile app** - Native iOS/Android pour accessibilité maximale

5. **API partenaires** - Intégration associations, services soutien, recherche académique (avec consentement)

---

_Session complétée le 2026-01-06_

_Facilitatrice: Mary (Agent Analyst)_

_Participant: Dev-linux (Solo Developer, ParlonsViolence)_

_Durée: ~3 heures_

_Résultat: Roadmap complète 6 semaines + 31 idées priorisées + décisions stratégiques validées_
