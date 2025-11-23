import { Card, CardContent } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/search/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: typeof search.q === "string" ? search.q : "",
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Résultats de recherche
        </h1>
        {q && (
          <p className="text-muted-foreground mt-2">
            Recherche pour :{" "}
            <span className="font-semibold text-foreground">{q}</span>
          </p>
        )}
      </div>

      {!q ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Utilisez la barre de recherche pour trouver du contenu
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Résultats à implémenter avec TanStack Query + Drizzle
          </p>
        </div>
      )}
    </div>
  );
}
