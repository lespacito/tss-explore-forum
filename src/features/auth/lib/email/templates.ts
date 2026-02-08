// Templates d'emails pour l'authentification et autres notifications

import { env } from "@/data/env/server";

interface EmailTemplate {
	subject: string;
	html: string;
	text: string;
}

/**
 * Template pour l'email de bienvenue après inscription
 */
export const welcomeEmail = (name: string): EmailTemplate => ({
	subject: "Bienvenue sur notre forum !",
	html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue !</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${name} 👋</h2>
            <p>Nous sommes ravis de vous accueillir sur notre forum !</p>
            <p>Vous pouvez maintenant :</p>
            <ul>
              <li>Participer aux discussions</li>
              <li>Créer vos propres sujets</li>
              <li>Interagir avec la communauté</li>
            </ul>
            <p>
              <a href="${env.APP_URL || "http://localhost:3000"}" class="button">
                Commencer à explorer
              </a>
            </p>
            <p>À très bientôt !</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par TSS Explore Forum</p>
          </div>
        </div>
      </body>
    </html>
  `,
	text: `
Bienvenue ${name} !

Nous sommes ravis de vous accueillir sur notre forum !

Vous pouvez maintenant :
- Participer aux discussions
- Créer vos propres sujets
- Interagir avec la communauté

Visitez ${env.APP_URL || "http://localhost:3000"} pour commencer.

À très bientôt !

---
Cet email a été envoyé par TSS Explore Forum
  `,
});

/**
 * Template pour la vérification d'email
 */
export const verifyEmailTemplate = (
	name: string,
	verificationUrl: string,
): EmailTemplate => ({
	subject: "Vérifiez votre adresse email",
	html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          .warning { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vérification d'email</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${name},</h2>
            <p>Merci de vous être inscrit sur notre forum !</p>
            <p>Pour finaliser votre inscription, veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email :</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">
                Vérifier mon email
              </a>
            </p>
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
              <p>Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.</p>
            </div>
            <p style="color: #6b7280; font-size: 12px;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par TSS Explore Forum</p>
          </div>
        </div>
      </body>
    </html>
  `,
	text: `
Bonjour ${name},

Merci de vous être inscrit sur notre forum !

Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur ce lien :

${verificationUrl}

⚠️ Important : Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.

---
Cet email a été envoyé par TSS Explore Forum
  `,
});

/**
 * Template pour la réinitialisation de mot de passe
 */
export const resetPasswordEmail = (
	name: string,
	resetUrl: string,
): EmailTemplate => ({
	subject: "Réinitialisation de votre mot de passe",
	html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          .warning { background-color: #FEE2E2; padding: 15px; border-left: 4px solid #DC2626; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${name},</h2>
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.</p>
            <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <div class="warning">
              <p><strong>⚠️ Sécurité :</strong></p>
              <ul>
                <li>Ce lien expire dans 1 heure</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Votre mot de passe actuel reste inchangé tant que vous n'en créez pas un nouveau</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 12px;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par TSS Explore Forum</p>
          </div>
        </div>
      </body>
    </html>
  `,
	text: `
Bonjour ${name},

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.

Pour créer un nouveau mot de passe, cliquez sur ce lien :

${resetUrl}

⚠️ Sécurité :
- Ce lien expire dans 1 heure
- Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
- Votre mot de passe actuel reste inchangé tant que vous n'en créez pas un nouveau

---
Cet email a été envoyé par TSS Explore Forum
  `,
});

/**
 * Template pour la notification de changement de mot de passe
 */
export const passwordChangedEmail = (name: string): EmailTemplate => ({
	subject: "Votre mot de passe a été modifié",
	html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          .info { background-color: #DBEAFE; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Mot de passe modifié</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${name},</h2>
            <p>Votre mot de passe a été modifié avec succès.</p>
            <div class="info">
              <p><strong>ℹ️ Pour information :</strong></p>
              <p>Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement pour sécuriser votre compte.</p>
            </div>
            <p>Date de modification : ${new Date().toLocaleString("fr-FR")}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par TSS Explore Forum</p>
          </div>
        </div>
      </body>
    </html>
  `,
	text: `
Bonjour ${name},

Votre mot de passe a été modifié avec succès.

ℹ️ Pour information : Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement pour sécuriser votre compte.

Date de modification : ${new Date().toLocaleString("fr-FR")}

---
Cet email a été envoyé par TSS Explore Forum
  `,
});

/**
 * Template pour la confirmation de suppression de compte
 */
export const deleteAccountTemplate = (
	name: string,
	url: string,
): EmailTemplate => ({
	subject: "Confirmation de la suppression de votre compte",
	html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          .warning { background-color: #FEE2E2; padding: 15px; border-left: 4px solid #DC2626; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗑️ Suppression de compte</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${name},</h2>
            <p>Nous avons reçu une demande de suppression de votre compte. Cette action est <strong>définitive et irréversible</strong>.</p>
            <p>Pour confirmer la suppression de votre compte et de toutes vos données, cliquez sur le bouton ci-dessous :</p>
            <p style="text-align: center;">
              <a href="${url}" class="button">
                Supprimer mon compte définitivement
              </a>
            </p>
            <div class="warning">
              <p><strong>⚠️ Attention :</strong></p>
              <ul>
                <li>Toutes vos données (profil, messages, etc.) seront supprimées.</li>
                <li>Cette action ne peut pas être annulée.</li>
                <li>Ce lien de confirmation expire dans 24 heures.</li>
                <li>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 12px;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
              <a href="${url}">${url}</a>
            </p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par TSS Explore Forum</p>
          </div>
        </div>
      </body>
    </html>
  `,
	text: `
Bonjour ${name},

Nous avons reçu une demande de suppression de votre compte. Cette action est définitive et irréversible.

Pour confirmer la suppression de votre compte et de toutes vos données, cliquez sur ce lien :
${url}

⚠️ Attention :
- Toutes vos données (profil, messages, etc.) seront supprimées.
- Cette action ne peut pas être annulée.
- Ce lien de confirmation expire dans 24 heures.
- Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.

---
Cet email a été envoyé par TSS Explore Forum
  `,
});
