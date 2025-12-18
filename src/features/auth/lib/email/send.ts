import type { SendMailOptions } from "nodemailer";
import { logger } from "@/lib/logger/server";
import { emailConfig, getEmailTransporter } from "./transport";

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

    logger.info("Email sent successfully", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error("Failed to send email", {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

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
    logger.info("SMTP connection established");
    return true;
  } catch (error) {
    logger.error("Failed to connect to SMTP server", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
};
