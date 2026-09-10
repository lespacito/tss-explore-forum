import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: Page });
function Page() {
	return (
		<article className="mx-auto max-w-3xl space-y-5 px-4 py-10 leading-7 [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
			<h1 className="font-serif text-3xl font-semibold">
				Confidentialité de la bêta
			</h1>
			<p>
				Cette page décrit le fonctionnement de la bêta et ses limites. L’accès
				aux publications et aux API nécessite une invitation valide.
			</p>
			<h2>Alias et identité</h2>
			<p>
				Aucun nom réel ni email n’est nécessaire pour une session anonyme. Un
				alias accompagne vos publications. L’administration technique peut
				relier une session à ses alias : cette séparation ne constitue pas une
				garantie d’anonymat absolu. Un récit peut également contenir des détails
				identifiants ; utilisez uniquement des scénarios fictifs.
			</p>
			<h2>Données conservées</h2>
			<p>
				Le service conserve les sessions, leurs données techniques, les alias,
				les publications, les décisions de modération et le code de
				récupération. Les données techniques de session peuvent inclure une
				adresse IP et des informations de navigateur. Le modérateur dispose du
				contenu et des décisions, sans affichage de l’adresse IP dans sa file de
				modération.
			</p>
			<h2>Sur votre appareil</h2>
			<p>
				Des cookies maintiennent l’accès invité et la session. Le thème et les
				préférences d’interface peuvent être enregistrés. Un brouillon n’est
				enregistré durablement que si vous activez cette option dans l’éditeur.
				Désactivez-la ou utilisez Effacer le brouillon sur un appareil partagé.
			</p>
			<h2>Votre code secret</h2>
			<p>
				Quiconque détient ce code peut retrouver votre session. Conservez-le
				dans un endroit privé. Il n’est pas placé dans l’URL. Tant que votre
				session est ouverte, vous pouvez le consulter depuis Mes publications.
			</p>
			<h2>Effacement et limites</h2>
			<p>
				Gérer le compte permet de demander la suppression du compte et de ses
				publications dans la base active. Une copie supprimée peut subsister
				jusqu’à sept jours supplémentaires dans une sauvegarde avant son
				expiration.
			</p>
			<p>
				Pour cette cohorte, les comptes et les scénarios doivent être supprimés
				sept jours après la fin du test. Seul un bilan sans identifiants sera
				conservé ensuite. L’automatisation de cette suppression et la
				restauration d’une sauvegarde doivent encore être vérifiées sur le
				serveur avant l’ouverture.
			</p>
			<p>
				Le lieu effectif d’hébergement et la durée de conservation des journaux
				techniques ne sont pas encore confirmés. Ces informations doivent être
				vérifiées avant l’ouverture. Ce test n’est pas ouvert aux récits
				personnels.
			</p>
			<h2>Contact</h2>
			<p>
				La personne qui organise la cohorte est responsable des demandes
				relatives aux données. Écrivez à{" "}
				<a href="mailto:contact@parlonsviolence.ch">
					contact@parlonsviolence.ch
				</a>{" "}
				ou utilisez le canal par lequel vous avez reçu votre invitation.
				N’envoyez jamais votre code secret, un récit personnel ou une capture
				contenant ce code.
			</p>
		</article>
	);
}
