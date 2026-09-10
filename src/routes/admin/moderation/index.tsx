import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	ArchiveX,
	Check,
	Clock3,
	EyeOff,
	FileCheck2,
	ShieldCheck,
	ShieldOff,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import {
	getModerationQueueFn,
	type ModerationQueueItem,
	moderateThreadFn,
} from "@/features/moderation/server/thread-moderation";
import { cn } from "@/lib/utils";

type QueueStatus = "pending" | "published" | "rejected";
type ModerationAction =
	| "publish"
	| "reject"
	| "mark_sensitive"
	| "unmark_sensitive";
type DecisionNotice = {
	title: string;
	description: string;
	filter: QueueStatus;
};
export const Route = createFileRoute("/admin/moderation/")({
	component: ModerationPage,
	loader: async () => {
		const session = await getAuthSession();
		if (!session.user) {
			throw redirect({
				to: "/auth/login",
				search: { redirect: "/admin/moderation" },
			});
		}
		if (!["ADMIN", "MODERATOR"].includes(session.user.role)) {
			throw redirect({ to: "/" });
		}

		return {
			threads: (await getModerationQueueFn()) as ModerationQueueItem[],
			moderator: session.user,
		};
	},
});

function ModerationPage() {
	const { threads, moderator } = Route.useLoaderData();
	const moderationThreads = threads as ModerationQueueItem[];
	const [filter, setFilter] = useState<QueueStatus>("pending");
	const [lastDecision, setLastDecision] = useState<DecisionNotice | null>(null);
	const counts = useMemo(
		() =>
			moderationThreads.reduce<Record<QueueStatus, number>>(
				(result, thread) => {
					result[thread.status] += 1;
					return result;
				},
				{ pending: 0, published: 0, rejected: 0 },
			),
		[moderationThreads],
	);
	const visibleThreads = moderationThreads.filter(
		(thread) => thread.status === filter,
	);

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
			<header className="mb-8 flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-2xl">
					<h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
						File de modération
					</h1>
					<p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
						Relisez chaque publication avec calme. L’identité technique et
						l’adresse IP des auteurs ne sont jamais affichées ici.
					</p>
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<ShieldCheck className="size-4 text-primary" />
					<span>{moderator.displayUsername || moderator.name}</span>
					<Badge variant="outline">{moderator.role}</Badge>
				</div>
			</header>

			<nav aria-label="Filtrer la file de modération" className="mb-7">
				<div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-secondary p-1">
					<FilterButton
						active={filter === "pending"}
						count={counts.pending}
						onClick={() => setFilter("pending")}
					>
						À examiner
					</FilterButton>
					<FilterButton
						active={filter === "published"}
						count={counts.published}
						onClick={() => setFilter("published")}
					>
						Publiées
					</FilterButton>
					<FilterButton
						active={filter === "rejected"}
						count={counts.rejected}
						onClick={() => setFilter("rejected")}
					>
						Rejetées
					</FilterButton>
				</div>
			</nav>

			{lastDecision && (
				<div className="mb-7 flex flex-col gap-3 rounded-xl bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0" aria-live="polite">
						<p className="font-medium">{lastDecision.title}</p>
						<p className="mt-1 break-words text-sm text-muted-foreground">
							{lastDecision.description}
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						className="shrink-0"
						onClick={() => setFilter(lastDecision.filter)}
					>
						Voir dans {filterLabel(lastDecision.filter)}
					</Button>
				</div>
			)}

			{visibleThreads.length === 0 ? (
				<EmptyQueue status={filter} />
			) : (
				<div className="space-y-5">
					{visibleThreads.map((thread) => (
						<ModerationItem
							key={thread.id}
							thread={thread}
							onDecision={setLastDecision}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function FilterButton({
	active,
	count,
	onClick,
	children,
}: {
	active: boolean;
	count: number;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				"flex min-h-9 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				active
					? "bg-background text-foreground shadow-xs"
					: "text-muted-foreground hover:text-foreground",
			)}
		>
			{children}
			<span className="tabular-nums">{count}</span>
		</button>
	);
}

function ModerationItem({
	thread,
	onDecision,
}: {
	thread: ModerationQueueItem;
	onDecision: (notice: DecisionNotice) => void;
}) {
	const router = useRouter();
	const [isWorking, setIsWorking] = useState(false);
	const [showReject, setShowReject] = useState(false);
	const [reason, setReason] = useState(thread.rejectionReason || "");
	const [pendingAction, setPendingAction] = useState<Exclude<
		ModerationAction,
		"reject"
	> | null>(null);

	async function runAction(action: ModerationAction) {
		setIsWorking(true);
		try {
			await moderateThreadFn({
				data: {
					threadId: thread.id,
					action,
					reason: action === "reject" ? reason : undefined,
				},
			});
			toast.success(
				action === "publish"
					? "Publication approuvée"
					: action === "reject"
						? "Publication rejetée"
						: action === "mark_sensitive"
							? "Contenu marqué sensible"
							: "Marquage sensible retiré",
			);
			setShowReject(false);
			setPendingAction(null);
			onDecision(decisionNoticeFor(action, thread.title, thread.status));
			try {
				await router.invalidate();
			} catch {
				toast.error(
					"Décision enregistrée, mais la file n’a pas pu être actualisée. Rechargez la page.",
				);
			}
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "L’action de modération a échoué",
			);
		} finally {
			setIsWorking(false);
		}
	}

	return (
		<article className="overflow-hidden rounded-xl bg-card shadow-sm">
			<div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
				<div className="min-w-0">
					<div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
						<Badge variant="outline">{thread.category}</Badge>
						<span>{thread.aliasName}</span>
						<span aria-hidden="true">·</span>
						<span className="inline-flex items-center gap-1">
							<Clock3 className="size-3.5" />
							{formatDistanceToNow(new Date(thread.createdAt), {
								addSuffix: true,
								locale: fr,
							})}
						</span>
						{thread.isSensitive && (
							<Badge variant="destructive">
								<EyeOff />
								Sensible
							</Badge>
						)}
					</div>
					<h2 className="font-serif text-xl font-semibold leading-snug sm:text-2xl">
						{thread.title}
					</h2>
					<SafeHtmlDisplay
						html={thread.body}
						className="mt-4 max-w-[72ch] text-sm leading-7 text-foreground/85"
					/>
					{thread.status === "rejected" && thread.rejectionReason && (
						<p className="mt-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
							<strong>Motif transmis :</strong> {thread.rejectionReason}
						</p>
					)}
				</div>

				<aside className="border-t pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
					<p className="mb-3 text-sm font-medium">Décision</p>
					<div className="grid gap-2">
						<Button
							type="button"
							disabled={
								isWorking ||
								showReject ||
								pendingAction !== null ||
								thread.status === "published"
							}
							onClick={() => setPendingAction("publish")}
						>
							<Check />
							Approuver
						</Button>
						<Button
							type="button"
							variant="outline"
							disabled={isWorking || showReject || pendingAction !== null}
							onClick={() =>
								setPendingAction(
									thread.isSensitive ? "unmark_sensitive" : "mark_sensitive",
								)
							}
						>
							{thread.isSensitive ? <ShieldOff /> : <ShieldCheck />}
							{thread.isSensitive ? "Retirer sensible" : "Marquer sensible"}
						</Button>
						<Button
							type="button"
							variant="outline"
							disabled={isWorking || pendingAction !== null}
							onClick={() => setShowReject((value) => !value)}
							aria-expanded={showReject}
						>
							<ArchiveX />
							Rejeter
						</Button>
					</div>
					{pendingAction && (
						<fieldset className="mt-4 space-y-3 rounded-lg bg-muted p-3">
							<legend className="sr-only">Confirmer la décision</legend>
							<p className="text-sm">{confirmationMessageFor(pendingAction)}</p>
							<div className="flex flex-wrap justify-end gap-2">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									disabled={isWorking}
									onClick={() => setPendingAction(null)}
								>
									Annuler
								</Button>
								<Button
									type="button"
									size="sm"
									disabled={isWorking}
									onClick={() => runAction(pendingAction)}
								>
									{isWorking
										? "Décision en cours…"
										: confirmationLabelFor(pendingAction)}
								</Button>
							</div>
						</fieldset>
					)}
				</aside>
			</div>

			{showReject && (
				<div className="border-t bg-muted/45 p-5 sm:p-6">
					<label
						htmlFor={`rejection-${thread.id}`}
						className="text-sm font-medium"
					>
						Motif transmis à l’auteur
					</label>
					<p className="mt-1 text-sm text-muted-foreground">
						Décrivez précisément ce qui doit être corrigé, sans jugement sur la
						personne.
					</p>
					<Textarea
						id={`rejection-${thread.id}`}
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						maxLength={500}
						placeholder="Cette publication ne peut pas être publiée car…"
						className="mt-3 min-h-24 bg-background"
					/>
					<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
						<span className="text-xs tabular-nums text-muted-foreground">
							{reason.trim().length}/500 caractères
						</span>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setShowReject(false)}
								disabled={isWorking}
							>
								Annuler
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={() => runAction("reject")}
								disabled={isWorking || reason.trim().length < 10}
							>
								<ArchiveX />
								Confirmer le rejet
							</Button>
						</div>
					</div>
				</div>
			)}
		</article>
	);
}

function confirmationMessageFor(action: Exclude<ModerationAction, "reject">) {
	if (action === "publish") {
		return "Cette publication deviendra visible par les invités.";
	}
	if (action === "mark_sensitive") {
		return "Son extrait sera masqué jusqu’à ce que la personne choisisse de l’afficher.";
	}
	return "Son extrait ne sera plus masqué avant la lecture.";
}

function confirmationLabelFor(action: Exclude<ModerationAction, "reject">) {
	if (action === "publish") return "Confirmer l’approbation";
	if (action === "mark_sensitive") return "Confirmer le marquage";
	return "Confirmer le retrait";
}

function decisionNoticeFor(
	action: ModerationAction,
	threadTitle: string,
	currentStatus: QueueStatus,
): DecisionNotice {
	if (action === "publish") {
		return {
			title: "Publication approuvée",
			description: `« ${threadTitle} » est maintenant visible par les invités.`,
			filter: "published",
		};
	}
	if (action === "reject") {
		return {
			title: "Publication rejetée",
			description:
				"« " +
				threadTitle +
				" » apparaît maintenant dans les publications rejetées.",
			filter: "rejected",
		};
	}
	return {
		title:
			action === "mark_sensitive"
				? "Contenu marqué sensible"
				: "Marquage sensible retiré",
		description:
			action === "mark_sensitive"
				? "L’extrait de « " +
					threadTitle +
					" » est maintenant masqué avant lecture."
				: "L’extrait de « " +
					threadTitle +
					" » n’est plus masqué avant lecture.",
		filter: currentStatus,
	};
}

function filterLabel(status: QueueStatus) {
	if (status === "pending") return "À examiner";
	if (status === "published") return "Publiées";
	return "Rejetées";
}

function EmptyQueue({ status }: { status: QueueStatus }) {
	const labels = {
		pending: {
			title: "La file est à jour",
			description: "Aucune publication n’attend actuellement votre examen.",
		},
		published: {
			title: "Aucune publication approuvée",
			description: "Les publications approuvées apparaîtront ici.",
		},
		rejected: {
			title: "Aucune publication rejetée",
			description: "Les décisions de rejet apparaîtront ici avec leur motif.",
		},
	};
	const current = labels[status];

	return (
		<div className="rounded-xl bg-card px-6 py-16 text-center shadow-sm">
			<FileCheck2 className="mx-auto size-8 text-primary" />
			<h2 className="mt-4 font-serif text-xl font-semibold">{current.title}</h2>
			<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
				{current.description}
			</p>
		</div>
	);
}
