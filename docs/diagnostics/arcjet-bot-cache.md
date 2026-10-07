# Caractérisation du cache BOT Arcjet beta.15

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

## Impact

Un faux positif temporaire peut toucher un navigateur partageant la même IP
(NAT/VPN) ou la même identité connectée. Plusieurs routes peuvent être concernées
car leurs options BOT et leur singleton sont identiques. En mode LIVE, les
handlers existants refusent la décision ; cela se traduit notamment par HTTP 403
sur l’API auth, ou une erreur applicative sur les server functions.

La mise en cache ne constitue pas ici un contournement de protection : le risque
observé est la disponibilité et la justesse de classification. Si l’IP ne peut
être extraite, notre fallback `127.0.0.1` peut élargir le groupe affecté ; ce scénario
est caractérisé par les tests synthétiques de résolution IP.

## Validation

`bun run test:unit src/features/auth/lib/security/__tests__/arcjet-bot-cache.test.ts`
exécute cinq cas avec le vrai SDK/détecteur/cache. L’UA navigateur est simulé ;
aucun navigateur piloté ni service Arcjet distant n’est utilisé. La première
initialisation WASM dispose de 30 secondes ; le temps TTL est contrôlé par Date.now
sans attente réelle ni fake timers du moteur.

Ces tests de caractérisation ne dépendent pas des anciens hooks de diagnostic.
Ils documentent le SDK verrouillé et ne prescrivent aucun changement des règles,
des caractéristiques globales ou des quotas.
