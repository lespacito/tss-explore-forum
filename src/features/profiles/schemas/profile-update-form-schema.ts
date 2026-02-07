import { z } from "zod";

export const profileUpdateSchema = z.object({
	name: z.string().min(1, "Le nom est requis").max(100),
	displayUsername: z.string().max(100).optional(),
	email: z.email("Une adresse email valide est requise").trim(),
});

export type ProfileUpdateFormSchema = z.infer<typeof profileUpdateSchema>;
