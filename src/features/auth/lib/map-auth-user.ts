import type { InferSelectModel } from "drizzle-orm";
import type { user } from "@/db/schema";
import type { User as BetterUser } from "better-auth";

export type User = InferSelectModel<typeof user>;

// Étendre le type BetterUser avec les propriétés personnalisées du plugin username
interface BetterAuthUser extends BetterUser {
  username?: string | null;
  displayUsername?: string | null;
  role?: "ADMIN" | "MODERATOR" | "USER" | "BANNED";
}

interface AuthDataWithUser {
  user?: BetterAuthUser;
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
    role: authUser.role ?? "USER",
  };
}
