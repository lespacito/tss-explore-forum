import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createAnonymousSessionFn } from "@/features/auth/server/create-anonymous-session";

export function AnonymousPostButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const result = await createAnonymousSessionFn();

      if (result.success) {
        // Redirection vers liste des threads avec ouverture automatique du dialog de création
        await router.navigate({
          to: "/threads",
          search: { openDialog: true },
        });
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Impossible de continuer. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size="lg"
      className="min-w-[200px]"
      aria-label="Publier anonymement sans créer de compte"
    >
      {isLoading ? "Chargement..." : "Publier Anonymement"}
    </Button>
  );
}
