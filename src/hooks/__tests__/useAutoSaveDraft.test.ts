import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger/client-logger";
import { useAutoSaveDraft } from "../useAutoSaveDraft";

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

describe("useAutoSaveDraft", () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should restore draft from localStorage on mount", () => {
		const key = "test-draft";
		const savedContent = "Previously saved content";

		// Pre-populate localStorage
		localStorage.setItem(key, savedContent);

		const { result } = renderHook(() =>
			useAutoSaveDraft({
				key,
				value: "",
			}),
		);

		expect(result.current.restoredDraft).toBe(savedContent);
		expect(result.current.hasDraft).toBe(true);
	});

	it("should not re-save a draft when the consumer hydrates the restored value", async () => {
		const key = "test-draft";
		const savedContent = "Previously saved content";
		localStorage.setItem(key, savedContent);

		const { rerender } = renderHook(
			({ value }) =>
				useAutoSaveDraft({
					key,
					value,
					delay: 1500,
				}),
			{ initialProps: { value: "" } },
		);

		await act(async () => {
			rerender({ value: savedContent });
			vi.advanceTimersByTime(1500);
			await Promise.resolve();
		});

		expect(localStorage.getItem(key)).toBe(savedContent);
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("should NOT restore draft if localStorage is empty", () => {
		const { result } = renderHook(() =>
			useAutoSaveDraft({
				key: "test-draft",
				value: "",
			}),
		);

		expect(result.current.restoredDraft).toBeNull();
		expect(result.current.hasDraft).toBe(false);
	});

	it("should save draft to localStorage after debounce delay", async () => {
		const key = "test-draft";
		const content = "New content to save";

		const { result, rerender } = renderHook(
			({ value }) =>
				useAutoSaveDraft({
					key,
					value,
					delay: 1500,
				}),
			{
				initialProps: { value: "" },
			},
		);

		// Update value
		await act(async () => {
			rerender({ value: content });
		});

		// Should NOT save immediately
		expect(localStorage.getItem(key)).toBeNull();

		// Fast-forward time by 1500ms
		await act(async () => {
			vi.advanceTimersByTime(1500);
			await Promise.resolve(); // Let effects run
		});

		// Should save after debounce
		expect(localStorage.getItem(key)).toBe(content);
		expect(result.current.hasDraft).toBe(true);

		// Should show success toast
		expect(toast.success).toHaveBeenCalledWith(
			"Brouillon sauvegardé automatiquement",
			expect.any(Object),
		);
	});

	it("should debounce multiple rapid changes", async () => {
		const key = "test-draft";

		const { rerender } = renderHook(
			({ value }) =>
				useAutoSaveDraft({
					key,
					value,
					delay: 1500,
				}),
			{
				initialProps: { value: "" },
			},
		);

		// Rapid changes - each change resets the debounce timer
		await act(async () => {
			rerender({ value: "a" });
		});

		await act(async () => {
			vi.advanceTimersByTime(500);
		});

		await act(async () => {
			rerender({ value: "ab" });
		});

		await act(async () => {
			vi.advanceTimersByTime(500);
		});

		await act(async () => {
			rerender({ value: "abc" });
		});

		// Now wait the full debounce period from the LAST change
		await act(async () => {
			vi.advanceTimersByTime(1500);
			await Promise.resolve();
		});

		// Only the last value should be saved
		expect(localStorage.getItem(key)).toBe("abc");

		// Toast should only be called once (for the final save)
		expect(toast.success).toHaveBeenCalledTimes(1);
	});

	it("should NOT save empty drafts", async () => {
		const key = "test-draft";

		renderHook(
			({ value }) =>
				useAutoSaveDraft({
					key,
					value,
					delay: 1500,
				}),
			{
				initialProps: { value: "   " }, // Empty/whitespace
			},
		);

		await act(async () => {
			vi.advanceTimersByTime(1500);
		});

		// Should NOT save empty content
		expect(localStorage.getItem(key)).toBeNull();
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("should clear draft from localStorage", () => {
		const key = "test-draft";
		localStorage.setItem(key, "Draft content");

		const { result } = renderHook(() =>
			useAutoSaveDraft({
				key,
				value: "Current content",
			}),
		);

		// Clear draft
		act(() => {
			result.current.clearDraft();
		});

		expect(localStorage.getItem(key)).toBeNull();
		expect(result.current.hasDraft).toBe(false);
		expect(result.current.restoredDraft).toBeNull();
	});

	it("should manually save draft", () => {
		const key = "test-draft";
		const content = "Manual save content";

		const { result } = renderHook(() =>
			useAutoSaveDraft({
				key,
				value: "",
			}),
		);

		act(() => {
			result.current.saveDraft(content);
		});

		expect(localStorage.getItem(key)).toBe(content);
		expect(result.current.hasDraft).toBe(true);
		expect(toast.success).toHaveBeenCalledWith(
			"Brouillon sauvegardé automatiquement",
			expect.any(Object),
		);
	});

	it("should respect enabled flag", async () => {
		const key = "test-draft";
		const content = "Content";

		const { rerender } = renderHook(
			({ value, enabled }) =>
				useAutoSaveDraft({
					key,
					value,
					enabled,
					delay: 1500,
				}),
			{
				initialProps: { value: "", enabled: false },
			},
		);

		// Update value while disabled
		await act(async () => {
			rerender({ value: content, enabled: false });
		});

		await act(async () => {
			vi.advanceTimersByTime(1500);
			await Promise.resolve();
		});

		// Should NOT save when disabled
		expect(localStorage.getItem(key)).toBeNull();

		// Enable and update to new value
		await act(async () => {
			rerender({ value: "New content", enabled: true });
		});

		await act(async () => {
			vi.advanceTimersByTime(1500);
			await Promise.resolve();
		});

		// Should save when enabled
		expect(localStorage.getItem(key)).toBe("New content");
	});

	it("should call onSave callback when draft is saved", async () => {
		const key = "test-draft";
		const onSave = vi.fn();

		const { rerender } = renderHook(
			({ value }) =>
				useAutoSaveDraft({
					key,
					value,
					delay: 1500,
					onSave,
				}),
			{
				initialProps: { value: "" },
			},
		);

		await act(async () => {
			rerender({ value: "New content" });
		});

		await act(async () => {
			vi.advanceTimersByTime(1500);
			await Promise.resolve();
		});

		expect(onSave).toHaveBeenCalledTimes(1);
	});

	it("should call onRestore callback when draft is restored", () => {
		const key = "test-draft";
		const savedContent = "Restored content";
		const onRestore = vi.fn();

		localStorage.setItem(key, savedContent);

		renderHook(() =>
			useAutoSaveDraft({
				key,
				value: "",
				onRestore,
			}),
		);

		expect(onRestore).toHaveBeenCalledWith(savedContent);
	});

	it("should handle localStorage errors gracefully", async () => {
		const key = "test-draft";
		const loggerErrorSpy = vi
			.spyOn(logger, "error")
			.mockImplementation(() => {});

		// Mock localStorage.setItem to throw error
		const originalSetItem = localStorage.setItem;
		localStorage.setItem = vi.fn(() => {
			throw new Error("localStorage is full");
		});

		const { rerender } = renderHook(
			({ value }) =>
				useAutoSaveDraft({
					key,
					value,
					delay: 1500,
				}),
			{
				initialProps: { value: "" },
			},
		);

		await act(async () => {
			rerender({ value: "Content" });
		});

		await act(async () => {
			vi.advanceTimersByTime(1500);
			await Promise.resolve();
		});

		expect(loggerErrorSpy).toHaveBeenCalled();
		expect(toast.error).toHaveBeenCalledWith(
			"Impossible de sauvegarder le brouillon",
			expect.any(Object),
		);

		// Restore original
		localStorage.setItem = originalSetItem;
		loggerErrorSpy.mockRestore();
	});

	it("should NOT trigger save if value hasn't changed", async () => {
		const key = "test-draft";
		const content = "Same content";

		const { rerender } = renderHook(
			({ value }) =>
				useAutoSaveDraft({
					key,
					value,
					delay: 1500,
				}),
			{
				initialProps: { value: content },
			},
		);

		await act(async () => {
			vi.advanceTimersByTime(1500);
		});

		const saveCount = vi.mocked(toast.success).mock.calls.length;

		// Re-render with same value
		rerender({ value: content });

		await act(async () => {
			vi.advanceTimersByTime(1500);
		});

		// Should NOT trigger additional save
		expect(vi.mocked(toast.success).mock.calls.length).toBe(saveCount);
	});
});

describe("private beta draft consent", () => {
	it("does not restore private text before consent", () => {
		localStorage.setItem("consent-test", "Private draft");
		const { result, rerender } = renderHook(
			({ enabled }) =>
				useAutoSaveDraft({ key: "consent-test", value: "", enabled }),
			{ initialProps: { enabled: false } },
		);
		expect(result.current.restoredDraft).toBeNull();
		rerender({ enabled: true });
		expect(result.current.restoredDraft).toBe("Private draft");
		localStorage.removeItem("consent-test");
	});
	it("does not resurrect a cleared draft through a pending debounce", () => {
		vi.useFakeTimers();
		const { result, rerender } = renderHook(
			({ value }) => useAutoSaveDraft({ key: "clear-test", value }),
			{ initialProps: { value: "" } },
		);
		act(() => rerender({ value: "Unsent private draft" }));
		act(() => result.current.clearDraft());
		act(() => vi.advanceTimersByTime(2000));
		expect(localStorage.getItem("clear-test")).toBeNull();
		vi.useRealTimers();
	});
});
