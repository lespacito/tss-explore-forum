import { Resend } from "resend";
import { env } from "@/data/env/server";

// Instance singleton de Resend
let resendClient: Resend | null = null;

export const getResendClient = (): Resend => {
	if (!resendClient) {
		resendClient = new Resend(env.RESEND_API_KEY);
	}
	return resendClient;
};

// Configuration par défaut pour l'envoi
export const emailConfig = {
	from: env.EMAIL_FROM,
	replyTo: env.EMAIL_REPLY_TO,
};
