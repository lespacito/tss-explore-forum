# Déployer le staging dans Dokploy

Ce guide prépare un environnement **staging isolé** de la production pour Parlons
Violence. Aucun secret réel ne doit être ajouté au dépôt. Le modèle à copier dans
Dokploy est [`.env.staging.example`](../.env.staging.example) et le manifeste est
[`compose.staging.yaml`](../compose.staging.yaml).

## 1. Préparer le domaine et le projet

Choisir une URL HTTPS dédiée, par exemple
`https://staging.parlonsviolence.ch`, puis créer son enregistrement DNS vers le
serveur Dokploy.

Dans Dokploy :

1. créer un projet `Parlons Violence` et un environnement `staging` ;
2. créer une application **Docker Compose** depuis ce dépôt ;
3. choisir `compose.staging.yaml` comme chemin Compose ;
4. activer **Isolated Deployments** si disponible ;
5. coller les variables décrites plus bas dans l’onglet Environment ;
6. dans Domains, associer le domaine au service `app` et au port `3000`, puis
   activer HTTPS ;
7. utiliser Preview Compose avant le premier déploiement.

Dokploy recommande sa gestion native des domaines : il ajoute les labels Traefik
et le réseau nécessaires au déploiement. Les variables saisies dans son interface
doivent être explicitement référencées par le Compose, ce que fait ce manifeste.
Les trois variables `VITE_*` sont aussi transmises comme arguments de build, car
elles sont intégrées au bundle client et ne peuvent pas être corrigées uniquement
au runtime.

Documentation : [domaines Docker Compose](https://docs.dokploy.com/docs/core/docker-compose/domains),
[variables Docker Compose](https://docs.dokploy.com/docs/core/docker-compose),
[arguments de build Dockerfile](https://docs.dokploy.com/docs/core/applications/build-type).

## 2. Créer les secrets locaux

### PostgreSQL

Générer un mot de passe distinct du mot de passe de production :

```sh
openssl rand -base64 36
```

Le Compose utilise un PostgreSQL 17 interne avec un volume nommé persistant.
Renseigner :

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=parlons_violence_staging
DB_USER=parlons_violence_staging
DB_PASSWORD=<mot-de-passe-généré>
DB_SSL=false
DB_SCHEMA=public
```

Ne pas remplacer ces champs par `DATABASE_URL` : le schéma d’environnement du
projet construit lui-même cette URL à partir des variables `DB_*`.

### Better Auth

Better Auth n’attribue pas de clé distante à récupérer. Générer un secret à forte
entropie :

```sh
openssl rand -base64 32
```

Puis configurer :

```env
BETTER_AUTH_SECRET=<secret-généré>
BETTER_AUTH_URL=https://staging.parlonsviolence.ch
```

Le secret doit faire au moins 32 caractères et rester stable. Le remplacer invalide
les cookies signés, y compris les accès bêta existants dans ce projet. Better Auth
recommande également de fixer explicitement l’URL de base.

Documentation : [installation Better Auth](https://better-auth.com/docs/installation),
[options Better Auth](https://better-auth.com/docs/reference/options).

### Codes d’invitation bêta

Créer un code distinct par testeur :

```sh
node -e 'console.log(require("node:crypto").randomBytes(32).toString("base64url"))'
```

Les placer, séparés par des virgules, dans `BETA_INVITATION_CODES`. Ne jamais les
envoyer dans une URL. Retirer un code puis redéployer révoque aussi les cookies
d’accès signés avec ce code. Pour le premier déploiement :

```env
BETA_SUBMISSIONS_OPEN=false
BETA_MODERATION_SCHEDULE=Staging uniquement — aucun créneau de modération public.
```

N’ouvrir les dépôts qu’après validation de la modération et des sauvegardes.

## 3. Créer ou renouveler les clés fournisseurs

### Arcjet

Le site dédié `parlons violence - staging` a été créé dans l’équipe `Personal` :

```text
site_01m2gaxw3kerasnjtvmswd601n
```

Récupérer sa clé avec la CLI, puis la copier directement dans la variable secrète
`ARCJET_KEY` de Dokploy :

```sh
npx -y @arcjet/cli@latest auth login
npx -y @arcjet/cli@latest sites get-key \
  --site-id site_01m2gaxw3kerasnjtvmswd601n \
  --output text
```

La dernière commande affiche un secret : ne pas la conserver dans les logs, une
capture d’écran, un fichier versionné ou l’historique d’un ticket.

Le code force les clés `ajkey_dev_…` en `DRY_RUN`. Pour tester les blocages réels
en staging avec `NODE_ENV=production`, utiliser une clé de site de production
dédiée au staging. Si la clé est perdue ou exposée, en créer une nouvelle, mettre
Dokploy à jour, redéployer puis révoquer l’ancienne.

Documentation : [Arcjet Node.js](https://github.com/arcjet/arcjet-js/tree/main/arcjet-node),
[documentation Arcjet](https://docs.arcjet.com/).

### Resend

Dans [Resend](https://resend.com) :

1. ajouter le domaine d’envoi et recopier ses enregistrements DNS ;
2. attendre que le domaine soit vérifié ;
3. créer une clé dédiée `Parlons Violence staging`, avec la permission
   **Sending access** et, si disponible, limitée à ce domaine ;
4. copier immédiatement le jeton `re_…` dans `RESEND_API_KEY` ;
5. utiliser une adresse du domaine vérifié dans `EMAIL_FROM` et une adresse qui
   reçoit réellement les réponses dans `EMAIL_REPLY_TO`.

Le jeton complet n’est affiché qu’à sa création. S’il est perdu, créer une nouvelle
clé, redéployer, envoyer un courriel de test, puis révoquer l’ancienne.

Documentation : [créer une clé Resend](https://resend.com/docs/api-reference/api-keys/create-api-key),
[créer et vérifier un domaine](https://resend.com/docs/api-reference/domains/create-domain),
[adresses d’expédition](https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend).

### OAuth GitHub

Créer une OAuth App staging dans GitHub, sous **Settings → Developer settings →
OAuth Apps → New OAuth App** :

- Homepage URL : `https://staging.parlonsviolence.ch`
- Authorization callback URL :
  `https://staging.parlonsviolence.ch/api/auth/callback/github`

Copier le Client ID et générer le Client Secret dans `GITHUB_CLIENT_ID` et
`GITHUB_CLIENT_SECRET`. En cas de perte ou d’exposition, générer un nouveau secret,
redéployer, vérifier la connexion, puis supprimer l’ancien. Ne pas utiliser de
callback générique ou wildcard.

Documentation : [créer une OAuth App GitHub](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app),
[bonnes pratiques OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/best-practices-for-creating-an-oauth-app).

### OAuth Google

Dans Google Cloud, créer ou sélectionner un projet staging, configurer l’écran de
consentement, puis créer un client **Web application** :

- Authorized JavaScript origin : `https://staging.parlonsviolence.ch`
- Authorized redirect URI :
  `https://staging.parlonsviolence.ch/api/auth/callback/google`

Copier les valeurs dans `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`. Google
n’affiche le secret qu’à la création : s’il est perdu, créer un nouveau client ou
secret selon les options proposées, déployer la nouvelle valeur puis retirer
l’ancienne. L’URI doit correspondre exactement, sinon Google renvoie
`redirect_uri_mismatch`.

Documentation : [OAuth Google pour application serveur](https://developers.google.com/identity/protocols/oauth2/web-server),
[gestion des clients OAuth](https://support.google.com/cloud/answer/15549257).

## 4. Variables à coller dans Dokploy

Copier le contenu de `.env.staging.example`, remplacer toutes les valeurs
d’exemple (`replace_…` et `replace_me`), puis vérifier les quatre URL suivantes :

```env
APP_URL=https://staging.parlonsviolence.ch
BETTER_AUTH_URL=https://staging.parlonsviolence.ch
VITE_APP_URL=https://staging.parlonsviolence.ch
VITE_BETTER_AUTH_URL=https://staging.parlonsviolence.ch
```

Les secrets serveur sont `DB_PASSWORD`, `BETTER_AUTH_SECRET`, les quatre valeurs
OAuth, `RESEND_API_KEY`, `ARCJET_KEY` et `BETA_INVITATION_CODES`. Ne jamais leur
ajouter un préfixe `VITE_`, car cela les exposerait dans le navigateur.

## 5. Premier déploiement

Le manifeste effectue l’ordre suivant :

1. PostgreSQL démarre et passe son healthcheck ;
2. le service ponctuel `migrate` applique les migrations Drizzle versionnées ;
3. `app` démarre uniquement si la migration a réussi ;
4. le healthcheck vérifie la route publique `/help`.

Après le déploiement :

1. vérifier que `/help`, `/privacy` et `/rules` répondent sans invitation ;
2. vérifier que `/` redirige vers `/beta` sans cookie ;
3. saisir une invitation staging et vérifier l’accès à `/` ;
4. tester GitHub et Google OAuth ;
5. déclencher un courriel de vérification/réinitialisation et contrôler l’expéditeur,
   les liens HTTPS et Reply-To ;
6. contrôler dans Arcjet que les requêtes arrivent avec l’IP publique attendue ;
7. conserver `BETA_SUBMISSIONS_OPEN=false` tant que la modération n’est pas prête.

## 6. Sauvegarde, rotation et retour arrière

- Configurer une sauvegarde Dokploy du volume PostgreSQL avant d’ouvrir le staging.
- Ne jamais réutiliser les secrets de production en staging.
- Pour une rotation, ajouter la nouvelle valeur dans Dokploy, redéployer et tester,
  puis révoquer l’ancienne chez le fournisseur.
- Pour Better Auth, conserver l’ancien secret jusqu’à accepter explicitement la
  reconnexion de toutes les sessions ; la configuration actuelle du projet ne met
  pas encore en œuvre la rotation multi-secret.
- Avant une migration de base, créer une sauvegarde. En cas d’échec, consulter les
  logs du service `migrate` et ne pas forcer le démarrage de `app`.
- Pour revenir à une version applicative antérieure, redéployer le commit précédent
  dans Dokploy. Ne restaurer la base que si la migration n’est pas rétrocompatible
  et après avoir identifié précisément la sauvegarde cible.

## Checklist de mise en service

- [ ] DNS et HTTPS valides
- [ ] volume PostgreSQL persistant et sauvegardé
- [ ] migrations réussies
- [ ] secrets staging distincts de production
- [ ] callbacks OAuth exacts
- [ ] domaine Resend vérifié et courriel de test reçu
- [ ] événements Arcjet visibles
- [ ] invitation staging testée
- [ ] dépôts fermés jusqu’à validation opérationnelle
