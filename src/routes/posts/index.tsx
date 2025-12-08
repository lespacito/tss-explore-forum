import { createFileRoute } from "@tanstack/react-router";
import { getPostsFn } from "@/features/posts/server/get-posts";
import { getThreadsFn } from "@/features/threads/server/get-threads";
import { PostCard } from "@/features/posts/components/post-card";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { createPostFn } from "@/features/posts/server/create-post";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/posts/")({
  component: PostsPage,
  loader: async () => {
    const [posts, threads] = await Promise.all([getPostsFn(), getThreadsFn()]);
    return { posts, threads };
  },
});

function PostsPage() {
  const { posts, threads } = Route.useLoaderData();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      threadId: "",
      content: "",
      isSensitive: false,
      contentWarnings: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.threadId) {
          toast.error("Veuillez sélectionner un thread");
          return;
        }

        await createPostFn({
          data: {
            threadId: value.threadId,
            content: value.content,
            isSensitive: value.isSensitive,
            contentWarnings: value.contentWarnings
              ? value.contentWarnings.split(",").map((w) => w.trim())
              : [],
          },
        });
        toast.success("Post créé avec succès");
        setIsOpen(false);
        form.reset();
        router.invalidate();
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du post",
        );
      }
    },
  });

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
          <p className="text-muted-foreground">
            Partagez, échangez et soutenez-vous en toute sécurité.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau post</DialogTitle>
              <DialogDescription>
                Partagez votre expérience ou posez une question à la communauté.
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
                name="threadId"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Thread</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un thread" />
                      </SelectTrigger>
                      <SelectContent>
                        {threads.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Aucun thread disponible
                          </div>
                        ) : (
                          threads.map((thread) => (
                            <SelectItem key={thread.id} value={thread.id}>
                              {thread.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <form.Field
                name="content"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Contenu</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Écrivez votre message ici..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                )}
              />
              <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/50">
                <form.Field
                  name="isSensitive"
                  children={(field) => (
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={field.name}
                        className="flex flex-col gap-1"
                      >
                        <span>Contenu sensible</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Le contenu sera flouté par défaut.
                        </span>
                      </Label>
                      <Switch
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                      />
                    </div>
                  )}
                />
              </div>
              <form.Field
                name="contentWarnings"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Avertissements (Optionnel)
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ex: Violence, Harcèlement (séparés par des virgules)"
                    />
                  </div>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">Publier</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            threadCategory={post.threadCategory || ""}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            Aucun post pour le moment. Soyez le premier à partager !
          </div>
        )}
      </div>
    </div>
  );
}
