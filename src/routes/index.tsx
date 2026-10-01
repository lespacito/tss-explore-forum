import { createFileRoute } from "@tanstack/react-router";
import { SafetyNotice } from "@/features/beta/components/safety-notice";
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
			<div className="mx-auto max-w-3xl bg-card px-4 py-6 text-card-foreground"><SafetyNotice /></div>
			<FeaturesSection />
			<FaqSection />
		</div>
	);
}
