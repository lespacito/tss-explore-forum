import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { fr } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";
import { getAuthorDisplayName } from "@/lib/utils/thread-utils";

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    body: string;
    slug: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
    aliasName: string | null;
    aliasId: string | null;
    displayUsername: string | null;
  };
}

export function ThreadCard({ thread }: ThreadCardProps) {
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
      support: "bg-primary/10 text-primary border-primary/20",
      discussion: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      question: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      partage: "bg-accent/10 text-accent-foreground border-accent/20",
      temoignage: "bg-chart-4/10 text-chart-4 border-chart-4/20",
      urgent: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      colors[category.toLowerCase()] ||
      "bg-muted/10 text-muted-foreground border-muted/20"
    );
  };

  const authorName = getAuthorDisplayName({
    isSensitive: false,
    threadCategory: thread.category,
    aliasName: thread.aliasName,
    displayUsername: thread.displayUsername,
  });

  return (
    <Link
      to="/threads/$threadSlug"
      params={{ threadSlug: thread.slug }}
      className="block"
    >
      <Card className="w-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {authorName ? getInitials(authorName) : "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{authorName}</span>
              <Badge
                variant="outline"
                className={`text-xs ${getCategoryColor(thread.category)}`}
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
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <h3 className="font-bold text-lg font-serif hover:text-primary transition-colors">
            {thread.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {thread.body}
          </p>
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-between text-muted-foreground">
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>0 réponses</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              <span>0 j'aime</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Voir la discussion →
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
