import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useId, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	passwordChangedEmail,
	resetPasswordEmail,
	sendEmail,
	verifyEmailConnection,
	verifyEmailTemplate,
	welcomeEmail,
} from "@/features/auth/lib/email";

const testEmailInputSchema = z.object({
	type: z.string(),
	email: z.email(),
	name: z.string(),
});

// Server function pour tester la connexion
const testConnectionFn = createServerFn({ method: "GET" }).handler(async () => {
	const isConnected = await verifyEmailConnection();
	return { success: isConnected };
});

// Server function pour envoyer un email de test
const sendTestEmailFn = createServerFn({ method: "POST" })
	.inputValidator(testEmailInputSchema.parse)
	.handler(async ({ data }) => {
		let template: { subject: string; html: string; text: string };

		switch (data.type) {
			case "welcome":
				template = welcomeEmail(data.name);
				break;
			case "verify":
				template = verifyEmailTemplate(
					data.name,
					"http://localhost:3000/verify?token=test123",
				);
				break;
			case "reset":
				template = resetPasswordEmail(
					data.name,
					"http://localhost:3000/reset-password?token=test123",
				);
				break;
			case "changed":
				template = passwordChangedEmail(data.name);
				break;
			default:
				return { success: false, error: "Type d'email invalide" };
		}

		const result = await sendEmail({
			to: data.email,
			subject: template.subject,
			html: template.html,
			text: template.text,
		});

		return result;
	});

export const Route = createFileRoute("/test-email")({
	component: TestEmailPage,
});

function TestEmailPage() {
	const nameId = useId();
	const emailId = useId();
	const [email, setEmail] = useState("test@example.com");
	const [name, setName] = useState("John Doe");
	const [status, setStatus] = useState<string>("");
	const [loading, setLoading] = useState<string>("");

	const handleTestConnection = async () => {
		setLoading("connection");
		setStatus("");
		try {
			const result = await testConnectionFn();
			setStatus(
				result.success
					? "✅ Connexion réussie au serveur SMTP (Mailpit)"
					: "❌ Impossible de se connecter au serveur SMTP",
			);
		} catch (error) {
			setStatus(
				`❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
			);
		} finally {
			setLoading("");
		}
	};

	const handleSendEmail = async (type: string) => {
		if (!email || !name) {
			setStatus("⚠️ Veuillez remplir tous les champs");
			return;
		}

		setLoading(type);
		setStatus("");
		try {
			const result = await sendTestEmailFn({ data: { type, email, name } });
			if (result.success) {
				setStatus(
					`✅ Email envoyé avec succès ! ID: ${result.messageId}\nConsultez Mailpit sur http://localhost:8025`,
				);
			} else {
				setStatus(`❌ Erreur: ${result.error}`);
			}
		} catch (error) {
			setStatus(
				`❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
			);
		} finally {
			setLoading("");
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-2">📧 Test d'envoi d'emails</h1>
				<p className="text-muted-foreground">
					Testez l'envoi d'emails via Mailpit. Les emails seront capturés et
					visibles sur{" "}
					<a
						href="http://localhost:8025"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline font-medium"
					>
						http://localhost:8025
					</a>
				</p>
			</div>

			<div className="grid gap-6">
				{/* Test de connexion */}
				<Card className="p-6">
					<h2 className="text-2xl font-semibold mb-4">
						🔌 Test de connexion SMTP
					</h2>
					<p className="text-muted-foreground mb-4">
						Vérifiez que la connexion au serveur Mailpit fonctionne correctement
					</p>
					<Button
						onClick={handleTestConnection}
						disabled={loading === "connection"}
						variant="outline"
					>
						{loading === "connection"
							? "Test en cours..."
							: "Tester la connexion"}
					</Button>
				</Card>

				{/* Configuration */}
				<Card className="p-6">
					<h2 className="text-2xl font-semibold mb-4">⚙️ Configuration</h2>
					<div className="space-y-4">
						<div>
							<label
								htmlFor={nameId}
								className="block text-sm font-medium mb-2"
							>
								Nom du destinataire
							</label>
							<input
								id={nameId}
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-3 py-2 border rounded-md"
								placeholder="John Doe"
							/>
						</div>
						<div>
							<label
								htmlFor={emailId}
								className="block text-sm font-medium mb-2"
							>
								Email du destinataire
							</label>
							<input
								id={emailId}
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-3 py-2 border rounded-md"
								placeholder="test@example.com"
							/>
						</div>
					</div>
				</Card>

				{/* Templates d'emails */}
				<Card className="p-6">
					<h2 className="text-2xl font-semibold mb-4">
						📬 Templates d'emails disponibles
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Button
							onClick={() => handleSendEmail("welcome")}
							disabled={!!loading}
							variant="default"
							className="h-auto py-4 flex flex-col items-start gap-2"
						>
							<span className="font-semibold">👋 Email de bienvenue</span>
							<span className="text-xs opacity-80">
								Envoyé après l'inscription
							</span>
						</Button>

						<Button
							onClick={() => handleSendEmail("verify")}
							disabled={!!loading}
							variant="default"
							className="h-auto py-4 flex flex-col items-start gap-2"
						>
							<span className="font-semibold">✉️ Vérification d'email</span>
							<span className="text-xs opacity-80">
								Lien de vérification d'email
							</span>
						</Button>

						<Button
							onClick={() => handleSendEmail("reset")}
							disabled={!!loading}
							variant="default"
							className="h-auto py-4 flex flex-col items-start gap-2"
						>
							<span className="font-semibold">
								🔐 Réinitialisation de mot de passe
							</span>
							<span className="text-xs opacity-80">
								Lien de réinitialisation
							</span>
						</Button>

						<Button
							onClick={() => handleSendEmail("changed")}
							disabled={!!loading}
							variant="default"
							className="h-auto py-4 flex flex-col items-start gap-2"
						>
							<span className="font-semibold">✅ Mot de passe modifié</span>
							<span className="text-xs opacity-80">
								Confirmation de changement
							</span>
						</Button>
					</div>
				</Card>

				{/* Statut */}
				{status && (
					<Card className="p-6">
						<h2 className="text-2xl font-semibold mb-4">📊 Statut</h2>
						<pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
							{status}
						</pre>
					</Card>
				)}

				{/* Informations */}
				<Card className="p-6 bg-muted">
					<h2 className="text-2xl font-semibold mb-4">ℹ️ Informations</h2>
					<ul className="space-y-2 text-sm">
						<li>
							<strong>Serveur SMTP:</strong> localhost:1025
						</li>
						<li>
							<strong>Interface Mailpit:</strong>{" "}
							<a
								href="http://localhost:8025"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								http://localhost:8025
							</a>
						</li>
						<li>
							<strong>Email d'expéditeur:</strong> noreply@forum.local
						</li>
						<li className="mt-4 text-muted-foreground">
							💡 Tous les emails sont capturés par Mailpit et ne sont jamais
							réellement envoyés. Parfait pour le développement !
						</li>
					</ul>
				</Card>
			</div>
		</div>
	);
}
