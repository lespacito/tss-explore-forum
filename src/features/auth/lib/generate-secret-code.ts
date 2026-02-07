import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schemas/user";

/**
 * Configuration for secret code generation
 */
const ALLOWED_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 30 characters (excludes 0, O, I, 1, l)
const CODE_LENGTH = 12; // Without separators
const SEPARATOR = "-";
const CHUNK_SIZE = 4;

/**
 * Generates a cryptographically secure secret code
 * Format: XXXX-XXXX-XXXX (12 alphanumeric characters with dashes every 4 chars)
 *
 * @returns Secret code string in format "XXXX-XXXX-XXXX"
 *
 * @example
 * ```typescript
 * const code = generateSecretCode();
 * console.log(code); // "K7MN-P8QR-X4BT"
 * ```
 *
 * Security properties:
 * - Uses crypto.randomBytes() for cryptographic security
 * - Excludes visually ambiguous characters (0/O, I/1/l)
 * - Entropy: 30^12 ≈ 5.3 × 10^17 possible codes
 * - Human-readable with dash separators every 4 characters
 */
export function generateSecretCode(): string {
	let code = "";
	const bytes = randomBytes(CODE_LENGTH);

	for (let i = 0; i < CODE_LENGTH; i++) {
		const index = bytes[i] % ALLOWED_CHARS.length;
		code += ALLOWED_CHARS[index];

		// Add separator every 4 characters (except at the end)
		if ((i + 1) % CHUNK_SIZE === 0 && i < CODE_LENGTH - 1) {
			code += SEPARATOR;
		}
	}

	return code; // Format: "XXXX-XXXX-XXXX"
}

/**
 * Generates a unique secret code by checking against the database
 * Retries generation if collision detected
 *
 * @param dbInstance - Drizzle database instance
 * @param maxAttempts - Maximum number of generation attempts (default: 5)
 * @returns Promise resolving to unique secret code
 * @throws Error if unable to generate unique code after maxAttempts
 *
 * @example
 * ```typescript
 * const uniqueCode = await ensureUniqueCode(db);
 * console.log(uniqueCode); // "H9JK-M2NP-Q3RS"
 * ```
 *
 * Note: With 30^12 possible codes, collision probability is extremely low.
 * Default 5 attempts should be more than sufficient.
 */
export async function ensureUniqueCode(
	dbInstance: typeof db = db,
	maxAttempts: number = 5,
): Promise<string> {
	for (let i = 0; i < maxAttempts; i++) {
		const code = generateSecretCode();

		// Check if code already exists in database
		const existing = await dbInstance
			.select()
			.from(user)
			.where(eq(user.secretCode, code))
			.limit(1);

		if (existing.length === 0) {
			return code;
		}

		// Collision detected, retry
	}

	throw new Error("Failed to generate unique secret code");
}
