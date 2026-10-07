# Résolution IP Arcjet — diagnostic du 8 octobre 2026

## État observé

L’utilisateur confirme maintenant BOT puis Chrome refusés en HTTP réel sur
GET /api/auth/get-session sans cookie, avec deux warnings `Client IP address is missing`.
Le refus HTTP est établi ; la cause exacte de l’absence d’IP nécessite encore un
relevé côté application des headers et de request.ip. Aucun accès VPS/Dokploy,
aucune relance réseau et aucun patch de protection dans cette investigation.

## Chaîne constatée dans le dépôt et les dépendances verrouillées

1. Build Nitro preset bun ; srvx expose un getter request.ip depuis
   server.requestIP(request).address : c’est le pair transport, généralement
   Traefik, pas nécessairement le client final.
2. TanStack getRequest retourne event.req ; la route auth passe son Request
   directement aux policies, sans reconstruction ni filtrage de headers.
3. La policy calcule session.user.id, sinon @arcjet/ip.findIp(Request), sinon
   la constante 127.0.0.1. Aucun proxies/platform n’est passé à cet appel.
4. Le Request est casté ArcjetNodeRequest. Un cast ne crée pas de socket Node.
5. @arcjet/node beta.15 normalise les Headers, conserve les headers de proxy,
   retire cookie et recalcule ip via findIp({socket: request.socket, headers},
   {platform, proxies}). Il ignore request.ip, request.info et le runtime Bun.
   Notre singleton ne configure pas proxies. En production, le warning signifie
   précisément que cette seconde résolution retourne une chaîne vide.
6. userIdOrIp reste dans details.extra ; details.ip est indépendant et peut
   être vide alors que userIdOrIp est valide. Le warning seul ne prouve donc
   pas que notre fallback a été utilisé.

## Headers beta.15 hors plateforme spécifique

findIp préfère request.ip/socket/info publics aux headers. Ensuite :
X-Client-IP ; X-Forwarded-For (de droite à gauche, première IP publique retenue) ;
DO-Connecting-IP ; Fastly-Client-IP ; True-Client-IP ; X-Real-IP ;
X-Cluster-Client-IP ; X-Forwarded ; Forwarded-For ; Forwarded ; X-Appengine-User-IP.
Les adresses privées/loopback et les proxies explicitement configurés sont exclus.
Forwarded n’est accepté que comme une IP brute : la syntaxe RFC
`for=8.8.8.8;proto=https` n’est pas analysée et retourne vide à elle seule.
X-Forwarded-Proto/Host ne fournissent aucune IP.

L’adaptateur ajoute une sélection platform via FLY_APP_NAME/VERCEL/RENDER ;
la policy ne la fait pas. Une variable de plateforme inattendue pourrait créer
une divergence. Sa présence réelle n’a pas été relevée.

Traefik documente l’ajout automatique X-Forwarded-For et X-Real-Ip :
https://doc.traefik.io/traefik/reference/routing-configuration/http/middlewares/headers/
Ses règles de confiance pour les headers entrants sont distinctes du proxies
Arcjet : https://doc.traefik.io/traefik/reference/install-configuration/entrypoints/
Le dépôt ne contient pas la configuration effective des entrypoints/middlewares
préprod. Il est donc impossible d’affirmer où les headers sont perdus, remplacés,
privés ou mal formés. Un Request Web n’empêche pas Arcjet de lire XFF/X-Real-IP :
les tests démontrent qu’ils fonctionnent lorsqu’ils contiennent une IP publique.

## Empreintes et rate limit

characteristics=[userIdOrIp] remplace la caractéristique IP implicite : une ip
vide ne rend pas automatiquement toutes les empreintes identiques. En revanche,
si findIp échoue aussi dans la policy, tous les visiteurs sans session partagent
127.0.0.1. Le cache BOT 60s devient alors un refus collectif, même entre des IP
réelles différentes. Si request.ip désigne un proxy public non exclu, la policy
peut aussi grouper ses visiteurs malgré un XFF valide.

Les slidingWindow n’ont pas de caractéristiques propres et héritent userIdOrIp :
le fallback partage donc aussi le quota anonyme. get-session utilise la policy
par défaut 60/min ; sign-in/sign-up/contributions utilisent 10/10min. Les règles
ont des IDs distincts selon leurs paramètres ; ce n’est pas un quota unique pour
tous les presets. Les comptes avec session restent séparés par user.id.

Les headers non fiables peuvent également changer l’identité et contourner les
quotas : X-Client-IP prime même sur XFF. Aucune exploitation réelle n’est démontrée.
L’IP vide prive les contrôles distants de leur signal IP ; leur comportement
réel et leurs compteurs ne sont pas reproduits par nos mocks. Les appelants ne
bloquent que isDenied(), donc une éventuelle ERROR n’est pas équivalente à DENY.

## Tests et correction minimale recommandée

Douze tests avec véritable SDK/adaptateur/résolveur/cache/WASM, session et transport
simulés : XFF public+proxy privé, X-Real-IP, priorités conflictuelles, chaîne XFF
publique, X-Client-IP, Forwarded RFC, privé seulement, absence, request.ip ignorée
par Node, partage BOT via fallback, identité/fingerprint de quota communs et
session conservée malgré IP vide. Ils prouvent les entrées du rate limit, pas
l’application de son compteur distant.

Priorité avant de toucher BOT : relever côté application uniquement la forme et
la présence des headers, request.ip, le résultat de chaque résolveur et
l’utilisation du fallback (sans cookies/tokens/IP brute dans les logs durables).
Vérifier les entrypoints/middlewares, les hops de proxy réels et l’inaccessibilité
directe de l’app ; neutraliser les headers de client pouvant supplanter l’IP canonique.

La correction applicative à préparer est une résolution IP canonique unique,
issue d’une chaîne de confiance vérifiée, utilisée à la fois pour le champ IP
Arcjet et l’identité anonyme. Supprimer le fallback localhost silencieux en
production et définir explicitement le traitement d’une IP introuvable. Le choix
technique d’adaptateur/API doit être validé pour beta.15 : ne pas recopier une
option ipSrc récente dans une version qui ne la gère pas. Corriger seulement
Traefik peut suffire si XFF/X-Real-IP manquent ; le test doit ensuite prouver la
séparation de deux clients et l’impossibilité de changer de quota par header forgé.

Même avec une IP correcte, le cache BOT reste partagé au sein d’une même identité/IP
quand l’UA change. Résoudre l’IP réduit l’amplification, mais ne corrige pas ce
second problème indépendant. Ne pas ajouter l’UA aux quotas globaux.
