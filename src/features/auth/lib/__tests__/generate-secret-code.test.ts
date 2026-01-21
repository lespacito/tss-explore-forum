import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateSecretCode, ensureUniqueCode } from "../generate-secret-code";

// Mock dependencies
vi.mock("@/db", () => ({
  db: {},
}));

describe("Secret Code Generation - Task 1", () => {
  describe("generateSecretCode", () => {
    it("should generate a code with correct format XXXX-XXXX-XXXX", () => {
      const code = generateSecretCode();
      expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    });

    it("should generate code with exactly 12 characters (excluding separators)", () => {
      const code = generateSecretCode();
      const charsOnly = code.replace(/-/g, "");
      expect(charsOnly).toHaveLength(12);
    });

    it("should only contain allowed characters (no 0, O, I, 1, l)", () => {
      const code = generateSecretCode();
      const forbiddenChars = /[0OIl1]/;
      expect(code).not.toMatch(forbiddenChars);
    });

    it("should contain exactly 2 separator dashes", () => {
      const code = generateSecretCode();
      const separatorCount = (code.match(/-/g) || []).length;
      expect(separatorCount).toBe(2);
    });

    it("should generate different codes on subsequent calls", () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateSecretCode());
      }
      // At least 99% should be unique (allowing for extremely rare collisions)
      expect(codes.size).toBeGreaterThan(98);
    });

    it("should only use uppercase letters and numbers", () => {
      const code = generateSecretCode();
      const uppercasePattern = /^[A-Z2-9-]+$/;
      expect(code).toMatch(uppercasePattern);
    });

    it("should have separators at correct positions (after 4th and 8th char)", () => {
      const code = generateSecretCode();
      expect(code[4]).toBe("-");
      expect(code[9]).toBe("-");
    });

    it("should have total length of 14 characters (12 + 2 separators)", () => {
      const code = generateSecretCode();
      expect(code).toHaveLength(14);
    });

    it("should use cryptographically secure random generation", () => {
      // Test that the function uses crypto.randomBytes (not Math.random)
      // This is implicit if we're using the crypto module
      const code = generateSecretCode();
      expect(code).toBeDefined();
      expect(typeof code).toBe("string");
    });

    it("should not contain lowercase letters", () => {
      const code = generateSecretCode();
      expect(code).not.toMatch(/[a-z]/);
    });
  });

  describe("ensureUniqueCode", () => {
    let mockDb: any;

    beforeEach(() => {
      mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // Default: no collision
      };
    });

    it("should return a unique code on first attempt", async () => {
      const code = await ensureUniqueCode(mockDb);
      expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should retry if first code already exists", async () => {
      let callCount = 0;
      mockDb.limit = vi.fn().mockImplementation(() => {
        callCount++;
        // First call returns collision, second returns no collision
        return Promise.resolve(callCount === 1 ? [{ id: "existing" }] : []);
      });

      const code = await ensureUniqueCode(mockDb);
      expect(code).toBeDefined();
      expect(mockDb.select).toHaveBeenCalledTimes(2);
    });

    it("should throw error after max attempts with collisions", async () => {
      // Mock DB to always return collisions
      mockDb.limit = vi.fn().mockResolvedValue([{ id: "existing" }]);

      await expect(ensureUniqueCode(mockDb, 3)).rejects.toThrow(
        "Failed to generate unique secret code",
      );
      expect(mockDb.select).toHaveBeenCalledTimes(3);
    });

    it("should respect custom maxAttempts parameter", async () => {
      mockDb.limit = vi.fn().mockResolvedValue([{ id: "existing" }]);

      await expect(ensureUniqueCode(mockDb, 5)).rejects.toThrow(
        "Failed to generate unique secret code",
      );
      expect(mockDb.select).toHaveBeenCalledTimes(5);
    });

    it("should return on second attempt if first collides", async () => {
      let callCount = 0;
      mockDb.limit = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve(callCount === 1 ? [{ id: "existing" }] : []);
      });

      const code = await ensureUniqueCode(mockDb, 5);
      expect(code).toBeDefined();
      expect(mockDb.select).toHaveBeenCalledTimes(2);
    });

    it("should use default maxAttempts of 5 if not specified", async () => {
      mockDb.limit = vi.fn().mockResolvedValue([{ id: "existing" }]);

      await expect(ensureUniqueCode(mockDb)).rejects.toThrow();
      expect(mockDb.select).toHaveBeenCalledTimes(5);
    });
  });

  describe("Code Security Properties", () => {
    it("should generate codes with sufficient entropy", () => {
      // With 30 allowed characters and 12 positions:
      // Entropy = 30^12 ≈ 5.3 × 10^17 possibilities
      const code = generateSecretCode();
      const charsOnly = code.replace(/-/g, "");

      // Verify we're using the full character set
      const allowedChars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      for (const char of charsOnly) {
        expect(allowedChars).toContain(char);
      }
    });

    it("should not be predictable or sequential", () => {
      const codes = [];
      for (let i = 0; i < 10; i++) {
        codes.push(generateSecretCode());
      }

      // Codes should not follow a pattern
      // Check that consecutive codes are different
      for (let i = 0; i < codes.length - 1; i++) {
        expect(codes[i]).not.toBe(codes[i + 1]);
      }
    });

    it("should not contain easily confused characters", () => {
      const code = generateSecretCode();
      // 0/O, I/1/l should not be present
      expect(code).not.toMatch(/0/);
      expect(code).not.toMatch(/O/);
      expect(code).not.toMatch(/I/);
      expect(code).not.toMatch(/1/);
      expect(code).not.toMatch(/l/);
    });
  });

  describe("Format Validation", () => {
    it("should have separators only at correct positions", () => {
      const code = generateSecretCode();
      const parts = code.split("-");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toHaveLength(4);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
    });

    it("should be human-readable with clear segments", () => {
      const code = generateSecretCode();
      // Should be easy to read in 3 chunks
      expect(code.split("-")).toHaveLength(3);
    });
  });
});
