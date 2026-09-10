import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { ThreadCategory } from "@/data/threads-categories";
import { threadCategories } from "@/data/threads-categories";

interface EmptyThreadsStateProps {
	activeCategory?: ThreadCategory;
}

export function EmptyThreadsState({ activeCategory }: EmptyThreadsStateProps) {
	const router = useRouter();

	if (!activeCategory) {
		return (
			<div className="py-10 text-center text-muted-foreground">
				Aucune publication validée pour le moment.
			</div>
		);
	}

	const activeConfig = threadCategories.find(
		(category) => category.id === activeCategory,
	);

	return (
		<div className="space-y-4 py-12 text-center">
			<p className="text-lg text-muted-foreground">
				Aucune publication validée dans cette catégorie.
			</p>
			<p className="text-sm text-muted-foreground">
				Les scénarios publiés dans « {activeConfig?.label} » apparaîtront ici
				après modération.
			</p>
			<div className="flex flex-wrap justify-center gap-2 pt-2">
				{threadCategories
					.filter((category) => category.id !== activeCategory)
					.map((category) => (
						<Button
							key={category.id}
							type="button"
							variant="secondary"
							size="sm"
							onClick={() =>
								router.navigate({
									to: "/threads",
									search: { category: category.id },
								})
							}
						>
							{category.label}
						</Button>
					))}
			</div>
			<Button
				type="button"
				variant="link"
				onClick={() => router.navigate({ to: "/threads", search: {} })}
			>
				Voir toutes les publications
			</Button>
		</div>
	);
}
