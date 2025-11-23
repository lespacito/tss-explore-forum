import { auth } from "@/lib/auth";
import z from "zod";

export const signInSchema = z.object({
  email: z.email({ message: "Une adresse email valide est requise" }).trim(),
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
