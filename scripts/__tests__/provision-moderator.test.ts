import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/users/server/db/user-queries", () => ({
	getUserByEmail: vi.fn(),
	setUserRole: vi.fn(),
}));

vi.mock("node:readline/promises", () => {
	const question = vi.fn();
	return {
		createInterface: vi.fn(() => ({
			question,
			close: vi.fn(),
		})),
	};
});

import { getUserByEmail, setUserRole } from "@/features/users/server/db/user-queries";
import { createInterface } from "node:readline/promises";
import { validateRoleInput, requireInteractiveEnvironment, DEFAULT_ROLE, ACCEPTED_ROLES, main } from "../provision-moderator";

describe("scripts/provision-moderator - validation stricte sans trim", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
		process.stdin.isTTY = true;
	});

	afterEach(() => {
		vi.restoreAllMocks();
		process.stdin.isTTY = true;
	});

	it("MODERATOR exact (pas d'espace) → accepté", () => {
		expect(validateRoleInput("MODERATOR")).toBe("MODERATOR");
	});

	it("ADMIN exact (pas d'espace) → accepté", () => {
		expect(validateRoleInput("ADMIN")).toBe("ADMIN");
	});

	it("chaîne avec espaces avant → rejetée", () => {
		expect(() => validateRoleInput(" MODERATOR")).toThrow(/exit/);
	});

	it("chaîne avec espaces après → rejetée", () => {
		expect(() => validateRoleInput("MODERATOR ")).toThrow(/exit/);
	});

	it("chaîne avec espaces avant et après → rejetée", () => {
		expect(() => validateRoleInput(" MODERATOR ")).toThrow(/exit/);
	});

	it("admin (minuscules) → rejeté", () => {
		expect(() => validateRoleInput("admin")).toThrow(/exit/);
	});

	it("moderator (minuscules) → rejeté", () => {
		expect(() => validateRoleInput("moderator")).toThrow(/exit/);
	});

	it("Moderator (casse mixte) → rejeté", () => {
		expect(() => validateRoleInput("Moderator")).toThrow(/exit/);
	});

	it("USER → rejeté", () => {
		expect(() => validateRoleInput("USER")).toThrow(/exit/);
	});

	it("BANNED → rejeté", () => {
		expect(() => validateRoleInput("BANNED")).toThrow(/exit/);
	});

	it("chaîne vide → rejetée", () => {
		expect(() => validateRoleInput("")).toThrow(/exit/);
	});

	it("chaîne invalide quelconque → rejetée", () => {
		expect(() => validateRoleInput("INVALID")).toThrow(/exit/);
	});

	it("ACCEPTED_ROLES contient exactement MODERATOR et ADMIN", () => {
		expect(ACCEPTED_ROLES).toEqual(["MODERATOR", "ADMIN"]);
		expect(ACCEPTED_ROLES.length).toBe(2);
		expect(new Set(ACCEPTED_ROLES).size).toBe(2);
	});

	it("DEFAULT_ROLE est MODERATOR", () => {
		expect(DEFAULT_ROLE).toBe("MODERATOR");
	});

	it("défaut MODERATOR géré par le script (pas par validateRoleInput)", () => {
		expect(() => validateRoleInput("")).toThrow(/exit/);
	});
});

describe("scripts/provision-moderator - guards d'exécution", () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		process.stdin.isTTY = true;

		vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		process.stdin.isTTY = true;
		consoleErrorSpy.mockRestore();
	});

	it("non-TTY → refus sans aucune DB", async () => {
		const originalIsTTY = process.stdin.isTTY;
		process.stdin.isTTY = false;

		expect(() => requireInteractiveEnvironment()).toThrow(/exit/);
		expect(getUserByEmail).not.toHaveBeenCalled();
		expect(setUserRole).not.toHaveBeenCalled();

		process.stdin.isTTY = originalIsTTY;
	});

	it("TTY → passe (pas d'erreur)", () => {
		process.stdin.isTTY = true;
		expect(() => requireInteractiveEnvironment()).not.toThrow();
	});

	it("confirmation 'no' → aucune DB appelée avant et après", async () => {
		const mockRl = createInterface();
		(mockRl.question as any)
			.mockResolvedValueOnce("test@example.com")
			.mockResolvedValueOnce("MODERATOR")
			.mockResolvedValueOnce("no");

		await expect(main()).rejects.toThrow(/exit/);
		expect(getUserByEmail).not.toHaveBeenCalled();
		expect(setUserRole).not.toHaveBeenCalled();
	});

	it("confirmation 'yes' → getUserByEmail appelé seulement après confirmation", async () => {
		const mockUser = { id: "user-123", email: "test@example.com", role: "USER" };
		const mockRl = createInterface();
		(mockRl.question as any)
			.mockResolvedValueOnce("test@example.com")
			.mockResolvedValueOnce("MODERATOR")
			.mockResolvedValueOnce("yes");

		(getUserByEmail as any).mockResolvedValueOnce(mockUser);

		await expect(main()).resolves.toBeUndefined();
		expect(getUserByEmail).toHaveBeenCalledTimes(1);
		expect(getUserByEmail).toHaveBeenCalledWith("test@example.com");
		expect(setUserRole).toHaveBeenCalledTimes(1);
		expect(setUserRole).toHaveBeenCalledWith("user-123", "MODERATOR");
	});

	it("utilisateur absent après confirmation → aucune écriture", async () => {
		const mockRl = createInterface();
		(mockRl.question as any)
			.mockResolvedValueOnce("test@example.com")
			.mockResolvedValueOnce("MODERATOR")
			.mockResolvedValueOnce("yes");

		(getUserByEmail as any).mockResolvedValueOnce(null);

		await expect(main()).rejects.toThrow(/exit/);
		expect(getUserByEmail).toHaveBeenCalledTimes(1);
		expect(setUserRole).not.toHaveBeenCalled();
	});

	it("rôle déjà identique → aucune écriture (setUserRole non appelé)", async () => {
		const mockUser = { id: "user-123", email: "test@example.com", role: "MODERATOR" };
		const mockRl = createInterface();
		(mockRl.question as any)
			.mockResolvedValueOnce("test@example.com")
			.mockResolvedValueOnce("")
			.mockResolvedValueOnce("yes");

		(getUserByEmail as any).mockResolvedValueOnce(mockUser);

		await expect(main()).rejects.toThrow(/exit/);
		expect(getUserByEmail).toHaveBeenCalledTimes(1);
		expect(setUserRole).not.toHaveBeenCalled();
	});

	it("rôle différent → exactement un setUserRole (pas plus)", async () => {
		const mockUser = { id: "user-123", email: "user@example.com", role: "USER" };
		const mockRl = createInterface();
		(mockRl.question as any)
			.mockResolvedValueOnce("user@example.com")
			.mockResolvedValueOnce("ADMIN")
			.mockResolvedValueOnce("yes");

		(getUserByEmail as any).mockResolvedValueOnce(mockUser);

		await expect(main()).resolves.toBeUndefined();
		expect(getUserByEmail).toHaveBeenCalledTimes(1);
		expect(setUserRole).toHaveBeenCalledTimes(1);
		expect(setUserRole).toHaveBeenCalledWith("user-123", "ADMIN");
	});

	it("rôle modifié de MODERATOR à ADMIN → exactement un setUserRole", async () => {
		const mockUser = { id: "user-456", email: "mod@example.com", role: "MODERATOR" };
		const mockRl = createInterface();
		(mockRl.question as any)
			.mockResolvedValueOnce("mod@example.com")
			.mockResolvedValueOnce("ADMIN")
			.mockResolvedValueOnce("yes");

		(getUserByEmail as any).mockResolvedValueOnce(mockUser);

		await expect(main()).resolves.toBeUndefined();
		expect(getUserByEmail).toHaveBeenCalledTimes(1);
		expect(setUserRole).toHaveBeenCalledTimes(1);
		expect(setUserRole).toHaveBeenCalledWith("user-456", "ADMIN");
	});

	it("rôles identiques (ADMIN→ADMIN) → aucune écriture", async () => {
		const mockUser = { id: "user-789", email: "admin@example.com", role: "ADMIN" };
		const mockRl = createInterface();
		(mockRl.question as any)
			.mockResolvedValueOnce("admin@example.com")
			.mockResolvedValueOnce("ADMIN")
			.mockResolvedValueOnce("yes");

		(getUserByEmail as any).mockResolvedValueOnce(mockUser);

		await expect(main()).rejects.toThrow(/exit/);
		expect(getUserByEmail).toHaveBeenCalledTimes(1);
		expect(setUserRole).not.toHaveBeenCalled();
	});
});
