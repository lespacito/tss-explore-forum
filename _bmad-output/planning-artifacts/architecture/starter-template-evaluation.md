# Starter Template Evaluation

## Primary Technology Domain

Application web SSR-first basée sur TanStack Start, en cohérence avec le PRD.

## Starter Options Considered

- TanStack Start RC (full-stack SSR + server functions) avec TypeScript strict et séparation claire client/serveur.
- Intégration d'un design system minimaliste et accessible, possibilité d'ajouter Shadcn en composants ciblés (bouton, champs) si nécessaire, en version récente.
- Pas de temps réel au MVP; choix d'un routeur SSR, forms et validation compatibles.

## Selected Starter: TanStack Start RC (strict TypeScript)

**Rationale for Selection:**

- Aligne parfaitement l'architecture MPA et SSR avec SEO et performance au premier chargement.
- Favorise la séparation des responsabilités: server functions pour logique sensible (auth Better Auth, modération, écritures), clients "minces" et déclaratifs.
- S'intègre avec TanStack Form/TanStack Query selon besoins (client-side state limité), tout en privilégiant chargement côté serveur initial.

**Initialization Command:**

```bash
# Initialisation guidée (placeholder à affiner selon dépôt et version RC en cours)
# À exécuter lors de l'implémentation, avec vérification des versions en amont
pnpx create tanstack-start@latest
```

**Architectural Decisions Provided by Starter:**

- Language & Runtime: TypeScript strict, SSR par défaut.
- Styling Solution: à préciser (CSS/Tailwind minimal) en gardant accessibilité et sobriété; Shadcn à ajouter ponctuellement avec `pnpx shadcn@latest add button` si nécessaire.
- Build Tooling: moderne, optimisé pour SSR.
- Testing Framework: à intégrer (Vitest/Playwright) selon besoins qualité.
- Code Organization: séparation pages/routes, server functions pour mutations/écritures, composants clients déclaratifs.
- Development Experience: hot reload, TS configs strictes, lint/format, DX orientée productivité.
