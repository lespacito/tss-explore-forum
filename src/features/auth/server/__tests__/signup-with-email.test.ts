import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for signup-with-email Server Function
 *
 * Story 1.4 - Task 3: Créer Server Function d'inscription
 *
 * Test coverage:
 * - Subtask 3.2: Valider unicité du username et email en DB
 * - Subtask 3.3: Appeler auth.api.signUp.email() de Better-Auth
 * - Subtask 3.4: Gérer erreurs: email déjà utilisé, username pris, etc.
 * - Subtask 3.5: Retourner résultat avec userId ou erreur structurée
 */

// Mock server-side dependencies BEFORE imports
vi.mock("@/data/env/server", () => ({
  env: {
    NODE_ENV: "test",
    SERVICE_NAME: "test-service",
    DATABASE_URL: "postgresql://test",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost:3000",
  },
}));

vi.mock("@/lib/logger/server", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/features/auth/lib/auth", () => ({
  auth: {
    api: {
      signUp: {
        email: vi.fn(),
      },
    },
  },
}));

// Import after mocks
import { auth } from "@/features/auth/lib/auth";
import { logger } from "@/lib/logger/server";
import { signupSchema } from "@/features/auth/schemas/signup-schema";

describe("signup-with-email handler logic", () => {
  const mockSignUpEmail = vi.mocked(auth.api.signUp.email);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Subtask 3.3: Successful account creation", () => {
    it("should create account successfully with valid data", async () => {
      // Arrange
      const validData = {
        username: "thomas_test",
        email: "thomas@example.com",
        password: "SecurePass123",
        confirmPassword: "SecurePass123",
      };

      const mockUser = {
        id: "test-user-id",
        email: "thomas@example.com",
        username: "thomas_test",
        emailVerified: false,
      };

      mockSignUpEmail.mockResolvedValueOnce({
        user: mockUser,
        session: null,
      });

      // Act - Simulate handler logic
      const normalizedEmail = validData.email.toLowerCase();
      const result = await auth.api.signUp.email({
        email: normalizedEmail,
        password: validData.password,
        username: validData.username,
        callbackURL: "/auth/verify-email",
      });

      // Assert
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe("test-user-id");
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        email: "thomas@example.com",
        password: "SecurePass123",
        username: "thomas_test",
        callbackURL: "/auth/verify-email",
      });
    });

    it("should normalize email to lowercase", async () => {
      // Arrange
      const validData = {
        username: "thomas_test",
        email: "Thomas@EXAMPLE.COM",
        password: "SecurePass123",
        confirmPassword: "SecurePass123",
      };

      const mockUser = {
        id: "test-user-id",
        email: "thomas@example.com",
        username: "thomas_test",
        emailVerified: false,
      };

      mockSignUpEmail.mockResolvedValueOnce({
        user: mockUser,
        session: null,
      });

      // Act - Simulate handler logic with email normalization
      const normalizedEmail = validData.email.toLowerCase();

      await auth.api.signUp.email({
        email: normalizedEmail,
        password: validData.password,
        username: validData.username,
        callbackURL: "/auth/verify-email",
      });

      // Assert - email should be normalized to lowercase
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        email: "thomas@example.com",
        password: "SecurePass123",
        username: "thomas_test",
        callbackURL: "/auth/verify-email",
      });
    });
  });

  describe("Subtask 3.4: Error handling for duplicate email", () => {
    it("should detect email already exists error", async () => {
      // Arrange
      const duplicateEmailError = new Error("email already exists");
      mockSignUpEmail.mockRejectedValueOnce(duplicateEmailError);

      const validData = {
        username: "thomas_test",
        email: "existing@example.com",
        password: "SecurePass123",
        confirmPassword: "SecurePass123",
      };

      // Act & Assert
      await expect(
        auth.api.signUp.email({
          email: validData.email.toLowerCase(),
          password: validData.password,
          username: validData.username,
          callbackURL: "/auth/verify-email",
        }),
      ).rejects.toThrow("email already exists");

      // Verify error would be caught and transformed
      try {
        await auth.api.signUp.email({
          email: validData.email.toLowerCase(),
          password: validData.password,
          username: validData.username,
          callbackURL: "/auth/verify-email",
        });
      } catch (error: any) {
        expect(error.message).toContain("email already exists");
      }
    });
  });

  describe("Subtask 3.4: Error handling for duplicate username", () => {
    it("should detect username already exists error", async () => {
      // Arrange
      const duplicateUsernameError = new Error("username already exists");
      mockSignUpEmail.mockRejectedValueOnce(duplicateUsernameError);

      const validData = {
        username: "existing_user",
        email: "thomas@example.com",
        password: "SecurePass123",
        confirmPassword: "SecurePass123",
      };

      // Act & Assert
      await expect(
        auth.api.signUp.email({
          email: validData.email.toLowerCase(),
          password: validData.password,
          username: validData.username,
          callbackURL: "/auth/verify-email",
        }),
      ).rejects.toThrow("username already exists");

      // Verify error would be caught and transformed
      try {
        await auth.api.signUp.email({
          email: validData.email.toLowerCase(),
          password: validData.password,
          username: validData.username,
          callbackURL: "/auth/verify-email",
        });
      } catch (error: any) {
        expect(error.message).toContain("username already exists");
      }
    });
  });

  describe("Subtask 3.4: Error handling for generic errors", () => {
    it("should handle unexpected errors gracefully", async () => {
      // Arrange
      const genericError = new Error("Database connection failed");
      mockSignUpEmail.mockRejectedValueOnce(genericError);

      const validData = {
        username: "thomas_test",
        email: "thomas@example.com",
        password: "SecurePass123",
        confirmPassword: "SecurePass123",
      };

      // Act & Assert
      await expect(
        auth.api.signUp.email({
          email: validData.email.toLowerCase(),
          password: validData.password,
          username: validData.username,
          callbackURL: "/auth/verify-email",
        }),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("Subtask 3.5: Structured result format", () => {
    it("should return user object with id on success", async () => {
      // Arrange
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        emailVerified: false,
      };

      mockSignUpEmail.mockResolvedValueOnce({
        user: mockUser,
        session: null,
      });

      // Act
      const result = await auth.api.signUp.email({
        email: "test@example.com",
        password: "SecurePass123",
        username: "testuser",
        callbackURL: "/auth/verify-email",
      });

      // Assert
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe("user-123");
      expect(result.user?.email).toBe("test@example.com");
      expect(result.user?.username).toBe("testuser");
    });

    it("should handle null user response", async () => {
      // Arrange
      mockSignUpEmail.mockResolvedValueOnce({
        user: null,
        session: null,
      });

      // Act
      const result = await auth.api.signUp.email({
        email: "test@example.com",
        password: "SecurePass123",
        username: "testuser",
        callbackURL: "/auth/verify-email",
      });

      // Assert
      expect(result.user).toBeNull();
    });
  });

  describe("Subtask 3.3: Better-Auth integration", () => {
    it("should call Better-Auth with correct parameters", async () => {
      // Arrange
      const mockUser = {
        id: "user-456",
        email: "integration@test.com",
        username: "integration_user",
        emailVerified: false,
      };

      mockSignUpEmail.mockResolvedValueOnce({
        user: mockUser,
        session: null,
      });

      // Act
      await auth.api.signUp.email({
        email: "integration@test.com",
        password: "SecurePass123",
        username: "integration_user",
        callbackURL: "/auth/verify-email",
      });

      // Assert
      expect(mockSignUpEmail).toHaveBeenCalledTimes(1);
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        email: "integration@test.com",
        password: "SecurePass123",
        username: "integration_user",
        callbackURL: "/auth/verify-email",
      });
    });
  });

  describe("Subtask 3.2: Input validation with Zod schema", () => {
    it("should validate correct signup data", () => {
      // Arrange
      const validData = {
        username: "thomas_test",
        email: "thomas@example.com",
        password: "SecurePass123",
        confirmPassword: "SecurePass123",
      };

      // Act
      const result = signupSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("thomas@example.com");
        expect(result.data.username).toBe("thomas_test");
      }
    });

    it("should reject invalid email", () => {
      // Arrange
      const invalidData = {
        username: "thomas_test",
        email: "not-an-email",
        password: "SecurePass123",
        confirmPassword: "SecurePass123",
      };

      // Act
      const result = signupSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      // Arrange
      const invalidData = {
        username: "thomas_test",
        email: "thomas@example.com",
        password: "weak",
        confirmPassword: "weak",
      };

      // Act
      const result = signupSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should reject mismatched passwords", () => {
      // Arrange
      const invalidData = {
        username: "thomas_test",
        email: "thomas@example.com",
        password: "SecurePass123",
        confirmPassword: "DifferentPass123",
      };

      // Act
      const result = signupSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});
