# Textes d’accès bêta — audit UI

Base vérifiée : dev `352ce585fefd08aaab610c217e5561689823d001`.
Le ticket explicite les deux modes ; les documents de cohorte privée
(CONTEXT.md, PRODUCT.md, CLAUDE.md et brief UX) décrivent le mode privé historique.
L’accès public ne transforme pas les situations fictives en récits réels, ne
supprime aucune prémodération et ne promet aucun service d’urgence ou de soutien.

## Matrice d’affichage

| Accès requis | Contributions effectives | Affichage |
| --- | --- | --- |
| true | ouvertes ou fermées | Textes privés existants, invitation distincte de récupération ; bouton suspendu si fermé |
| false | ouvertes | Accès public, rédaction fictive sans invitation ; code de récupération conservé |
| false | fermées | Lecture publique ; contributions temporairement suspendues ; bouton existant désactivé |

`submissionsOpen` reste calculé par le contrat existant : flag explicitement true
ET créneaux de modération renseignés. Aucun contrôle d’autorisation n’utilise le
nouveau contexte de présentation. Seuls les booléens et le planning déjà public
sont transmis par le loader serveur ; aucun code d’invitation n’est envoyé.

## Inventaire et décision

Recherche globale, y compris documentation/configuration/tests, sur bêta privée,
invitation/invités, code d’accès, accès réservé et variantes. Les occurrences UI
suivantes sont maintenant conditionnelles :

| Occurrences | Mode privé | Mode public |
| --- | --- | --- |
| Titre document racine | Bêta privée | Nom du projet |
| Navbar, footer, ancienne sidebar | Marque privée | Accès public / situations fictives pour adultes |
| Hero et guide de contribution | Adultes invités, situation fournie avec invitation | Lecture publique, rédaction fictive ou suspension explicite |
| FAQ | Lecteurs invités et deux codes distincts | Lecture publique et code de récupération seul |
| Aide et confidentialité | Contact via invitation, accès invité | Contact direct, session et lecture publique |
| Règles | Cohorte invitée, planning reçu avec invitation | Règles de participation et état indépendant des contributions |
| Profil, confirmation, confirmation/toast de modération | Audience invitée, planning de l’invitation | Audience publique, aucune invitation requise |

Occurrences volontairement conservées :

- `/beta` et erreurs du gate : accessibles uniquement selon leurs conditions
  existantes. En mode public, GET /beta redirige déjà vers / ; aucun changement.
- Code de récupération, code de vérification e-mail et « endroit privé » :
  sécurité de session, pas restriction d’accès public. Textes conservés.
- « Accès réservé à la modération » : autorisation du rôle, indépendante de l’accès.
- Mention « bêta » sans restriction dans les avertissements de sécurité, exemples,
  feedback et règles de contenu fictif : ne prétend pas imposer une invitation.
- Ancien message serveur de create-post (« réponses fermées pendant la bêta
  privée ») : action de réponse désactivée, sans formulaire/CTA public actif.
  Conservé pour ne pas modifier les règles de publication ou actions serveur.
- README, guides d’exploitation, migrations, configurations, fixtures/tests et
  archives de conception : décrivent contrat/configuration ou historique, pas
  affichage participant. Les fixtures privées restent nécessaires à la régression.
- Aucun texte de restriction supplémentaire trouvé dans les assets publics.

## Validation préprod après revue et autorisation distincte

Vérifier sur les pages accueil, règles, confidentialité, aide et profil que
l’accès public ne montre aucun badge privé ni instruction d’invitation. Le titre
SSR et l’interface hydratée doivent être cohérents. Avec contributions fermées,
la lecture et les ressources d’aide restent utilisables, le bouton d’envoi reste
indisponible et son état est expliqué en texte.

Le retour en mode privé conserve les formulations et le gate existants. Tester
les contributions ouvertes uniquement dans un environnement prévu pour cela,
avec planning renseigné. Aucun changement d’environnement distant ni déploiement
n’est effectué dans ce ticket.
