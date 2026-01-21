import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  deleteAccountSchema,
  type DeleteAccountInput,
} from "../schemas/delete-account-schema";

describe("Delete Account Schema Validation", () => {
  describe("Valid schemas", () => {
    it("should validate correct delete_all option with password and confirmation", () => {
      const validInput: DeleteAccountInput = {
        retentionOption: "delete_all",
        confirmationChecked: true,
        password: "mySecurePassword123",
      };

      const result = deleteAccountSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it("should validate correct anonymize option with password and confirmation", () => {
      const validInput: DeleteAccountInput = {
        retentionOption: "anonymize",
        confirmationChecked: true,
        password: "anotherPassword456",
      };

      const result = deleteAccountSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });
  });

  describe("Invalid retention option", () => {
    it("should reject invalid retention option value", () => {
      const invalidInput = {
        retentionOption: "invalid_option",
        confirmationChecked: true,
        password: "password123",
      };

      const result = deleteAccountSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("retentionOption");
      }
    });

    it("should reject missing retention option", () => {
      const invalidInput = {
        confirmationChecked: true,
        password: "password123",
      };

      const result = deleteAccountSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("retentionOption");
      }
    });
  });

  describe("Invalid confirmation checkbox", () => {
    it("should reject when confirmation is false", () => {
      const invalidInput = {
        retentionOption: "anonymize",
        confirmationChecked: false,
        password: "password123",
      };

      const result = deleteAccountSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmationChecked");
        expect(result.error.issues[0].message).toMatch(
          /vous devez confirmer/i,
        );
      }
    });

    it("should reject missing confirmation checkbox", () => {
      const invalidInput = {
        retentionOption: "delete_all",
        password: "password123",
      };

      const result = deleteAccountSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmationChecked");
      }
    });
  });

  describe("Invalid password", () => {
    it("should reject empty password", () => {
      const invalidInput = {
        retentionOption: "anonymize",
        confirmationChecked: true,
        password: "",
      };

      const result = deleteAccountSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("password");
        expect(result.error.issues[0].message).toMatch(/mot de passe/i);
      }
    });

    it("should reject missing password", () => {
      const invalidInput = {
        retentionOption: "delete_all",
        confirmationChecked: true,
      };

      const result = deleteAccountSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("password");
      }
    });
  });

  describe("Edge cases", () => {
    it("should accept very long password", () => {
      const longPassword = "a".repeat(200);
      const validInput: DeleteAccountInput = {
        retentionOption: "anonymize",
        confirmationChecked: true,
        password: longPassword,
      };

      const result = deleteAccountSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should accept password with special characters", () => {
      const specialPassword = "P@ssw0rd!#$%^&*()_+-=[]{}|;:',.<>?/~`";
      const validInput: DeleteAccountInput = {
        retentionOption: "delete_all",
        confirmationChecked: true,
        password: specialPassword,
      };

      const result = deleteAccountSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should trim whitespace from password", () => {
      const inputWithWhitespace = {
        retentionOption: "anonymize" as const,
        confirmationChecked: true,
        password: "  password123  ",
      };

      const result = deleteAccountSchema.safeParse(inputWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe("password123");
      }
    });
  });
});
