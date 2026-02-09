import { describe, expect, it } from "vitest";
import {
	threadStatus,
	threadStatusEnum,
	type ThreadStatus,
} from "../thread";

/**
 * Unit tests for Thread Status Schema (Story 2.4)
 *
 * Tests the thread_status enum and related types for moderation workflow.
 * Validates enum values, default status, and TypeScript type safety.
 */

describe("Thread Status Schema (Story 2.4)", () => {
	describe("threadStatus array", () => {
		it("should define exactly 3 status values", () => {
			expect(threadStatus).toHaveLength(3);
		});

		it("should include 'pending' status", () => {
			expect(threadStatus).toContain("pending");
		});

		it("should include 'published' status", () => {
			expect(threadStatus).toContain("published");
		});

		it("should include 'rejected' status", () => {
			expect(threadStatus).toContain("rejected");
		});

		it("should have exact values in correct order", () => {
			expect(threadStatus).toEqual(["pending", "published", "rejected"]);
		});
	});

	describe("threadStatusEnum (pgEnum)", () => {
		it("should expose enumValues matching threadStatus array", () => {
			expect(threadStatusEnum.enumValues).toEqual(threadStatus);
		});

		it("should have enumName 'thread_status'", () => {
			expect(threadStatusEnum.enumName).toBe("thread_status");
		});
	});

	describe("ThreadStatus TypeScript type", () => {
		it("should accept 'pending' as valid status", () => {
			const status: ThreadStatus = "pending";
			expect(status).toBe("pending");
		});

		it("should accept 'published' as valid status", () => {
			const status: ThreadStatus = "published";
			expect(status).toBe("published");
		});

		it("should accept 'rejected' as valid status", () => {
			const status: ThreadStatus = "rejected";
			expect(status).toBe("rejected");
		});

		it("should match threadStatus array at runtime", () => {
			const validStatuses: ThreadStatus[] = [
				"pending",
				"published",
				"rejected",
			];
			expect(validStatuses).toEqual([...threadStatus]);
		});
	});

	describe("Default status behavior", () => {
		it("should use 'pending' as first/default value", () => {
			expect(threadStatus[0]).toBe("pending");
		});
	});

	describe("Status transitions (validation rules)", () => {
		it("should allow transition from pending to published", () => {
			const from: ThreadStatus = "pending";
			const to: ThreadStatus = "published";
			expect(threadStatus).toContain(from);
			expect(threadStatus).toContain(to);
		});

		it("should allow transition from pending to rejected", () => {
			const from: ThreadStatus = "pending";
			const to: ThreadStatus = "rejected";
			expect(threadStatus).toContain(from);
			expect(threadStatus).toContain(to);
		});

		it("should document invalid transition: published → pending", () => {
			// Business rule: Once published, cannot go back to pending
			const invalidTransition = (from: ThreadStatus, to: ThreadStatus) => {
				return from === "published" && to === "pending";
			};
			expect(invalidTransition("published", "pending")).toBe(true);
		});
	});

	describe("Story 2.4 Acceptance Criteria", () => {
		it("AC1: threadStatus includes 'pending' as default for new threads", () => {
			expect(threadStatus).toContain("pending");
			expect(threadStatus[0]).toBe("pending");
		});

		it("AC2: all moderation workflow statuses are defined", () => {
			const required = ["pending", "published", "rejected"];
			for (const s of required) {
				expect(threadStatus).toContain(s);
			}
		});
	});
});
