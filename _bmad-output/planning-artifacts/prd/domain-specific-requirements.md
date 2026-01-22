# Domain-Specific Requirements

## Healthcare / Wellness Compliance & Regulatory Overview

"ParlonsViolence" opère dans le domaine sensible du soutien à la santé mentale et au bien-être. Bien qu'il ne s'agisse pas d'un dispositif médical, le projet adhère à des principes stricts pour garantir la sécurité des utilisateurs et la conformité légale, notamment avec le RGPD. L'approche est "la confidentialité par le design" (privacy by design).

## Key Domain Concerns

- **Confidentialité des Données (RGPD) :** La protection des données des utilisateurs est la priorité absolue. L'anonymat est au cœur de la conception pour minimiser la collecte de données personnelles.
- **Sécurité des Utilisateurs :** La plateforme doit être un refuge. Des mécanismes sont en place pour protéger les utilisateurs contre les contenus re-traumatisants et les interactions nuisibles.
- **Responsabilité Légale :** La plateforme doit définir clairement ses limites et responsabilités, en particulier le fait qu'elle n'est pas un service d'urgence.

## Compliance Requirements

- **Conformité RGPD :**
  - **Hébergement :** L'application sera hébergée en Europe (Hetzner) pour se conformer aux lois sur la souveraineté des données.
  - **Anonymisation :** Le système d'alias et de "codes secrets" est conçu pour éviter de stocker des informations personnelles identifiables.
  - **Droit à l'oubli :** Une fonctionnalité de suppression de compte est requise.
  - **Politique de Confidentialité :** Un document clair expliquant les données collectées (le minimum possible) et leur utilisation doit être accessible.

## Safety Measures

- **Modération "Trauma-Informed" :** Les témoignages bruts sont floutés (non supprimés) pour préserver l'authenticité, tandis que les réponses agressives ou culpabilisantes sont supprimées.
- **Pré-modération :** Tous les nouveaux messages passent par une file d'attente de vérification avant d'être visibles publiquement.
- **Signalement :** Les utilisateurs disposent d'outils pour signaler tout contenu ou comportement inapproprié.

## Liability & Legal Boundaries

- **Conditions Générales d'Utilisation (CGU) :** Des CGU doivent être rédigées et accessibles, stipulant clairement que la plateforme n'est pas un service médical ou d'urgence.
- **Avertissement (Disclaimer) :** La plateforme affichera visiblement des avertissements et redirigera les utilisateurs en danger immédiat vers de véritables services d'urgence.
- **Consultation Légale :** Il est fortement recommandé de consulter un avocat spécialisé avant le lancement pour valider l'approche légale et la gestion des responsabilités.
