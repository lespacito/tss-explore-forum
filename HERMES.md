# Hermes workspace — Parlons Violence

Ce workspace est utilisé par Hermes Agent pour travailler sur **Parlons Violence**.

## Règles de travail permanentes

### Branches et flux

- Toute nouvelle tâche de développement doit partir de `dev` et utiliser une branche dédiée `hermes/*`.
- Ne jamais commit/push directement sur `dev`, `master` ou `prod`.
- Ne jamais merger vers ces branches sans autorisation explicite de @lolilol2017.
- Avant toute modification, vérifier la branche courante (`git branch --show-current`) et `git status`.
- Comprendre le code existant avant de le modifier et respecter l'architecture du projet (cf. `CLAUDE.md` et `CONTEXT.md`).

### Secret et environnement

- Ne jamais afficher, copier, modifier ou committer des secrets, tokens ou véritables fichiers `.env`.
- Ne jamais exécuter de migration ou commande destructive contre staging/production sans autorisation explicite de @lolilol2017.

### Vérifications avant commit

- Après modification, exécuter les vérifications pertinentes disponibles dans `package.json` (lint, typecheck, tests, build selon la tâche).
- Inspecter le diff avant commit et signaler toute modification inattendue.
- Faire des commits Git petits et explicites.
- Pousser uniquement la branche `hermes/*` concernée.

### Déploiement

- Ne jamais déployer directement dans Dokploy depuis ce workspace.
- Pour staging : branche Hermes → revue → intégration dans `dev` → Dokploy.
- Pour production : ne jamais déclencher de déploiement sans autorisation explicite de @lolilol2017.

## Documentation

Ce fichier documente les règles de travail permanentes de Hermes Agent sur Parlons Violence. Il est prioritaire sur toute autre guidance implicite.

Ce fichier est une documentation d'usage du workspace, pas un document de produit.
