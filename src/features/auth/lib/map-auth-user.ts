import type { User as BetterUser } from "better-auth";
import type { InferSelectModel } from "drizzle-orm";
import { type UserRole, type user, userRoles } from "@/db/schema";

export type User = InferSelectModel<typeof user>;

// Étendre le type BetterUser avec les propriétés personnalisées du plugin username
interface BetterAuthUser extends BetterUser {
	username?: string | null;
	displayUsername?: string | null;
	role?: string | null;
	isAnonymous?: boolean;
	bio?: string | null;
	banned?: boolean;
	secretCode?: string | null;
	secretCodeGeneratedAt?: Date | null;
}

interface AuthDataWithUser {
	user?: unknown;
}

function normalizeRole(role?: string | null): UserRole {
	return userRoles.includes(role as UserRole) ? (role as UserRole) : "USER";
}

function inferAnonymousUser(authUser: BetterAuthUser): boolean {
	const email = authUser.email.toLowerCase();
	const hasTemporaryEmail = email.endsWith(".local");
	const hasAnonymousUsername = /^(anon|anonymous)_/i.test(
		authUser.username ?? "",
	);

	return (
		(hasTemporaryEmail && !authUser.emailVerified) ||
		(hasAnonymousUsername && (hasTemporaryEmail || !authUser.emailVerified))
	);
}

export function mapAuthDataToUser(
	authData: AuthDataWithUser | null | undefined,
): User | null {
	if (!authData?.user) {
		return null;
	}

	const authUser = authData.user as BetterAuthUser;

	return {
		id: authUser.id,
		email: authUser.email,
		name: authUser.name,
		image: authUser.image ?? null,
		emailVerified: authUser.emailVerified,
		createdAt: authUser.createdAt,
		updatedAt: authUser.updatedAt,
		username: authUser.username ?? null,
		displayUsername: authUser.displayUsername ?? null,
		role: normalizeRole(authUser.role),
		isAnonymous:
			typeof authUser.isAnonymous === "boolean"
				? authUser.isAnonymous
				: inferAnonymousUser(authUser),
		bio: authUser.bio ?? null,
		banned: authUser.banned ?? false,
		secretCode: authUser.secretCode ?? null,
		secretCodeGeneratedAt: authUser.secretCodeGeneratedAt ?? null,
	};
}
