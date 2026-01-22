# Project Scoping & Phased Development

## MVP Strategy & Philosophy

- **Approche MVP :** L'approche est un hybride entre un **"Problem-Solving MVP"** et un **"Experience MVP"**. L'objectif est de résoudre le problème fondamental de l'expression en situation de crise (pour Marie) et du besoin de guidance (pour Thomas), tout en garantissant une expérience utilisateur exceptionnellement sûre, anonyme et empathique dès le premier jour.
- **Ressources :** Le périmètre est conçu pour être réalisable par un **développeur solo** sur une période de 6 semaines (3 sprints de 2 semaines).

## MVP Feature Set (Phase 1)

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

## Post-MVP Features

- **Phase 2 (Post-MVP / Croissance) :**
  - Cette phase correspond au **Sprint 3** de la roadmap.
  - Mise en place de la **"Bibliothèque de Témoignages"** pour la lecture thérapeutique.
  - Amélioration de l'UX avec des suggestions contextuelles pour la sécurité et la conversion progressive des comptes.
  - Potentiellement, une landing page plus immersive.

- **Phase 3 (Expansion / Vision) :**
  - **Équipe :** Recruter et former une équipe de modération "trauma-informed".
  - **Fonctionnalités :** Tags multiples, détection de catégories par IA, "Safe Spaces" thématiques.
  - **Plateforme :** Expansion multilingue et développement d'une application mobile native.

## Risk Mitigation Strategy

- **Risque Technique (Abus de l'anonymat) :**
  - **Mitigation :** Le risque d'abus (spam, trolling) des sessions anonymes est géré par la **pré-modération systématique**, un **rate-limiting** potentiel, et la capacité pour les modérateurs de bannir des sessions.
- **Risque Marché (Charge de modération) :**
  - **Mitigation :** Pour un développeur solo, la charge peut être lourde. Le MVP part du principe d'un **volume faible au lancement**, gérable avec un SLA de revue de 24h. Le recrutement d'une équipe est une étape clé de la phase de croissance.
- **Risque Légal (Responsabilité) :**
  - **Mitigation :** Le risque est géré par des **CGU claires** et des **avertissements** indiquant que la plateforme n'est pas un service d'urgence, et par la **recommandation forte de consulter un avocat** avant le lancement.
