import { auth } from "./auth";
import type { SignUpInput, SignUpResult } from "@/features/auth/schema/sign-up-schema";

const ERROR_PATTERNS: Record<
  string,
  { field?: keyof SignUpInput; message: string }
> = {
  email: { field: "email", message: "Cet email est déjà utilisé" },
  password: {
    field: "password",
    message: "Le mot de passe ne respecte pas les critères",
  },
  name: { field: "name", message: "Le nom est invalide" },
};

function parseAuthError(error: unknown): SignUpResult {
  if (!(error instanceof Error)) {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
  const msg = error.message.toLowerCase();
  for (const [pattern, info] of Object.entries(ERROR_PATTERNS)) {
    if (msg.includes(pattern)) {
      return info.field
        ? { success: false, error: info.message, field: info.field }
        : { success: false, error: info.message };
    }
  }
  return {
    success: false,
    error: error.message || "Erreur lors de l'inscription",
  };
}

export const authApi = {
  async signUp(input: SignUpInput): Promise<SignUpResult> {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
      });
      if (!result) {
        return {
          success: false,
          error: "Une erreur est survenue lors de l'inscription",
        };
      }
      return { success: true, data: result };
    } catch (e) {
      return parseAuthError(e);
    }
  },
};
