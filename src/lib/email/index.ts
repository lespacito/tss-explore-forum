// Export principal du module email
export { sendEmail, sendBulkEmail, verifyEmailConnection } from "./send";
export type { SendEmailOptions, SendEmailResult } from "./send";

export {
  welcomeEmail,
  verifyEmailTemplate,
  resetPasswordEmail,
  passwordChangedEmail,
} from "./templates";

export { getEmailTransporter, emailConfig } from "./transport";
