import { auth } from "@/features/auth/lib/auth";
import { logger } from "@/lib/logger/server";
import { createServerFn } from "@tanstack/react-start";

export const createAnonymousSessionFn = createServerFn({
  method: "POST",
}).handler(async ({ request }) => {
  try {
    const session = await auth.api.signInAnonymous({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      throw new Error("Failed to create anonymous session");
    }

    logger.info("Anonymous session created", {
      userId: session.user.id,
    });

    return { success: true, userId: session.user.id };
  } catch (error) {
    // Log detailed error server-side only
    logger.error("Anonymous session creation failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return generic client-safe message (never expose internal details)
    return {
      success: false,
      error: "Impossible de créer une session. Veuillez réessayer.",
    };
  }
});
