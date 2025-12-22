import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { Session } from "better-auth";
import { auth } from "@/features/auth/lib/auth";
import {
  mapAuthDataToUser,
  type User,
} from "@/features/auth/lib/map-auth-user";
import { getContextLogger } from "@/lib/logger/middleware";

export type AuthContext = {
  user: User | null;
  isAuthenticated: boolean;
  session: Session | null;
};

export const getAuthSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthContext> => {
    const request = getRequest();
    const logger = getContextLogger();

    try {
      const authData = await auth.api.getSession({
        headers: request.headers,
      });

      const session = authData?.session || null;
      const user = mapAuthDataToUser(authData);

      return {
        user,
        isAuthenticated: !!session,
        session,
      };
    } catch (error) {
      logger.error("Error getting auth session", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        user: null,
        isAuthenticated: false,
        session: null,
      };
    }
  },
);
