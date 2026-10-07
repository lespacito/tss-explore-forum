# Caractérisation de la résolution IP Arcjet beta.15

Ce document décrit le comportement des dépendances verrouillées et des policies,
sans instrumentation runtime. Les cas synthétiques ne permettent pas de déduire
la configuration effective des proxies ni un défaut global chez les visiteurs.

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

## Tests

Douze tests avec véritable SDK/adaptateur/résolveur/cache/WASM, session et transport
simulés : XFF public+proxy privé, X-Real-IP, priorités conflictuelles, chaîne XFF
publique, X-Client-IP, Forwarded RFC, privé seulement, absence, request.ip ignorée
par Node, partage BOT via fallback, identité/fingerprint de quota communs et
session conservée malgré IP vide. Ils prouvent les entrées du rate limit, pas
l’application de son compteur distant.

Ces tests ne dépendent pas des anciens hooks de diagnostic. Ils servent de
référence lors d’une évolution du SDK ou des policies ; ils ne prescrivent aucun
changement des protections actuelles.
