// Export principal du module email

export type { SendEmailOptions, SendEmailResult } from "./send";
export { sendBulkEmail, sendEmail, verifyEmailConnection } from "./send";

export {
	passwordChangedEmail,
	resetPasswordEmail,
	verifyEmailTemplate,
	welcomeEmail,
} from "./templates";

export { emailConfig, getEmailTransporter } from "./transport";
