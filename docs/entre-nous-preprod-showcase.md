# Entre nous — vitrine de préproduction

Décision du 9 octobre 2026 : présenter l’offre future « Entre nous » au sein de
Parlons Violence, en conservant l’identité visuelle existante. Cette vitrine
sert aux entretiens ; elle n’ouvre pas le service aux situations réelles.

Source : `recherche-parlons-violence.md`, joint à la conversation « Préparer la
préprod », version du 9 octobre 2026, sections 7–10. L’accroche retenue est
« Pas assez grave pour appeler ? Assez pour en parler. ». Le CTA futur est
« En parler, entre nous », désactivé et accompagné d’une explication en préprod.
Les réponses entre pairs relues sont une intention non implémentée ; aucune
réponse, aucun délai, résultat utilisateur ou anonymat absolu n’est promis.

## Activation ultérieure, uniquement après GO de préproduction

`PREPROD_SHOWCASE` est un réglage serveur de présentation, désactivé par défaut.
Il ne remplace aucune autorisation. Pour afficher la vitrine sur la préproduction
isolée, configurer **après le GO distinct de déploiement** :

```dotenv
PREPROD_SHOWCASE=true
PUBLICATION_MODE=test
BETA_SUBMISSIONS_OPEN=false
```

Le réglage reste `false` ou absent en staging et en production. Le staging garde
le parcours de bêta privée pour les adultes invités. La vitrine ne s’affiche
pas en mode `real` ni lorsque les dépôts sont effectivement ouverts. Elle ne
modifie pas les fenêtres de modération ou le contrôle des invitations.

Conserver la valeur existante de `BETA_ACCESS_REQUIRED` de chaque environnement.
Lorsque le contrôle est actif, le lien du fil exige toujours une invitation
côté serveur ; la vitrine l’indique. Si la préprod autorise déjà la lecture
publique, celle-ci se limite aux scénarios fictifs validés. Cela ne constitue
pas une ouverture de la bêta privée ou de la production.

Ne pas partager bases, secrets, cookies ou domaines entre staging, préproduction
et production. Conserver `noindex, nofollow`, `no-referrer` et les protections
serveur existantes. Aucune migration, donnée réelle ou réponse simulée n’est
ajoutée : l’exemple statique est explicitement inventé, distinct d’une publication.

## Langage et fonctionnement vérifié

Les textes utilisent « Mes scénarios », les statuts « À examiner », « Publié » et
« Non publié », « alias » et « code de récupération ». Le parcours sous alias ne
nécessite ni nom réel ni email. La connexion email historique n’est pas une
condition du parcours anonyme ; les formulations ambiguës de la landing sont
retirées. Les fonctionnalités de compte existantes ne sont pas changées.

Le code actuel du fil affiche « Auteur anonyme » et conserve l’alias interne :
CONTEXT.md est aligné sur cette présentation ; le brief UX historique décrit
encore l’intention antérieure d’un alias public. La vitrine explique cette limite sans modifier le
payload public ni réintroduire d’identifiants. Aucun changement de protection,
d’authentification ou de politique de conservation n’est inclus.

## Limite de livraison

La PR cible `dev`. Sa création ne vaut ni fusion ni autorisation de déploiement.
Ne pas déclencher GHCR manuellement, déployer sur Dokploy ou intervenir sur la
production. L’activation de la vitrine requiert un GO ultérieur distinct.
