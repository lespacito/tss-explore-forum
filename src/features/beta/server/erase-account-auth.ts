const OAUTH_PROVIDERS = new Set(["github", "google"]);
export const OAUTH_ERASURE_REAUTH_WINDOW_MS = 10 * 60 * 1000;

export function hasSupportedOAuthAccount(providerIds: string[]) {
	return providerIds.some((providerId) => OAUTH_PROVIDERS.has(providerId));
}

export function isRecentAuthentication(
	createdAt: Date | string,
	now = Date.now(),
) {
	const authenticatedAt = new Date(createdAt).getTime();
	const age = now - authenticatedAt;
	return (
		Number.isFinite(authenticatedAt) &&
		age >= 0 &&
		age <= OAUTH_ERASURE_REAUTH_WINDOW_MS
	);
}
