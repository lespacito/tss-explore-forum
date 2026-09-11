import { createFileRoute } from "@tanstack/react-router";
import FaqSection from "@/components/shadcn-studio/blocks/faq-section";

import FeaturesSection from "@/components/shadcn-studio/blocks/features-section";

import HeroSection from "@/components/shadcn-studio/blocks/hero-section/hero-section";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="landing-page min-h-screen">
			<HeroSection />
			<FeaturesSection />
			<FaqSection />
		</div>
	);
}
