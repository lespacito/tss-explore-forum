import type { SendMailOptions } from "nodemailer";
import { getEmailTransporter, emailConfig } from "./transport";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
  attachments?: SendMailOptions["attachments"];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envoie un email via Mailpit (ou tout autre serveur SMTP configuré)
 */
export const sendEmail = async (
  options: SendEmailOptions,
): Promise<SendEmailResult> => {
  try {
    const transporter = getEmailTransporter();

    const mailOptions: SendMailOptions = {
      from: options.from || emailConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || emailConfig.replyTo,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email envoyé avec succès:", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite",
    };
  }
};

/**
 * Envoie un email à plusieurs destinataires
 */
export const sendBulkEmail = async (
  recipients: string[],
  emailContent: Omit<SendEmailOptions, "to">,
): Promise<SendEmailResult[]> => {
  const promises = recipients.map((recipient) =>
    sendEmail({
      ...emailContent,
      to: recipient,
    }),
  );

  return Promise.all(promises);
};

/**
 * Vérifie la connexion au serveur SMTP
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = getEmailTransporter();
    await transporter.verify();
    console.log("✅ Connexion au serveur SMTP établie");
    return true;
  } catch (error) {
    console.error("❌ Impossible de se connecter au serveur SMTP:", error);
    return false;
  }
};
