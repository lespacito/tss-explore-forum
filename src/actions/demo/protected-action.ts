import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/lib/auth-middleware";
import { loggingMiddleware } from "@/lib/logger/server";

export const protectedAction = createServerFn({ method: "POST" })
  .middleware([loggingMiddleware, authMiddleware])
  .handler(async ({ context }) => {
    if (!context.isAuthenticated || !context.user) {
      context.logger.warn("Unauthorized access attempt");
      throw new Error("Unauthorized");
    }

    context.logger.info("Protected action executed", {
      userId: context.user.id,
      username: context.user.username,
    });

    return {
      message: `Hello ${context.user.name}, you are authenticated!`,
      email: context.user.email,
    };
  });
