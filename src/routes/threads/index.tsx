import { createFileRoute } from "@tanstack/react-router";
import { getThreadsFn } from "@/features/threads/server/get-threads";
import { ThreadCard } from "@/features/threads/components/thread-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { createThreadFn } from "@/features/threads/server/create-thread";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/threads/")({
  component: ThreadsPage,
  loader: () => getThreadsFn(),
});

const categories = [
  { value: "support", label: "Support" },
  { value: "discussion", label: "Discussion" },
  { value: "question", label: "Question" },
  { value: "partage", label: "Partage" },
  { value: "temoignage", label: "Témoignage" },
  { value: "urgent", label: "Urgent" },
];

function ThreadsPage() {
  const threads = Route.useLoaderData();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      body: "",
      category: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.category) {
          toast.error("Veuillez sélectionner une catégorie");
          return;
        }

        await createThreadFn({
          data: {
            title: value.title,
            body: value.body,
            category: value.category,
          },
        });
        toast.success("Thread créé avec succès");
        setIsOpen(false);
        form.reset();
        router.invalidate();
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du thread",
        );
      }
    },
  });

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fil de discussions
          </h1>
          <p className="text-muted-foreground">
            Démarrez une nouvelle discussion ou explorez les sujets existants.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau fil de discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle discussion</DialogTitle>
              <DialogDescription>
                Lancez une discussion sur un sujet qui vous tient à cœur.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field
                name="title"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Titre</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Un titre clair et descriptif..."
                      required
                    />
                  </div>
                )}
              />

              <form.Field
                name="category"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Catégorie</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <form.Field
                name="body"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Description</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Décrivez votre sujet en détail..."
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">Créer la discussion</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
        {threads.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            Aucune discussion pour le moment. Soyez le premier à en créer une !
          </div>
        )}
      </div>
    </div>
  );
}
