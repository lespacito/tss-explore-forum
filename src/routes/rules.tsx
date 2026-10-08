import { createFileRoute } from "@tanstack/react-router";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";

export const Route = createFileRoute("/rules")({ component: Page });
function Page() {
	const { accessRequired, submissionsOpen, publicationMode } =
		useBetaPresentation();
	if (publicationMode === "real")
		return (
			<RealRules
				accessRequired={accessRequired}
				submissionsOpen={submissionsOpen}
			/>
		);
	return (
		<article className="mx-auto max-w-3xl space-y-5 px-4 py-10 leading-7 [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
			<h1 className="font-serif text-3xl font-semibold">
				{accessRequired
					? "Règles de la bêta privée"
					: "Règles de participation"}
			</h1>
			<p>
				{accessRequired
					? "Ce test dure deux semaines et réunit 5 à 10 adultes invités en Suisse romande. Il sert à vérifier l’envoi sans identité publique, le suivi de la modération et la récupération de session."
					: "Les situations fictives publiées sont accessibles publiquement en lecture. Aucune invitation ni code d’accès n’est nécessaire."}
			</p>
			<h2>Utilisez uniquement des situations fictives</h2>
			<p>
				Ne publiez pas de noms réels, coordonnées, lieux précis ou détails
				permettant d’identifier une personne. Aucun récit personnel n’est{" "}
				{accessRequired
					? "demandé pendant cette première cohorte."
					: "demandé sur ce site."}
			</p>
			<h2>Avant la mise en ligne</h2>
			<p>
				Un modérateur examine chaque situation fictive. Les situations fictives
				publiées sont lisibles{" "}
				{accessRequired ? "par les invités" : "publiquement"} sous « Auteur
				anonyme », sans affichage du pseudonyme interne. En cas de
				non-publication, le motif apparaît dans Mes situations fictives. Les
				réponses et commentaires sont désactivés.
			</p>
			<p>
				La modération décide de la publication ; elle ne constitue pas une aide
				professionnelle et ne promet aucune réponse de soutien.
			</p>
			<h2>
				{accessRequired
					? "Les horaires du test"
					: "Disponibilité des contributions"}
			</h2>
			<p>
				{accessRequired
					? "Les créneaux de modération et les dates sont communiqués par l’organisateur avec votre invitation. La modération n’est pas permanente ; l’envoi de situations fictives peut être suspendu. Si vous n’avez pas reçu ces informations, contactez l’organisateur avant de commencer."
					: submissionsOpen
						? "Les contributions sont ouvertes. Chaque situation fictive est examinée avant publication. La modération n’est pas permanente."
						: "Le site reste accessible publiquement en lecture. Les contributions sont temporairement suspendues."}
			</p>
			<h2>Participer reste facultatif</h2>
			<p>
				{accessRequired
					? "Vous pouvez arrêter le test et demander l’effacement depuis Gérer mes données. Faites part des difficultés rencontrées à la personne qui vous a invité, sans lui transmettre votre code de récupération."
					: "Vous pouvez demander l’effacement depuis Gérer mes données. Signalez les difficultés à contact@parlonsviolence.ch, sans transmettre votre code de récupération."}
			</p>
		</article>
	);
}

function RealRules({
	accessRequired,
	submissionsOpen,
}: {
	accessRequired: boolean;
	submissionsOpen: boolean;
}) {
	return (
		<article className="mx-auto max-w-3xl space-y-5 px-4 py-10 leading-7 [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
			<h1 className="font-serif text-3xl font-semibold">
				Règles de participation
			</h1>
			<p>
				{accessRequired
					? "L’accès aux témoignages nécessite une invitation valide."
					: "Les témoignages publiés sont accessibles publiquement en lecture, sans invitation ni code d’accès."}
			</p>
			<h2>Partager un témoignage réel</h2>
			<p>
				Victime ou témoin de violence, vous choisissez ce que vous souhaitez
				raconter. Vous pouvez aussi simplement lire, sans contribuer. Ne publiez
				pas de noms, coordonnées, lieux précis ou détails permettant de
				reconnaître une personne, y compris vous-même.
			</p>
			<p>
				Le libellé « Auteur anonyme » ne garantit pas un anonymat absolu. Le
				contenu du témoignage et certaines données techniques peuvent permettre
				de vous reconnaître. Consultez la page Confidentialité avant tout envoi.
			</p>
			<h2>Avant la mise en ligne</h2>
			<p>
				{accessRequired
					? "Un modérateur examine chaque témoignage avant publication. Les témoignages publiés sont lisibles par les personnes invitées sous « Auteur anonyme »."
					: "Un modérateur examine chaque témoignage avant publication. Les témoignages publiés sont lisibles publiquement sous « Auteur anonyme »."}{" "}
				Le pseudonyme interne n’est pas affiché. Le statut et le motif d’une
				éventuelle non-publication sont consultables dans votre espace de suivi.
				Les réponses et commentaires sont désactivés.
			</p>
			<h2>Disponibilité des contributions</h2>
			<p>
				{submissionsOpen
					? "Les contributions sont ouvertes. La modération n’est ni immédiate ni permanente ; aucun délai de publication n’est garanti."
					: "Les contributions sont temporairement suspendues. Les témoignages déjà publiés restent accessibles en lecture."}
			</p>
			<h2>Une publication, pas une prise en charge</h2>
			<p>
				La modération décide de la publication. Elle ne fournit pas d’aide
				professionnelle et ne promet aucune réponse de soutien. Le site n’est
				pas un service d’urgence, de conseil juridique ou médical, ni une
				permanence d’écoute.
			</p>
			<h2>Garder le choix</h2>
			<p>
				Vous pouvez interrompre la rédaction. Gérer mes données permet de
				demander l’effacement depuis votre session. Pour une question sur le
				site, écrivez à contact@parlonsviolence.ch sans joindre de témoignage,
				de code de récupération ou d’autre donnée sensible.
			</p>
		</article>
	);
}
