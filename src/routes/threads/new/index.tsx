import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	type ThreadCategory,
	threadCategories,
} from "@/data/threads-categories";

export const Route = createFileRoute("/threads/new/")({
	component: NewThreadPage,
});

function NewThreadPage() {
	const navigate = useNavigate();
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

			{/* Safety Disclaimer */}
			<div className="p-4 bg-warning/20 border-2 border-warning/50 rounded-lg">
				<div className="flex items-start gap-3">
					<span className="text-2xl">⚠️</span>
					<div className="flex-1">
						<p className="text-sm text-warning-foreground font-semibold mb-1">
							Important : Cette plateforme n&apos;est pas un service
							d&apos;urgence
						</p>
						<p className="text-sm text-warning-foreground">
							Si vous êtes en danger immédiat, contactez le 117 (Police), le 143
							(La Main Tendue) ou le 147 (CPN - Conseils + aide 147).
						</p>
					</div>
				</div>
			</div>

			{/* Categories Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{threadCategories.map((category) => (
					<button
						key={category.id}
						type="button"
						className={[
							"flex flex-col items-start gap-2 p-4 rounded-xl border transition-colors cursor-pointer text-left",
							category.color,
							selectedCategory === category.id
								? "ring-2 ring-primary border-primary"
								: "hover:shadow-sm",
						].join(" ")}
						aria-pressed={selectedCategory === category.id}
						onClick={() => handleCategorySelect(category.id)}
					>
						<span className="text-2xl">{category.icon}</span>
						<span className="font-semibold">{category.label}</span>
						<span className="text-sm text-muted-foreground">
							{category.description}
						</span>
					</button>
				))}
			</div>

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
