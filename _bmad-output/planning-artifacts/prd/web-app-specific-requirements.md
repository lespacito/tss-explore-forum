# Web App Specific Requirements

## Architecture & Design Philosophy

L'application sera développée en tant qu'**Application Multi-Pages (MPA)**, en utilisant TanStack Start avec rendu côté serveur (SSR). Cette approche est choisie pour privilégier la performance au premier chargement et optimiser le référencement naturel (SEO), deux aspects critiques du projet. La philosophie de design est "mobile-first", "calme" et "empathique".

## Browser Support Matrix

Le support officiel est assuré pour les dernières versions des navigateurs suivants. La priorité absolue est donnée aux navigateurs mobiles.

- Google Chrome (Mobile & Desktop)
- Mozilla Firefox (Mobile & Desktop)
- Apple Safari (Mobile & Desktop)
- Microsoft Edge (Desktop)

## Responsive Design

Une approche **"mobile-first"** est fondamentale. L'expérience doit être optimale sur un appareil mobile, où les utilisateurs comme Marie et Thomas sont les plus susceptibles d'accéder à la plateforme pour la première fois. Toutes les fonctionnalités doivent être conçues d'abord pour un petit écran, puis adaptées aux écrans plus grands.

## SEO Strategy

Le référencement naturel est une **priorité critique** pour le produit. Le succès de la plateforme dépend de sa capacité à être découverte par des utilisateurs vulnérables via des moteurs de recherche. L'architecture MPA, la sémantique HTML, et la génération de métadonnées appropriées seront des points d'attention majeurs.

## Real-time & Performance Targets

Les fonctionnalités en **temps-réel (via WebSockets) ne font pas partie du périmètre du MVP**. Les notifications de réponse seront gérées de manière asynchrone. L'objectif de performance pour le MVP est d'assurer des temps de chargement rapides et une expérience utilisateur fluide et réactive, sans la complexité additionnelle du temps-réel.

## Accessibility Level

L'accessibilité est une **exigence fondamentale et non-négociable**.

- **Objectif :** Atteindre au minimum le niveau **WCAG 2.1 AA**.
- **Points clés :** Hauts contrastes de couleurs, navigation complète au clavier, compatibilité avec les lecteurs d'écran, et sémantique HTML correcte pour assurer une expérience utilisable et digne pour tous.
