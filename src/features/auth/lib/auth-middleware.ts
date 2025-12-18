import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { Session } from "better-auth";
import type { InferSelectModel } from "drizzle-orm";
import type { user } from "@/db/schema";
import {
  enrichLogContextWithUser,
  getContextLogger,
} from "@/lib/logger/server";
import { auth } from "./auth";

export type User = InferSelectModel<typeof user>;

export type AuthContext = {
  user: User | null;
  isAuthenticated: boolean;
  session: Session | null;
};

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const logger = getContextLogger();
  const request = getRequest();

  try {
    const authData = await auth.api.getSession({
      headers: request.headers,
    });

    const session = authData?.session || null;
    const user = authData?.user
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

    // Enrichir le contexte de log avec les infos utilisateur
    if (user) {
      enrichLogContextWithUser(
        user.id,
        user.username || user.name || undefined,
      );
      logger.debug("User authenticated", {
        userId: user.id,
        username: user.username,
        email: user.email,
      });
    } else {
      logger.debug("Anonymous request");
    }

    return await next({
      context: {
        user,
        isAuthenticated: !!session,
        session,
      } as AuthContext,
    });
  } catch (error) {
    logger.error("Auth middleware error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
});
