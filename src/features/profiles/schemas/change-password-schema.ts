import { z } from "zod";

export const changePasswordSchema = z.object({
	currentPassword: z
		.string()
		.min(1, "Le mot de passe actuel est requis")
		.max(100),
	newPassword: z
		.string()
		.min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
		.max(100),
	revokeOtherSessions: z.boolean(),
});

export type ChangePasswordFormSchema = z.infer<typeof changePasswordSchema>;
