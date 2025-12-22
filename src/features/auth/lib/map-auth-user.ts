import type { InferSelectModel } from "drizzle-orm";
import type { user } from "@/db/schema";

export type User = InferSelectModel<typeof user>;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  username?: string | null;
  displayUsername?: string | null;
}

export function mapAuthDataToUser(
  authData: { user?: AuthUser } | null | undefined,
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
    role: "USER", // Default role, as it's required in the User type but not in AuthUser
  };
}
