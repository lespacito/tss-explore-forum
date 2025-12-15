import { env } from "@/data/env/server";
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

// Configuration du transport SMTP pour Mailpit
const createTransporter = (): Transporter => {
  const config = {
    host: env.SMTP_HOST || "localhost",
    port: Number(env.SMTP_PORT) || 1025,
    secure: false, // Mailpit n'utilise pas SSL/TLS
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
          }
        : undefined,
    // Options pour le développement avec Mailpit
    tls: {
      rejectUnauthorized: false,
    },
  };

  return nodemailer.createTransport(config);
};

// Instance singleton du transporter
let transporter: Transporter | null = null;

export const getEmailTransporter = (): Transporter => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Configuration par défaut pour l'envoi
export const emailConfig = {
  from: env.SMTP_FROM || "noreply@forum.local",
  replyTo: env.SMTP_REPLY_TO,
};
