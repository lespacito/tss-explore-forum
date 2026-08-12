import type { User as BetterUser } from "better-auth";
import type { InferSelectModel } from "drizzle-orm";
import { user, userRoles, type UserRole } from "@/db/schema";

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
	user?: BetterAuthUser;
}

function normalizeRole(role?: string | null): UserRole {
	return userRoles.includes(role as UserRole) ? (role as UserRole) : "USER";
}

export function mapAuthDataToUser(
	authData: AuthDataWithUser | null | undefined,
): User | null {
	if (!authData?.user) {
		return null;
	}

	const authUser = authData.user;

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
		isAnonymous: authUser.isAnonymous ?? false,
		bio: authUser.bio ?? null,
		banned: authUser.banned ?? false,
		secretCode: authUser.secretCode ?? null,
		secretCodeGeneratedAt: authUser.secretCodeGeneratedAt ?? null,
	};
}
