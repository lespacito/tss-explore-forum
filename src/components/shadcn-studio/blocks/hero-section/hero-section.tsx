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
		title: "Alias",
		copy: "Vous choisissez un alias. Votre code secret permet ensuite de retrouver la session.",
		note: "VOTRE PARCOURS · VOS REPÈRES",
		Icon: UserRound,
	},
	{
		number: "03",
		title: "Scénario fictif",
		copy: "Vous testez le dépôt avec une situation inventée, sans nom ni détail identifiant.",
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
		title: "Mes publications",
		copy: "Vous retrouvez la décision et, en cas de refus, son motif dans votre espace.",
		note: "EN ATTENTE · PUBLIÉE · REFUSÉE",
		Icon: ClipboardCheck,
		stamp: "EN ATTENTE",
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
				{index === 1 && <span className="landing-alias-line">Mon alias</span>}
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
					<p className="landing-thesis">
						Tester un parcours.
						<br />
						Garder le contrôle.
					</p>
					<div className="landing-primary-action">
						<AnonymousPostButton
							className="landing-cta"
							label="Entrer avec mon invitation"
						/>
						<p>Ni service d’urgence, ni permanence d’écoute.</p>
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
					sous alias, modéré et sans inscription par email reste compréhensible.
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
