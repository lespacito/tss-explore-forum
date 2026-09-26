import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Privacy section — feedback mention", () => {
	it("privacy.tsx contient la section Retours anonymes", () => {
		const privacyPath = resolve(__dirname, "../../../routes/privacy.tsx");
		const source = readFileSync(privacyPath, "utf-8");
		expect(source).toContain("Retours anonymes");
		expect(source).toContain("anonyme : aucun nom, email, identifiant de session");
		expect(source).toContain("Seules les réponses elles-mêmes sont conservées");
	});
});