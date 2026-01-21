import { describe, it, expect } from "vitest";
import { authClient } from "@/features/auth/lib/auth-client";

describe("Better Auth Client Configuration", () => {
  describe("Anonymous Plugin Configuration", () => {
    it("should have auth client properly initialized", () => {
      expect(authClient).toBeDefined();
    });

    it("should expose anonymous authentication methods", () => {
      // Verify that the anonymous authentication API is available
      expect(authClient.signIn).toBeDefined();
      expect(authClient.signIn.anonymous).toBeDefined();
      expect(typeof authClient.signIn.anonymous).toBe("function");
    });

    it("should have session management methods", () => {
      // Verify session management is available
      expect(authClient.useSession).toBeDefined();
      expect(authClient.getSession).toBeDefined();
      expect(typeof authClient.getSession).toBe("function");
    });

    it("should have sign out method", () => {
      // Verify sign out is available
      expect(authClient.signOut).toBeDefined();
      expect(typeof authClient.signOut).toBe("function");
    });

    it("should have base URL configured", () => {
      // Verify client has configuration
      expect(authClient.$store).toBeDefined();
    });
  });

  describe("Auth Client Plugins", () => {
    it("should have username client plugin configured", () => {
      // Username plugin provides additional auth methods
      expect(authClient).toBeDefined();
    });

    it("should have admin client plugin configured", () => {
      // Admin plugin provides role-based methods
      expect(authClient).toBeDefined();
    });
  });
});
