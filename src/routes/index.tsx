import { createFileRoute} from "@tanstack/react-router";
import HeroSection from "@/components/shadcn-studio/blocks/hero-section/hero-section";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4">
        <HeroSection />
      </main>
    </div>
  );
}
