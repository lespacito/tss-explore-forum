import { createServerFn } from "@tanstack/react-start";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import { getAuthSession } from "@/features/auth/server/get-auth-session";

export const getCurrentPrimaryAliasFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getAuthSession();
	if (!session?.user) return null;

	const primaryAlias = await getPrimaryAlias(session.user.id);
	return primaryAlias?.alias ?? null;
});
