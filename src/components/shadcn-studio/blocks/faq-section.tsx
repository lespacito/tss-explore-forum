import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function FaqSection() {
  const faqs = [
    {
      q: "Est-ce vraiment anonyme ?",
      a: "Oui. Nous ne demandons pas votre nom réel et les données sont sécurisées. Vous choisissez un pseudonyme pour interagir.",
    },
    {
      q: "Comment fonctionne la modération ?",
      a: "Notre équipe et des outils automatiques veillent à ce que les échanges restent respectueux. Tout contenu haineux est rapidement supprimé.",
    },
    {
      q: "Que faire si je me sens en danger ?",
      a: "Si vous êtes en danger immédiat, contactez les services d'urgence (15 ou 112). Notre plateforme propose aussi des liens vers des services d'écoute.",
    },
    {
      q: "Puis-je supprimer mes messages ?",
      a: "Oui, vous gardez le contrôle total sur vos publications et pouvez les supprimer à tout moment.",
    },
  ];

  return (
    <section className="mx-auto max-w-3xl py-12 sm:py-16 px-4">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <Badge variant="outline">FAQ</Badge>
        <h2 className="text-2xl sm:text-3xl font-bold">Questions fréquentes</h2>
        <p className="text-muted-foreground">
          Tout ce que vous devez savoir pour utiliser l'espace sereinement.
        </p>
      </div>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <FaqItem key={i} question={f.q} answer={f.a} />
        ))}
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-md p-4 bg-card"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer font-medium hover:underline">
          {question}
          <Button variant="ghost" size="icon" className="w-8 h-8">
             {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 text-muted-foreground text-sm">
        {answer}
      </CollapsibleContent>
    </Collapsible>
  );
}
