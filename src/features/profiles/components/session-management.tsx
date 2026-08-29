import { useRouter } from "@tanstack/react-router";
import type { Session } from "better-auth";
import { Monitor, Smartphone, Trash2 } from "lucide-react";
import { UAParser } from "ua-parser-js";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BetterAuthActionButton } from "@/features/auth/components/better-auth-action-button";
import { authClient } from "@/features/auth/lib/auth-client";

export const SessionManagement = ({
	sessions,
	currentSessionToken,
}: {
	sessions: Session[];
	currentSessionToken: string;
}) => {
	const otherSessions = sessions.filter((s) => s.token !== currentSessionToken);
	const currentSession = sessions.find((s) => s.token === currentSessionToken);

	const router = useRouter();

	function revokeOtherSessions() {
		return authClient.revokeOtherSessions(undefined, {
			onSuccess: () => {
				router.invalidate();
			},
		});
	}

	return (
		<div className="space-y-6">
			{currentSession && (
				<SessionCard session={currentSession} isCurrentSession />
			)}

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium">Autres sessions actives</h3>
					{otherSessions.length > 0 && (
						<BetterAuthActionButton
							variant="destructive"
							size="sm"
							action={revokeOtherSessions}
						>
							Se déconnecter des autres appareils
						</BetterAuthActionButton>
					)}
				</div>
				{otherSessions.length === 0 ? (
					<Card>
						<CardContent className="py-8 text-center text-muted-foreground">
							Pas d'autres sessions actives
						</CardContent>
					</Card>
				) : (
					<div className="space-y-3">
						{otherSessions.map((session) => (
							<SessionCard key={session.id} session={session} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

const SessionCard = ({
	session,
	isCurrentSession = false,
}: {
	session: Session;
	isCurrentSession?: boolean;
}) => {
	const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null;
	const router = useRouter();
	function getBrowserInformation(): string {
		if (userAgentInfo == null) return "Appareil inconnu";
		if (userAgentInfo.browser.name == null && userAgentInfo.os.name == null) {
			return "Appareil inconnu";
		}
		if (userAgentInfo.browser.name == null)
			return userAgentInfo.os.name ?? "Appareil inconnu";
		if (userAgentInfo.os.name == null) return userAgentInfo.browser.name;

		return `${userAgentInfo.browser.name}, ${userAgentInfo.os.name}`;
	}

	function revokeSession() {
		return authClient.revokeSession(
			{
				token: session.token,
			},
			{
				onSuccess: () => {
					router.invalidate();
				},
			},
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<CardTitle className="text-base">{getBrowserInformation()}</CardTitle>
				{isCurrentSession && <Badge>Session active</Badge>}
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 text-muted-foreground">
						{userAgentInfo?.device.type === "mobile" ? (
							<Smartphone className="h-5 w-5" />
						) : (
							<Monitor className="h-5 w-5" />
						)}
						<div>
							{session.ipAddress && (
								<span className="text-sm">{session.ipAddress}</span>
							)}
						</div>
					</div>
					{!isCurrentSession && (
						<BetterAuthActionButton
							variant="destructive"
							size="sm"
							action={() => revokeSession()}
							successMessage="Session révoquée"
						>
							<Trash2 className="h-4 w-4" />
						</BetterAuthActionButton>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
