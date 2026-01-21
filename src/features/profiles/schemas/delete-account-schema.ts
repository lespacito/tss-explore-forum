import { z } from "zod";

/**
 * Retention options for user publications when account is deleted
 * - delete_all: Hard delete all threads and replies
 * - anonymize: Keep publications but change author to "utilisateur-supprimé"
 */
export const retentionOptionSchema = z.enum(["delete_all", "anonymize"], {
  errorMap: () => ({
    message: "Veuillez choisir une option valide pour vos publications",
  }),
});

/**
 * Confirmation checkbox validation
 * User must explicitly confirm they understand the action is irreversible
 */
export const confirmationCheckboxSchema = z.boolean().refine((val) => val === true, {
  message: "Vous devez confirmer que vous comprenez cette action",
});

/**
 * Password validation for account deletion
 * Required for security - user must enter their current password
 */
export const passwordSchema = z
  .string({
    required_error: "Le mot de passe est requis",
  })
  .trim()
  .min(1, "Le mot de passe est requis");

/**
 * Complete schema for account deletion with options
 */
export const deleteAccountSchema = z.object({
  retentionOption: retentionOptionSchema,
  confirmationChecked: confirmationCheckboxSchema,
  password: passwordSchema,
});

/**
 * TypeScript type inferred from schema
 */
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

/**
 * Type for retention options only
 */
export type RetentionOption = z.infer<typeof retentionOptionSchema>;
