import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TSS Explore Forum. Tous droits réservés.
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:underline">Mentions légales</a>
            <a href="#" className="hover:underline">Confidentialité</a>
            <a href="#" className="hover:underline">Contact</a>
            <a href="#" className="hover:underline">Ressources d'aide</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
