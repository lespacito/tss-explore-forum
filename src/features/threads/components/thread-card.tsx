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

  const authorName = getAuthorDisplayName({
    isSensitive: false,
    threadCategory: thread.category,
    aliasName: thread.aliasName,
    displayUsername: thread.displayUsername,
  });

  return (
    <Link
      to="/threads/$threadId"
      params={{ threadId: thread.id }}
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
          <h3 className="font-bold text-lg hover:text-primary transition-colors">
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
