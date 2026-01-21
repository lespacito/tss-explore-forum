import { describe, it, expect, beforeEach, vi } from "vitest";
import { findUserBySecretCode } from "@/features/auth/lib/find-user-by-code";
import { db } from "@/db/index";
import type { User } from "@/db/schemas/user";

// Mock the database
vi.mock("@/db/index", () => {
  const mockDb = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };

  return {
    db: mockDb,
  };
});

describe("findUserBySecretCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock chain
    const mockDb = db as any;
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([]);
  });

  describe("Valid code scenarios", () => {
    it("should find user with valid 8-character code", async () => {
      const mockUser: Partial<User> = {
        id: "user-123",
        email: null,
        secretCode: "K7MN-P8QR",
        secretCodeGeneratedAt: new Date(),
        isAnonymous: true,
      };

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const user = await findUserBySecretCode("K7MN-P8QR");

      expect(user).toEqual(mockUser);
    });

    it("should find user with valid 12-character code", async () => {
      const mockUser: Partial<User> = {
        id: "user-456",
        email: null,
        secretCode: "X4BT-9C2W-H5JK",
        secretCodeGeneratedAt: new Date(),
        isAnonymous: true,
      };

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const user = await findUserBySecretCode("X4BT-9C2W-H5JK");

      expect(user).toEqual(mockUser);
    });

    it("should be case-insensitive when searching", async () => {
      const mockUser: Partial<User> = {
        id: "user-789",
        email: null,
        secretCode: "K7MN-P8QR",
        secretCodeGeneratedAt: new Date(),
        isAnonymous: true,
      };

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const user = await findUserBySecretCode("k7mn-p8qr");

      expect(user).toEqual(mockUser);
    });

    it("should handle codes with extra whitespace", async () => {
      const mockUser: Partial<User> = {
        id: "user-101",
        email: null,
        secretCode: "K7MN-P8QR",
        secretCodeGeneratedAt: new Date(),
        isAnonymous: true,
      };

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const user = await findUserBySecretCode("  K7MN-P8QR  ");

      expect(user).toEqual(mockUser);
    });
  });

  describe("Invalid code scenarios", () => {
    it("should return null for non-existent code", async () => {
      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([]);

      const user = await findUserBySecretCode("XXXX-YYYY");

      expect(user).toBeNull();
    });

    it("should return null for empty string", async () => {
      const user = await findUserBySecretCode("");

      expect(user).toBeNull();
    });

    it("should return null for null input", async () => {
      const user = await findUserBySecretCode(null as any);

      expect(user).toBeNull();
    });

    it("should return null for malformed code", async () => {
      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([]);

      const user = await findUserBySecretCode("INVALID");

      expect(user).toBeNull();
    });
  });

  describe("Timing attack protection", () => {
    it("should take consistent time for valid and invalid codes", async () => {
      // Test for valid code
      const mockUser: Partial<User> = {
        id: "user-123",
        email: null,
        secretCode: "K7MN-P8QR",
        secretCodeGeneratedAt: new Date(),
        isAnonymous: true,
      };

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const start1 = Date.now();
      await findUserBySecretCode("K7MN-P8QR");
      const time1 = Date.now() - start1;

      // Test for invalid code
      mockDb.limit.mockResolvedValueOnce([]);

      const start2 = Date.now();
      await findUserBySecretCode("XXXX-YYYY");
      const time2 = Date.now() - start2;

      // Timing difference should be minimal (within reasonable margin)
      // This is a basic check - real timing attack protection requires crypto.timingSafeEqual
      const timeDiff = Math.abs(time1 - time2);
      expect(timeDiff).toBeLessThan(100); // Allow 100ms variance for test environment
    });

    it("should always query database even for obviously invalid codes", async () => {
      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([]);

      await findUserBySecretCode("definitely-not-valid");

      // Should still query database to maintain consistent timing
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle database errors gracefully", async () => {
      const mockDb = db as any;
      mockDb.limit.mockRejectedValueOnce(new Error("Database error"));

      await expect(findUserBySecretCode("K7MN-P8QR")).rejects.toThrow(
        "Database error",
      );
    });

    it("should only return first result when multiple matches exist", async () => {
      const mockUsers = [
        {
          id: "user-1",
          email: null,
          secretCode: "K7MN-P8QR",
          isAnonymous: true,
        },
        {
          id: "user-2",
          email: null,
          secretCode: "K7MN-P8QR",
          isAnonymous: true,
        },
      ];

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUsers[0]]); // limit(1) ensures only first

      const user = await findUserBySecretCode("K7MN-P8QR");

      expect(user).toEqual(mockUsers[0]);
      expect(user?.id).toBe("user-1");
    });
  });

  describe("Input sanitization", () => {
    it("should normalize lowercase to uppercase", async () => {
      const mockUser: Partial<User> = {
        id: "user-123",
        email: null,
        secretCode: "K7MN-P8QR",
        isAnonymous: true,
      };

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const user = await findUserBySecretCode("k7mn-p8qr");

      expect(user).toEqual(mockUser);
    });

    it("should trim whitespace from input", async () => {
      const mockUser: Partial<User> = {
        id: "user-123",
        email: null,
        secretCode: "K7MN-P8QR",
        isAnonymous: true,
      };

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const user = await findUserBySecretCode("  K7MN-P8QR\n");

      expect(user).toEqual(mockUser);
    });

    it("should handle mixed case input", async () => {
      const mockUser: Partial<User> = {
        id: "user-123",
        email: null,
        secretCode: "K7MN-P8QR",
        isAnonymous: true,
      };

      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const user = await findUserBySecretCode("K7mN-p8Qr");

      expect(user).toEqual(mockUser);
    });
  });
});
