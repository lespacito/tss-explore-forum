# Non-Functional Requirements

## Sécurité

La sécurité est l'exigence non-fonctionnelle la plus importante de ce projet.

- **Confidentialité des Données :** Toutes les données des utilisateurs doivent être chiffrées au repos et en transit.
- **Principe de Moindre Privilège :** Les modérateurs ne peuvent que supprimer du contenu, jamais le modifier. L'accès à la base de données est strictement limité.
- **Anonymat :** Le système doit être conçu pour ne jamais exiger d'informations personnelles identifiables pour les parcours de crise.
- **Dépendances :** Toutes les dépendances logicielles devront être auditées régulièrement pour des failles de sécurité.

## Performance

L'application doit être rapide et réactive, en particulier pour un utilisateur en situation de stress.

- **Temps de Réponse :** L'interaction pour commencer à écrire un message (parcours de Marie) doit se charger en moins de 2 secondes sur une connexion mobile standard.
- **Publication :** La soumission d'un post doit recevoir une confirmation du système en moins de 3 secondes.

## Accessibilité

L'accessibilité est une exigence fondamentale et non-négociable.

- **Standard :** L'application doit se conformer au minimum au standard **WCAG 2.1 niveau AA**.
- **Tests :** L'application doit être testable et utilisable via la navigation au clavier et avec les principaux lecteurs d'écran.

## Fiabilité (Reliability)

La plateforme doit être disponible lorsque les utilisateurs en ont besoin.

- **Disponibilité :** Le service doit viser un temps de disponibilité de **99.9%**.
- **Sauvegardes :** Des sauvegardes régulières de la base de données doivent être effectuées pour prévenir toute perte de données.

## Scalability

L'architecture du MVP doit supporter le lancement initial et une croissance modeste, tout en ayant un plan pour l'avenir.

- **MVP :** Le système doit pouvoir gérer confortablement les 20+ utilisateurs actifs et 50+ posts prévus dans les 6 premières semaines.
- **Post-MVP :** L'architecture choisie devra permettre une mise à l'échelle pour supporter une croissance future, comme défini dans la vision du produit.
