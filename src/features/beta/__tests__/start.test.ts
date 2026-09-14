import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	csrf: { name: "csrf" },
	privateBeta: { name: "private-beta" },
	createCsrfMiddleware: vi.fn(),
	createStart: vi.fn(),
}));

vi.mock("@tanstack/react-start", () => ({
	createCsrfMiddleware: mocks.createCsrfMiddleware.mockReturnValue(mocks.csrf),
	createMiddleware: () => ({ server: () => mocks.privateBeta }),
	createStart: mocks.createStart.mockImplementation((factory) => ({
		getOptions: factory,
	})),
}));

import { startInstance } from "../../../start";

describe("start request middleware", () => {
	it("registers CSRF protection for server functions before beta access", () => {
		const [options] = mocks.createCsrfMiddleware.mock.calls[0];
		expect(options.filter({ handlerType: "serverFn" })).toBe(true);
		expect(options.filter({ handlerType: "ssr" })).toBe(false);
		expect(startInstance.getOptions().requestMiddleware).toEqual([
			mocks.csrf,
			mocks.privateBeta,
		]);
	});
});
