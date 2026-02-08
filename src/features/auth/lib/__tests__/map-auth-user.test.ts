import { describe, expect, it } from "vitest";
import { mapAuthDataToUser } from "../map-auth-user";

describe("mapAuthDataToUser - Anonymous User Detection", () => {
	describe("Explicit isAnonymous flag", () => {
		it("should detect anonymous user when isAnonymous is true", () => {
			const authData = {
				user: {
					id: "anon-123",
					email: "random@anonymous.local",
					name: "Anonymous",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					isAnonymous: true,
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});

		it("should not detect anonymous user when isAnonymous is false", () => {
			const authData = {
				user: {
					id: "user-456",
					email: "john@example.com",
					name: "John Doe",
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
					isAnonymous: false,
					username: "johndoe",
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(false);
		});
	});

	describe("Temp email pattern detection", () => {
		it("should detect anonymous user with @anonymous.local email", () => {
			const authData = {
				user: {
					id: "anon-789",
					email: "xyz123@anonymous.local",
					name: "Anonymous",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});

		it("should detect anonymous user with @temp.local email", () => {
			const authData = {
				user: {
					id: "temp-456",
					email: "user123@temp.local",
					name: "Temp User",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});

		it("should detect anonymous user with @anon.local email", () => {
			const authData = {
				user: {
					id: "anon-999",
					email: "random@anon.local",
					name: "Anon",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});

		it("should detect anonymous user with .local domain", () => {
			const authData = {
				user: {
					id: "local-123",
					email: "test@something.local",
					name: "Local User",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});
	});

	describe("Username pattern detection", () => {
		it("should detect anonymous user with anon_ username prefix", () => {
			const authData = {
				user: {
					id: "user-abc",
					email: "test@anonymous.local",
					name: "Anonymous",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "anon_xyz123",
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});

		it("should detect anonymous user with anonymous_ username prefix", () => {
			const authData = {
				user: {
					id: "user-def",
					email: "user@temp.local",
					name: "Anonymous",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "anonymous_abc789",
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});
	});

	describe("Combined signals", () => {
		it("should detect anonymous user with temp email + unverified email", () => {
			const authData = {
				user: {
					id: "combined-1",
					email: "random@anonymous.local",
					name: "User",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "someuser",
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});

		it("should NOT detect as anonymous if email is verified despite temp domain", () => {
			const authData = {
				user: {
					id: "verified-1",
					email: "user@anonymous.local",
					name: "Verified User",
					emailVerified: true, // Email verified
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "verifieduser",
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			// Should still be anonymous due to temp email pattern
			// This is a edge case - temp email but verified is unusual
			expect(user?.isAnonymous).toBe(false);
		});

		it("should detect anonymous with temp email + anon username", () => {
			const authData = {
				user: {
					id: "strong-signal",
					email: "xyz@temp.local",
					name: "Anonymous",
					emailVerified: true, // Even if verified
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "anon_12345",
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});
	});

	describe("Registered users (should NOT be detected as anonymous)", () => {
		it("should NOT detect normal user as anonymous", () => {
			const authData = {
				user: {
					id: "user-123",
					email: "john.doe@gmail.com",
					name: "John Doe",
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "johndoe",
					displayUsername: "John Doe",
					role: "USER" as const,
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(false);
		});

		it("should NOT detect user with .local email if verified and normal username", () => {
			const authData = {
				user: {
					id: "edge-case",
					email: "developer@company.local",
					name: "Dev User",
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "devuser",
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(false);
		});

		it("should NOT detect user with legitimate anon username but real email", () => {
			const authData = {
				user: {
					id: "legit-anon",
					email: "real.person@example.com",
					name: "Anon Person",
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "anon_person", // Chosen username, not auto-generated
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			// This is ambiguous but since email is real and verified, treat as registered
			expect(user?.isAnonymous).toBe(false);
		});
	});

	describe("Edge cases", () => {
		it("should return null for null authData", () => {
			const user = mapAuthDataToUser(null);
			expect(user).toBeNull();
		});

		it("should return null for undefined authData", () => {
			const user = mapAuthDataToUser(undefined);
			expect(user).toBeNull();
		});

		it("should return null for authData without user", () => {
			const user = mapAuthDataToUser({});
			expect(user).toBeNull();
		});

		it("should handle case-insensitive email patterns", () => {
			const authData = {
				user: {
					id: "case-test",
					email: "TEST@ANONYMOUS.LOCAL",
					name: "Test",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});

		it("should handle case-insensitive username patterns", () => {
			const authData = {
				user: {
					id: "username-case",
					email: "test@temp.local",
					name: "Test",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "ANON_TESTUSER",
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.isAnonymous).toBe(true);
		});
	});

	describe("Field mapping", () => {
		it("should correctly map all user fields", () => {
			const now = new Date();
			const authData = {
				user: {
					id: "map-test",
					email: "test@example.com",
					name: "Test User",
					image: "https://example.com/avatar.jpg",
					emailVerified: true,
					createdAt: now,
					updatedAt: now,
					username: "testuser",
					displayUsername: "Test User",
					role: "MODERATOR" as const,
					isAnonymous: false,
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.id).toBe("map-test");
			expect(user?.email).toBe("test@example.com");
			expect(user?.name).toBe("Test User");
			expect(user?.image).toBe("https://example.com/avatar.jpg");
			expect(user?.emailVerified).toBe(true);
			expect(user?.createdAt).toBe(now);
			expect(user?.updatedAt).toBe(now);
			expect(user?.username).toBe("testuser");
			expect(user?.displayUsername).toBe("Test User");
			expect(user?.role).toBe("MODERATOR");
			expect(user?.isAnonymous).toBe(false);
			expect(user?.bio).toBeNull();
			expect(user?.banned).toBe(false);
			expect(user?.secretCode).toBeNull();
			expect(user?.secretCodeGeneratedAt).toBeNull();
		});

		it("should handle missing optional fields", () => {
			const authData = {
				user: {
					id: "minimal",
					email: "min@example.com",
					name: "Minimal",
					emailVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			const user = mapAuthDataToUser(authData);

			expect(user).not.toBeNull();
			expect(user?.username).toBeNull();
			expect(user?.displayUsername).toBeNull();
			expect(user?.image).toBeNull();
			expect(user?.role).toBe("USER"); // Default role
			expect(user?.isAnonymous).toBe(false);
		});
	});
});
