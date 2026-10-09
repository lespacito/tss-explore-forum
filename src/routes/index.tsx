import { createFileRoute } from "@tanstack/react-router";
import FaqSection from "@/components/shadcn-studio/blocks/faq-section";
import FeaturesSection from "@/components/shadcn-studio/blocks/features-section";
import HeroSection from "@/components/shadcn-studio/blocks/hero-section/hero-section";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { EntreNousShowcase } from "@/features/beta/components/entre-nous-showcase";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { preprodShowcase, publicationMode, submissionsOpen } =
		useBetaPresentation();
	if (preprodShowcase && publicationMode === "test" && !submissionsOpen)
		return <EntreNousShowcase />;
	return (
		<div className="landing-page min-h-screen">
			<HeroSection />
			<FeaturesSection />
			<FaqSection />
		</div>
	);
}
