---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "tss-explore-forum/_bmad-output/planning-artifacts/prd.md"
  - "tss-explore-forum/_bmad-output/planning-artifacts/architecture.md"
  - "tss-explore-forum/_bmad-output/planning-artifacts/epics.md"
  - "tss-explore-forum/_bmad-output/planning-artifacts/brainstorming-session-2026-01-06.md"
---

# UX Design Specification tss-explore-forum

**Author:** Dev-linux
**Date:** 2026-01-07

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

**tss-explore-forum** est un forum anonyme révolutionnaire conçu pour créer un espace sûr où les personnes affectées par la violence, l'abus ou la détresse peuvent s'exprimer librement et recevoir du soutien communautaire. L'approche "Post First, Register Later" inverse les paradigmes traditionnels pour éliminer toute friction lors de moments critiques.

### Target Users

**Utilisateur Primaire - Marie (Victime en Crise) :**

- Situation : 2h du matin, besoin urgent d'expression après traumatisme
- Besoins : Anonymat radical, accès immédiat, guidance bienveillante
- Contraintes : Stress cognitif, discrétion nécessaire, mobile uniquement

**Utilisateur Secondaire - Thomas (Témoin Bienveillant) :**

- Situation : Témoin d'abus, veut aider mais hésite sur l'approche
- Besoins : Templates guidés, catégories claires, protection d'autrui
- Contraintes : Peur de mal faire, besoin de structure

**Utilisateur Admin - Chloé (Modératrice Trauma-Informed) :**

- Situation : Professionnelle maintenant espace sûr
- Besoins : Outils modération empathiques, visibilité claire, process
- Contraintes : Charge émotionnelle, responsabilité communautaire

### Key Design Challenges

1. **Friction Zéro vs Protection :** Équilibrer accessibilité immédiate et sécurité communautaire
2. **Anonymat avec Continuité :** UX codes secrets simple mais secure
3. **Guidance Empathique :** Accompagner sans décourager ni infantiliser
4. **Modération Humaine :** Interface admin trauma-informed avec charge émotionnelle gérable

### Design Opportunities

1. **UX Trauma-Informed Pionnier :** Établir nouveau standard pour plateformes sensibles
2. **Langage Visuel Thérapeutique :** Couleurs apaisantes, typographie douce, micro-interactions calmantes
3. **Patterns Révélation Progressive :** Contrôle utilisateur sur exposition au contenu sensible
4. **Innovation "Post-First" :** Redéfinir UX d'onboarding pour situations de crise

## Core User Experience

### Defining Experience

**tss-explore-forum** est centré sur l'**"Expression Urgente Sans Barrière"** - permettre à quelqu'un en détresse de passer de "j'ai besoin de parler" à "mon message est en route vers des personnes bienveillantes" en moins de 2 minutes, sans aucune friction administrative ou cognitive.

L'expérience core = **Post Anonyme Immédiat** → Tout le reste (inscription, modération, communauté) soutient ce moment critique.

### Platform Strategy

**Web responsive mobile-first** optimisé pour usage tactile en situation de stress :

- Performance <2s critique pour Premier Post (contrainte NFR5)
- SSR (TanStack Start) pour rapidité de chargement
- Navigation clavier essentielle (WCAG 2.1 AA)
- Cache agressif pour interactions fluides
- Pas d'offline requis MVP, mais rapidité prioritaire absolue

### Effortless Interactions

**Zéro Friction Cognitive :**

- Session anonyme automatique (pas de popup/bannière/distraction)
- Guidance template douce apparaissant selon catégorie
- Auto-sauvegarde continue (jamais perdre contenu en cours)
- Confirmation apaisante post-soumission avec code secret
- Navigation intuitive même sous stress émotionnel

**Principe :** Éliminer toute charge cognitive supplémentaire quand l'utilisateur est déjà en surcharge émotionnelle.

### Critical Success Moments

1. **"Je peux vraiment parler ici"** (10 premières secondes) : Landing accueillante sans barrière
2. **"Je me sens accompagné(e)"** (sélection catégorie) : Template qui résonne et guide
3. **"C'est parti, plus seul(e)"** (soumission) : Confirmation + code secret rassurants
4. **"D'autres comprennent"** (première réponse) : Lecture de soutien bienveillant
5. **"Cet espace est sûr"** (modération visible) : Voir protection empathique active

**Transform** vulnérabilité en autonomisation à chaque étape.

### Experience Principles

1. **"Stress-Cognitive Aware"** : Jamais de choix complexes quand utilisateur en détresse
2. **"Bienveillance by Design"** : Chaque micro-interaction respire sécurité et empathie
3. **"Anonymat Rassurant"** : L'invisibilité = protection, pas isolement
4. **"Progression Douce"** : Du anonyme vers confiance, jamais l'inverse

## Desired Emotional Response

### Primary Emotional Goals

**Transformation de Vulnérabilité en Force Collective** - tss-explore-forum doit permettre aux utilisateurs de passer de l'isolement douloureux à la connexion empathique, transformant leur expérience difficile en source de force partagée.

**Marie** : "Je suis en sécurité ici, je peux enfin parler sans jugement"
**Thomas** : "Je sais comment aider sans risquer de faire du mal"
**Communauté** : "Nos expériences difficiles deviennent des lumières pour d'autres"

### Emotional Journey Mapping

1. **Découverte** : Soulagement + Espoir ("Enfin un espace qui comprend")
2. **Écriture** : Libération + Autonomisation ("Je peux vraiment dire ce qui m'arrive")
3. **Soumission** : Connexion + Confiance ("Des gens bienveillants vont me lire")
4. **En cas d'erreur** : Soutien maintenu ("L'erreur expliquée avec douceur")
5. **Retour d'usage** : Appartenance + Stabilité ("Mon refuge sûr est toujours là")

### Micro-Emotions

**États Émotionnels Prioritaires :**

- **Confiance > Méfiance** : Chaque micro-interaction rassure et sécurise
- **Espoir > Désespoir** : Le design respire la possibilité de s'en sortir
- **Appartenance > Isolement** : Anonymat qui relie au lieu de séparer
- **Autonomisation > Impuissance** : L'utilisateur garde contrôle complet
- **Sérénité > Anxiété** : Couleurs, rythme, langage apaisants

**Émotions à Éviter Absolument :** Exposition, Jugement, Complexité cognitive supplémentaire

### Design Implications

**Architecture Émotionnelle par Zone :**

- **Landing** → Accueil immédiat sans barrière (Sécurité)
- **Écriture** → Guidance douce + auto-save (Autonomisation)
- **Soumission** → Confirmation empathique + code secret "trésor" (Connexion)
- **Lecture** → Contrôle révélation contenu sensible (Respect limites)

**Choix UX pour Émotions :**

- **Palettes douces** (Sérénité) : Pas de rouge agressif, tons terre/pastel
- **Espacement généreux** (Respiration) : Jamais de densité oppressante
- **Micro-copy chaleureux** (Bienveillance) : Chaque message respire l'empathie
- **Contrôles utilisateur** (Autonomisation) : Choix permanents sur exposition

### Emotional Design Principles

1. **"Vulnérabilité = Force"** : Le design honore le courage de partager
2. **"Anonymat Connecté"** : Invisible mais jamais seul
3. **"Douceur Constante"** : Même les erreurs sont traitées avec empathie
4. **"Contrôle Utilisateur"** : Jamais d'exposition forcée ou de surprise négative

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Signal (Sécurité + Simplicité) :**

- **Force UX** : Communication sécurisée sans compromis sur simplicité
- **Pattern clé** : Interface familière + sécurité invisible en arrière-plan
- **Applicable** : Session anonyme sécurisée sans complexité utilisateur

**Notes Smartphone (Accès Immédiat) :**

- **Force UX** : Capture instantanée de pensées sans aucune barrière
- **Pattern clé** : Zéro onboarding, auto-save permanent, sync transparent
- **Applicable** : Premier post Marie sans inscription préalable

**Headspace (Calme Intentionnel) :**

- **Force UX** : Interface apaisante supportant état émotionnel vulnérable
- **Pattern clé** : Couleurs douces, progression respectueuse, langage bienveillant
- **Applicable** : Design émotionnellement sûr pour utilisateurs en détresse

### Transferable UX Patterns

**Navigation Patterns :**

- **"Accès Direct"** → Session anonyme immédiate pour Marie (urgence 2h)
- **"Liste Simple + Détail"** → Découverte publications sans surcharge cognitive

**Interaction Patterns :**

- **"Auto-Save Permanent"** → Jamais perdre contenu émotionnellement coûteux
- **"Guidance Progressive"** → Templates empathiques adaptés à catégories sensibles
- **"Contrôle Utilisateur"** → Révélation contenu sensible uniquement si choisi

**Visual Patterns :**

- **"Calme Intentionnel"** → Palettes terre/pastel, espacement généreux
- **"Familiarité Rassurante"** → Pas d'innovation déstabilisante sous stress

### Anti-Patterns to Avoid

**Friction d'Onboarding :** Création compte complexe (Marie abandonnera)
**Métriques Sociales Visibles :** Conflits avec anonymat et objectifs émotionnels
**Notifications Agressives :** Stress supplémentaire pour utilisateurs vulnérables
**Rouge pour Actions Importantes :** Couleur d'alarme incompatible avec empathie
**Pop-ups Interruptifs :** Charge cognitive sous stress émotionnel déjà élevé

### Design Inspiration Strategy

**À Adopter Directement :**

- Pattern "Accès Direct" (Notes) pour éliminer friction Premier Post
- Interface "Familière" (Signal) pour rassurer sous stress

**À Adapter pour Notre Contexte :**

- "Guidance Progressive" (Duolingo) → Templates empathiques pas gamifiés
- "Sécurité Invisible" (Signal) → Anonymat protecteur pas anxiogène

**À Éviter Absolument :**

- Métriques de performance sociale → Conflit avec philosophie anonymat
- Couleurs/language agressifs → Opposé aux objectifs de sérénité

## Design System Foundation

### Design System Choice

**Shadcn/UI + Tailwind CSS** sélectionné comme fondation pour tss-explore-forum.

Approche hybride combinant composants éprouvés Shadcn avec flexibilité Tailwind pour customisation empathique.

### Rationale for Selection

**Alignement Architectural :** Déjà intégré dans stack TanStack Start prévu
**Rapidité MVP :** Composants copy-paste réduisent timeline développement
**Customisation Émotionnelle :** Tailwind optimal pour palettes terre/pastel apaisantes
**Accessibilité Intégrée :** WCAG 2.1 AA built-in répond aux NFR8
**Performance :** Léger et optimisé SSR pour contrainte <2s (NFR5)
**Simplicité Maintenance :** Pas de dépendances complexes, équipe réduite

### Implementation Approach

**Phase 1 - Fondation (Sprint 1) :**

- Configuration Tailwind avec palette empathique personnalisée
- Installation composants Shadcn core : Button, Input, Card, Modal
- Définition tokens design pour cohérence émotionnelle

**Phase 2 - Customisation (Sprint 2) :**

- Adaptation composants pour micro-interactions apaisantes
- Implémentation patterns révélation progressive contenu sensible
- Tests accessibilité navigation clavier complète

### Customization Strategy

**Palette Empathique :**

- Couleurs primaires : Tons terre doux (beige, taupe clair)
- Couleurs secondaires : Pastels apaisants (vert sage, bleu poudré)
- Élimination rouge agressif : Remplacé par oranges doux pour alertes

**Composants Spécialisés :**

- "Gentle Button" : Bordures arrondies, transitions douces
- "Content Blur" : Révélation progressive contenu sensible
- "Empathy Cards" : Espacement généreux, ombres subtiles

**Micro-interactions :**

- Transitions lentes (300ms+) pour éviter stress
- Feedback haptic subtil sur mobile
- Loading states apaisants (pas de spinners agressifs)

## Visual Design Foundation

### Color System

**Système OKLCH Existant - Perception Humaine Optimisée**

Votre implementation utilise l'espace colorimétrique OKLCH avancé, garantissant :

- Perception uniforme des couleurs sur tous écrans
- Contraste accessible automatique light/dark
- Cohérence empathique mathématiquement précise

**Couleurs Clés Analysées :**

- `primary`: oklch(0.5854 0.2041 277.1173) → Violet doux, apaisant
- `destructive`: oklch(0.6368 0.2078 25.3313) → Orange tempéré (pas rouge agressif)
- `muted`: oklch(0.9232 0.0026 48.7171) → Beige ultra-doux backgrounds

**Alignement Empathique :** ✅ Parfait pour objectifs sérénité

### Typography System

**Stack Existant Analysé - Optimal pour Contenu Sensible**

**Primary: Plus Jakarta Sans Variable**

- Humaniste moderne, moins corporate qu'Inter
- Variable font = performance + flexibilité
- Excellent pour UI empathique

**Reading: Lora Variable**

- Serif empathique pour contenu émotionnel long
- Variable weight pour hiérarchie douce
- Optimal lecture posts sensibles

**Mono: Roboto Mono Variable**

- Clean pour codes secrets, metadata

**Assessment:** Votre choix typo **supérieur** à mes recommandations initiales !

### Spacing & Layout Foundation

**Système Existant - "Douceur Mathématique"**

**Border Radius:** `1.25rem` → Douceur visuelle extrême ✅
**Shadows:** Subtiles avec opacité réduite → Pas de brutalité ✅  
**Transitions:** `0.2s ease` → Adaptable pour versions plus lentes ✅

**Recommandation :** Ajouter variables `--transition-gentle` pour interactions sensibles

### Accessibility Considerations

**OKLCH + Variables CSS :** Support excellent light/dark automatique
**Focus States :** `--ring` défini pour navigation clavier
**Semantic Tokens :** Mapping destructive/accent approprié
**Performance :** Variable fonts optimisées chargement

**Status :** Foundation accessibility-ready ✅

## 2. Core User Experience

### 2.1 Defining Experience

**"Expression Urgente Sans Barrière"** - Transformation en moins de 2 minutes de douleur silencieuse en message partagé vers communauté bienveillante.

**Flow Core :** Utilisateur en détresse → Landing accueillante → Session anonyme auto → Choix catégorie → Template empathique → Écriture guidée → Soumission → Code secret + confirmation rassurante → Sentiment connection.

**L'Interaction Signature :** Ce que les utilisateurs décrivent = "Il y a un endroit où tu peux vraiment dire ce qui t'arrive, anonymement, et des gens bienveillants vont te lire."

### 2.2 User Mental Model

**Marie (Détresse) Mental Model :**

- **Expectation :** Simplicité Notes smartphone pour partage émotionnel
- **Fear :** Exposition identité liée à vulnérabilité
- **Hope :** Connexion humaine sans jugement

**Thomas (Témoin) Mental Model :**

- **Expectation :** Guidance pour aider sans nuire
- **Need :** Structure pour réponse empathique appropriée

**Solutions Actuelles Référence :**

- **Adorent :** Notes (instantané), Signal (anonymat)
- **Détestent :** Facebook (exposition), forums complexes
- **Workarounds :** Écriture privée puis effacement

### 2.3 Success Criteria

**Critères "Ça Marche" :**

1. **"C'est vraiment anonyme"** : Zéro donnée perso visible
2. **"Je peux tout dire"** : Interface accueille vulnérabilité
3. **"C'est parti vers bienveillance"** : Confirmation rassurante modération
4. **"Je retrouve mes messages"** : Code secret cross-device fonctionnel
5. **"Vitesse fulgurante"** : <2 minutes landing → confirmation

**Métriques Succès :**

- Taux complétion Premier Post >90%
- Temps Landing → Soumission <2 minutes
- Retour usage codes secrets >60%

### 2.4 Novel UX Patterns

**Patterns Novel Différenciants :**

- **"Session Anonyme Auto"** : Zéro friction inscription, direct à écriture
- **"Code Secret Visuel"** : Post-it mental remplace compte traditionnel
- **"Floutage Empathique"** : Révélation douce contenu sensible

**Métaphores Familières :**

- **Notes smartphone** (simplicité interface)
- **Post-it** (codes secrets mémorables)
- **Voile protecteur** (floutage bienveillant)

**Patterns Établis Conservés :**

- Interface liste/détail familière
- Formulaires simples reconnaissables
- Confirmations standard rassurantes

### 2.5 Experience Mechanics

**1. Initiation :**

- **Trigger :** Landing "Partager anonymement" immédiatement visible
- **Invitation :** "Votre voix compte. Partagez en sécurité."

**2. Interaction :**

- **Flow :** Session auto → Catégorie → Template → Écriture guidée
- **Controls :** Tactile mobile, auto-save permanent, navigation intuitive
- **Feedback :** Guidance douce + confirmation anonymat constante

**3. Response System :**

- **Succès :** Barre progression apaisante, encouragements
- **Erreur :** Empathie, jamais blame, solutions douces
- **Working :** "Votre message est en sécurité" + auto-save visible

**4. Completion :**

- **Confirmation :** "Votre message va vers modérateurs bienveillants"
- **Code Secret :** "Voici votre clé : [CODE] (sauvegardez-la)"
- **Transition :** "Explorez d'autres expériences si vous souhaitez"
