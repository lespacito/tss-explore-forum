import { createFileRoute } from "@tanstack/react-router";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { SafetyNotice } from "@/features/beta/components/safety-notice";
export const Route = createFileRoute("/help")({ component: Page });
function Page() {
	const { accessRequired } = useBetaPresentation();
	return (
		<article className="mx-auto max-w-3xl space-y-5 px-4 py-10 leading-7 [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
			<h1 className="font-serif text-3xl font-semibold">Aide et contact</h1>
			<SafetyNotice />
			<h2>
				{accessRequired
					? "Une écoute extérieure à la bêta"
					: "Une écoute extérieure au site"}
			</h2>
			<p>
				La Main Tendue propose une écoute téléphonique au{" "}
				<a href="tel:143">143</a>. Consultez également{" "}
				<a href="https://www.143.ch/fr/" rel="noreferrer">
					son site officiel
				</a>{" "}
				pour ses autres moyens de contact. Ce service est indépendant de la{" "}
				{accessRequired ? "bêta." : "plateforme."}
			</p>
			<h2>Modération et aide professionnelle</h2>
			<p>
				La modération décide si une situation fictive peut être publiée. Elle ne
				fournit pas d’aide professionnelle et ne promet aucune réponse de
				soutien. Pour une situation réelle, appelez le 142 ou contactez un
				centre LAVI ; en cas de danger imminent, appelez le 117 ou le 144.
			</p>
			<h2>
				{accessRequired
					? "Un problème pendant le test ?"
					: "Un problème sur le site ?"}
			</h2>
			<p>
				Écrivez à{" "}
				<a href="mailto:contact@parlonsviolence.ch">
					contact@parlonsviolence.ch
				</a>
				{accessRequired
					? " ou contactez la personne qui vous a envoyé l’invitation, par le même canal. "
					: ". "}
				Indiquez l’étape et ce qui ne fonctionne pas, sans joindre de récit
				personnel, de code de récupération ou de capture contenant ce code.
			</p>
			<h2>Préparer un appareil partagé</h2>
			<p>
				Laissez la sauvegarde des brouillons désactivée. À la fin,
				déconnectez-vous et fermez l’onglet. L’historique du navigateur, les
				téléchargements et le presse-papier ne sont pas effacés automatiquement
				par le site.
			</p>
			<h2>Sources des ressources</h2>
			<ul>
				<li>
					<a
						href="https://www.bakom.admin.ch/fr/autres-numeros-payants-ou-gratuits"
						rel="noreferrer"
					>
						OFCOM : numéros d’urgence en Suisse
					</a>
				</li>
				<li>
					<a
						href="https://www.bag.admin.ch/fr/plan-daction-pour-la-prevention-du-suicide"
						rel="noreferrer"
					>
						OFSP : aide et écoute pour les adultes
					</a>
				</li>
			</ul>
		</article>
	);
}
