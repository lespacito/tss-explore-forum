# Profil GEO : Parlons Violence

> Profil de travail du moteur GEO. `CONTEXT.md` et `PRODUCT.md` restent les sources de vérité produit. Aucune hypothèse marché ne doit devenir une affirmation publiée sans recherche et validation.

## 1. Identité

- **Nom** : Parlons Violence
- **URL publique** : https://parlonsviolence.ch
- **Catégorie actuelle vérifiée** : bêta privée sur invitation avec scénarios fictifs
- **Service cible** : à définir et valider avant tout positionnement public
- **Plateformes** : web
- **Modèle et prix** : aucun prix ou modèle public détecté `[À CONFIRMER]`
- **Pays et année de création** : Suisse, année non confirmée
- **Entité juridique** : `[À CONFIRMER]`
- **Contact public** : contact@parlonsviolence.ch

## 2. Proposition de valeur

- **En une phrase** : Parlons Violence expérimente en Suisse romande un parcours sous alias, modéré et sans inscription par e-mail, avant de décider du service public durable.
- **H1 réel de la page d'accueil** : Parlons Violence
- **Sous-titre réel** : Une expérience encadrée. Environ 10 minutes.
- **Meta description réelle** : aucune détectée

## 3. Niche et vocabulaire

- **Vocabulaire actuel** : bêta privée, scénario fictif, alias, prémodération, code de récupération
- **Requêtes marché** : aucune recherche validée à ce jour
- **Questions posées à une IA** : aucune donnée observée ou trackée à ce jour
- **Concepts à ne pas traiter en article générique** : définition de la violence, définition de l'anonymat, définition de la modération

## 4. Cibles

### Persona principal

- **Qui, pendant la bêta** : adulte invité en Suisse romande utilisant un scénario fictif
- **Problème testé** : accomplir et comprendre le parcours sans assistance de l'observateur
- **Service cible** : cible, douleur et attente à valider avant production de contenu d'acquisition

### Personas secondaires

- Aucun persona secondaire validé.

## 5. Jobs-to-be-done

1. Partager un récit sous alias sans créer de profil public `[À CONFIRMER pour le service cible]`.
2. Comprendre ce qui arrive au récit après son envoi.
3. Retrouver sa session et demander l'effacement de ses données.
4. Trouver des ressources d'aide adaptées sans confondre le site avec un service d'urgence.

## 6. Fonctionnalités clés

1. Parcours sur invitation pour la bêta privée : `/`.
2. Publication sous alias après examen humain : `/threads`.
3. Récupération de session par code confidentiel : `/auth/login`.
4. Règles, confidentialité et ressources d'aide : `/rules`, `/privacy`, `/help`.

## 7. Concurrents

- **Directs** : aucun concurrent validé
- **Adjacents** : aucun acteur validé comme concurrent ; les services d'aide ne doivent pas être classés automatiquement comme concurrents commerciaux
- **Ceux qu'on cite dans les comparatifs** : aucun avant recherche et validation

## 8. Data first-party

- **Datasets disponibles** : schéma produit pour sessions, scénarios et décisions de modération. Aucune donnée réelle exploitable constatée.
- **Comment y accéder en lecture** : accès à définir après la cohorte, avec agrégation et contrôle de confidentialité.
- **Chiffres canoniques déjà publiés** : aucun résultat de cohorte établi.
- **Études ou pages de données déjà en ligne** : aucune détectée.

## 9. Voix

- **Langue(s) de production** : français
- **Tutoiement ou vouvoiement** : vouvoiement dans le produit ; tutoiement réservé aux briefs internes de l'agent
- **Ton** : clair, respectueux, sobre, sans jugement
- **Interdits** : ne pas promettre l'anonymat absolu, l'urgence, une disponibilité permanente, une prise en charge, un diagnostic ou un conseil juridique personnalisé ; ne jamais présenter les scénarios de bêta comme réels
- **Exemple de page qui incarne la voix** : `src/routes/privacy.tsx`

## 10. Site et stack

- **Framework** : TanStack Start avec React et Vite
- **Dossier des pages de contenu** : aucun système éditorial détecté ; cible proposée `content/` `[À CONFIRMER]`
- **Format d'une page** : routes React TypeScript ; aucun rendu Markdown ou MDX détecté
- **Rendu** : SSR disponible dans la stack, rendu public de contenu non vérifié
- **Internationalisation** : français uniquement, sans préfixe de locale
- **Sitemap** : absent du dépôt ; aucun sitemap public vérifié
- **robots.txt autorise les bots IA** : oui dans le fichier statique, mais le meta robots global impose `noindex, nofollow`
- **Page auteur et schema author** : à créer
- **Adaptateur choisi** : `markdown-generic`, faute d'intégration MDX existante
- **Exemple de page de référence** : aucun article éditorial existant

## 11. Outils connectés

- **Suivi de la visibilité IA** : treg a été utilisé pendant la configuration ; disponibilité actuelle à revérifier, aucun budget payant autorisé
- **Analytics produit** : aucun détecté
- **Google Search Console, observation du 2026-09-14** : `sc-domain:stagging.parlonsviolence.ch` était sélectionnée dans treg avec le niveau `siteOwner`. La propriété du domaine public n'avait pas été constatée. Revérifier avant toute décision.
- **Emailing** : Resend détecté pour l'e-mail transactionnel, pas de système de lead magnet
- **Automatisation navigateur** : Playwright local
- **Recherche de mots-clés** : expansion manuelle ; DataForSEO non autorisé

## 12. Auteur (E-E-A-T)

- **Nom** : `[À CONFIRMER]`
- **Bio en deux lignes** : `[À CONFIRMER]`
- **Page auteur** : à créer
- **Profils publics à lier** : `[À CONFIRMER]`

## 13. Multi-produits

- Aucun autre produit détecté.

## 14. État

- **Inventaire de contenu** : `content-inventory.md`
- **Univers de mots-clés** : aucune recherche validée ; reconstruire le fichier uniquement à partir de données observées
- **Files d'exécution** : `queue/`
- **Dernier rituel de mesure** : aucun
- **Phase actuelle** : fondations infra avant volume
