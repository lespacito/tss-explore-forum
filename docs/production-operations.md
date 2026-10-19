# Décisions d’exploitation pour la première production

Éléments fournis par l’exploitant le 19 octobre 2026 ; périmètre : témoignages réels prémodérés, sans nouvelle fonctionnalité. Ces décisions ne sont pas la preuve d’une configuration effective du serveur.

- Hébergement : VPS Netcup actuel ; déploiement via Dokploy. Aucun pays d’hébergement n’est déduit du nom du fournisseur.
- Nom public d’exploitation : **Équipe Parlons Violence**. Ce libellé public n’est pas présenté comme une identité juridique vérifiée.
- Contact : **contact@parlonsviolence.ch**.
- Domaine et messagerie : **Infomaniak**.
- Protection anti-abus : **Arcjet**.
- Politique souhaitée : **7 jours maximum pour les journaux techniques et les sauvegardes**. Configurer et vérifier l’expiration effective avant l’ouverture. Une rotation Docker fondée sur la taille ne suffit pas à prouver ce délai ; couvrir les logs app, proxy et les copies pertinentes.
- Ce délai **ne s’applique pas automatiquement aux comptes et témoignages**. Aucun nettoyage de ces données n’est ajouté. Aucune durée supplémentaire n’est inventée pour les retours ou les données métier.
- Modération : **vérification quotidienne selon les disponibilités, sans horaire fixe ni délai de réponse garanti**. Pas de permanence ni de prise en charge d’urgence promise.

## Points d’exécution restant distincts

- Domaine canonique confirmé : **parlonsviolence.ch**. Préparer les images avec cette origine ; basculement DNS toujours soumis au GO de lancement.
- **Resend est confirmé pour les e-mails automatiques de l’application**, conformément au transport existant (src/features/auth/lib/email/transport.ts). Infomaniak conserve la messagerie de contact. Aucun changement SMTP/auth ou clé effectué ; les credentials et le domaine d’envoi production restent à vérifier.
- Le kit conserve la phase de bootstrap contributions fermées. Provisionnement, expiration des sauvegardes/logs, restauration isolée, fournisseur transactionnel et preuves runtime restent à réaliser après les GO prévus dans le runbook.
- Les tests staging/utilisateurs déjà effectués restent acquis ; seuls les contrôles techniques du nouveau candidat et de sa cible production sont à exécuter.
