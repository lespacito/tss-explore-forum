import { createFileRoute } from "@tanstack/react-router";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";

export const Route = createFileRoute("/privacy")({ component: Page });
function Page() {
	const { accessRequired, publicationMode } = useBetaPresentation();
	if (publicationMode === "real")
		return <RealPrivacy accessRequired={accessRequired} />;
	return (
		<article className="mx-auto max-w-3xl space-y-5 px-4 py-10 leading-7 [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
			<h1 className="font-serif text-3xl font-semibold">
				{accessRequired ? "Confidentialité de la bêta" : "Confidentialité"}
			</h1>
			<p>
				{accessRequired
					? "Cette page décrit le fonctionnement de la bêta et ses limites. L’accès aux situations fictives et aux API nécessite une invitation valide."
					: "Cette page décrit le fonctionnement du site et ses limites. Les situations fictives publiées sont accessibles en lecture sans invitation ni code d’accès."}
			</p>
			<h2>Anonymat et identité</h2>
			<p>
				Aucun nom réel ni email n’est nécessaire pour une session anonyme. Un
				alias interne relie votre session à vos situations fictives. Si elles
				sont publiées, elles apparaissent sous « Auteur anonyme », sans alias
				public. L’administration technique peut relier une session à ses alias :
				cette séparation ne constitue pas une garantie d’anonymat absolu. Un
				récit peut également contenir des détails identifiants ; utilisez
				uniquement des situations fictives.
			</p>
			<h2>Données conservées</h2>
			<p>
				Le service conserve les sessions, leurs données techniques, les alias,
				les situations fictives, les décisions de modération et le code de
				récupération. Les données techniques de session peuvent inclure une
				adresse IP et des informations de navigateur. Le modérateur dispose du
				contenu et des décisions, sans affichage de l’adresse IP dans sa file de
				modération.
			</p>
			<h2>Retours anonymes</h2>
			<p>
				Un formulaire de feedback permet de remonter votre expérience. Il est
				anonyme : aucun nom, email, identifiant de session ou adresse IP n’est
				lié à vos réponses. Seules les réponses elles-mêmes sont conservées,
				pour analyse interne par l’organisation de la cohorte. Les champs
				obligatoires sont limités à trois notes. Les champs libres sont
				facultatifs.
			</p>
			<h2>Sur votre appareil</h2>
			<p>
				{accessRequired
					? "Des cookies maintiennent l’accès invité et la session."
					: "Des cookies maintiennent la session."}{" "}
				Le thème et les préférences d’interface peuvent être enregistrés. Un
				brouillon n’est enregistré durablement que si vous activez cette option
				dans l’éditeur. Désactivez-la ou utilisez Effacer le brouillon sur un
				appareil partagé.
			</p>
			<h2>Votre code de récupération</h2>
			<p>
				Quiconque détient ce code peut retrouver votre session. Conservez-le
				dans un endroit privé. Il n’est pas placé dans l’URL. Tant que votre
				session est ouverte, vous pouvez le consulter depuis Mes scénarios.
			</p>
			<h2>Effacement et limites</h2>
			<p>
				Gérer mes données permet de demander la suppression du compte et de ses
				situations fictives dans la base active. Une copie supprimée peut
				subsister jusqu’à sept jours supplémentaires dans une sauvegarde avant
				son expiration. Les retours anonymes soumis via le formulaire de
				feedback sont également conservés avec les réponses elles-mêmes, sans
				identifiant de participant.
			</p>
			<p>
				Pour cette cohorte, les comptes et les situations fictives doivent être
				supprimés sept jours après la fin du test. Seul un bilan sans
				identifiants sera conservé ensuite. L’automatisation de cette
				suppression et la restauration d’une sauvegarde doivent encore être
				vérifiées sur le serveur avant l’ouverture.
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
				</a>
				{accessRequired
					? " ou utilisez le canal par lequel vous avez reçu votre invitation. "
					: ". "}
				N’envoyez jamais votre code de récupération, un récit personnel ou une
				capture contenant ce code.
			</p>
		</article>
	);
}

function RealPrivacy({ accessRequired }: { accessRequired: boolean }) {
	return (
		<article className="mx-auto max-w-3xl space-y-5 px-4 py-10 leading-7 [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
			<h1 className="font-serif text-3xl font-semibold">Confidentialité</h1>
			<p>
				{accessRequired
					? "L’accès aux témoignages nécessite une invitation valide. Une invitation ne garantit pas la confidentialité du contenu publié."
					: "Les témoignages publiés sont accessibles publiquement en lecture. Ils peuvent être copiés ou partagés par les lecteurs."}
			</p>
			<h2>Identité et limites de l’anonymat</h2>
			<p>
				Une session anonyme ne nécessite ni nom réel ni email. Les publications
				apparaissent sous « Auteur anonyme » ; leur alias reste interne. Un
				compte avec email ne change pas cette présentation. Aucun parcours de
				publication nominative n’est proposé actuellement.
			</p>
			<p>
				L’administration technique peut relier une session à ses alias. Le
				contenu d’un récit et les données techniques peuvent permettre de
				reconnaître une personne. Aucun anonymat absolu n’est garanti. Évitez
				les noms, coordonnées, lieux précis et autres détails identifiants.
			</p>
			<h2>Données conservées</h2>
			<p>
				Le service conserve les sessions et leurs données techniques, les alias,
				les témoignages, les décisions de modération et les codes de
				récupération. Les données de session peuvent inclure une adresse IP et
				des informations de navigateur. Les modérateurs disposent du contenu et
				des décisions, sans affichage de l’adresse IP dans leur file.
			</p>
			<h2>Sur votre appareil</h2>
			<p>
				{accessRequired
					? "Des cookies maintiennent l’accès invité et la session."
					: "Des cookies maintiennent la session."}{" "}
				Le thème et les préférences d’interface peuvent être enregistrés. Une
				copie de brouillon n’est conservée durablement sur l’appareil que si
				vous activez cette option. Sur un appareil partagé, laissez-la
				désactivée et fermez la session après utilisation.
			</p>
			<h2>Code de récupération</h2>
			<p>
				Quiconque détient le code de récupération peut retrouver votre session.
				Conservez-le dans un endroit privé ; ne le partagez pas et ne le placez
				pas dans une URL.
			</p>
			<h2>Effacement et conservation</h2>
			<p>
				Gérer mes données permet de demander l’effacement du compte et de ses
				publications dans la base active. Cela n’efface pas les copies déjà
				conservées par des lecteurs. La durée effective des sauvegardes, la
				conservation des journaux techniques et les conditions d’hébergement
				restent à confirmer avant l’ouverture aux témoignages réels. Aucune
				durée de suppression automatique de témoignages réels n’est annoncée
				ici.
			</p>
			<h2>Retours sur le site</h2>
			<p>
				Le formulaire de feedback conserve les réponses sans leur associer de
				nom, email, identifiant de session ou adresse IP. Les textes libres
				peuvent néanmoins contenir des informations identifiantes : n’y joignez
				pas de témoignage ni de donnée sensible.
			</p>
			<h2>Contact</h2>
			<p>
				Pour une demande relative aux données, écrivez à{" "}
				<a href="mailto:contact@parlonsviolence.ch">
					contact@parlonsviolence.ch
				</a>
				. N’envoyez pas de code de récupération, de témoignage ou de capture
				contenant des données sensibles. L’identité du responsable et les
				informations de conservation doivent être précisées avant l’ouverture
				aux témoignages réels.
			</p>
		</article>
	);
}
