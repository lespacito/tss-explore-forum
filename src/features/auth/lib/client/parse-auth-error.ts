import type { SignUpInput } from "@/features/auth/schemas/sign-up-schema";
import type { SignInInput } from "@/features/auth/schemas/sign-in-schema";
import type { ProfileUpdateFormSchema } from "@/features/profiles/schemas/profile-update-form-schema";
import type { ChangePasswordFormSchema } from "@/features/profiles/schemas/change-password-schema";

/**
 * Extrait le message d'erreur d'un objet d'erreur Better Auth complexe
 */
function extractErrorMessage(error: unknown): string {
  // Cas 1: Error standard avec message string
  if (error instanceof Error && typeof error.message === "string") {
    const msg = error.message.trim();
    if (msg) return msg;
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
    const msg = (error.error.message as string).trim();
    if (msg) return msg;
  }

  // Cas 3: Objet avec propriété message directe
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const msg = (error.message as string).trim();
    if (msg) return msg;
  }

  // Cas 4: Objet Better Auth avec error string
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string"
  ) {
    const msg = error.error.trim();
    if (msg) return msg;
  }

  // Cas 5: String directe
  if (typeof error === "string") {
    const msg = error.trim();
    if (msg) return msg;
  }

  // Fallback: stringify l'objet pour debug
  try {
    const stringified = JSON.stringify(error);
    const msg = stringified.trim();
    if (msg && msg !== "{}" && msg !== "{}") return msg;
  } catch {
    // Ignoré
  }

  // Ultime fallback
  return "Une erreur inattendue est survenue";
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
 * Patterns d'erreurs pour le profile update
 */
const PROFILE_UPDATE_ERROR_PATTERNS: Record<
  string,
  { field?: keyof ProfileUpdateFormSchema; message: string }
> = {
  "invalid email": { field: "email", message: "Adresse email invalide" },
  "email already": { field: "email", message: "Cet email est déjà utilisé" },
  disposable: {
    field: "email",
    message: "Les emails jetables ne sont pas autorisés",
  },
  "no mx": { field: "email", message: "Domaine email invalide" },
  email: { field: "email", message: "Erreur liée à l'email" },
  "display username already": {
    field: "displayUsername",
    message: "Ce nom d'affichage est déjà pris",
  },
  "displayusername already": {
    field: "displayUsername",
    message: "Ce nom d'affichage est déjà pris",
  },
  "display username": {
    field: "displayUsername",
    message: "Nom d'affichage invalide",
  },
  displayusername: {
    field: "displayUsername",
    message: "Nom d'affichage invalide",
  },
  name: { field: "name", message: "Le nom est invalide" },
  "rate limit": {
    message: "Trop de tentatives. Veuillez réessayer plus tard.",
  },
  "too many": { message: "Trop de tentatives. Veuillez réessayer plus tard." },
};

/**
 * Patterns d'erreurs pour le changement de mot de passe
 */
const CHANGE_PASSWORD_ERROR_PATTERNS: Record<
  string,
  { field?: keyof ChangePasswordFormSchema; message: string }
> = {
  "incorrect password": {
    field: "currentPassword",
    message: "Mot de passe incorrect",
  },
  "current password": {
      field: "currentPassword",
      message: "Mot de passe actuel incorrect"
  },
  "invalid password": {
    field: "newPassword",
    message: "Le nouveau mot de passe est invalide",
  },
  password: { field: "newPassword", message: "Erreur liée au mot de passe" },
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
 * Parse une erreur d'authentication pour profile update
 */
export function parseProfileUpdateError(
  error: unknown,
): ParsedAuthError<ProfileUpdateFormSchema> {
  const errorMessage = extractErrorMessage(error);
  const lower = errorMessage.toLowerCase();

  // Recherche du premier pattern qui match
  for (const [pattern, info] of Object.entries(PROFILE_UPDATE_ERROR_PATTERNS)) {
    if (lower.includes(pattern)) {
      return {
        message: info.message,
        field: info.field as keyof ProfileUpdateFormSchema | undefined,
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

/**
 * Parse une erreur d'authentication pour le changement de mot de passe
 */
export function parseChangePasswordError(
  error: unknown,
): ParsedAuthError<ChangePasswordFormSchema> {
  const errorMessage = extractErrorMessage(error);
  const lower = errorMessage.toLowerCase();

  // Recherche du premier pattern qui match
  for (const [pattern, info] of Object.entries(CHANGE_PASSWORD_ERROR_PATTERNS)) {
    if (lower.includes(pattern)) {
      return {
        message: info.message,
        field: info.field as keyof ChangePasswordFormSchema | undefined,
        isRateLimit: pattern.includes("rate") || pattern.includes("too many"),
      };
    }
  }

  // Fallback: retourner le message d'origine
  return { message: errorMessage };
}
