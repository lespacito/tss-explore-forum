import z from "zod";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export { resetPasswordSchema };
