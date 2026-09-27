import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { getFeedbackListFn } from "@/features/feedback/server/get-feedback-list";
import type { FeedbackItem } from "@/features/feedback/server/db/feedback-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

export const Route = createFileRoute("/admin/feedback/")({
	loader: async () => {
		const session = await getAuthSession();
		if (!session.user) {
			throw redirect({ to: "/auth/login", search: { redirect: "/admin/feedback" } });
		}
		if (!["ADMIN", "MODERATOR"].includes(session.user.role)) {
			throw redirect({ to: "/" });
		}
		const items = await getFeedbackListFn();
		return { items, moderator: session.user };
	},
	component: AdminFeedbackPage,
});

function AdminFeedbackPage() {
	const data = Route.useLoaderData();
	const items = data.items as FeedbackItem[];
	const moderator = data.moderator;
	const [expandedId, setExpandedId] = useState<string | null>(null);

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
			<header className="mb-8 flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-2xl">
					<h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
						Retours anonymes
					</h1>
					<p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
						Notes et commentaires reçus via le formulaire de feedback. Aucune donnée
						identifiante n'est affichée.
					</p>
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Badge variant="outline">{moderator.role}</Badge>
					<span>{moderator.displayUsername || moderator.name}</span>
				</div>
			</header>

			<div className="space-y-3">
				{items.length === 0 ? (
								<Empty className="mx-auto max-w-xl">
									<EmptyHeader className="text-center">
										<EmptyMedia variant="icon">
											<MessageSquare className="size-6 text-muted-foreground" />
										</EmptyMedia>
										<EmptyTitle className="font-serif text-xl font-semibold">
											Aucun retour
										</EmptyTitle>
										<EmptyDescription className="text-sm text-muted-foreground">
											Aucune note ou commentaire reçu pour l'instant.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
					items.map((item) => (
						<Card key={item.id} className="overflow-hidden">
							<CardHeader className="flex flex-row items-start gap-4 bg-muted/50 px-5 py-4">
								<div className="flex flex-col gap-1">
									<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
										<Badge variant="secondary">
											<span className="tabular-nums">{item.overallRating}</span>/
											<span className="tabular-nums">{item.easeOfUse}</span>/
											<span className="tabular-nums">{item.trustAnonymity}</span>
										</Badge>
										<span>
											{formatDistanceToNow(new Date(item.createdAt), {
												addSuffix: true,
												locale: fr,
											})}
										</span>
									</div>
									<p className="text-sm font-medium">
										{item.misunderstood ? "Incompris · " : ""}
										{item.bugDescription ? "Bug · " : ""}
										{item.improvementSuggestion ? "Suggestion · " : ""}
									</p>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-expanded={expandedId === item.id}
									onClick={() =>
										setExpandedId(expandedId === item.id ? null : item.id)
									}
								>
									{expandedId === item.id ? "Masquer" : "Voir"}
								</Button>
							</CardHeader>
							{expandedId === item.id && (
								<CardContent className="space-y-4 px-5 pb-4">
									{item.misunderstood && (
										<Field label="Élément incompris">
											<Textarea readOnly value={item.misunderstood} />
										</Field>
									)}
									{item.bugDescription && (
										<Field label="Bug rencontré">
											<Textarea readOnly value={item.bugDescription} />
										</Field>
									)}
									{item.bugPage && (
										<Field label="Page concernée">
											<Textarea readOnly value={item.bugPage} />
										</Field>
									)}
									{item.improvementSuggestion && (
										<Field label="Amélioration souhaitée">
											<Textarea readOnly value={item.improvementSuggestion} />
										</Field>
									)}
									{item.freeComment && (
										<Field label="Remarque libre">
											<Textarea readOnly value={item.freeComment} />
										</Field>
									)}
								</CardContent>
							)}
						</Card>
					))
				)}
			</div>
		</div>
	);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="space-y-2">
			<p className="text-sm font-medium text-muted-foreground">{label}</p>
			{children}
		</div>
	);
}
