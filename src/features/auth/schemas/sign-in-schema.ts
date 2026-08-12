import z from "zod";
import type { auth } from "@/features/auth/lib/auth";

export const signInSchema = z.object({
	username: z
		.string()
		.min(1, { message: "Le nom d'utilisateur est requis" })
		.max(100),
	password: z
		.string()
		.min(1, { message: "Le mot de passe est requis" })
		.max(100),
});

export type SignInInput = z.infer<typeof signInSchema>;

type SignInSuccess = {
	success: true;
	data: AuthSignInResult;
};

type SignInError = {
	success: false;
	error: string;
	field?: keyof SignInInput;
};

export type AuthSignInResult = Awaited<ReturnType<typeof auth.api.signInEmail>>;

export type SignInResult = SignInSuccess | SignInError;
