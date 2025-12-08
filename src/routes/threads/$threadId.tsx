import { createFileRoute } from "@tanstack/react-router";
import { getThreadByIdFn } from "@/features/threads/server/get-thread-by-id";
import { getPostsByThreadFn } from "@/features/posts/server/get-posts-by-thread";
import { PostCard } from "@/features/posts/components/post-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { createPostFn } from "@/features/posts/server/create-post";
import { useRouter, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { fr } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { getAuthorDisplayName } from "@/lib/utils/thread-utils";

export const Route = createFileRoute("/threads/$threadId")({
  component: ThreadDetailPage,
  loader: async ({ params }) => {
    const [thread, posts] = await Promise.all([
      getThreadByIdFn({ data: { threadId: params.threadId } }),
      getPostsByThreadFn({ data: { threadId: params.threadId } }),
    ]);
    return { thread, posts };
  },
});

function ThreadDetailPage() {
  const { thread, posts } = Route.useLoaderData();
  const { threadId } = Route.useParams();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      content: "",
      isSensitive: false,
      contentWarnings: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await createPostFn({
          data: {
            threadId,
            content: value.content,
            isSensitive: value.isSensitive,
            contentWarnings: value.contentWarnings
              ? value.contentWarnings.split(",").map((w) => w.trim())
              : [],
          },
        });
        toast.success("Réponse publiée avec succès");
        form.reset();
        router.invalidate();
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la publication",
        );
      }
    },
  });

  const getInitials = (name: string) => {
    return name
      .split("-")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      support: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      discussion: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      question: "bg-green-500/10 text-green-700 border-green-500/20",
      partage: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      temoignage: "bg-pink-500/10 text-pink-700 border-pink-500/20",
      urgent: "bg-red-500/10 text-red-700 border-red-500/20",
    };
    return (
      colors[category.toLowerCase()] ||
      "bg-gray-500/10 text-gray-700 border-gray-500/20"
    );
  };

  const threadAuthorName = getAuthorDisplayName({
    isSensitive: false,
    threadCategory: thread.category,
    aliasName: thread.aliasName,
    displayUsername: thread.displayUsername,
  });

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/threads">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux threads
          </Link>
        </Button>
      </div>

      {/* Thread principal */}
      <Card className="w-full">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {threadAuthorName ? getInitials(threadAuthorName) : "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{threadAuthorName}</span>
                <Badge
                  variant="outline"
                  className={getCategoryColor(thread.category)}
                >
                  {thread.category}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(thread.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{thread.title}</h1>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {thread.body}
          </p>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>
            {posts.length} {posts.length === 1 ? "réponse" : "réponses"}
          </span>
        </div>
      </div>

      {/* Formulaire de réponse */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Ajouter une réponse</h2>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="content"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Votre réponse</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Partagez votre expérience, vos conseils ou vos questions..."
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
                    <Label htmlFor={field.name} className="flex flex-col gap-1">
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
                  <Label htmlFor={field.name}>Avertissements (Optionnel)</Label>
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

            <div className="flex justify-end">
              <Button type="submit">Publier la réponse</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste des réponses */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {posts.length > 0 ? "Réponses" : "Aucune réponse pour le moment"}
        </h2>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={{
              ...post,
              threadTitle: null, // Pas besoin du titre thread ici
            }}
            threadCategory={thread.category}
          />
        ))}
      </div>
    </div>
  );
}
