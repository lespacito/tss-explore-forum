# Parlons Violence

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

La première cohorte réunit des adultes invités en Suisse romande, utilisant
l’interface en français sur ordinateur ou navigateur mobile. Commencer avec cinq
personnes, dont au moins deux peu familières du projet, puis élargir jusqu’à dix.
Les participants testent un parcours avec des scénarios fictifs fournis ; ils ne
sont pas invités à raconter une expérience personnelle.

L’organisateur est le seul responsable de la cohorte, des invitations, de la
modération, des demandes relatives aux données et des incidents. Ce projet est
un side projet : sa charge quotidienne doit rester soutenable pour une personne.

## Product Purpose

Valider un parcours de dépôt sous alias, de prémodération, de suivi de décision,
de récupération de session et d’effacement, sans inscription par email pour le
participant anonyme.

La cohorte dure deux semaines. Le critère convenu pour envisager la suite est
qu’au moins 80 % des participants accomplissent le parcours sans assistance,
comprennent le statut de leur publication et que la modération reste tenable.
Il s’agit d’un objectif à mesurer, pas d’un résultat déjà obtenu.

## Positioning

Le mécanisme retenu combine accès sur invitation, publication sous alias,
examen humain avant visibilité et code secret pour retrouver sa session.
L’alias ne garantit pas l’anonymat absolu : l’administration technique peut relier
une session à ses alias, et le contenu lui-même peut être identifiant.

La bêta n’est ni un service d’urgence ni une permanence d’écoute. Aucune promesse
de prise en charge immédiate, de disponibilité 24 h/24 ou de notification par email
pour les participants anonymes ne doit être introduite.

## Operating Context

- Invitations individuelles par WhatsApp, email ou Snapchat. Un code d’invitation
  donne accès à la bêta ; le code secret personnel sert à retrouver une session.
  Ces deux codes ont des fonctions distinctes et ne doivent pas être partagés.
- Contact confirmé : contact@parlonsviolence.ch. Ne pas demander un code secret,
  un récit personnel ou une capture contenant un secret dans les retours de test.
- Modération prévue quotidiennement, sans heure fixe et sans assistance immédiate.
  Suspendre les nouveaux dépôts lorsque l’organisateur est indisponible.
- Préproduction prévue sur beta.parlonsviolence.ch, avec une base séparée, sur le
  VPS Netcup RS 1000 G12 de l’organisateur. Debian 13 Trixie minimal est annoncé ;
  l’installation de Dokploy reste à effectuer. Ne pas présenter ce déploiement
  comme réalisé. Aucun nouvel abonnement n’est prévu pour cette première bêta.
- Avant ouverture : vérifier le parcours sur l’instance déployée, l’effacement et
  la restauration d’une sauvegarde. Les dépôts restent fermés au départ.
- Politique retenue pour la cohorte : supprimer comptes et scénarios sept jours
  après la fin du test ; chaque sauvegarde expire après sept jours maximum.
  Une suppression peut donc subsister jusqu’à sept jours supplémentaires dans une
  sauvegarde. L’automatisation et sa vérification restent à réaliser sur le serveur.
  Garder ensuite uniquement un bilan sans identifiants.

## Capabilities and Constraints

Le parcours courant comprend l’entrée par invitation, la création d’une session
anonyme, le choix d’une catégorie, la rédaction guidée, le dépôt pour modération,
le suivi dans « Mes publications », la reconnexion par code et « Gérer le compte »
pour l’effacement.

- Contrôle d’invitation côté serveur pour les publications et les API. Les pages
  Aide, Règles et Confidentialité restent accessibles sans invitation.
- Statuts personnels : en attente, publiée ou refusée ; motif en cas de refus.
- Lecture et filtrage par catégorie des publications validées.
- Contenu marqué sensible : extrait masqué et choix explicite avant affichage du
  message. Cet avertissement est un contrôle de présentation, pas un chiffrement.
- Code secret absent des URL, consultable sur demande dans une session ouverte.
- Conservation d’un brouillon sur l’appareil uniquement sur consentement explicite,
  avec possibilité de l’effacer. Un appareil peut être partagé.
- Réponses et commentaires fermés pour cette cohorte. Garder un parcours de dépôt
  unique plutôt que réintroduire un formulaire concurrent.

Décisions ouvertes : dates effectives de la cohorte, participants nommément choisis,
localisation effective de l’hébergement, configuration des sauvegardes et traitement
des journaux techniques. L’ouverture aux témoignages réels, au public, aux mineurs
ou à des fonctions sociales relève d’une décision ultérieure explicite.

## Brand Commitments

Nom du projet : Parlons Violence. Domaine : parlonsviolence.ch.
Conserver l’identité existante pour les travaux de refinement ; toute refonte
nécessite une intention explicite. Employer un français clair, respectueux et sans
jugement. Distinguer les engagements de fonctionnement des capacités effectivement
vérifiées ; ne pas amplifier les promesses de protection ou d’assistance.

## Evidence on Hand

- `docs/private-beta-interface-audit-2026-09-06.md` : audit initial, corrections et
  observations du parcours local. Les résultats historiques décrivent leur contexte
  de test et ne prouvent pas le fonctionnement du futur serveur.
- `src/routes/threads/`, `src/routes/account/` et `src/features/moderation/` : parcours
  et modération implémentés ; `src/features/beta/` : invitation et contrôles associés.
- `src/routes/help.tsx`, `src/routes/privacy.tsx`, `src/routes/rules.tsx` : informations
  actuellement affichées. Elles peuvent être en retard sur les décisions confirmées
  ci-dessus ; leur mise à jour doit être une modification distincte et vérifiée.
- Les essais documentés utilisent des données fictives. Aucun taux de réussite de
  cohorte, témoignage utilisateur ou certification d’accessibilité n’est établi.

## Product Principles

1. Permettre à la personne de comprendre son action, son statut et ses possibilités
   de retour, sans dépendre d’une explication de l’organisateur.
2. Préserver le contrôle sur les données et limiter les traces inutiles, en
   particulier sur un appareil partagé.
3. Annoncer précisément les limites de l’alias, de la modération et du service.
4. Garder un périmètre assez réduit pour être exploité par une seule personne.
5. Mesurer les parcours avec des scénarios fictifs avant de décider d’une extension.

## Accessibility & Inclusion

La bêta doit pouvoir être utilisée sur mobile et ordinateur, avec des contrôles
nommés, une navigation au clavier et un focus visible, des textes lisibles et des
statuts compréhensibles sans dépendre uniquement de la couleur. Présenter les
contenus sensibles de manière à permettre un choix de lecture. Ne pas revendiquer
une certification WCAG à partir de seuls tests automatiques ou contrôles ponctuels.
