import { describe, expect, it, vi } from "vitest";
import { alias, user, verification } from "@/db/schema";
import { eraseAccountRecords } from "../erase-account-records";

vi.mock("@/db", () => ({ db: {} }));

describe("eraseAccountRecords", () => {
	it("deletes user-linked verification challenges in the erasure transaction", async () => {
		const deleteWhere = vi.fn().mockResolvedValue(undefined);
		const tx = {
			select: vi.fn(() => ({
				from: vi.fn((table) => {
					if (table === user) {
						return {
							where: vi.fn(() => ({
								for: vi.fn().mockResolvedValue([{ id: "user-1" }]),
							})),
						};
					}
					if (table === alias) {
						return { where: vi.fn().mockResolvedValue([]) };
					}
					throw new Error("Unexpected table selection");
				}),
			})),
			delete: vi.fn(() => ({ where: deleteWhere })),
		};
		const database = {
			transaction: vi.fn(async (run) => run(tx)),
		};

		await eraseAccountRecords("user-1", database as never);

		expect(database.transaction).toHaveBeenCalledOnce();
		expect(tx.delete).toHaveBeenNthCalledWith(1, verification);
		expect(tx.delete).toHaveBeenNthCalledWith(2, user);
		expect(deleteWhere).toHaveBeenCalledTimes(2);
	});
});
