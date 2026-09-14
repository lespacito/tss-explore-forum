# Inventaire de contenu : Parlons Violence

## Pages existantes

| URL | Famille | Cluster / hub | Langue | Publié le | Mis à jour le | Liens entrants | Liens sortants | Fact-check |
|---|---|---|---|---|---|---|---|---|
| `/` | produit | bêta privée | fr | non mesuré | non mesuré | non mesuré | `/rules` | à revoir avant ouverture publique |
| `/help` | fondation | ressources d'aide | fr | non mesuré | non mesuré | non mesuré | sources officielles externes | à vérifier |
| `/rules` | fondation | règles de la bêta | fr | non mesuré | non mesuré | `/` | `/privacy`, `/help` | à vérifier |
| `/privacy` | fondation | contrôle des données | fr | non mesuré | non mesuré | `/` | `/help` | à vérifier |

## Hubs

| Hub | Cluster | Spokes rattachés | Spokes manquants |
|---|---|---|---|
| `/help` | ressources d'aide | aucun article | à définir après validation éditoriale |

## Pages orphelines

- Non mesuré.

## Ressources gated

| Ressource | Persona | Placement | Outil emailing / tag | Inscrits |
|---|---|---|---|---|

## Outils gratuits

| Outil | URL | Job résolu | Usage | Conversion | Décision |
|---|---|---|---|---|---|

## Prérequis infra

### Vérifié dans le dépôt le 2026-09-14

- Le rendu serveur fait partie de la stack ; aucun fonctionnement de production n'est déduit de ce constat.
- Aucun sitemap, canonical, JSON-LD Organization/Article, page auteur ou pipeline Markdown/MDX n'a été trouvé.
- `public/robots.txt` ne bloque pas les bots, mais `src/routes/__root.tsx` impose globalement `noindex, nofollow`.

### Observation externe datée, à revérifier avant usage

- Le 2026-09-14, `https://stagging.parlonsviolence.ch` répondait en 401 avec `X-Robots-Tag: noindex, nofollow`. Cette observation convient à un staging privé mais ne prouve rien sur le domaine public ni sur un futur déploiement.
