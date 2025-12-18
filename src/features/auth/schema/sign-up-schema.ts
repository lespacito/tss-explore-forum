import z from "zod";
import type { auth } from "@/features/auth/lib/auth";
import type { Result } from "@/lib/api-error";

export const signUpSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis" }).max(100),
  email: z.email({ message: "Une adresse email valide est requise" }).trim(),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
    .max(100),
  username: z
    .string()
    .min(1, { message: "Le nom d'utilisateur est requis" })
    .max(100),
  displayUsername: z
    .string()
    .min(1, { message: "Le nom d'affichage est requis" })
    .max(100),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export type AuthSignUpResult = Awaited<ReturnType<typeof auth.api.signUpEmail>>;

// Utilise un Result générique cohérent avec le reste de l'app
export type SignUpResult = Result<AuthSignUpResult>;
