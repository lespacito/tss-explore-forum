import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { getUserThreadsFn } from "@/features/threads/server/get-user-threads";
import { getUserPostsFn } from "@/features/posts/server/get-user-posts";
import { ThreadCard } from "@/features/threads/components/thread-card";
import { PostCard } from "@/features/posts/components/post-card";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AtSign,
  Calendar,
  Settings,
  FileText,
  MessageSquare,
} from "lucide-react";

const getInitials = (name?: string) => {
  const safe = (name ?? "").trim();
  if (!safe) return "??";
  return safe
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const Route = createFileRoute("/account/profile/")({
  component: PublicProfilePage,
  loader: async () => {
    const session = await getAuthSession();
    if (!session || !session.user) {
      throw redirect({
        to: "/auth/login",
      });
    }

    // Load user's threads and posts with error handling
    try {
      const [userThreads, userPosts] = await Promise.all([
        getUserThreadsFn().catch(() => []),
        getUserPostsFn().catch(() => []),
      ]);

      return {
        user: session.user,
        threads: userThreads ?? [],
        posts: userPosts ?? [],
      };
    } catch (error) {
      console.error("Error loading user profile data:", error);
      return {
        user: session.user,
        threads: [],
        posts: [],
      };
    }
  },
});

function PublicProfilePage() {
  const { user, threads, posts } = Route.useLoaderData();
  const displayName = user?.name ?? user?.username ?? "Utilisateur";
  const avatarSrc = user?.image ?? "";
  const joinDate = user?.createdAt
    ? format(new Date(user.createdAt), "d MMMM yyyy", { locale: fr })
    : "Date inconnue";

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
      <Card>
        <CardHeader className="relative">
          <div className="space-y-4">
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="text-3xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {displayName}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <AtSign className="h-4 w-4" />
                {user.username ?? "non-défini"}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="absolute top-6 right-6 gap-2"
          >
            <Link to="/account/settings">
              <Settings className="h-4 w-4" />
              Gérer le compte
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">À propos de moi</h3>
            <p className="text-muted-foreground italic">
              {user?.bio || "L'utilisateur n'a pas encore écrit de biographie."}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Rejoint le {joinDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>
                {threads?.length ?? 0}{" "}
                {(threads?.length ?? 0) === 1 ? "publication" : "publications"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>
                {posts?.length ?? 0}{" "}
                {(posts?.length ?? 0) === 1 ? "réponse" : "réponses"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mes publications et réponses */}
      <Card>
        <CardHeader>
          <CardTitle>Mon activité</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="publications" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="publications" className="gap-2">
                <FileText className="h-4 w-4" />
                Mes publications ({threads?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="reponses" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Mes réponses ({posts?.length ?? 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="publications" className="space-y-4 mt-6">
              {!threads || threads.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Vous n'avez pas encore créé de publication.</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link to="/threads">Explorer les discussions</Link>
                  </Button>
                </div>
              ) : (
                threads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))
              )}
            </TabsContent>

            <TabsContent value="reponses" className="space-y-4 mt-6">
              {!posts || posts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Vous n'avez pas encore posté de réponse.</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link to="/threads">Participer aux discussions</Link>
                  </Button>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    threadCategory={post.threadCategory || ""}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
