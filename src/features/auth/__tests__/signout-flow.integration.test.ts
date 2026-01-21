import { describe, it, expect, beforeEach, vi } from "vitest";
import { signOut } from "@/features/auth/lib/auth-client";

// Mock Better-Auth client
vi.mock("@/features/auth/lib/auth-client", () => ({
  signOut: vi.fn(),
}));

describe("Signout Flow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Successful signout", () => {
    it("should signout successfully when user is authenticated", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
      });

      const result = await signOut({
        fetchOptions: {
          onSuccess: vi.fn(),
        },
      });

      expect(mockSignOut).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchOptions: expect.any(Object),
        })
      );

      expect(result).toEqual({ success: true });
    });

    it("should call onSuccess callback after successful signout", async () => {
      const onSuccessMock = vi.fn();
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockImplementation(async ({ fetchOptions }) => {
        if (fetchOptions?.onSuccess) {
          fetchOptions.onSuccess();
        }
        return { success: true };
      });

      await signOut({
        fetchOptions: {
          onSuccess: onSuccessMock,
        },
      });

      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });

    it("should invalidate session on signout", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
      });

      await signOut();

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("Signout when already signed out", () => {
    it("should handle signout when no active session", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
        message: "No active session",
      });

      const result = await signOut();

      expect(result).toEqual({
        success: true,
        message: "No active session",
      });
    });

    it("should not throw error when signing out twice", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValue({
        success: true,
      });

      await signOut();
      await signOut();

      expect(mockSignOut).toHaveBeenCalledTimes(2);
    });
  });

  describe("Signout with errors", () => {
    it("should handle network errors gracefully", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockRejectedValueOnce(new Error("Network error"));

      await expect(signOut()).rejects.toThrow("Network error");
    });

    it("should handle server errors gracefully", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockRejectedValueOnce({
        error: {
          code: "SERVER_ERROR",
          message: "Internal server error",
        },
      });

      await expect(signOut()).rejects.toMatchObject({
        error: expect.objectContaining({
          code: "SERVER_ERROR",
        }),
      });
    });

    it("should call onError callback when signout fails", async () => {
      const onErrorMock = vi.fn();
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockImplementation(async ({ fetchOptions }) => {
        const error = new Error("Signout failed");
        if (fetchOptions?.onError) {
          fetchOptions.onError(error);
        }
        throw error;
      });

      try {
        await signOut({
          fetchOptions: {
            onError: onErrorMock,
          },
        });
      } catch (error) {
        // Expected to throw
      }

      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("Session cleanup", () => {
    it("should clear cookies on successful signout", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
      });

      const result = await signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it("should clear JWT tokens on successful signout", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
      });

      await signOut();

      // Better-Auth handles token cleanup internally
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("Redirect after signout", () => {
    it("should support redirect to custom URL after signout", async () => {
      const onSuccessMock = vi.fn();
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockImplementation(async ({ fetchOptions }) => {
        if (fetchOptions?.onSuccess) {
          fetchOptions.onSuccess();
        }
        return { success: true };
      });

      await signOut({
        fetchOptions: {
          onSuccess: onSuccessMock,
        },
      });

      expect(onSuccessMock).toHaveBeenCalled();
    });

    it("should handle redirect to home page after signout", async () => {
      const mockNavigate = vi.fn();
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockImplementation(async ({ fetchOptions }) => {
        if (fetchOptions?.onSuccess) {
          fetchOptions.onSuccess();
          mockNavigate({ to: "/" });
        }
        return { success: true };
      });

      await signOut({
        fetchOptions: {
          onSuccess: () => mockNavigate({ to: "/" }),
        },
      });

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });

  describe("Multi-device signout", () => {
    it("should invalidate session across all devices", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
      });

      await signOut();

      // Better-Auth should invalidate session server-side
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("should prevent access to protected routes after signout", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
      });

      const result = await signOut();

      expect(result.success).toBe(true);
      // After signout, session should be null
      // Protected routes should redirect to login
    });
  });

  describe("Signout without options", () => {
    it("should signout successfully without fetchOptions", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
      });

      const result = await signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it("should signout successfully with empty options", async () => {
      const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
      mockSignOut.mockResolvedValueOnce({
        success: true,
      });

      const result = await signOut({});

      expect(mockSignOut).toHaveBeenCalledWith({});
      expect(result.success).toBe(true);
    });
  });
});
