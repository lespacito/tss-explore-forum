import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rules")({ component: Page });
function Page() {
	return (
		<article className="mx-auto max-w-3xl space-y-5 px-4 py-10 leading-7 [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
			<h1 className="font-serif text-3xl font-semibold">
				Règles de la bêta privée
			</h1>
			<p>
				Ce test dure deux semaines et réunit 5 à 10 adultes invités en Suisse
				romande. Il sert à vérifier le dépôt anonyme, le suivi de la modération
				et la récupération de session.
			</p>
			<h2>Utilisez uniquement des scénarios fictifs</h2>
			<p>
				Ne publiez pas de noms réels, coordonnées, lieux précis ou détails
				permettant d’identifier une personne. Aucun récit personnel n’est
				demandé pendant cette première cohorte.
			</p>
			<h2>Avant la mise en ligne</h2>
			<p>
				Un modérateur examine chaque message. Les publications acceptées sont
				lisibles par les invités. En cas de refus, le motif apparaît dans Mes
				publications. Les réponses et commentaires sont désactivés.
			</p>
			<h2>Les horaires du test</h2>
			<p>
				Les créneaux de modération et les dates sont communiqués par
				l’organisateur avec votre invitation. La modération n’est pas permanente
				; les dépôts peuvent être suspendus. Si vous n’avez pas reçu ces
				informations, contactez l’organisateur avant de commencer.
			</p>
			<h2>Participer reste facultatif</h2>
			<p>
				Vous pouvez arrêter le test et demander l’effacement depuis Gérer le
				compte. Faites part des difficultés rencontrées à la personne qui vous a
				invité, sans lui transmettre votre code secret.
			</p>
		</article>
	);
}
