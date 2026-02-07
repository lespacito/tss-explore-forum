import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "@/features/auth/lib/auth"; // Better-Auth instance
import { findUserBySecretCode } from "@/features/auth/lib/find-user-by-code";

const signInSchema = z.object({
	secretCode: z
		.string()
		.regex(
			/^[A-Z2-9]{4}-[A-Z2-9]{4}(-[A-Z2-9]{4})?$/,
			"Format de code invalide",
		),
});

export const signinWithSecretCodeFn = createServerFn({ method: "POST" })
	.inputValidator(signInSchema)
	.handler(async ({ data, request }) => {
		// Sanitize input
		const normalizedCode = data.secretCode.trim().toUpperCase();

		// Find user - avec protection timing attack
		const user = await findUserBySecretCode(normalizedCode);

		if (!user) {
			// Message générique pour ne pas révéler si le code existe
			return {
				success: false,
				error: "Impossible de se connecter. Vérifiez votre code.",
			};
		}

		// Vérifier que c'est bien un utilisateur anonyme
		if (user.email !== null) {
			return { success: false, error: "Ce code n'est pas valide." };
		}

		// Créer session Better-Auth manuellement
		const session = await auth.api.createSession({
			userId: user.id,
			headers: request.headers,
		});

		if (!session) {
			return { success: false, error: "Erreur lors de la connexion." };
		}

		return { success: true, userId: user.id };
	});
