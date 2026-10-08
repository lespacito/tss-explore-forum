# Préparation production — Parlons Violence

Manifest : `compose.prod.yaml`. Contrat : `.env.prod.example`.
Cette préparation ne modifie aucun serveur et n’exécute aucune migration distante.

## Inspection du code avant lancement

Le manifeste précédent utilisait `DATABASE_URL`, `ORIGIN` et `POSTGRES_*`, sans
arguments client ni migration. Le code attend `DB_*` et construit l’URL SQL ;
les emails passent par Resend, sans consommation de `SMTP_*` dans `src/`.
La porte d’invitation était inconditionnelle, même avec `NODE_ENV=production`.
Le contrôle des contributions, les sessions, Arcjet, CSRF et les projections
publiques des scénarios existent déjà : ils sont conservés.

## Configuration Dokploy à préparer avant un déploiement autorisé

- Créer une application Compose production **distincte** du staging, avec un
  nom de projet stable. Choisir `compose.prod.yaml`. Ne pas réutiliser le projet
  staging : réseau, alias `postgres` et volume doivent rester isolés.
- Activer **Isolated Deployments** et configurer Domains sur `app`, port `3000`,
  avec HTTPS. Dokploy raccorde Traefik au réseau isolé et ajoute ses labels.
  Le manifeste n’ouvre aucun port hôte et ne fixe aucun nom global de conteneur.
  Examiner Preview Compose avant lancement pour confirmer cette isolation.
- Copier `.env.prod.example` dans Environment et remplacer les valeurs d’exemple.
  Générer des secrets production distincts et un secret Better Auth stable d’au
  moins 32 caractères. Fixer les quatre URL au même origin HTTPS canonique :
  `APP_URL`, `BETTER_AUTH_URL`, `VITE_APP_URL`, `VITE_BETTER_AUTH_URL`.
  Better Auth utilise son `baseURL` pour son origine ; la porte d’invitation
  valide les POST avec `APP_URL`. Aucun wildcard d’origines n’est ajouté.
- Les `VITE_*` sont intégrés au build : reconstruire après tout changement.
  OAuth reste masqué par défaut ; si activé, fournir les deux secrets serveur
  du fournisseur et configurer son callback. Aucun secret ne porte `VITE_`.
- Vérifier le domaine d’envoi Resend, les adresses From/Reply-To et une clé Arcjet
  production. Une clé Arcjet de développement reste en DRY_RUN dans le code.
- PostgreSQL utilise `postgres_prod_data`, sans port public. Sauvegarder ce volume
  et tester la restauration avant ouverture des contributions. Ne pas supprimer
  le volume lors des redéploiements et ne pas changer le nom du projet Compose.

Documentation Dokploy : [domaines Compose](https://docs.dokploy.com/docs/core/docker-compose/domains),
[déploiements isolés](https://docs.dokploy.com/docs/core/docker-compose/utilities).

## Deux commandes indépendantes

`BETA_ACCESS_REQUIRED=false` rend les pages et endpoints accessibles sans cookie
 d’invitation. Seule cette valeur exacte désactive la porte. Une valeur absente,
 vide ou invalide conserve la porte fermée ; les codes vides n’ouvrent jamais le
 site. En mode public, `/beta` redirige vers `/`, les POST d’invitation sont refusés,
 et la confirmation d’effacement continue de fonctionner.

Staging conserve `BETA_ACCESS_REQUIRED=true` par défaut et exige ses codes.
La production exige un choix explicite dans Compose ; pour revenir aux invitations,
mettre `true` et fournir des codes valides de 32 à 128 caractères.

`BETA_SUBMISSIONS_OPEN=true` autorise les contributions seulement si
`BETA_MODERATION_SCHEDULE` contient un créneau. Le défaut est `false`, y compris
sur un site public. Une session, un alias et le contrôle Arcjet restent requis ;
les nouveaux scénarios restent `pending` et le code de récupération anonyme est
préparé avant écriture. L’ouverture publique ne modifie ni l’auth ni CSRF.
Les en-têtes existants `private, no-store` et `noindex, nofollow` sont conservés.

## Mode de présentation avant ouverture réelle

`PUBLICATION_MODE=test` reste le défaut sûr à l’exécution dans Compose. Seule la
valeur exacte `real` adapte les textes aux témoignages réels. Aucun build client
spécifique ni secret supplémentaire n’est nécessaire. Ce mode ne change ni
l’accès invité/public, ni l’ouverture des contributions, ni la prémodération.
Consulter [les blocages avant récits réels](publication-mode-readiness.md) :
la préparation de ces textes ne constitue pas un GO pour ouvrir la production.

## Migrations et lancement ultérieur

L’ordre est PostgreSQL sain → `migrate` (`bun run db:migrate`, migrations
versionnées, jamais `db:push`) terminé avec succès → `app` → healthcheck `/help`.
Le service `migrate` utilise l’étage builder, qui contient Drizzle et les fichiers
SQL. L’application ne démarre pas si la migration échoue. Les secrets DB sont
passés au runtime du migrateur, jamais en arguments de build.

Avant chaque migration, sauvegarder la base et vérifier sa compatibilité avec un
retour à la version précédente. Sur redéploiement, vérifier que Dokploy recrée et
exécute `migrate` pour la nouvelle révision ; ne pas réutiliser un ancien conteneur
ponctuel terminé. Ne jamais forcer le démarrage après un échec SQL.
Le healthcheck confirme la réponse HTTP, pas l’état complet des fournisseurs/DB.

Après un lancement autorisé : vérifier HTTPS et `/help`, lecture sans invitation,
connexion/reconnexion anonyme, contrôle des rôles de modération, refus d’écriture
avec contributions fermées, email et IP réelle reçue par Arcjet. Tester staging
séparément : invitation toujours requise, pages d’aide publiques.
