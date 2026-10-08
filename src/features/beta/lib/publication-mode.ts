// Presentation only. Unknown or missing configuration keeps fictitious scenarios.
export function publicationMode(value: string | undefined): "test" | "real" {
	return value === "real" ? "real" : "test";
}
