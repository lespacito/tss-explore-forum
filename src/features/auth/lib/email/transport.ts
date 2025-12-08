import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

// Configuration du transport SMTP pour Mailpit
const createTransporter = (): Transporter => {
	const config = {
		host: process.env.SMTP_HOST || "localhost",
		port: Number(process.env.SMTP_PORT) || 1025,
		secure: false, // Mailpit n'utilise pas SSL/TLS
		auth:
			process.env.SMTP_USER && process.env.SMTP_PASSWORD
				? {
						user: process.env.SMTP_USER,
						pass: process.env.SMTP_PASSWORD,
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
	from: process.env.SMTP_FROM || "noreply@forum.local",
	replyTo: process.env.SMTP_REPLY_TO,
};
