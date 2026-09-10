---
target: parcours participant bêta privée
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:/Users/dev/Documents/Codex/2026-09-03/onn/tss-explore-forum/src/routes/threads"
timestamp: 2026-09-09T20-29-31Z
slug: src-routes-threads
closed: true
---
## État de santé du design

| # | Heuristique | Score | Problème clé |
|---|---|---:|---|
| 1 | Visibilité de l’état du système | 3/4 | Chargement, envoi, copie et statuts sont signalés, mais le parcours n’affiche aucun repère d’étape et l’effacement se termine sans confirmation dédiée. |
| 2 | Correspondance avec le monde réel | 2/4 | Le langage est généralement clair, mais plusieurs catégories sollicitent une expérience réelle alors que la bêta impose un scénario fictif. |
| 3 | Contrôle et liberté | 2/4 | Les retours sont présents, mais « Effacer le brouillon » réinitialise aussi le formulaire sans confirmation ; un refus n’offre aucune voie de correction. |
| 4 | Cohérence et standards | 2/4 | « Refusées » devient « Modifications nécessaires », « publication » devient « discussion » et la typographie des titres varie. |
| 5 | Prévention des erreurs | 2/4 | Les contraintes et la confirmation `EFFACER` sont solides ; la récupération du brouillon reste difficile à découvrir et son effacement est dangereux. |
| 6 | Reconnaissance plutôt que mémorisation | 2/4 | La navigation est explicite, mais la restauration du brouillon et le créneau de modération reposent sur le souvenir. |
| 7 | Flexibilité et efficacité | 2/4 | Le clavier natif et le collage du code aident ; le parcours reste rigide, ce qui demeure acceptable pour une petite cohorte. |
| 8 | Esthétique et minimalisme | 2/4 | La base est calme, mais la rédaction empile trop de cartes, consignes et outils avant l’action principale. |
| 9 | Reconnaissance et récupération des erreurs | 2/4 | Plusieurs messages sont bienveillants, mais les erreurs de formulaire sont surtout globales et un fallback parle encore de « thread ». |
| 10 | Aide et documentation | 3/4 | Aide publique, avertissement contextuel et explications du code sont solides ; certains conseils sont éloignés du moment où ils servent. |
| **Total** |  | **22/40** | **Acceptable — améliorations significatives nécessaires** |

## Verdict de spécificité

L’interface est modérément spécifique à Parlons Violence. La palette minérale, Lora, le Violet de confiance, le consentement au brouillon local, la prémodération et le traitement du code secret construisent une identité crédible. Mais l’ossature reste proche d’un forum générique fondé sur des cartes, avatars, badges, emojis et une barre d’édition standard. Les moments sensibles n’expriment pas encore pleinement le « carnet de confiance ».

La rupture la plus dommageable n’est pas décorative : le produit annonce un exercice fictif, tandis que plusieurs textes invitent la personne à raconter « ce qui lui est arrivé » ou à chercher du soutien. Cette contradiction affaiblit davantage la confiance que la direction visuelle ne peut la renforcer.

Le détecteur retourne 0 constat dans `src/routes/threads`. Ce résultat propre est limité au sous-arbre ciblé et ne couvre pas les composants importés dans `src/components`, `src/features` et `src/data`. Quatre vues ont été inspectées : `/threads`, `/threads/new`, `/threads/new/VIOLENCE` et `/threads/confirmation`. Le thème sombre, le violet et la hiérarchie globale sont cohérents ; le formulaire est nettement plus dense que la liste vide et la confirmation. L’API du navigateur n’autorisait pas la mutation de `document.title` : aucune injection fiable ni overlay `[Human]` n’est disponible. Les captures et arbres d’accessibilité servent de preuve de repli.

## Impression générale

Le socle est responsable, calme et déjà utilisable. La plus grande opportunité est de faire coïncider chaque mot et chaque fin de parcours avec la promesse réelle de la bêta : scénario fictif, contrôle des données, prémodération et suivi sans assistance immédiate.

La charge cognitive de la rédaction est élevée : 6 échecs sur 8. Les deux routes séparent correctement choix et rédaction, mais le formulaire expose simultanément questions guides, stockage local, effacement, formatage, modération et sécurité. Trois décisions dépassent quatre options : cinq catégories, six filtres et six commandes de formatage.

## Ce qui fonctionne

1. La responsabilité produit est visible : invitation, absence d’email, limites de la modération et urgence sont expliquées à des moments pertinents.
2. Les statuts restent compréhensibles sans dépendre uniquement de la couleur : icône, texte et couleur sont combinés, avec un motif en cas de refus.
3. Le code secret est traité comme un objet important : typographie mono, copie, explication de conservation et avertissement sur le presse-papier forment un dispositif convaincant.

## Problèmes prioritaires

### [P1] Les catégories sollicitent une confidence réelle pendant un test fictif

Pourquoi : c’est une rupture de contrat sur un sujet sensible. Une personne peut transmettre de vraies informations personnelles alors que la cohorte ne le demande pas.

Correction : reformuler descriptions, aides, placeholders et questions autour d’un personnage et d’une situation fictive, sans « votre situation », « ce qui m’est arrivé » ni promesse de soutien.

Commande suggérée : `$impeccable clarify`

### [P1] La récupération de session mène au fil public

Pourquoi : après avoir saisi un code à fort enjeu, la personne s’attend à retrouver ses publications. L’arrivée sur `/threads` ressemble à un échec de reconnexion.

Correction : rediriger vers `/account/profile` et confirmer « Session retrouvée — voici vos publications ».

Commande suggérée : `$impeccable harden`

### [P1] Les deux suppressions se terminent sans assurance suffisante

Pourquoi : « Effacer le brouillon » retire le stockage et vide aussi le formulaire courant sans confirmation. L’effacement du compte renvoie ensuite vers l’entrée sans confirmer clairement ce qui a été supprimé.

Correction : séparer « retirer la copie enregistrée » et « vider ce formulaire », confirmer toute perte du contenu courant, puis afficher une fin explicite et honnête sur la base active et les sauvegardes.

Commande suggérée : `$impeccable harden`

### [P1] Le statut de refus promet une modification inexistante

Pourquoi : le filtre dit « Refusées », le badge « Modifications nécessaires », mais aucune édition ni resoumission n’est possible. « Notre équipe est là » amplifie aussi une capacité non garantie.

Correction : soit assumer « Refusée » avec une explication et le contact réel, soit créer un véritable parcours de correction. Employer le même statut partout.

Commande suggérée : `$impeccable clarify`

### [P2] La rédaction enfouit l’action principale

Pourquoi : sur mobile, l’éditeur et le CTA arrivent après plusieurs blocs. Les six commandes de formatage mesurent 32×32 px, sous la cible tactile de 44 px, et la sauvegarde opt-in peut être manquée avant une interruption.

Correction : condenser les consignes avant l’éditeur, déplacer les détails en divulgation progressive, ne garder qu’un avertissement d’urgence, rapprocher l’état de sauvegarde du champ et porter les commandes à 44 px.

Commandes suggérées : `$impeccable distill`, puis `$impeccable adapt`

## Drapeaux rouges par persona

**Jordan — première utilisation**

- Les catégories lui demandent littéralement de partager une expérience alors que l’exercice doit rester fictif.
- Cinq catégories proches demandent une distinction sémantique difficile.
- La récupération de session apparaît comme une clé sans libellé visible dans la barre.
- Après reconnexion, le fil public ne confirme pas que sa session a été retrouvée.

**Sam — lecteur d’écran, clavier ou basse vision**

- Les commandes de formatage de 32 px sont trop petites.
- Les erreurs de titre et de message déclenchées à l’envoi ne sont pas reliées aux champs par `aria-invalid` et `aria-describedby`.
- Le statut est correctement redondant par icône, texte et couleur.
- La barre d’outils possède un nom accessible, mais ses séparateurs restent purement visuels.

**Casey — mobile, distraite et interrompue**

- L’action principale se trouve très bas et hors de la zone naturelle du pouce.
- La sauvegarde est désactivée par défaut ; une interruption peut coûter le brouillon.
- La restauration exige de retrouver la bonne catégorie puis de penser à réactiver l’option.
- Les six petites commandes de formatage captent l’attention et sont difficiles à toucher.

## Observations mineures

- « Voir la discussion » promet une conversation alors que les réponses sont fermées.
- Les badges affichent parfois les identifiants internes `VIOLENCE` ou `DETRESSE` plutôt que les libellés humains.
- Les emojis de catégorie ont un rendu variable et rapprochent le produit d’un forum de soutien.
- Le titre de sélection des catégories n’utilise pas Lora contrairement au système documenté.
- Le fallback « Erreur lors de la création du thread » expose du vocabulaire technique.
- La connexion par email reste proposée dans un parcours dont la cohorte privilégie la session anonyme.

## Questions à considérer

- Si la bêta mesure un scénario fictif, pourquoi son langage continue-t-il à demander une confidence réelle ?
- « Modifications nécessaires » signifie-t-il réellement qu’une correction est possible ?
- Le formatage riche aide-t-il cinq participants à tester le dépôt, ou détourne-t-il l’attention du parcours à valider ?
- Après l’effacement, quelle phrase doit permettre à la personne de fermer l’onglet sans aucun doute ?
