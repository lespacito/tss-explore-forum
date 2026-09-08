/**
 * Extract initials from a name string.
 * Splits on "-" if present (alias names like "brave-fox"),
 * otherwise splits on whitespace (display names like "John Doe").
 * Single words return the first 2 characters.
 * Always uppercase, max 2 characters.
 *
 * @param name - The name to extract initials from
 * @param fallback - Fallback string when name is empty/null (default: "??")
 * @returns Uppercase initials (max 2 chars) or fallback
 *
 * @example
 * getInitials("brave-fox")     // "BF"
 * getInitials("John Doe")      // "JD"
 * getInitials("Alice")          // "AL"
 * getInitials(null)             // "??"
 * getInitials("", "NA")         // "NA"
 */
export function getInitials(name?: string | null, fallback = "??"): string {
	const safe = (name ?? "").trim();
	if (!safe) return fallback;

	const separator = safe.includes("-") ? "-" : /\s+/;
	const parts = safe.split(separator).filter(Boolean);

	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}

	return parts
		.map((p) => p[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}
