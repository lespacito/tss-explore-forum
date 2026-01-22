# Functional Requirements

## Gestion des Utilisateurs et de l'Anonymat

- **FR1 :** Un **utilisateur invité (comme Marie)** peut soumettre une publication sans créer de compte.
- **FR2 :** Un **utilisateur anonyme** peut recevoir un "code secret" unique après sa première publication.
- **FR3 :** Un **utilisateur anonyme** peut utiliser son "code secret" pour retrouver ses publications précédentes sur différents appareils.
- **FR4 :** Un **utilisateur (comme Thomas)** peut s'inscrire en utilisant un pseudonyme, un email et un mot de passe.
- **FR5 :** Un **utilisateur enregistré** peut se connecter et se déconnecter.
- **FR6 :** Un **utilisateur enregistré** peut supprimer son compte et toutes ses données associées.

## Création et Interaction de Contenu

- **FR7 :** Un **utilisateur** peut créer une nouvelle publication (un "post").
- **FR8 :** Un **utilisateur** peut choisir une catégorie visible pour sa publication parmi une liste prédéfinie.
- **FR9 :** Le **système** affiche un template de publication guidé basé sur la catégorie choisie.
- **FR10 :** Un **utilisateur** peut écrire et formater le contenu de sa publication.
- **FR11 :** Un **utilisateur** peut soumettre une publication pour modération.
- **FR12 :** Un **utilisateur** peut écrire une réponse à une publication existante.
- **FR13 :** Un **utilisateur** peut signaler une publication ou une réponse comme étant inappropriée.

## Découverte et Consommation de Contenu

- **FR14 :** Un **utilisateur** peut voir une liste de publications publiées.
- **FR15 :** Un **utilisateur** peut filtrer les publications par catégorie.
- **FR16 :** Le **système** affiche un avertissement pour le contenu sensible et le floute par défaut.
- **FR17 :** Un **utilisateur** peut choisir de "voir le contenu" pour révéler un message flouté.
- **FR18 :** Un **utilisateur** peut lire une publication et toutes ses réponses.
- **FR19 :** Le **système** n'affiche aucune métrique sociale (likes, nombre de vues, etc.).

## Modération et Sécurité

- **FR20 :** Un **modérateur** peut voir un tableau de bord avec une file des messages en attente de validation.
- **FR21 :** Un **modérateur** peut voir une file des contenus signalés par la communauté.
- **FR22 :** Un **modérateur** peut lire le contenu d'un message en attente ou signalé.
- **FR23 :** Un **modérateur** peut **approuver** un message, le rendant public.
- **FR24 :** Un **modérateur** peut **rejeter** un message, qui ne sera pas publié.
- **FR25 :** Un **modérateur** peut **supprimer** une publication ou une réponse qui viole les règles.
- **FR26 :** Un **modérateur** peut marquer un message comme "sensible", ce qui déclenchera le floutage.
- **FR27 :** Un **modérateur** peut envoyer un avertissement standardisé à un utilisateur ayant enfreint les règles.

## Plateforme et Gouvernance

- **FR28 :** Un **utilisateur** peut consulter les Conditions Générales d'Utilisation (CGU).
- **FR29 :** Un **utilisateur** peut consulter la Politique de Confidentialité.
- **FR30 :** Le **système** affiche des avertissements clairs indiquant que la plateforme n'est pas un service d'urgence.
