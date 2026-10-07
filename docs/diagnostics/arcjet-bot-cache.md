# Diagnostic BOT → navigateur, même identité/IP

## Conclusion

Le SDK réellement verrouillé est `@arcjet/node` / `arcjet` **1.0.0-beta.15**.
Le comportement est reproduit sans réseau, avec nos véritables `arcjet-core.ts`
et `arcjet-policies.ts`, l’adaptateur Node, le détecteur WASM et le cache réels.
Seuls la session, l’environnement et le transport distant sont remplacés dans le
test ; le transport retourne ALLOW pour isoler la décision BOT locale.

Séquence observée : `curl/8.0.1` → DENY BOT, `RUN`, TTL 60 ; nouveau Request avec
UA Chrome, même IP/identité, une seconde plus tard → DENY BOT, `CACHED`, TTL 59,
même fingerprint et même ruleId, sans aucun appel distant à `decide`.
À 60 secondes, la classification BOT locale repasse ALLOW. Reconstruire le client
singleton permet également ALLOW avant expiration. Une autre IP n’hérite pas du
refus. Le refus est partagé entre les policies auth et création de contenu.
Le test vérifie les logs de résultat local BOT ALLOW, pas seulement l’ALLOW du
transport simulé : un échec du détecteur ne doit pas être pris pour un succès.

## Origine exacte

- `src/features/auth/lib/security/arcjet-core.ts` définit un singleton, avec
  `characteristics: ["userIdOrIp"]`.
- `arcjet-policies.ts` choisit l’ID de session ou l’IP, puis crée des wrappers
  `.withRule()` ; ces wrappers ne créent pas de cache indépendant.
- Dans `node_modules/arcjet/index.js`, `detectBot().protect` consulte le cache avec
  `(ruleId, fingerprint)` **avant** d’analyser les nouveaux headers. Un refus local
  BOT porte `ttl: 60`. Le moteur stocke ce refus dans `MemoryCache` en mode LIVE.
- Le constructeur crée le cache dans sa closure ; `.withRule()` conserve cette
  closure. `@arcjet/cache` expire les entrées via `Math.floor(Date.now()/1000)`.
- Le User-Agent et le path ne distinguent pas nos empreintes BOT : le test montre
  que des objets Request distincts, des UA différents et d’autres routes se
  heurtent à la même entrée.

Il ne s’agit pas d’une memoization de nos fonctions ni d’une décision distante
persistante dans cette reproduction. C’est le cache par instance du SDK, combiné
à notre choix d’empreinte. Cela n’établit pas à lui seul un bug au regard du contrat
Arcjet : le SDK met intentionnellement des refus en cache.

## Limite d’attribution à la sonde préprod

La sonde distante indiquée est
`/home/deploylespacito/.config/parlonsviolence-preprod/probe-arcjet.mjs` ; son résultat
est `arcjet-validation.json` dans le même répertoire. Le script distant n’a pas été
lu ni relancé. Les résultats transmis par l’utilisateur confirment précisément :

- BOT initial : `BOT RUN/DENY`, décision `DENY`, raison `BOT` ;
- contrôle Chrome, même IP et même processus : `BOT CACHED/DENY` ;
- chemins distincts `/<nonce>/bot` puis `/<nonce>/control`, UA curl puis Chrome ;
- dans les deux cas, SHIELD et RATE_LIMIT restent `NOT_RUN/ALLOW` ; cela ne
  signifie pas que ces protections ont évalué et autorisé la requête ;
- `d.ttl` non sérialisé : aucun TTL historique ne peut être reconstruit avec certitude.

Le passage RUN → CACHED confirme une reprise de la décision BOT, pas un nouveau
classement Chrome comme bot. Le TTL 60 est démontré dans la version verrouillée
et le test local, et non mesuré a posteriori dans cette sonde.

Confirmation Hermes : chaque lancement est un nouveau processus Bun qui importe
le bundle compilé instanciant Arcjet au niveau module. La sonde construit des
Request synthétiques et appelle directement les policies, sans fetch HTTP.
BOT puis Chrome partagent donc réellement le cache ; un nouveau lancement le
recrée. L’attribution SDK/policies est confirmée. Un blocage HTTP d’un véritable
navigateur reste à vérifier : il n’est pas démontré par cette sonde.

## Impact

Un faux positif temporaire peut toucher un navigateur partageant la même IP
(NAT/VPN) ou la même identité connectée. Plusieurs routes peuvent être concernées
car leurs options BOT et leur singleton sont identiques. En mode LIVE, les
handlers existants refusent la décision ; cela se traduit notamment par HTTP 403
sur l’API auth, ou une erreur applicative sur les server functions.

La mise en cache ne constitue pas ici un contournement de protection : le risque
observé est la disponibilité et la justesse de classification. Si l’IP ne peut
être extraite, notre fallback `127.0.0.1` peut élargir le groupe affecté ; ce cas
n’est pas prouvé dans les observations préprod fournies.

## Correction minimale recommandée

Pour la sonde, la modification minimale d’observabilité est de sérialiser `d.ttl`
et les champs state/ruleId/fingerprint pertinents, sans changer ses identités ni
relancer la validation sans demande. Conserver les deux requêtes consécutives
sur le même client pour cette séquence ; un client neuf sert uniquement de témoin.


1. Conserver cette séquence en test de caractérisation et distinguer les tests de
   sonde indépendants (client froid) des tests de séquence (client partagé).
   Un client neuf est un témoin, pas une correction de production.
2. Si un navigateur doit être réévalué immédiatement après changement de signaux,
   corriger **la clé du cache BOT seulement** pour inclure les signaux pertinents,
   au minimum le User-Agent. Préférer une correction SDK vérifiée ; à défaut,
   envisager un patch SDK versionné et ciblé après revue. Aucune version corrigée
   n’est affirmée ici sans vérification de son code et de son comportement.
3. Conserver inchangées les empreintes/quota de rate limiting par identité/IP et
   les protections Shield. Transformer alors le test principal en attente
   navigateur ALLOW (BOT initial toujours DENY), et ajouter la preuve que varier
   l’UA ne réinitialise pas le quota.

Ne pas ajouter l’UA aux caractéristiques **globales**, modifier `userIdOrIp`,
recréer le client à chaque requête, passer en DRY_RUN, autoriser CURL, vider le
cache ou ignorer un refus BOT pour rendre le test vert. Ces changements altèrent
la protection et ne sont pas une correction ciblée de ce diagnostic.

## Validation

`bun run test:unit src/features/auth/lib/security/__tests__/arcjet-bot-cache.test.ts`
exécute cinq cas avec le vrai SDK/détecteur/cache. L’UA navigateur est simulé ;
aucun navigateur piloté ni service Arcjet distant n’est utilisé. La première
initialisation WASM dispose de 30 secondes ; le temps TTL est contrôlé par Date.now
sans attente réelle ni fake timers du moteur.

Aucun fichier de protection, dépendance ou lockfile modifié. Aucun déploiement.

## Vérification officielle — 7 octobre 2026

La dernière version npm de `@arcjet/node` est **1.14.1**. Le tag officiel
`v1.14.1` pointe sur `89fe50a07b587de0e565805c5aefb7aeabf218af`.
Le code publié `arcjet/dist/index.js` conserve, comme beta.15, la consultation
`context.cache.get(ruleId, fingerprint)` avec le fingerprint global, puis un
refus BOT `ttl: 60`. Le User-Agent ne participe pas à cette clé.

Sources officielles :

- [Signalement #6292](https://github.com/arcjet/arcjet-js/issues/6292) : même
  phénomène avec iMessage puis Safari sur 1.12.0 ; fermé le 16 septembre 2026,
  état `not_planned`. La réponse propose des caractéristiques globales IP + UA,
  pas une version corrigeant le cache BOT.
- [Code v1.14.1](https://github.com/arcjet/arcjet-js/blob/v1.14.1/arcjet/src/index.ts#L3000)
  : clé et TTL toujours identiques dans detectBot.
- [Versions publiées](https://github.com/arcjet/arcjet-js/releases).

Les cinq tests de caractérisation existants ont été exécutés sans modification
contre 1.14.1, dans une copie temporaire indépendante du dépôt : **5/5 passent**.
Cela confirme la persistance du comportement indésirable, pas sa correction :
BOT RUN/DENY → Chrome CACHED/DENY, TTL 60 puis 59 ; récupération à expiration,
client neuf, partage entre routes et séparation entre IP.
Le libellé beta.15 du describe a été conservé pour exécuter exactement les mêmes
tests ; les paquets installés node/ip/inspect et le cœur arcjet sont bien 1.14.1.
Le transport reste simulé : aucune requête Arcjet distante ni sonde préprod.

Aucun upgrade ne peut donc être recommandé comme correctif démontré à ce stade.
Le contournement global proposé officiellement modifierait nos quotas hérités ;
il ne doit pas être appliqué tel quel. Une éventuelle isolation des caractéristiques
BOT et rate limit demanderait une conception et des tests séparés. Aucun patch,
changement de dépendance ou de protection n’a été appliqué au dépôt.
