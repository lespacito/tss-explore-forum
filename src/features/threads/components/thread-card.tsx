import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { memo } from "react";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	getCategoryConfig,
	type ThreadCategory,
} from "@/data/threads-categories";
import {
	getAuthorDisplayName,
	getCategoryColor,
} from "@/lib/utils/thread-utils";

interface ThreadCardProps {
	thread: {
		id: string;
		title: string;
		body: string;
		slug: string;
		category: string;
		isSensitive?: boolean;
		createdAt: Date | string;
		updatedAt: Date | string;
		aliasName: string | null;
		aliasId: string | null;
		displayUsername: string | null;
	};
}

// OPTIMIZATION: Memoize ThreadCard to prevent re-renders when parent updates
// This improves performance when scrolling through long lists of threads
export const ThreadCard = memo(function ThreadCard({
	thread,
}: ThreadCardProps) {
	const authorName = getAuthorDisplayName({
		isSensitive: thread.isSensitive ?? false,
		threadCategory: thread.category,
		aliasName: thread.aliasName,
		displayUsername: thread.displayUsername,
	});
	const categoryLabel = getCategoryConfig(
		thread.category as ThreadCategory,
	)?.label;

	return (
		<Link
			to="/threads/$threadSlug"
			params={{ threadSlug: thread.slug }}
			className="block"
		>
			<Card
				className="w-full cursor-pointer transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-sm"
				data-testid="thread-card"
			>
				<CardHeader className="flex flex-row items-start gap-4 p-4">
					<div className="flex min-w-0 flex-1 flex-col">
						<div className="flex flex-wrap items-center gap-2">
							<span
								className="font-semibold text-sm"
								data-testid="thread-author"
							>
								{authorName}
							</span>
							<Badge
								variant="outline"
								className={`text-xs ${getCategoryColor(thread.category)}`}
								data-testid="thread-category"
							>
								{categoryLabel ?? thread.category}
							</Badge>
						</div>
						<span
							className="text-xs text-muted-foreground"
							data-testid="thread-timestamp"
						>
							{formatDistanceToNow(new Date(thread.createdAt), {
								addSuffix: true,
								locale: fr,
							})}
						</span>
					</div>
				</CardHeader>
				<CardContent className="p-4 pt-0 space-y-2">
					<h3
						className="font-bold text-lg font-serif hover:text-primary transition-colors"
						data-testid="thread-title"
					>
						{thread.title}
					</h3>
					{thread.isSensitive ? (
						<p className="text-sm text-muted-foreground">
							Contenu sensible. Ouvrez la publication pour choisir de le lire.
						</p>
					) : (
						<SafeHtmlDisplay
							html={thread.body}
							className="text-sm text-muted-foreground line-clamp-3 break-words"
							data-testid="thread-excerpt"
						/>
					)}
				</CardContent>
				<CardFooter className="p-4 border-t flex justify-end text-muted-foreground">
					<span className="text-xs font-medium text-primary">
						Lire la publication →
					</span>
				</CardFooter>
			</Card>
		</Link>
	);
});
