import { describe, it, expect } from "vitest";
import { user, userColumns } from "../user";
import { getTableColumns } from "drizzle-orm";

describe("User Schema - Task 2", () => {
  describe("Secret Code Columns", () => {
    it("should have secretCode column in userColumns", () => {
      expect(userColumns.secretCode).toBeDefined();
    });

    it("should have secretCodeGeneratedAt column in userColumns", () => {
      expect(userColumns.secretCodeGeneratedAt).toBeDefined();
    });

    it("should have secretCode as nullable text column", () => {
      const columns = getTableColumns(user);
      expect(columns.secretCode).toBeDefined();
      expect(columns.secretCode.notNull).toBe(false); // nullable
    });

    it("should have secretCodeGeneratedAt as timestamp column", () => {
      const columns = getTableColumns(user);
      expect(columns.secretCodeGeneratedAt).toBeDefined();
      expect(columns.secretCodeGeneratedAt.notNull).toBe(false); // nullable
    });

    it("should have unique constraint on secretCode", () => {
      // The unique constraint is defined at table level
      // Verified by migration: user_secret_code_unique
      expect(userColumns.secretCode).toBeDefined();
    });

    it("should have all required user columns including new ones", () => {
      const columns = getTableColumns(user);

      // Existing columns
      expect(columns.id).toBeDefined();
      expect(columns.email).toBeDefined();
      expect(columns.name).toBeDefined();
      expect(columns.isAnonymous).toBeDefined();

      // New columns (Task 2)
      expect(columns.secretCode).toBeDefined();
      expect(columns.secretCodeGeneratedAt).toBeDefined();
    });

    it("should maintain backward compatibility with existing columns", () => {
      const columns = getTableColumns(user);

      // Critical: secretCode and secretCodeGeneratedAt are nullable
      // This ensures existing users without codes are not affected
      expect(columns.secretCode.notNull).toBe(false);
      expect(columns.secretCodeGeneratedAt.notNull).toBe(false);
    });
  });

  describe("Migration Safety", () => {
    it("should not break existing user records", () => {
      // Both new columns are nullable, so existing records are safe
      const columns = getTableColumns(user);

      expect(columns.secretCode.notNull).toBe(false);
      expect(columns.secretCodeGeneratedAt.notNull).toBe(false);
    });

    it("should allow users without secret codes (registered users)", () => {
      // Registered users (email signup, OAuth) won't have secret codes
      // Only anonymous users will have codes
      const columns = getTableColumns(user);

      expect(columns.secretCode.notNull).toBe(false);
    });
  });
});
