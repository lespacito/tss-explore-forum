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
				Aucune discussion pour le moment. Soyez le premier à en créer une !
			</div>
		);
	}

	const activeConfig = threadCategories.find(
		(category) => category.id === activeCategory,
	);

	return (
		<div className="space-y-4 py-12 text-center">
			<p className="text-lg text-muted-foreground">
				Pas encore de discussions dans cette catégorie.
			</p>
			<p className="text-sm text-muted-foreground">
				Soyez le premier à partager une expérience dans « {activeConfig?.label}{" "}
				».
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
							{category.icon} {category.label}
						</Button>
					))}
			</div>
			<Button
				type="button"
				variant="link"
				onClick={() => router.navigate({ to: "/threads", search: {} })}
			>
				Voir toutes les discussions
			</Button>
		</div>
	);
}
