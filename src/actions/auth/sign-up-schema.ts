import type { auth } from "@/lib/auth";
import z from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis" }).max(100),
  email: z.email({ message: "Une adresse email valide est requise" }).trim(),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
    .max(100),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

type SignUpSuccess = {
  success: true;
  data: AuthSignUpResult;
};

type SignUpError = {
  success: false;
  error: string;
  field?: keyof SignUpInput;
};

export type AuthSignUpResult = Awaited<ReturnType<typeof auth.api.signUpEmail>>;

export type SignUpResult = SignUpSuccess | SignUpError;
