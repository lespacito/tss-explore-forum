import { sendEmail } from "@/features/auth/lib/email/send";
import { verifyEmailTemplate } from "@/features/auth/lib/email/templates";
import { logger } from "@/lib/logger/server";

/**
 * Envoie un email de vérification à l'utilisateur
 */
export async function sendEmailVerificationEmail({
  user,
  url,
}: {
  user: { id: string; email: string; name: string };
  url: string;
}) {
  try {
    const template = verifyEmailTemplate(user.name, url);

    logger.info("Envoi de l'email de vérification", {
      userId: user.id,
      email: user.email,
    });

    const result = await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!result.success) {
      logger.error("Échec de l'envoi de l'email de vérification", {
        userId: user.id,
        email: user.email,
        error: result.error,
      });
      throw new Error(
        result.error || "Impossible d'envoyer l'email de vérification",
      );
    }

    logger.info("Email de vérification envoyé avec succès", {
      userId: user.id,
      email: user.email,
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    logger.error("Erreur lors de l'envoi de l'email de vérification", {
      userId: user.id,
      email: user.email,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
