import { createServerFn } from "@tanstack/react-start";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { z } from "zod";

const sendWelcomeEmailSchema = z.object({
  email: z.email(),
  name: z.string(),
});

/**
 * Action serveur pour envoyer un email de bienvenue après inscription
 */
export const sendWelcomeEmailFn = createServerFn({ method: "POST" })
  .inputValidator(sendWelcomeEmailSchema.parse)
  .handler(async ({ data }) => {
    try {
      const template = welcomeEmail(data.name);

      const result = await sendEmail({
        to: data.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (!result.success) {
        console.error(
          "Échec de l'envoi de l'email de bienvenue:",
          result.error,
        );
        return {
          success: false,
          error: result.error || "Impossible d'envoyer l'email",
        };
      }

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  });
