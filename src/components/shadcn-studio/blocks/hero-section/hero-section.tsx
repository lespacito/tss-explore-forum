import {
	ClipboardCheck,
	FileText,
	KeyRound,
	MailOpen,
	Search,
	UserRound,
} from "lucide-react";
import { type ComponentType, type SVGProps, useId } from "react";
import { AnonymousPostButton } from "@/features/auth/components/AnonymousPostButton";
import paperTexture from "../../../../assets/plates/paper-texture.webp";

type JourneyStep = {
	number: string;
	title: string;
	copy: string;
	note: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
	stamp?: string;
};

const steps: JourneyStep[] = [
	{
		number: "01",
		title: "Invitation",
		copy: "Un code d’invitation réservé ouvre l’accès à cette bêta privée.",
		note: "ACCÈS LIMITÉ · BÊTA PRIVÉE",
		Icon: MailOpen,
	},
	{
		number: "02",
		title: "Pseudonyme",
		copy: "Un pseudonyme est généré pour cette session. Aucun nom ni e-mail n’est demandé.",
		note: "VOTRE PARCOURS · VOS REPÈRES",
		Icon: UserRound,
	},
	{
		number: "03",
		title: "Situation fictive",
		copy: "Vous rédigez une situation inventée, sans nom ni détail identifiant.",
		note: "RÉFLÉCHIR · DÉCOUVRIR · SE REPÉRER",
		Icon: FileText,
	},
	{
		number: "04",
		title: "Examen humain",
		copy: "Une personne relit chaque message avant toute publication.",
		note: "EXAMEN HUMAIN AVANT PUBLICATION",
		Icon: Search,
	},
	{
		number: "05",
		title: "Mes situations fictives",
		copy: "Vous retrouvez la décision et, en cas de non-publication, son motif dans Mes situations fictives.",
		note: "À EXAMINER · PUBLIÉE · NON PUBLIÉE",
		Icon: ClipboardCheck,
		stamp: "À EXAMINER",
	},
];

function JourneyPanel({ step, index }: { step: JourneyStep; index: number }) {
	const { Icon } = step;
	return (
		<article className="landing-fold" data-fold={index + 1}>
			<header className="landing-step-heading">
				<span className="landing-step-number" aria-hidden="true">
					{step.number}
				</span>
				<h2>{step.title}</h2>
			</header>
			<div className="landing-step-figure" aria-hidden="true">
				<Icon strokeWidth={1.35} />
				{index === 0 && (
					<div className="landing-code-slip">
						<KeyRound />
						<code>••••-••••-••••</code>
					</div>
				)}
				{index === 1 && <span className="landing-alias-line">Mon pseudonyme</span>}
				{step.stamp && (
					<strong className="landing-status-stamp">{step.stamp}</strong>
				)}
			</div>
			<div className="landing-step-copy">
				<p>{step.copy}</p>
				<span>{step.note}</span>
			</div>
		</article>
	);
}

export default function HeroSection() {
	const titleId = useId();
	return (
		<section className="landing-hero" aria-labelledby={titleId}>
			<div className="landing-sheet">
				<img className="landing-paper-plate" src={paperTexture} alt="" />
				<div className="landing-intro landing-fold" data-fold="0">
					<div className="landing-civic-mark">
						DES MOTS
						<br />
						POUR DEMAIN
					</div>
					<div>
						<h1 id={titleId}>
							Parlons
							<br />
							Violence
						</h1>
						<span className="landing-title-rule" aria-hidden="true" />
						<p className="landing-beta-label">BÊTA PRIVÉE · SUISSE ROMANDE</p>
					</div>
					<div className="my-6 space-y-3 text-sm leading-6">
						<p>Le projet vise à permettre aux personnes concernées par la violence de partager leur vécu et de trouver des repères.</p>
						<p>Aujourd’hui, cette bêta privée sur invitation teste uniquement des situations fictives, en environ 10 minutes.</p>
						<p>Les commentaires sont fermés. Aucune réponse professionnelle n’est promise.</p>
					</div>
					<div className="landing-primary-action">
						<AnonymousPostButton className="landing-cta" label="Commencer" />
						<p>Utilisez uniquement la situation fictive fournie.</p>
					</div>
					<div className="landing-intro-footer">
						<span>
							ÉCOUTER
							<br />
							COMPRENDRE
							<br />
							AGIR AUTREMENT
						</span>
						<span>
							UN PROJET
							<br />À TAILLE HUMAINE
						</span>
					</div>
				</div>
				{steps.map((step, index) => (
					<JourneyPanel key={step.number} step={step} index={index} />
				))}
			</div>

			<div className="landing-close">
				<h2>
					Un espace pour avancer,
					<br />
					ensemble.
				</h2>
				<p>
					Une expérimentation en Suisse romande pour vérifier qu’un parcours
					sous pseudonyme, modéré et sans inscription par email reste compréhensible.
				</p>
				<span>
					DES REPÈRES
					<br />
					AUJOURD’HUI
					<br />
					POUR DÉCIDER DEMAIN
				</span>
			</div>
		</section>
	);
}
