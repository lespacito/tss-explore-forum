import { z } from "zod";

/**
 * Liste des pseudonymes interdits pour éviter les conflits
 * avec les rôles système et les termes sensibles
 */
export const FORBIDDEN_USERNAMES = [
  "admin",
  "administrator",
  "moderator",
  "system",
  "root",
  "support",
] as const;

/**
 * Schema de validation pour l'inscription avec email/pseudonyme
 *
 * Validation stricte selon story 1.4:
 * - username: 3-20 caractères, alphanumeric + underscore uniquement
 * - email: format RFC 5322, normalisé en lowercase
 * - password: min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
 * - confirmPassword: doit correspondre au password
 */
export const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Le pseudonyme doit contenir au moins 3 caractères" })
      .max(20, { message: "Le pseudonyme ne peut pas dépasser 20 caractères" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message:
          "Le pseudonyme ne peut contenir que des lettres, chiffres et underscores",
      })
      .refine((val) => !FORBIDDEN_USERNAMES.includes(val.toLowerCase() as any), {
        message: "Ce pseudonyme est réservé et ne peut pas être utilisé",
      }),

    email: z
      .string()
      .email({ message: "Veuillez entrer une adresse email valide" })
      .trim()
      .toLowerCase()
      .transform((val) => val.toLowerCase()),

    password: z
      .string()
      .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
      .regex(/[A-Z]/, {
        message: "Le mot de passe doit contenir au moins une majuscule",
      })
      .regex(/[a-z]/, {
        message: "Le mot de passe doit contenir au moins une minuscule",
      })
      .regex(/[0-9]/, {
        message: "Le mot de passe doit contenir au moins un chiffre",
      }),

    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    // Validation que les mots de passe correspondent
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
      });
    }
  });

/**
 * Type TypeScript inféré du schema de validation
 */
export type SignupFormData = z.infer<typeof signupSchema>;
