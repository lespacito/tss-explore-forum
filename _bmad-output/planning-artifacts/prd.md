---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - _bmad-output/analysis/brainstorming-session-2026-01-06.md
workflowType: "prd"
lastStep: 11
briefCount: 0
researchCount: 0
brainstormingCount: 1
projectDocsCount: 0
---

# Product Requirements Document - tss-explore-forum

**Author:** Dev-linux
**Date:** 2026-01-07

## Executive Summary

Le projet 'ParlonsViolence' vise à créer un forum de soutien anonyme et sécurisé pour les sujets sensibles comme la violence et la détresse psychologique. Il répond à un double besoin : permettre aux victimes en crise de s'exprimer immédiatement sans la barrière de l'inscription (persona 'Marie'), et offrir aux témoins hésitants un espace légitime et guidé pour demander de l'aide (persona 'Thomas').

### What Makes This Special

- **Architecture "Post First, Register Later"**: Inverse le modèle de forum classique pour un accès immédiat en cas de crise.
- **Confidentialité Radicale**: Élimine les profils publics, la recherche d'utilisateurs et les métriques sociales pour maximiser la sécurité.
- **Modération "Trauma-Informed"**: Protège l'expression authentique en floutant les contenus sensibles plutôt qu'en les supprimant systématiquement.
- **Parcours Utilisateurs Différenciés**: Offre des expériences sur mesure pour les victimes et les témoins.
- **Identité Anonyme Améliorée**: Propose un système de "code secret" optionnel pour maintenir l'anonymat sur plusieurs appareils.

## Project Classification

**Technical Type:** web_app
**Domain:** healthcare
**Complexity:** high
**Project Context:** Greenfield - new project

## Success Criteria

### User Success

Le succès pour l'utilisateur est atteint lorsque l'expérience est fluide, sécurisante et répond à leur besoin émotionnel critique.

- **UX :** Le temps moyen pour un premier post par un utilisateur en crise (persona Marie) est inférieur à 3 minutes.
- **Engagement :** Au moins 30% des utilisateurs reviennent sur la plateforme.
- **Adoption :** Au moins 20% des utilisateurs engagés adoptent le système de "code secret" pour une sécurité renforcée.
- **Feedback Qualitatif :** Les retours des utilisateurs sont positifs concernant le sentiment de sécurité et d'anonymat.

### Business Success

Le succès pour le projet (la "mission") se mesure par sa capacité à créer et maintenir un espace sûr et actif.

- **Croissance de la communauté :** Atteindre au moins 50 posts publiés et 20 utilisateurs actifs dans les 6 semaines suivant le lancement.
- **Pertinence du contenu :** Plus de 60% des posts sont correctement classés dans les catégories par les utilisateurs, indiquant une bonne compréhension de la plateforme.
- **Impact :** La "bibliothèque de témoignages" contient au moins 10 récits, prouvant sa valeur en tant qu'outil de guérison passif.

### Technical Success

La plateforme doit être fiable, performante et sécurisée.

- **Sécurité :** 0 violation de données ou de confidentialité.
- **Performance de la Modération :** Le temps moyen de revue d'un post par l'équipe de modération est inférieur à 2 heures.
- **Fiabilité :** La plateforme maintient un temps de disponibilité (uptime) de 99.9%.
- **Qualité de la Modération :** Moins de 5% des posts sont rejetés après publication, indiquant une bonne qualité des soumissions et un bon guidage des utilisateurs.

### Measurable Outcomes

- **Taux de retour utilisateur :** > 30%
- **Taux d'adoption du "code secret" :** > 20%
- **Temps de modération moyen :** < 2 heures

## Product Scope

### MVP - Minimum Viable Product

Le MVP se concentre sur la mise en place des fondations sécurisées et des parcours utilisateurs critiques, correspondant aux **Sprints 1 et 2** de la roadmap.

- **Core Features :** Système de catégories visibles, templates guidés par catégorie, landing page avec 3 chemins (crise, témoin, exploration).
- **Sécurité et Modération :** Workflow de pré-modération, boutons de signalement, architecture d'anonymat (session rapide + code secret), et système de floutage des contenus sensibles.
- **Décisions de Design Clés :** Élimination des compteurs sociaux, des profils publics et de la recherche d'utilisateurs.

### Growth Features (Post-MVP)

Après le MVP, l'accent sera mis sur l'amélioration de l'expérience utilisateur et l'enrichissement de l'écosystème, correspondant au **Sprint 3** et aux idées "Post-MVP".

- **Amélioration de l'UX :** Mise en place de la "Bibliothèque de Témoignages" pour la lecture thérapeutique, suggestions contextuelles pour renforcer la sécurité, et conversion progressive des sessions anonymes en comptes permanents.
- **Design :** Potentiellement une landing page plus immersive.

### Vision (Future)

La vision à long terme est de faire de ParlonsViolence une ressource de premier plan et un écosystème de soutien complet.

- **Équipe :** Recruter et former une équipe de modérateurs "trauma-informed".
- **Fonctionnalités Avancées :** Tags multiples, détection de catégories par IA, "Safe Spaces" thématiques.
- **Expansion :** Support multilingue et potentiellement une application mobile native.
- **Partenariats :** Intégration avec des associations, des services de soutien et la recherche académique (avec consentement).

## User Journeys

### Parcours 1 : Marie - L'Expression d'Urgence

**Scène d'ouverture :** Il est 2h du matin. Marie est en larmes, secouée par une dispute violente. La peur et l'isolement sont immenses. Sur son téléphone, en navigation privée, elle tape "aide violence anonyme" et tombe sur ParlonsViolence. Son cœur bat fort ; elle a désespérément besoin de parler, mais la terreur d'être retrouvée la paralyse.

**Montée de l'action :** La page d'accueil est simple et calme. Un grand bouton se démarque : "🆘 J'ai besoin de parler maintenant". C'est exactement ce qu'elle ressent. Elle clique, et à son grand soulagement, elle n'a pas à créer de compte. Un simple éditeur de texte apparaît. Tremblante, elle écrit son histoire, vidant son sac de douleur et de peur.

**Climax :** Après une longue hésitation, elle appuie sur "Publier". Instantanément, son message apparaît, accompagné d'une note discrète : "Votre message est sauvegardé et sera bientôt visible après une rapide vérification de sécurité." Un poids énorme quitte ses épaules. Le simple fait d'avoir écrit et envoyé est une victoire. On lui propose alors un "code secret" de trois mots pour qu'elle puisse retrouver son message plus tard, si elle le souhaite.

**Résolution :** Le lendemain, avec une appréhension mêlée d'espoir, elle utilise son code secret pour revenir. Son message est là, visible, bien que flouté pour les autres. Et en dessous, il y a une réponse. Un simple "Nous vous entendons. Vous n'êtes pas seule." C'est le début d'un chemin. Pour la première fois depuis des heures, elle respire un peu plus librement.

### Parcours 2 : Thomas - Le Témoin Guidé

**Scène d'ouverture :** C'est dimanche soir, et Thomas est rongé par l'inquiétude pour sa collègue, Sophie. Les bleus qu'elle cache, son anxiété... il suspecte une situation de violence mais se sent impuissant et illégitime. Que faire ? Comment aider sans envenimer les choses ? Il cherche sur Google et trouve ParlonsViolence, hésitant à cliquer, se demandant s'il a sa place ici.

**Montée de l'action :** La page d'accueil le surprend. Un chemin est clairement pour lui : "💭 Je cherche des conseils pour aider quelqu'un". Ce simple message valide son besoin. Il clique. On lui propose une inscription rapide avec un simple pseudo, ce qui lui convient. Une fois inscrit, il choisit la catégorie "👁️ Témoignage Témoin" pour son message, et sent qu'il est au bon endroit.

**Climax :** Au lieu d'une page blanche angoissante, un formulaire structuré apparaît. Des questions le guident : "Quelle est votre relation avec la personne ?", "Quels changements avez-vous observés ?". Des conseils discrets lui rappellent de ne pas donner de détails identifiants. Guidé et rassuré, il écrit son post. Le template l'aide à formuler ses pensées de manière constructive et sécuritaire. Il publie, se sentant enfin proactif au lieu d'être un spectateur impuissant.

**Résolution :** Le lendemain, il consulte les réponses. D'autres témoins partagent leurs expériences ; des modérateurs le remercient pour sa vigilance et lui offrent des conseils concrets et prudents. Thomas a transformé son angoisse en un plan d'action. Il n'est plus seul face à son inquiétude.

### Parcours 3 : Chloé - La Gardienne de l'Espace Sûr

**Scène d'ouverture :** Chloé, une modératrice volontaire, se connecte à son tableau de bord. Sa mission : une heure de veille pour protéger la communauté. Elle voit immédiatement deux files d'attente : "5 Nouveaux Messages en Attente" et "1 Message Signalé (Prioritaire)".

**Montée de l'action :** Elle commence par le message signalé. Un utilisateur a rapporté une réponse pour "victim-blaming" (culpabilisation de la victime). Elle lit la réponse : "Tu es sûre que tu n'as pas un peu provoqué ?". C'est une violation claire des règles. Sur son interface, à côté du commentaire, elle a des options claires : "Approuver", "Supprimer", "Bannir l'utilisateur".

**Climax :** Chloé clique sur "Supprimer". Une fenêtre de confirmation apparaît, lui proposant d'envoyer un avertissement standard à l'auteur. Elle valide. En deux clics, le contenu toxique a disparu. Elle passe ensuite à un témoignage brut en attente. Le système a déjà suggéré de le "flouter". Chloé confirme que le post respecte les règles, valide la suggestion, et l'approuve.

**Résolution :** En fin de session, Chloé a traité tous les messages. Elle a protégé l'expression d'une victime tout en la masquant, et elle a épuré la conversation d'un commentaire nuisible. Elle se déconnecte, sachant qu'elle a contribué à maintenir l'équilibre fragile qui fait de ParlonsViolence un véritable refuge.

### Résumé des Exigences Révélées par les Parcours

- **Accueil et Publication :** Sessions anonymes instantanées, parcours d'accueil différenciés (crise vs. témoin), éditeurs de texte simples, et templates de publication guidés.
- **Interaction et Communauté :** Catégories de contenu visibles, système de "code secret" pour une continuité anonyme, et une distinction claire dans la modération entre le floutage du contenu original et la suppression des réponses nuisibles.
- **Modération et Sécurité :** Un tableau de bord de modération dédié, des files d'attente de contenu (en attente, signalés), des actions de modération en un clic, des directives de modération intégrées, et des modèles de communication pré-rédigés.

## Domain-Specific Requirements

### Healthcare / Wellness Compliance & Regulatory Overview

"ParlonsViolence" opère dans le domaine sensible du soutien à la santé mentale et au bien-être. Bien qu'il ne s'agisse pas d'un dispositif médical, le projet adhère à des principes stricts pour garantir la sécurité des utilisateurs et la conformité légale, notamment avec le RGPD. L'approche est "la confidentialité par le design" (privacy by design).

### Key Domain Concerns

- **Confidentialité des Données (RGPD) :** La protection des données des utilisateurs est la priorité absolue. L'anonymat est au cœur de la conception pour minimiser la collecte de données personnelles.
- **Sécurité des Utilisateurs :** La plateforme doit être un refuge. Des mécanismes sont en place pour protéger les utilisateurs contre les contenus re-traumatisants et les interactions nuisibles.
- **Responsabilité Légale :** La plateforme doit définir clairement ses limites et responsabilités, en particulier le fait qu'elle n'est pas un service d'urgence.

### Compliance Requirements

- **Conformité RGPD :**
  - **Hébergement :** L'application sera hébergée en Europe (Hetzner) pour se conformer aux lois sur la souveraineté des données.
  - **Anonymisation :** Le système d'alias et de "codes secrets" est conçu pour éviter de stocker des informations personnelles identifiables.
  - **Droit à l'oubli :** Une fonctionnalité de suppression de compte est requise.
  - **Politique de Confidentialité :** Un document clair expliquant les données collectées (le minimum possible) et leur utilisation doit être accessible.

### Safety Measures

- **Modération "Trauma-Informed" :** Les témoignages bruts sont floutés (non supprimés) pour préserver l'authenticité, tandis que les réponses agressives ou culpabilisantes sont supprimées.
- **Pré-modération :** Tous les nouveaux messages passent par une file d'attente de vérification avant d'être visibles publiquement.
- **Signalement :** Les utilisateurs disposent d'outils pour signaler tout contenu ou comportement inapproprié.

### Liability & Legal Boundaries

- **Conditions Générales d'Utilisation (CGU) :** Des CGU doivent être rédigées et accessibles, stipulant clairement que la plateforme n'est pas un service médical ou d'urgence.
- **Avertissement (Disclaimer) :** La plateforme affichera visiblement des avertissements et redirigera les utilisateurs en danger immédiat vers de véritables services d'urgence.
- **Consultation Légale :** Il est fortement recommandé de consulter un avocat spécialisé avant le lancement pour valider l'approche légale et la gestion des responsabilités.

## Innovation & Novel Patterns

### Detected Innovation Areas

- **Architecture "Post First, Register Later" :** Le projet inverse le paradigme d'inscription classique. Pour les utilisateurs en crise, l'expression précède l'identité, ce qui est une innovation fondamentale en matière d'accessibilité pour les services de soutien en ligne.
- **Confidentialité par Soustraction ("Radical Privacy") :** Plutôt que d'ajouter des fonctionnalités de confidentialité, le projet en retire délibérément (profils publics, recherche d'utilisateurs, métriques sociales). Cette approche minimaliste est une innovation qui place la sécurité psychologique au-dessus de l'engagement superficiel.
- **Modération "Trauma-Informed" :** Le système fait une distinction nuancée entre le _contenu_ d'un témoignage (qui est protégé et flouté) and le _comportement_ d'un utilisateur (qui peut être sanctionné par une suppression). C'est une innovation dans la gouvernance des communautés en ligne sensibles.
- **Parcours Utilisateurs Duaux :** La conception de flux d'accueil radicalement différents pour les victimes en crise ("Marie") et les témoins hésitants ("Thomas") constitue une innovation en matière de conception d'expérience utilisateur empathique et ciblée.

### Validation Approach

La validation de ces innovations reposera sur l'atteinte des "Critères de Succès" définis précédemment.

- **Validation de "Post First" :** Mesurée par la métrique de l'UX utilisateur, visant un temps de premier post inférieur à 3 minutes pour les utilisateurs en crise.
- **Validation de la "Confidentialité Radicale" :** Mesurée par le feedback qualitatif des utilisateurs sur leur sentiment de sécurité et d'anonymat.
- **Validation de la Modération et des Parcours Duaux :** Mesurée par un faible taux de rejet de posts (<5%) et un taux d'adoption élevé des catégories par les utilisateurs (>60%), indiquant que les utilisateurs se sentent compris et bien guidés.

### Risk Mitigation

Les risques associés à ces innovations sont principalement liés aux abus potentiels de l'anonymat.

- **Risque :** Abus des sessions anonymes (spam, trolling).
- **Mitigation :** Le risque est géré par la pré-modération de tous les nouveaux messages, un rate-limiting potentiel par session, et la possibilité pour l'équipe de modération de bannir une session anonyme si nécessaire.

## Web App Specific Requirements

### Architecture & Design Philosophy

L'application sera développée en tant qu'**Application Multi-Pages (MPA)**, en utilisant TanStack Start avec rendu côté serveur (SSR). Cette approche est choisie pour privilégier la performance au premier chargement et optimiser le référencement naturel (SEO), deux aspects critiques du projet. La philosophie de design est "mobile-first", "calme" et "empathique".

### Browser Support Matrix

Le support officiel est assuré pour les dernières versions des navigateurs suivants. La priorité absolue est donnée aux navigateurs mobiles.

- Google Chrome (Mobile & Desktop)
- Mozilla Firefox (Mobile & Desktop)
- Apple Safari (Mobile & Desktop)
- Microsoft Edge (Desktop)

### Responsive Design

Une approche **"mobile-first"** est fondamentale. L'expérience doit être optimale sur un appareil mobile, où les utilisateurs comme Marie et Thomas sont les plus susceptibles d'accéder à la plateforme pour la première fois. Toutes les fonctionnalités doivent être conçues d'abord pour un petit écran, puis adaptées aux écrans plus grands.

### SEO Strategy

Le référencement naturel est une **priorité critique** pour le produit. Le succès de la plateforme dépend de sa capacité à être découverte par des utilisateurs vulnérables via des moteurs de recherche. L'architecture MPA, la sémantique HTML, et la génération de métadonnées appropriées seront des points d'attention majeurs.

### Real-time & Performance Targets

Les fonctionnalités en **temps-réel (via WebSockets) ne font pas partie du périmètre du MVP**. Les notifications de réponse seront gérées de manière asynchrone. L'objectif de performance pour le MVP est d'assurer des temps de chargement rapides et une expérience utilisateur fluide et réactive, sans la complexité additionnelle du temps-réel.

### Accessibility Level

L'accessibilité est une **exigence fondamentale et non-négociable**.

- **Objectif :** Atteindre au minimum le niveau **WCAG 2.1 AA**.
- **Points clés :** Hauts contrastes de couleurs, navigation complète au clavier, compatibilité avec les lecteurs d'écran, et sémantique HTML correcte pour assurer une expérience utilisable et digne pour tous.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

- **Approche MVP :** L'approche est un hybride entre un **"Problem-Solving MVP"** et un **"Experience MVP"**. L'objectif est de résoudre le problème fondamental de l'expression en situation de crise (pour Marie) et du besoin de guidance (pour Thomas), tout en garantissant une expérience utilisateur exceptionnellement sûre, anonyme et empathique dès le premier jour.
- **Ressources :** Le périmètre est conçu pour être réalisable par un **développeur solo** sur une période de 6 semaines (3 sprints de 2 semaines).

### MVP Feature Set (Phase 1)

Le MVP correspond aux **Sprints 1 et 2** de la roadmap définie dans le brainstorming.

- **Parcours Utilisateurs Essentiels Supportés :**
  - Le parcours complet de **Marie** (victime en crise) : publication anonyme immédiate.
  - Le parcours complet de **Thomas** (témoin) : inscription guidée et publication.
  - Le parcours de base de **Chloé** (modératrice) : revue et action sur les posts.

- **Fonctionnalités Indispensables ("Must-Have") :**
  - **Fondations :** Landing page avec 3 chemins, système de catégories visibles, templates de publication guidés.
  - **Sécurité & Anonymat :** Architecture "Post First" avec sessions anonymes, système de "code secret" pour la continuité.
  - **Modération :** Workflow de pré-modération (statuts "pending"), boutons de signalement, et système de floutage des contenus.
  - **Design :** Élimination des profils publics, des compteurs sociaux et de la recherche d'utilisateurs.

### Post-MVP Features

- **Phase 2 (Post-MVP / Croissance) :**
  - Cette phase correspond au **Sprint 3** de la roadmap.
  - Mise en place de la **"Bibliothèque de Témoignages"** pour la lecture thérapeutique.
  - Amélioration de l'UX avec des suggestions contextuelles pour la sécurité et la conversion progressive des comptes.
  - Potentiellement, une landing page plus immersive.

- **Phase 3 (Expansion / Vision) :**
  - **Équipe :** Recruter et former une équipe de modération "trauma-informed".
  - **Fonctionnalités :** Tags multiples, détection de catégories par IA, "Safe Spaces" thématiques.
  - **Plateforme :** Expansion multilingue et développement d'une application mobile native.

### Risk Mitigation Strategy

- **Risque Technique (Abus de l'anonymat) :**
  - **Mitigation :** Le risque d'abus (spam, trolling) des sessions anonymes est géré par la **pré-modération systématique**, un **rate-limiting** potentiel, et la capacité pour les modérateurs de bannir des sessions.
- **Risque Marché (Charge de modération) :**
  - **Mitigation :** Pour un développeur solo, la charge peut être lourde. Le MVP part du principe d'un **volume faible au lancement**, gérable avec un SLA de revue de 24h. Le recrutement d'une équipe est une étape clé de la phase de croissance.
- **Risque Légal (Responsabilité) :**
  - **Mitigation :** Le risque est géré par des **CGU claires** et des **avertissements** indiquant que la plateforme n'est pas un service d'urgence, et par la **recommandation forte de consulter un avocat** avant le lancement.

## Functional Requirements

### Gestion des Utilisateurs et de l'Anonymat

- **FR1 :** Un **utilisateur invité (comme Marie)** peut soumettre une publication sans créer de compte.
- **FR2 :** Un **utilisateur anonyme** peut recevoir un "code secret" unique après sa première publication.
- **FR3 :** Un **utilisateur anonyme** peut utiliser son "code secret" pour retrouver ses publications précédentes sur différents appareils.
- **FR4 :** Un **utilisateur (comme Thomas)** peut s'inscrire en utilisant un pseudonyme, un email et un mot de passe.
- **FR5 :** Un **utilisateur enregistré** peut se connecter et se déconnecter.
- **FR6 :** Un **utilisateur enregistré** peut supprimer son compte et toutes ses données associées.

### Création et Interaction de Contenu

- **FR7 :** Un **utilisateur** peut créer une nouvelle publication (un "post").
- **FR8 :** Un **utilisateur** peut choisir une catégorie visible pour sa publication parmi une liste prédéfinie.
- **FR9 :** Le **système** affiche un template de publication guidé basé sur la catégorie choisie.
- **FR10 :** Un **utilisateur** peut écrire et formater le contenu de sa publication.
- **FR11 :** Un **utilisateur** peut soumettre une publication pour modération.
- **FR12 :** Un **utilisateur** peut écrire une réponse à une publication existante.
- **FR13 :** Un **utilisateur** peut signaler une publication ou une réponse comme étant inappropriée.

### Découverte et Consommation de Contenu

- **FR14 :** Un **utilisateur** peut voir une liste de publications publiées.
- **FR15 :** Un **utilisateur** peut filtrer les publications par catégorie.
- **FR16 :** Le **système** affiche un avertissement pour le contenu sensible et le floute par défaut.
- **FR17 :** Un **utilisateur** peut choisir de "voir le contenu" pour révéler un message flouté.
- **FR18 :** Un **utilisateur** peut lire une publication et toutes ses réponses.
- **FR19 :** Le **système** n'affiche aucune métrique sociale (likes, nombre de vues, etc.).

### Modération et Sécurité

- **FR20 :** Un **modérateur** peut voir un tableau de bord avec une file des messages en attente de validation.
- **FR21 :** Un **modérateur** peut voir une file des contenus signalés par la communauté.
- **FR22 :** Un **modérateur** peut lire le contenu d'un message en attente ou signalé.
- **FR23 :** Un **modérateur** peut **approuver** un message, le rendant public.
- **FR24 :** Un **modérateur** peut **rejeter** un message, qui ne sera pas publié.
- **FR25 :** Un **modérateur** peut **supprimer** une publication ou une réponse qui viole les règles.
- **FR26 :** Un **modérateur** peut marquer un message comme "sensible", ce qui déclenchera le floutage.
- **FR27 :** Un **modérateur** peut envoyer un avertissement standardisé à un utilisateur ayant enfreint les règles.

### Plateforme et Gouvernance

- **FR28 :** Un **utilisateur** peut consulter les Conditions Générales d'Utilisation (CGU).
- **FR29 :** Un **utilisateur** peut consulter la Politique de Confidentialité.
- **FR30 :** Le **système** affiche des avertissements clairs indiquant que la plateforme n'est pas un service d'urgence.

## Non-Functional Requirements

### Sécurité

La sécurité est l'exigence non-fonctionnelle la plus importante de ce projet.

- **Confidentialité des Données :** Toutes les données des utilisateurs doivent être chiffrées au repos et en transit.
- **Principe de Moindre Privilège :** Les modérateurs ne peuvent que supprimer du contenu, jamais le modifier. L'accès à la base de données est strictement limité.
- **Anonymat :** Le système doit être conçu pour ne jamais exiger d'informations personnelles identifiables pour les parcours de crise.
- **Dépendances :** Toutes les dépendances logicielles devront être auditées régulièrement pour des failles de sécurité.

### Performance

L'application doit être rapide et réactive, en particulier pour un utilisateur en situation de stress.

- **Temps de Réponse :** L'interaction pour commencer à écrire un message (parcours de Marie) doit se charger en moins de 2 secondes sur une connexion mobile standard.
- **Publication :** La soumission d'un post doit recevoir une confirmation du système en moins de 3 secondes.

### Accessibilité

L'accessibilité est une exigence fondamentale et non-négociable.

- **Standard :** L'application doit se conformer au minimum au standard **WCAG 2.1 niveau AA**.
- **Tests :** L'application doit être testable et utilisable via la navigation au clavier et avec les principaux lecteurs d'écran.

### Fiabilité (Reliability)

La plateforme doit être disponible lorsque les utilisateurs en ont besoin.

- **Disponibilité :** Le service doit viser un temps de disponibilité de **99.9%**.
- **Sauvegardes :** Des sauvegardes régulières de la base de données doivent être effectuées pour prévenir toute perte de données.

### Scalability

L'architecture du MVP doit supporter le lancement initial et une croissance modeste, tout en ayant un plan pour l'avenir.

- **MVP :** Le système doit pouvoir gérer confortablement les 20+ utilisateurs actifs et 50+ posts prévus dans les 6 premières semaines.
- **Post-MVP :** L'architecture choisie devra permettre une mise à l'échelle pour supporter une croissance future, comme défini dans la vision du produit.
