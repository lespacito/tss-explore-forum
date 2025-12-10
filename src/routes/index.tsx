import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/shadcn-studio/blocks/hero-section/hero-section";

import FeaturesSection from "@/components/shadcn-studio/blocks/features-section";
import FaqSection from "@/components/shadcn-studio/blocks/faq-section";
import Footer from "@/components/shadcn-studio/blocks/footer";

export const Route = createFileRoute("/")({
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
