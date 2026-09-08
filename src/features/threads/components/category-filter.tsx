import { useRouter } from "@tanstack/react-router";
import type { ThreadCategory } from "@/data/threads-categories";
import { threadCategories } from "@/data/threads-categories";
import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/utils/thread-utils";

interface CategoryFilterProps {
	activeCategory?: ThreadCategory;
}

export function CategoryFilter({ activeCategory }: CategoryFilterProps) {
	const router = useRouter();

	const selectCategory = (category?: ThreadCategory) => {
		router.navigate({
			to: "/threads",
			search: category ? { category } : {},
		});
	};

	return (
		<fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
			<legend className="sr-only">Filtrer par catégorie</legend>
			<button
				type="button"
				aria-pressed={!activeCategory}
				onClick={() => selectCategory()}
				className={cn(
					"rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
					!activeCategory
						? "bg-primary text-primary-foreground"
						: "bg-muted text-muted-foreground hover:bg-muted/80",
				)}
			>
				Toutes
			</button>
			{threadCategories.map((category) => (
				<button
					key={category.id}
					type="button"
					aria-pressed={activeCategory === category.id}
					onClick={() => selectCategory(category.id)}
					className={cn(
						"rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
						activeCategory === category.id
							? getCategoryColor(category.id)
							: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
					)}
				>
					{category.icon} {category.label}
				</button>
			))}
		</fieldset>
	);
}
