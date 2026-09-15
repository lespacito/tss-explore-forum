import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	getCategoryConfig,
	type ThreadCategory,
} from "@/data/threads-categories";
import { SecretCodeDisplay } from "@/features/auth/components/SecretCodeDisplay";
import { generateSecretCodeFn } from "@/features/auth/server/generate-secret-code-fn";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
import { RejectionMessage } from "@/features/profiles/components/RejectionMessage";
import { ThreadStatusBadge } from "@/features/profiles/components/ThreadStatusBadge";
import { getUserThreadsFn } from "@/features/threads/server/actions/get-user-threads";

export const Route = createFileRoute("/account/profile/")({
	component: Profile,
	loader: async () => {
		const session = await getAuthSessionCached();
		if (!session.user) throw redirect({ to: "/auth/anonymous-signin" });
		return {
			user: session.user,
			threads: await getUserThreadsFn({ data: {} }),
		};
	},
});

function Profile() {
	const { user, threads } = Route.useLoaderData();
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const groups = [
		{
			status: "pending" as const,
			title: "À examiner",
			description: "Ces scénarios attendent une décision humaine.",
		},
		{
			status: "rejected" as const,
			title: "Non publiés",
			description:
				"Le motif de non-publication est indiqué sous chaque scénario.",
		},
		{
			status: "published" as const,
			title: "Publiés",
			description: "Ces scénarios sont visibles par les personnes invitées.",
		},
	];

	return (
		<div className="civic-page mx-auto max-w-4xl space-y-10 px-4 py-10 sm:py-14">
			<header className="flex flex-wrap items-end justify-between gap-5 border-b pb-7">
				<div>
					<h1 className="font-serif text-4xl font-semibold tracking-tight">
						Mes scénarios
					</h1>
					<p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
						Chaque scénario reste ici, avec la décision prise après examen.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link to="/account/settings">Gérer mes données</Link>
				</Button>
			</header>

			{user.isAnonymous && (
				<section className="space-y-4 border-b pb-8">
					<Button
						variant="outline"
						disabled={loading}
						onClick={async () => {
							if (code) {
								setCode("");
								return;
							}
							setLoading(true);
							setError("");
							try {
								const result = await generateSecretCodeFn();
								if (result.success) setCode(result.secretCode);
								else setError(result.error);
							} catch {
								setError("Le code n’a pas pu être chargé. Réessayez.");
							} finally {
								setLoading(false);
							}
						}}
					>
						{loading
							? "Chargement…"
							: code
								? "Masquer mon code de récupération"
								: "Voir mon code de récupération"}
					</Button>
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
					{code && <SecretCodeDisplay secretCode={code} isExisting />}
				</section>
			)}

			{threads.length === 0 ? (
				<section className="border-y py-12">
					<h2 className="font-serif text-2xl font-semibold">Aucun scénario</h2>
					<p className="mt-2 text-muted-foreground">
						Votre premier scénario apparaîtra ici après son envoi.
					</p>
				</section>
			) : (
				<div className="space-y-12">
					{groups.map((group) => {
						const groupThreads = threads.filter(
							(thread) => thread.status === group.status,
						);
						return (
							<section
								key={group.status}
								aria-labelledby={`group-${group.status}`}
							>
								<div className="mb-5 flex items-baseline justify-between gap-4">
									<div>
										<h2
											id={`group-${group.status}`}
											className="font-serif text-2xl font-semibold"
										>
											{group.title}
										</h2>
										<p className="mt-1 text-sm text-muted-foreground">
											{group.description}
										</p>
									</div>
									<span className="text-sm tabular-nums text-muted-foreground">
										{groupThreads.length}
									</span>
								</div>
								{groupThreads.length ? (
									<div className="divide-y border-y">
										{groupThreads.map((thread) => (
											<UserThreadRow key={thread.id} thread={thread} />
										))}
									</div>
								) : (
									<p className="border-y py-5 text-sm text-muted-foreground">
										Aucun scénario dans ce groupe.
									</p>
								)}
							</section>
						);
					})}
				</div>
			)}

			<Button asChild size="lg">
				<Link to="/threads/new">Créer un nouveau scénario</Link>
			</Button>
		</div>
	);
}

type UserThread = {
	id: string;
	title: string;
	body: string;
	slug: string;
	category: string | null;
	status: "pending" | "published" | "rejected";
	isSensitive: boolean;
	rejectionReason: string | null;
	createdAt: Date | string;
};

function UserThreadRow({ thread }: { thread: UserThread }) {
	const content = (
		<article className="py-6">
			<div className="flex flex-wrap items-center gap-2">
				<ThreadStatusBadge status={thread.status} />
				<Badge variant="outline">
					{thread.category
						? (getCategoryConfig(thread.category as ThreadCategory)?.label ??
							thread.category)
						: "Non classé"}
				</Badge>
				<time className="text-xs text-muted-foreground">
					{formatDistanceToNow(new Date(thread.createdAt), {
						addSuffix: true,
						locale: fr,
					})}
				</time>
			</div>
			<h3 className="mt-3 font-serif text-xl font-semibold">{thread.title}</h3>
			<SafeHtmlDisplay
				html={thread.body}
				className="mt-2 line-clamp-3 max-w-[70ch] text-sm leading-6 text-muted-foreground"
			/>
		</article>
	);

	return (
		<div>
			{thread.status === "published" ? (
				<Link
					to="/threads/$threadSlug"
					params={{ threadSlug: thread.slug }}
					className="block hover:bg-secondary/35"
				>
					{content}
				</Link>
			) : (
				content
			)}
			{thread.status === "rejected" && thread.rejectionReason && (
				<div className="pb-6">
					<RejectionMessage reason={thread.rejectionReason} />
					<Button asChild variant="outline" className="mt-3">
						<Link to="/threads/new">Créer un nouveau scénario</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
