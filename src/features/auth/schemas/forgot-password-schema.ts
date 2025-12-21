import z from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("Veuillez fournir une adresse email valide."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export { forgotPasswordSchema };
