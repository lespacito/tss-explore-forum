import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MessageSquare, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { fr } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { getAuthorDisplayName } from "@/lib/utils/thread-utils";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    threadId: string | null;
    threadTitle: string | null;
    isSensitive: boolean;
    contentWarnings: string[] | null;
    createdAt: Date;
    updatedAt: Date;
    aliasName: string | null;
    aliasId: string | null;
    displayUsername: string | null;
  };
  threadCategory?: string;
}

export function PostCard({ post, threadCategory = "" }: PostCardProps) {
  const [isBlurred, setIsBlurred] = useState(post.isSensitive);

  const getInitials = (name: string) => {
    return name
      .split("-")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const authorName = getAuthorDisplayName({
    isSensitive: post.isSensitive,
    threadCategory,
    aliasName: post.aliasName,
    displayUsername: post.displayUsername,
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary">
            {authorName ? getInitials(authorName) : "??"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{authorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
        </div>
        {post.isSensitive && (
          <Badge variant="destructive" className="ml-auto">
            Sensible
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {post.threadTitle && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span>Dans : {post.threadTitle}</span>
          </div>
        )}
        {post.contentWarnings && post.contentWarnings.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {post.contentWarnings.map((warning) => (
              <Badge key={warning} variant="outline" className="text-xs">
                ⚠️ {warning}
              </Badge>
            ))}
          </div>
        )}
        <div className="relative mt-2">
          <div
            className={`text-sm text-muted-foreground whitespace-pre-wrap ${
              isBlurred ? "blur-md select-none" : ""
            }`}
          >
            {post.content}
          </div>
          {isBlurred && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsBlurred(false)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Voir le contenu
              </Button>
            </div>
          )}
          {!isBlurred && post.isSensitive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBlurred(true)}
              className="mt-2 gap-2 text-xs text-muted-foreground"
            >
              <EyeOff className="h-3 w-3" />
              Masquer
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between">
        <Button variant="ghost" size="sm" className="gap-2">
          <ThumbsUp className="h-4 w-4" />
          J'aime
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Commenter
        </Button>
      </CardFooter>
    </Card>
  );
}
