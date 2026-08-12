import { BetterAuthActionButton } from "@/features/auth/components/better-auth-action-button";
import { signIn } from "@/features/auth/lib/auth-client";
import {
	SUPPORTED_OAUTH_PROVIDER_DETAILS,
	SUPPORTED_OAUTH_PROVIDERS,
} from "@/features/auth/lib/o-auth-providers";
import { logger } from "@/lib/logger";

export function SocialAuthButtons({ redirectTo }: { redirectTo?: string } = {}) {
	const handleOAuthSignIn = async (
		provider: (typeof SUPPORTED_OAUTH_PROVIDERS)[number],
	) => {
		logger.info(`Starting ${provider} OAuth`, { provider });
		const result = await signIn.social({
			provider,
			callbackURL: redirectTo || "/",
		});

		if (result.error) {
			logger.error(`${provider} OAuth init failed`, {
				provider,
				error: result.error,
			});
		}

		return result;
	};

	return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
		const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon;

		return (
			<BetterAuthActionButton
				key={provider}
				variant={"outline"}
				className="w-full"
				action={() => handleOAuthSignIn(provider)}
			>
				<Icon />
				{SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
			</BetterAuthActionButton>
		);
	});
}
