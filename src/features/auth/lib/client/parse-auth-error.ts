import type { SignUpInput } from "@/features/auth/schemas/sign-up-schema";
import type { SignInInput } from "@/features/auth/schemas/sign-in-schema";

/**
 * Extrait le message d'erreur d'un objet d'erreur Better Auth complexe
 */
function extractErrorMessage(error: unknown): string {
  // Cas 1: Error standard avec message string
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }

  // Cas 2: Objet avec propriété error.message
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    error.error &&
    typeof error.error === "object" &&
    "message" in error.error &&
    typeof error.error.message === "string"
  ) {
    return error.error.message;
  }

  // Cas 3: Objet avec propriété message directe
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  // Cas 4: Objet Better Auth avec error string
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string"
  ) {
    return error.error;
  }

  // Cas 5: String directe
  if (typeof error === "string") {
    return error;
  }

  // Fallback: stringify l'objet pour debug
  try {
    return JSON.stringify(error);
  } catch {
    return "Une erreur inattendue est survenue";
  }
}

/**
 * Patterns d'erreurs pour le sign-up
 */
const SIGNUP_ERROR_PATTERNS: Record<
  string,
  { field?: keyof SignUpInput; message: string }
> = {
  disposable: {
    field: "email",
    message: "Les emails jetables ne sont pas autorisés",
  },
  "invalid email": { field: "email", message: "Adresse email invalide" },
  "no mx": { field: "email", message: "Domaine email invalide" },
  "email already": { field: "email", message: "Cet email est déjà utilisé" },
  email: { field: "email", message: "Erreur liée à l'email" },
  password: {
    field: "password",
    message: "Le mot de passe ne respecte pas les critères",
  },
  "username already": {
    field: "username",
    message: "Ce nom d'utilisateur est déjà pris",
  },
  username: { field: "username", message: "Nom d'utilisateur invalide" },
  name: { field: "name", message: "Le nom est invalide" },
  "rate limit": {
    message: "Trop de tentatives. Veuillez réessayer plus tard.",
  },
  "too many": { message: "Trop de tentatives. Veuillez réessayer plus tard." },
};

/**
 * Patterns d'erreurs pour le sign-in
 */
const SIGNIN_ERROR_PATTERNS: Record<
  string,
  { field?: keyof SignInInput; message: string }
> = {
  "user not found": {
    field: "username",
    message: "Nom d'utilisateur introuvable",
  },
  "invalid username": {
    field: "username",
    message: "Nom d'utilisateur invalide",
  },
  username: { field: "username", message: "Erreur liée au nom d'utilisateur" },
  "incorrect password": {
    field: "password",
    message: "Mot de passe incorrect",
  },
  "invalid credentials": {
    field: "password",
    message: "Identifiants incorrects",
  },
  password: { field: "password", message: "Erreur liée au mot de passe" },
  "rate limit": {
    message: "Trop de tentatives. Veuillez réessayer plus tard.",
  },
  "too many": { message: "Trop de tentatives. Veuillez réessayer plus tard." },
};

/**
 * Résultat du parsing d'erreur
 */
export type ParsedAuthError<TInput = SignUpInput | SignInInput> = {
  message: string;
  field?: keyof TInput;
  isRateLimit?: boolean;
};

/**
 * Parse une erreur d'authentification pour sign-up
 */
export function parseSignUpError(error: unknown): ParsedAuthError<SignUpInput> {
  const errorMessage = extractErrorMessage(error);
  const lower = errorMessage.toLowerCase();

  // Recherche du premier pattern qui match
  for (const [pattern, info] of Object.entries(SIGNUP_ERROR_PATTERNS)) {
    if (lower.includes(pattern)) {
      return {
        message: info.message,
        field: info.field as keyof SignUpInput | undefined,
        isRateLimit: pattern.includes("rate") || pattern.includes("too many"),
      };
    }
  }

  // Fallback: retourner le message d'origine
  return { message: errorMessage };
}

/**
 * Parse une erreur d'authentication pour sign-in
 */
export function parseSignInError(error: unknown): ParsedAuthError<SignInInput> {
  const errorMessage = extractErrorMessage(error);
  const lower = errorMessage.toLowerCase();

  // Recherche du premier pattern qui match
  for (const [pattern, info] of Object.entries(SIGNIN_ERROR_PATTERNS)) {
    if (lower.includes(pattern)) {
      return {
        message: info.message,
        field: info.field as keyof SignInInput | undefined,
        isRateLimit: pattern.includes("rate") || pattern.includes("too many"),
      };
    }
  }

  // Fallback: retourner le message d'origine
  return { message: errorMessage };
}
