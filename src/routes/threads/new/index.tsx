import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	type ThreadCategory,
	threadCategories,
} from "@/data/threads-categories";
import { AnonymousPostButton } from "@/features/auth/components/AnonymousPostButton";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { SafetyNotice } from "@/features/beta/components/safety-notice";

export const Route = createFileRoute("/threads/new/")({
	component: NewThreadPage,
	loader: async () => {
		const session = await getAuthSession();

		// Allow access for both anonymous and registered users
		return { session };
	},
});

function NewThreadPage() {
	const navigate = useNavigate();
	const { session } = Route.useLoaderData();
	const [selectedCategory, setSelectedCategory] =
		useState<ThreadCategory | null>(null);

	const handleCategorySelect = (category: ThreadCategory) => {
		setSelectedCategory(category);
	};

	const handleContinue = () => {
		if (!selectedCategory) return;
		navigate({
			to: "/threads/new/$category",
			params: { category: selectedCategory },
		});
	};

	if (!session?.user)
		return (
			<div className="mx-auto max-w-xl space-y-5 px-4 py-10">
				<h1 className="font-serif text-3xl font-semibold">
					Créer une publication
				</h1>
				<p>
					Commencez une session anonyme pour rédiger un scénario fictif. Aucun
					email n’est nécessaire.
				</p>
				<AnonymousPostButton />
			</div>
		);
	return (
		<main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
			<header className="space-y-2">
				<h1 className="font-serif text-3xl font-semibold">
					Créer une publication
				</h1>
				<p className="max-w-prose text-muted-foreground">
					Choisissez la catégorie qui correspond le mieux au scénario fictif que
					vous allez rédiger.
				</p>
			</header>

			<SafetyNotice />

			<fieldset
				aria-label="Sélection de la catégorie de publication"
				className="divide-y border-y"
			>
				{threadCategories.map((category) => (
					<button
						key={category.id}
						type="button"
						className={[
							"group flex min-h-20 w-full items-start gap-4 px-1 py-4 text-left transition-colors",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4",
							selectedCategory === category.id
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground",
						].join(" ")}
						aria-pressed={selectedCategory === category.id}
						aria-describedby={`category-${category.id}-desc`}
						onClick={() => handleCategorySelect(category.id)}
					>
						<span
							aria-hidden="true"
							className={[
								"mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
								selectedCategory === category.id
									? "border-primary"
									: "border-muted-foreground/50 group-hover:border-primary",
							].join(" ")}
						>
							{selectedCategory === category.id && (
								<span className="size-2 rounded-full bg-primary" />
							)}
						</span>
						<span className="min-w-0">
							<span className="block font-semibold text-foreground">
								{category.label}
							</span>
							<span
								id={`category-${category.id}-desc`}
								className="mt-1 block text-sm leading-6"
							>
								{category.description}
							</span>
						</span>
					</button>
				))}
			</fieldset>

			<div className="flex items-center justify-between gap-4">
				<Button
					variant="ghost"
					onClick={() =>
						navigate({ to: "/threads", search: { openDialog: false } })
					}
				>
					Annuler
				</Button>
				<Button
					onClick={handleContinue}
					disabled={!selectedCategory}
					size="lg"
					className="min-h-11"
				>
					Continuer
				</Button>
			</div>

			{selectedCategory && (
				<div className="rounded-xl bg-muted/60 p-4">
					<p className="text-sm text-muted-foreground">
						{threadCategories.find((c) => c.id === selectedCategory)?.helpText}
					</p>
				</div>
			)}
		</main>
	);
}
