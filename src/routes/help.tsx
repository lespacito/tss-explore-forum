import { createFileRoute } from "@tanstack/react-router";
import { SafetyNotice } from "@/features/beta/components/safety-notice";
export const Route = createFileRoute("/help")({ component: Page });
function Page() {
	return (
		<article className="mx-auto max-w-3xl space-y-5 px-4 py-10 leading-7 [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
			<h1 className="font-serif text-3xl font-semibold">Aide et contact</h1>
			<SafetyNotice />
			<h2>Une écoute extérieure au forum</h2>
			<p>
				La Main Tendue propose une écoute téléphonique au{" "}
				<a href="tel:143">143</a>. Consultez également{" "}
				<a href="https://www.143.ch/fr/" rel="noreferrer">
					son site officiel
				</a>{" "}
				pour ses autres moyens de contact. Ce service est indépendant de la
				bêta.
			</p>
			<h2>Un problème pendant le test ?</h2>
			<p>
				Contactez la personne qui vous a envoyé l’invitation, par le même canal.
				Indiquez l’étape et ce qui ne fonctionne pas, sans joindre de récit
				personnel, de code secret ou de capture contenant ce code.
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
