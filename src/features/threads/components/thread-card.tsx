import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { memo } from "react";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { getAuthorDisplayName } from "@/lib/utils/thread-utils";

interface ThreadCardProps {
	thread: {
		id: string;
		title: string;
		body: string;
		slug: string;
		category: string;
		createdAt: Date | string;
		updatedAt: Date | string;
		aliasName: string | null;
		aliasId: string | null;
		displayUsername: string | null;
	};
}

// OPTIMIZATION: Hoist utility functions outside component to prevent recreation on each render
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
		VIOLENCE: "bg-destructive/10 text-destructive border-destructive/20",
		ABUS: "bg-primary/10 text-primary border-primary/20",
		TEMOIN: "bg-accent/10 text-accent-foreground border-accent/20",
		DETRESSE: "bg-secondary/10 text-secondary-foreground border-secondary/20",
		AUTRE: "bg-muted/10 text-muted-foreground border-muted/20",
	};
	return (
		colors[category.toUpperCase()] ||
		"bg-muted/10 text-muted-foreground border-muted/20"
	);
};

// OPTIMIZATION: Memoize ThreadCard to prevent re-renders when parent updates
// This improves performance when scrolling through long lists of threads
export const ThreadCard = memo(function ThreadCard({
	thread,
}: ThreadCardProps) {
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
					<SafeHtmlDisplay
						html={thread.body}
						className="text-sm text-muted-foreground line-clamp-3"
					/>
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
});
