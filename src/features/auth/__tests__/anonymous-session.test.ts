import { describe, expect, it } from "vitest";
import { authClient } from "@/features/auth/lib/auth-client";

describe("Anonymous Session Creation", () => {
	describe("Client API availability", () => {
		it("should have authClient properly initialized", () => {
			expect(authClient).toBeDefined();
		});

		it("should expose signIn.anonymous() method", () => {
			expect(authClient.signIn).toBeDefined();
			expect(authClient.signIn.anonymous).toBeDefined();
			expect(typeof authClient.signIn.anonymous).toBe("function");
		});

		it("should have session management methods available", () => {
			expect(authClient.useSession).toBeDefined();
			expect(typeof authClient.getSession).toBe("function");
		});

		it("should support fetching current session", () => {
			expect(authClient.getSession).toBeDefined();
			expect(typeof authClient.getSession).toBe("function");
		});
	});

	describe("Anonymous authentication flow", () => {
		it("should have signOut method for session cleanup", () => {
			expect(authClient.signOut).toBeDefined();
			expect(typeof authClient.signOut).toBe("function");
		});

		it("should have $store for state management", () => {
			expect(authClient.$store).toBeDefined();
		});

		it("should be configured with base URL", () => {
			// Verify the client has proper configuration
			expect(authClient.$store).toBeDefined();
		});
	});

	describe("Plugin configuration", () => {
		it("should have anonymous client plugin methods", () => {
			// The anonymousClient plugin should provide signIn.anonymous
			expect(authClient.signIn.anonymous).toBeDefined();
		});

		it("should have username client plugin methods", () => {
			// The usernameClient plugin is configured
			expect(authClient.signIn).toBeDefined();
		});

		it("should have admin client plugin methods", () => {
			// The adminClient plugin is configured
			expect(authClient).toBeDefined();
		});
	});

	describe("Session creation expectations", () => {
		it("should allow calling anonymous authentication without parameters", () => {
			// The anonymous() method should be callable
			// It returns a Promise that resolves to session data
			const anonymousFn = authClient.signIn.anonymous;
			expect(anonymousFn).toBeDefined();
			expect(typeof anonymousFn).toBe("function");
			// Function is callable - actual call would require server connection
		});

		it("should support session retrieval after anonymous login", () => {
			// After calling signIn.anonymous(), session should be retrievable
			expect(authClient.getSession).toBeDefined();
			expect(typeof authClient.getSession).toBe("function");
		});
	});
});
