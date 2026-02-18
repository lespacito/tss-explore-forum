import { createFileRoute } from "@tanstack/react-router";
import FaqSection from "@/components/shadcn-studio/blocks/faq-section";

import FeaturesSection from "@/components/shadcn-studio/blocks/features-section";
import Footer from "@/components/shadcn-studio/blocks/footer";
import HeroSection from "@/components/shadcn-studio/blocks/hero-section/hero-section";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title: "Parlons Violence — Forum de soutien anonyme",
			},
			{
				name: "description",
				content:
					"Forum de soutien anonyme pour partager des expériences de violence, d'abus et de détresse. Anonymat garanti, sans inscription obligatoire.",
			},
			{
				property: "og:title",
				content: "Parlons Violence — Forum de soutien anonyme",
			},
			{
				property: "og:description",
				content:
					"Partagez vos expériences en toute sécurité. Espace bienveillant, anonyme, et confidentiel.",
			},
			{
				property: "og:url",
				content: "https://parlonsviolence.ch",
			},
			{ name: "twitter:card", content: "summary" },
			{
				name: "twitter:title",
				content: "Parlons Violence — Forum de soutien anonyme",
			},
		],
		links: [{ rel: "canonical", href: "https://parlonsviolence.ch" }],
	}),
	component: App,
});

function App() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<main className="container mx-auto px-4">
				<HeroSection />
				<FeaturesSection />
				<FaqSection />
			</main>
			<Footer />
		</div>
	);
}
