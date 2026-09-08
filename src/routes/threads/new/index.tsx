import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SafetyNotice } from "@/features/beta/components/safety-notice";
import { AnonymousPostButton } from "@/features/auth/components/AnonymousPostButton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	type ThreadCategory,
	threadCategories,
} from "@/data/threads-categories";
import { getAuthSession } from "@/features/auth/server/get-auth-session";

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
				<h1 className="font-serif text-3xl">Créer une publication</h1>
				<p>
					Commencez une session anonyme pour rédiger un scénario fictif. Aucun
					email n’est nécessaire.
				</p>
				<AnonymousPostButton />
			</div>
		);
	return (
		<div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Créer une publication
				</h1>
				<p className="text-muted-foreground">
					Choisissez la catégorie qui correspond le mieux à votre situation
				</p>
			</div>

			<SafetyNotice />

			{/* Categories Grid */}
			<fieldset
				aria-label="Sélection de la catégorie de publication"
				className="grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				{threadCategories.map((category) => (
					<button
						key={category.id}
						type="button"
						className={[
							"flex flex-col items-start gap-2 p-4 rounded-xl border transition-colors cursor-pointer text-left",
							"focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
							category.color,
							selectedCategory === category.id
								? "ring-2 ring-primary border-primary"
								: "hover:shadow-sm",
						].join(" ")}
						aria-pressed={selectedCategory === category.id}
						aria-describedby={`category-${category.id}-desc`}
						onClick={() => handleCategorySelect(category.id)}
					>
						<span className="text-2xl" aria-hidden="true">
							{category.icon}
						</span>
						<span className="font-semibold">{category.label}</span>
						<span
							id={`category-${category.id}-desc`}
							className="text-sm text-muted-foreground"
						>
							{category.description}
						</span>
					</button>
				))}
			</fieldset>

			{/* Action Buttons */}
			<div className="flex justify-between items-center">
				<Button
					variant="ghost"
					onClick={() =>
						navigate({ to: "/threads", search: { openDialog: false } })
					}
				>
					Annuler
				</Button>
				<Button onClick={handleContinue} disabled={!selectedCategory} size="lg">
					Continuer
				</Button>
			</div>

			{/* Helper Text when selected */}
			{selectedCategory && (
				<div className="p-4 bg-primary/5 border border-primary/20 rounded-lg mt-2">
					<p className="text-sm text-muted-foreground">
						{threadCategories.find((c) => c.id === selectedCategory)?.helpText}
					</p>
				</div>
			)}
		</div>
	);
}
