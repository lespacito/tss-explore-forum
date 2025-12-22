import type { InferSelectModel } from "drizzle-orm";
import type { user } from "@/db/schema";

export type User = InferSelectModel<typeof user>;

export function mapAuthDataToUser(
  authData: { user?: any } | null | undefined,
): User | null {
  return authData?.user
    ? ({
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.name,
        image: authData.user.image,
        emailVerified: authData.user.emailVerified,
        createdAt: authData.user.createdAt,
        updatedAt: authData.user.updatedAt,
        username: authData.user.username,
        displayUsername: authData.user.displayUsername,
      } as User)
    : null;
}
