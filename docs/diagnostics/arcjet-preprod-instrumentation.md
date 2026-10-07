# Instrumentation temporaire Arcjet — validation avant merge

Désactivée par défaut. Opt-in strict : ARCJET_PREPROD_DIAGNOSTICS=true dans
l’environnement **du processus applicatif**, uniquement pendant la validation
préprod. Ne pas activer ARCJET_LOG_LEVEL=debug pour cette procédure.
Aucun header de requête ne peut activer cette instrumentation.

## Diff

Module isolé arcjet-diagnostics.ts et hooks dans les policies : identifiant
UUID aléatoire par invocation de policy, deux événements JSON console.info
policy-entry / arcjet-decision (ou arcjet-error). Aucun contexte logger enrichi
avec un utilisateur ; aucun path/query/header brut, ID de session, empreinte,
ruleId ou message d’erreur. Les logs Arcjet préexistants restent inchangés.
La structure des quatre headers conserve l’ordre de 16 entrées maximum ; les
valeurs sont remplacées par form/category et un indicateur truncated.
private regroupe les adresses valides non globales, y compris réservées ;
missing inclut une valeur absente ou invalide. Le parsing Forwarded sert
uniquement à l’anonymisation, jamais à résoudre ou modifier l’identité.

policyIpResolution=not-run-session signifie que le court-circuit de session
existant a été respecté. fallbackUsed correspond à l’utilisation effective du
fallback existant, avant la substitution spécifique au développement.
requestIpCategory est l’adresse exposée par le runtime (souvent le pair Traefik).
adapterIpResolution=not-observable : beta.15 n’expose pas de hook stable pour
observer son champ IP réel. Pas d’interception de ses logs, de faux résultat
recalculé, ni d’accès aux internals SDK. Le warning natif ne peut donc pas être
corrélé précisément par ce module. Les événements corrèlent en revanche la
policy et la décision qu’elle retourne. Les UUID ne sont pas renvoyés au client.

## Procédure proposée, après review/merge et autorisation distincte de déploiement

1. Rendre la variable disponible dans l’environnement app préprod effectif.
   Le compose actuel n’en fait pas un passthrough automatique : une variable
   définie seulement dans l’interface Dokploy peut ne pas atteindre le conteneur.
   Préparer ce raccordement dans la configuration préprod autorisée, sans clé
   applicative supplémentaire. Aucune configuration infra n’est modifiée ici.
2. Pour une courte fenêtre, activer la variable exactement à true. Conserver le
   niveau de logs actuel ; limiter l’accès aux logs et leur rétention.
3. Sur GET /api/auth/get-session sans cookie, effectuer un contrôle navigateur,
   puis BOT curl et navigateur immédiatement après. Grouper les événements
   par correlationId ; comparer policyIpResolution, fallbackUsed, catégories
   des headers, requestIpCategory et les états de décision. L’UA n’est pas loggé :
   consigner séparément l’ordre/heure des appels de test.
4. Refaire les contrôles depuis une deuxième sortie réseau indépendante,
   dans la fenêtre du cache. Ne pas injecter d’IP falsifiée pour simuler ce client.
   Si fallbackUsed=true sur les appels anonymes : identité de repli collective
   confirmée. Si resolution=success/fallbackUsed=false : ne pas conclure que
   l’adresse est celle du client final ; vérifier la topologie des hops.
5. En cas de warning natif malgré résolution policy réussie, la divergence est
   compatible avec l’adaptateur, mais l’instrumentation seule ne prouve pas quel
   warning appartient à quelle requête. Garder cette limite dans le compte rendu.
6. Désactiver la variable à false ou la retirer, vérifier l’arrêt de ces événements.
   Retirer ensuite module/hooks/tests/documentation dans un commit dédié.

Aucun changement de règles, characteristics, fallback, proxy ou dépendances.
Aucun déploiement ni accès à la préprod exécuté pour préparer ce diff.
