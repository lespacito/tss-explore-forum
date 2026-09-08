import { createFileRoute } from "@tanstack/react-router";
import FaqSection from "@/components/shadcn-studio/blocks/faq-section";

import FeaturesSection from "@/components/shadcn-studio/blocks/features-section";

import HeroSection from "@/components/shadcn-studio/blocks/hero-section/hero-section";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="container mx-auto px-4">
				<HeroSection />
				<FeaturesSection />
				<FaqSection />
			</div>

		</div>
	);
}
