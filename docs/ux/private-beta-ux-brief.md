# Brief UX — Bêta privée Parlons Violence

**Date :** 12 septembre 2026
**Statut :** Décisions confirmées, prêt pour conception détaillée
**Périmètre :** Première cohorte privée, scénarios fictifs uniquement

## 1. Objet

La bêta privée est un produit expérimental distinct du service cible. Elle doit
valider qu’un adulte invité peut envoyer un scénario fictif sous alias, comprendre
la prémodération, retrouver sa session et contrôler ses données sans dépendre
d’une explication de l’organisateur.

Elle ne doit pas être présentée comme un forum déjà actif, un espace d’écoute ou
un service d’urgence. Les contraintes temporaires de la bêta ne préjugent pas de
l’UX du service cible.

Le vocabulaire canonique est défini dans [`CONTEXT.md`](../../CONTEXT.md).

## 2. Résultats recherchés

### Apprentissage principal

Le participant accomplit l’**envoi autonome** depuis l’entrée par invitation
jusqu’à la confirmation, sans indication de l’observateur. Il peut utiliser les
aides intégrées à l’interface.

### Apprentissage secondaire

Après l’envoi, le participant sait expliquer que son scénario est **À examiner**,
qu’il n’est pas encore visible et qu’une décision humaine le rendra **Publié** ou
**Non publié**.

### Seuil de passage

La cohorte permet d’envisager la suite lorsque :

- au moins 80 % des participants envoient un scénario sans assistance ;
- au moins 80 % expliquent correctement le statut « À examiner » ;
- aucun blocage critique d’accessibilité ou de récupération n’est observé ;
- la charge de modération reste soutenable pour une personne.

La préférence esthétique et la satisfaction déclarée éclairent les décisions,
mais ne remplacent pas ces critères.

## 3. Promesse et ton

Le premier écran présente une **expérience de test encadrée** :

- participation temporaire ;
- scénario obligatoirement fictif ;
- durée approximative de la tâche ;
- examen humain avant toute visibilité ;
- action claire pour commencer.

Le ton est chaleureux, direct et sans dramatisation. Il ne promet ni anonymat
absolu, ni soutien immédiat, ni disponibilité permanente.

Formulation de référence pour l’identité :

> Aucun nom ni e-mail n’est demandé. Un alias est affiché publiquement si votre
> scénario est publié. Le contenu et certaines données techniques peuvent
> néanmoins permettre de vous reconnaître.

## 4. Architecture de l’information

### Navigation permanente

Une barre supérieure compacte remplace la combinaison barre supérieure + barre
latérale :

- marque Parlons Violence ;
- « Mes scénarios » ;
- menu secondaire : Règles, Confidentialité, Aide.

Le **Fil public** reste accessible depuis l’orientation et « Mes scénarios », mais
ne concurrence pas le parcours principal dans la navigation permanente.

### Parcours critique

```text
Code d’invitation
  → Orientation de la bêta
  → Session sous alias
  → Rédaction continue
  → Confirmation et code de récupération
  → Mes scénarios
```

### Parcours secondaires

```text
Code de récupération
  → Session retrouvée
  → Mes scénarios

Mes scénarios
  → Gérer mes données
  → Effacer mes données
  → Confirmation d’effacement
```

## 5. Écran d’orientation

Le premier écran n’essaie pas de convaincre un public froid. Le participant est
déjà invité ; l’écran doit l’orienter.

Ordre recommandé :

1. « Vous participez à une expérience de test encadrée. »
2. « Utilisez uniquement le scénario fictif fourni. »
3. Durée approximative et aperçu des étapes.
4. Action dominante : « Commencer ».
5. Accès secondaire à Règles, Confidentialité et Aide.

Les explications longues restent accessibles progressivement.

## 6. Formulaire de scénario

Le formulaire est une page continue, sans assistant multi-écrans.

### Ordre de lecture et d’interaction

1. **Scénario** — champ TipTap principal.
2. **Titre** — résumé court demandé après la rédaction.
3. **Catégorie** — classement facultatif.
4. **Alias et visibilité** — rappel avant l’envoi.
5. **Examen humain** — conséquence immédiate expliquée.
6. **Envoyer pour examen** — action principale.

### Aide à la rédaction

L’éditeur commence par une amorce neutre :

> Décrivez ce qui se passe dans ce scénario fictif.

Deux ou trois questions-guides sont proposées dans une aide dépliable. Aucun
modèle n’est injecté dans le texte et aucune réponse n’est préremplie.

### Éditeur TipTap

TipTap est conservé avec une barre d’outils minimale :

- gras ;
- italique ;
- liste à puces.

Les titres, citations et listes numérotées sont retirés du parcours de la bêta.

### Catégorie

La catégorie ne précède plus la rédaction et ne bloque jamais l’envoi. L’absence
de choix produit l’état **Non classé**, distinct du choix **Autre situation**.

### Copie sur appareil

Après les premiers caractères, une option secondaire propose de conserver une
copie sur l’appareil. Elle est désactivée par défaut et prévient :

> Toute personne utilisant ce navigateur pourrait retrouver cette copie.

Refuser cette option ne doit jamais empêcher la rédaction ou l’envoi.

### Alias

Avant l’action finale, l’interface indique :

> Si ce scénario est publié, il apparaîtra sous l’alias **{alias}**.

L’alias est généré ; il n’est ni choisi ni modifié pendant cette bêta.

### Validation et échec

- Une erreur reste visible sous le champ concerné.
- Si plusieurs erreurs existent, un résumé placé au début du formulaire reçoit le
  focus et contient des liens vers les champs.
- Une erreur de validation n’est pas répétée dans une notification temporaire.
- Si l’envoi échoue, tout le contenu reste présent.
- L’interface indique explicitement que le scénario n’a pas été envoyé et permet
  de réessayer.
- Un échec ne doit jamais activer la copie sur appareil sans consentement.

### Action finale

Libellé : **Envoyer pour examen**.

Texte de conséquence immédiatement adjacent :

> Votre scénario ne sera visible qu’après validation par le modérateur.

Le jaune signal est réservé à cette action sur l’écran.

## 7. Confirmation et récupération

L’écran suivant l’envoi présente deux blocs ordonnés.

### Bloc 1 — Résultat

- titre : « Scénario reçu » ;
- statut : « À examiner » ;
- explication : le scénario n’est pas encore visible ;
- rappel de la fenêtre d’examen indiquée dans l’invitation.

### Bloc 2 — Retour ultérieur

- titre : « Conservez votre code de récupération » ;
- code lisible, sélectionnable et copiable ;
- indication que toute personne possédant ce code peut retrouver la session ;
- avertissement sur le presse-papier et les captures d’écran ;
- alternatives de conservation privée, sans imposer une méthode.

La copie du code ne bloque pas la suite et ne constitue pas une preuve de
conservation. Le code reste consultable depuis « Mes scénarios » tant que la
session actuelle existe.

Les expressions « code d’invitation » et « code de récupération » sont toujours
écrites en entier. La connexion par e-mail est masquée pendant la bêta.

## 8. Mes scénarios

L’espace personnel utilise le titre **Mes scénarios** et non « Profil », « Mes
publications » ou « Mes dépôts ».

Introduction :

> Retrouvez vos scénarios et suivez leur statut.

Les scénarios sont regroupés directement, sans filtres :

1. **À examiner** ;
2. **Non publiés** ;
3. **Publiés**.

Chaque statut associe texte et icône. Le jaune peut signaler « À examiner » sur
cet écran, où il ne concurrence pas une action principale. Un scénario « Non
publié » affiche son motif et propose de commencer un nouveau scénario. Aucun
parcours de correction ou de renvoi du même scénario n’est promis dans la
première bêta.

## 9. Fil public et contenu sensible

Le fil public affiche une liste simple de scénarios publiés. Les filtres de
catégorie sont retirés pour la première cohorte ; ils pourront être introduits
dans le service cible lorsque le volume les justifiera.

Un scénario marqué sensible par le modérateur présente le titre et l’alias, mais
masque son contenu. Deux choix explicites sont offerts : revenir ou afficher. Une
fois révélé, le contenu peut être masqué à nouveau.

Le marquage sensible contrôle la présentation. Il ne signifie ni urgence, ni
chiffrement, ni priorité de modération pendant la bêta.

## 10. Modération

La file est ordonnée du scénario le plus ancien au plus récent. Le marquage
sensible reste visible mais ne change pas cet ordre pendant la bêta.

Une décision « Non publié » exige :

1. un motif prédéfini ;
2. une précision facultative.

Motifs initiaux à vérifier avec l’organisateur :

- détail permettant d’identifier une personne ;
- situation réelle ou urgente ;
- contenu hors périmètre de la bêta ;
- informations insuffisantes pour le test.

Le motif décrit le contenu ou le cadre ; il ne juge jamais le participant. Il ne
promet pas une modification lorsque cette fonction n’existe pas.

Si une situation réelle, urgente ou identifiante est reçue, le scénario n’est pas
publié. Le participant est orienté vers les ressources adaptées sans que la bêta
prétende traiter une demande de soutien. Le protocole opérationnel de
l’organisateur doit être finalisé avant l’ouverture.

Pour le service cible, la priorité aux contenus sensibles reste une hypothèse.
Elle exigera une définition distincte de l’urgence et une décision sur le mode de
tri.

## 11. Contrôle et effacement des données

Depuis « Mes scénarios », **Gérer mes données** mène à **Effacer mes données**.

L’écran explique avant confirmation que l’action supprime de la base active :

- scénarios ;
- alias ;
- code de récupération ;
- sessions.

Les copies de brouillon présentes sur l’appareil utilisé sont également retirées.
Le participant saisit **EFFACER**, sans sensibilité à la casse, pour activer
l’action définitive.

Après réussite, l’interface :

- confirme l’effacement ;
- rappelle qu’une copie peut subsister jusqu’à sept jours dans une sauvegarde ;
- permet de quitter la bêta ;
- ne propose pas immédiatement de recréer une session.

## 12. Système visuel

Le « dossier civique » devient le système commun, avec une expression calme dans
les écrans fonctionnels :

- angles droits et filets fins plutôt que cartes molles ;
- surfaces papier pour la lecture et champ bleu nuit pour la structure ;
- quatre rôles typographiques conservés ;
- jaune rare, réservé à l’action ou au statut décisif ;
- aucune information transmise par la couleur seule ;
- ordre de lecture identique après repli responsive.

Le thème suit la préférence claire ou sombre du système. Les deux variantes sont
des états de production à vérifier, pas une préférence décorative secondaire.

La réussite du langage visuel est jugée par la performance et la compréhension,
pas par sa conformité esthétique isolée à `DESIGN.md`.

## 13. Périmètre de réalisation futur

La prochaine itération d’implémentation devra :

- reconcevoir visuellement le parcours participant critique ;
- aligner la terminologie dans toute la bêta ;
- apporter les changements fonctionnels minimaux nécessaires à la modération,
  la récupération et l’effacement ;
- ne pas lancer une refonte complète de toutes les pages ou du service cible.

### Hors périmètre

- témoignages réels ;
- réponses et commentaires ;
- notifications par e-mail ;
- choix ou rotation d’alias ;
- modification et renvoi d’un scénario non publié ;
- authentification par e-mail pendant la bêta ;
- priorité automatique aux contenus sensibles ;
- filtres du fil public pour la première cohorte ;
- certification WCAG.

## 14. Critères d’acceptation de conception

- Le participant peut commencer à écrire sans choisir de catégorie.
- Le scénario, le titre et la catégorie facultative forment une seule page.
- Les contrôles précédant le champ principal sont limités au strict nécessaire.
- L’action finale indique l’examen humain et non une publication immédiate.
- L’alias visible est annoncé avant l’envoi.
- Une confirmation distingue clairement réussite, statut et récupération.
- « Mes scénarios » n’appelle jamais un élément en attente « publication ».
- Les statuts restent compréhensibles sans couleur.
- La navigation ne duplique pas les mêmes destinations dans deux composants.
- Le contenu saisi survit à un échec d’envoi.
- Aucun brouillon durable n’est créé sans consentement.
- L’effacement et sa limite de sauvegarde sont expliqués avant confirmation.
- Le parcours critique fonctionne au clavier, à 200 % de zoom, en thème clair et
  sombre et sur mobile étroit.

## 15. Documentation à aligner lors de l’implémentation

Les changements de code devront inclure une passe de cohérence sur :

- `README.md`, qui promet encore un « anonymat garanti » et décrit le service
  cible comme déjà disponible ;
- `PRODUCT.md`, dont certains noms de parcours et statuts sont antérieurs aux
  décisions présentes ;
- `DESIGN.md`, afin de préciser l’expression fonctionnelle calme du dossier
  civique ;
- les tests qui attendent encore « publication », « code secret », l’ancienne
  sélection de catégorie ou les anciens titres de pages.

Ces alignements sont nécessaires, mais ne font pas partie du présent travail de
documentation décisionnelle.
