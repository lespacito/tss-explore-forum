# Modes de publication — textes et conditions d’ouverture

Cette modification prépare l’interface. Elle n’autorise ni un déploiement ni
l’ouverture aux récits réels. Les flags d’accès et de contributions restent
indépendants du mode de publication. Aucun contrôle serveur n’est assoupli.

## Configuration

`PUBLICATION_MODE` est une variable serveur à l’exécution : seule la valeur exacte `real` active les textes réels. Absence, valeur vide ou inconnue donnent `test`. Aucun `VITE_PUBLICATION_MODE` ni secret client. Le loader racine transmet seulement le mode normalisé avec les flags existants pour un rendu SSR et hydraté cohérent. Les exemples et Compose passent `test` par défaut ; aucun environnement distant n’est modifié.

## Contrat de présentation inspecté

- `test` conserve les situations fictives et les textes existants, en accès privé
  ou public selon le flag d’accès.
- `real` présente des témoignages de victimes ou témoins. Une contribution reste
  facultative, soumise à prémodération, et indisponible si les contributions sont
  fermées. Une invitation peut encore être requise séparément.
- La publication actuelle affiche « Auteur anonyme » pour tous les comptes.
  Un compte avec nom/email ne constitue pas un choix de publication nominative.
  Aucun bouton ni promesse de publication sous son nom n’est ajouté.
- La modération ne promet ni accompagnement professionnel, ni réponse de soutien,
  ni délai garanti. L’anonymat absolu n’est jamais promis.

## Écarts et vérifications avant récits réels

| Priorité | Preuve dans le repository | Vérification / reste à traiter |
| --- | --- | --- |
| Bloquant ouverture | `src/routes/privacy.tsx` indique hébergement, journaux et conservation non confirmés | Identifier le responsable effectif et les prestataires, préciser les durées réelles, destinataires et procédure de contact dans une notice validée. La page préparée expose ces inconnues plutôt que d’inventer une garantie. |
| Bloquant ouverture | Aucun mécanisme de sauvegarde n’est vérifié par ce ticket ; le mode test annonce sept jours, le mode real ne les présente pas comme un fait acquis | Vérifier sauvegarde, restauration, expiration et retrait effectif ; aligner tous les textes sur les pratiques constatées avant ouverture. La page real ne reprend pas cette durée comme fait acquis. |
| Bloquant ouverture | `src/features/beta/server/erase-account-records.ts` efface transactionnellement la base active ; ne supprime pas les copies externes | Vérifier le schéma effectivement migré et l’effacement de bout en bout sur un environnement autorisé. Documenter limites des copies déjà partagées, sauvegardes et journaux. Aucune migration effectuée ici. |
| Bloquant ouverture | `src/features/threads/server/actions/create-thread.ts` enregistre userId dans certains événements techniques ; la base conserve session/IP et contenu sensible | Examiner accès, rétention et minimisation des journaux/informations techniques avec les responsables avant ouverture. Ce ticket ne change aucun logging ni protection. |
| Bloquant ouverture | Prémodération présente, planning conditionne les contributions | Confirmer disponibilité humaine, procédure pour données identifiantes, tiers mentionnés, demandes de retrait et situations urgentes. Une règle UI n’assure pas la désidentification d’un récit. |
| Bloquant ouverture | `src/features/moderation/server/thread-moderation.ts` conserve les motifs de test `REAL_OR_URGENT`, `OUT_OF_SCOPE` et leurs textes fictifs | Ticket distinct pour définir les critères de modération des témoignages réels et les messages enregistrés. Les motifs affichés/enregistrés ne sont pas réécrits par un simple flag ; la file real signale cet écart. Aucun contournement de prémodération. |
| Bloquant ouverture | Le mode est une présentation à l’exécution, sans colonne de mode ni séparation des enregistrements | Ne pas basculer une base de scénarios fictifs en service réel en changeant seulement le flag. Valider un jeu de données et un environnement distincts avant ouverture ; aucune séparation DB ni migration ajoutée ici. |
| Écart fonctionnel bloquant pour le périmètre nominatif demandé | `src/features/threads/components/thread-card.tsx`, `src/routes/threads/$threadSlug.tsx`, `src/features/threads/server/db/thread-queries.ts` | Les vues publiques ne proposent aucune publication nominative ; alias/corrélation restent internes. La publication nominative demandée nécessite un ticket distinct avec consentement, visibilité et retrait à concevoir ; elle n’est pas livrée par cette modification de présentation. |
| À vérifier | `src/features/feedback/server/submit-feedback.ts` ne persiste pas d’identifiant avec les réponses | Les textes libres restent potentiellement identifiants. Préserver l’avertissement de ne pas transmettre de récit/donnée sensible ; confirmer accès et conservation opérationnels. |
| À vérifier | Copie de brouillon avec consentement et nettoyage dans le parcours existant | Vérifier appareil partagé, récupération de session, effacement des copies locales et absence de données sensibles dans captures/exports de test. |

Les anciens composants `AccountDeletion`/`delete-account-with-options` ne sont
pas le parcours actif de `/account/settings/` : ce dernier utilise
`EraseAccountForm` et `eraseBetaAccount`. Leur existence seule ne démontre pas
que leurs options de conservation sont disponibles dans l’interface actuelle.

## Revue better-writing

Source inspectée ; pas de validation visuelle de production.

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| HIGH | `src/routes/rules.tsx:80`, `src/routes/help.tsx:28` | Situations fictives et cohorte quel que soit le mode | En real, victimes/témoins, choix de lire, contribution selon flag, limites de modération | Terminologie cohérente avec le parcours sans promettre de prise en charge. |
| HIGH | `src/routes/privacy.tsx:106` | Notice de test et durée de cohorte appliquées à tout usage | Notice real distincte : identité interne, copie publique, effacement limité et inconnues explicites | Ne pas transposer des promesses de test à des récits sensibles. |
| HIGH | `src/routes/privacy.tsx:149` | Risque d’interpréter une durée annoncée comme vérifiée | Durées/hébergement/responsable restent à confirmer avant ouverture réelle | Information nécessaire pour décider de contribuer ; reste opérationnel bloquant. |
| MEDIUM | `src/routes/privacy.tsx:112` | Compte nommé pouvant être confondu avec signature publique | Présentation actuelle « Auteur anonyme » explicitée, nominatif non proposé | Distinguer identité de compte et identité publiée. |

**Block pour l’ouverture aux témoignages réels** tant que les points bloquants
ci-dessus ne sont pas résolus. Cette décision porte sur la préparation de
l’ouverture, pas sur une interdiction de revoir ou merger des textes inactifs.

## Revue better-ui

No actionable UI-polish findings sur les trois pages inspectées : structure
existante, titres, liens et classes conservés. Aucune animation, interaction ou
surface nouvelle. Vérification de source uniquement ; rendu navigateur et
états visuels : **Not verified**. Approve pour ce périmètre de présentation.

## Couverture de validation

Tests d’information : modes test/real, accès privé/public et contributions
ouvertes/fermées ; assertions absence de cohorte fictive en real, avertissement
anonymat, absence de publication nominative et limites opérationnelles.
Vérifier ensuite en environnement autorisé les trois pages, le parcours complet,
les textes conditionnels et les lecteurs sans session. Aucun déploiement ni
changement d’environnement distant fait ici.

Les deux erreurs d’envoi fictives connues sont reformulées à l’affichage uniquement en mode réel, en conservant leur consigne de récupération. Les autres erreurs serveur et les motifs de rejet déjà enregistrés restent fidèles à leur source. Ces motifs peuvent encore mentionner le cadre fictif : ils doivent être traités avec le contrat de modération serveur dans le ticket séparé, sans masquer ni réinterpréter une décision existante dans cette PR. Les réponses/commentaires restent fermés ; « entraide » désigne ici la lecture et le partage de témoignages, pas une conversation ni une réponse garantie.

## Périmètre de revue complémentaire

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| HIGH | `src/components/shadcn-studio/blocks/hero-section/hero-section.tsx`, `src/routes/threads/new/index.tsx` | Invitation à inventer quel que soit l’usage | Deux modes explicites, liberté de lire sans raconter, examen avant visibilité | Un lecteur doit comprendre ce qu’il peut envoyer et quand cela devient visible. |
| HIGH | `src/features/beta/server/access.ts` | Introduction HTML de test et confirmation fictive également en réel | Textes conditionnels uniquement ; contrôles, cookies, CSP, méthodes et limiteur inchangés | L’entrée SSR privée doit rester cohérente avec les pages React. |
| MEDIUM | `src/routes/account/profile/index.tsx`, `src/routes/threads/new/index.tsx` | Entrées de rédaction encore proposées sur accès direct lorsque suspendu | En réel suspendu, texte explicite et contrôles désactivés ; règles serveur conservées | Un état indisponible doit être compréhensible avant l’envoi. |

Better Writing : **Approve pour les textes de présentation inspectés**, avec
**Block pour l’ouverture réelle** selon les écarts opérationnels et de modération.
Better UI et Better Accessibility : structure, classes, champs nommés, contrôles
natifs et choix de masquage conservés ; tests de labels/statuts et navigation
clavier. Vérification avec lecteur d’écran, audit automatique complet et zoom
200 % : **Not verified**. Aucune certification d’accessibilité revendiquée.

## Procédure de validation avant toute ouverture distante

1. Garder `PUBLICATION_MODE=test` en préproduction tant qu’elle utilise des données fictives. Avec accès public et contributions fermées : vérifier accueil, navigation, règles, confidentialité et bouton suspendu, sans invitation ni création automatique de session.
2. Sur un environnement local autorisé, utiliser le même build et relancer le processus avec `PUBLICATION_MODE=real`. Vérifier les variantes sur invitation et publiques, contributions fermées puis ouvertes avec créneau configuré. Comparer le HTML serveur initial au rendu hydraté ; aucune valeur de secret ne doit être ajoutée à la présentation.
3. Vérifier formulaire (catégorie facultative, identité affichée, brouillon facultatif), erreur récupérable, confirmation « À examiner », suivi et confirmation explicite de modération. Tous les contenus de validation restent inventés, même lorsque les textes sont en mode réel.
4. Avant une ouverture réelle, traiter les blocages listés plus haut dans des tickets séparés et faire vérifier les pratiques effectives. Cette procédure n’autorise ni une modification de l’environnement préprod ni un déploiement.

Les tests du handler serveur existant sont paramétrés dans les deux modes : contributions fermées, planning absent, session absente, refus du contrôle de protection, génération du code de récupération et écriture sous alias avec statut `pending`. Aucun handler ni règle serveur n’est modifié.

Le mode n’active pas les réponses/commentaires, la signature nominative, une priorité de modération ou une prise en charge professionnelle. Le `noindex, nofollow` existant est conservé.

## Tickets distincts proposés

- Modération des témoignages réels : critères, motifs persistés et protocole humain pour contenus identifiants, demandes de retrait et urgences, en conservant l’examen avant publication.
- Publication nominative volontaire : choix de signature, consentement avant visibilité, information sur les copies et parcours de retrait. Aucun identifiant technique ou pseudonyme interne ne doit devenir une signature par défaut.
- Préparation opérationnelle des données sensibles : notice de confidentialité complète, responsable et prestataires, rétention/logs, sauvegardes/effacement vérifiés et données de production distinctes des scénarios de test.

Ces tickets sont proposés dans ce document ; aucune issue externe n’est créée par ce travail.

## Résultats locaux de cette révision

- Suite unitaire complète : 1 009 réussis, 19 ignorés ; 81 fichiers réussis et 2 ignorés. Relance avec deux workers après des dépassements de délai pendant un build concurrent, sans modifier les délais des tests.
- Suite ciblée finale après les dernières corrections : 162 réussis dans 12 fichiers, dont les handlers existants paramétrés test/real et les erreurs du formulaire.
- Typecheck, Biome sur les 44 fichiers TS/TSX modifiés, build client/SSR/Nitro et `git diff --check` : réussis.
- Chromium sur le même build, paramètres serveur changés uniquement à l’exécution : test privé (1 réussi), test public fermé (2), réel privé fermé (2), réel public fermé (3), réel public ouvert avec créneau synthétique (3). Soit 11 réussis et 4 ignorés intentionnellement selon le mode.
- Parcours de lecture sans création de session, titre SSR, HTML serveur et rendu hydraté, menu clavier, largeurs 1440/390/320 px. Formulaire et décisions de modération vérifiés par les tests ciblés ; Firefox/WebKit et lecteur d’écran non exécutés.
- Base PostgreSQL jetable locale arrêtée et configuration Playwright temporaire retirée du dépôt. Aucune donnée réelle utilisée, aucun changement distant, déploiement ou publication d’image.
