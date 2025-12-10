import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FeaturesSection() {
  const features = [
    { title: "Anonymat garanti", desc: "Partagez librement sans révéler votre identité." },
    { title: "Modération bienveillante", desc: "Un cadre sain et respectueux." },
    { title: "Ressources utiles", desc: "Guides et liens vers des structures d’aide." },
    { title: "Disponibilité 24/7", desc: "Une communauté présente à toute heure." },
    { title: "Signalements faciles", desc: "Outils pour signaler et protéger." },
    { title: "Sujets variés", desc: "Santé mentale, violences, difficultés…"},
  ];
  return (
    <section className="mx-auto max-w-7xl py-12 sm:py-16">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <Badge>Pourquoi nous</Badge>
        <h2 className="text-2xl sm:text-3xl font-bold">Ce que notre espace vous apporte</h2>
        <p className="text-muted-foreground">Un cadre sécurisé pour parler de ce qui compte.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Card key={i} className="h-full">
            <CardHeader>
              <CardTitle>{f.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {f.desc}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
