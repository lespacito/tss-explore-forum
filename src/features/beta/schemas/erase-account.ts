import { z } from "zod";

export const eraseBetaAccountSchema = z.object({
	confirmation: z
		.string()
		.transform((value) => value.trim().toUpperCase())
		.pipe(z.literal("EFFACER")),
	password: z.string().max(256).optional(),
});
