import { z } from "zod";
import { threadCategoryIds } from "@/data/threads-categories";

export const createThreadSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, "Le titre doit contenir au moins 3 caractères")
		.max(200, "Le titre ne peut pas dépasser 200 caractères"),
	body: z
		.string()
		.min(1, "Le contenu ne peut pas être vide")
		.max(10000, "Le contenu ne peut pas dépasser 10000 caractères"),
	category: z.enum(threadCategoryIds).nullish(),
});
