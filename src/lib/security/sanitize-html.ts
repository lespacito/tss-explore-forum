/**
 * Server-side HTML sanitization for user-generated content from Tiptap editor
 * Uses sanitize-html library for robust XSS protection
 * Part of defense-in-depth security strategy (critical layer)
 */

import sanitizeHtmlLib from "sanitize-html";

// Whitelist of allowed HTML tags from Tiptap editor
const ALLOWED_TAGS = [
	"p", // Paragraphs
	"h2", // Headings (no h1 to preserve hierarchy)
	"h3",
	"ul", // Lists
	"ol",
	"li",
	"em", // Emphasis (italic)
	"strong", // Strong (bold)
	"blockquote", // Quotes
	"br", // Line breaks
	// Optionally enable links with validation (disabled by default for MVP)
	// "a",
] as const;

// Whitelist of allowed HTML attributes
const ALLOWED_ATTRIBUTES = {
	// No attributes allowed by default for maximum security
	// If links are enabled, uncomment:
	// "a": ["href", "title", "target", "rel"],
};

// Allowed URL schemes (if links are enabled)
const ALLOWED_SCHEMES = ["http", "https", "mailto"];

/**
 * Sanitizes HTML content from Tiptap editor
 * Removes all dangerous elements, scripts, and attributes
 * Only allows whitelisted tags and attributes
 *
 * @param html - Raw HTML content from Tiptap editor
 * @returns Sanitized HTML safe for storage and display
 */
export function sanitizeHtml(html: string): string {
	return sanitizeHtmlLib(html, {
		allowedTags: ALLOWED_TAGS as unknown as string[],
		allowedAttributes: ALLOWED_ATTRIBUTES,
		allowedSchemes: ALLOWED_SCHEMES,
		allowedSchemesByTag: {},
		allowProtocolRelative: false,

		// Disallow dangerous protocols
		disallowedTagsMode: "discard",

		// Remove all CSS styles
		allowedStyles: {},

		// Remove all classes and IDs
		allowedClasses: {},

		// Transform tags to remove dangerous elements
		transformTags: {
			// Remove all event handlers
			"*": (tagName, attribs) => {
				const cleanAttribs = { ...attribs };
				for (const key in cleanAttribs) {
					if (key.startsWith("on")) {
						delete cleanAttribs[key];
					}
				}
				return { tagName, attribs: cleanAttribs };
			},
		},

		// Enforce self-closing tags
		selfClosing: ["br"],

		// Enforce valid nesting
		enforceHtmlBoundary: true,

		// Additional security options
		parser: {
			lowerCaseTags: true,
			lowerCaseAttributeNames: true,
		},
	});
}

/**
 * Validates that HTML content is safe and non-empty after sanitization
 * Use this before storing content in the database
 *
 * @param html - Raw HTML content
 * @returns Object with validation status and sanitized content or error
 */
export function validateAndSanitize(html: string): {
	isValid: boolean;
	sanitized?: string;
	error?: string;
} {
	// Check if content is empty
	if (!html || html.trim().length === 0) {
		return {
			isValid: false,
			error: "Le contenu ne peut pas être vide",
		};
	}

	// Sanitize content
	const sanitized = sanitizeHtml(html);

	// Check if sanitized content is empty (all content was dangerous)
	const textContent = sanitized.replace(/<[^>]*>/g, "").trim();
	if (textContent.length === 0) {
		return {
			isValid: false,
			error:
				"Votre message contient uniquement du contenu qui n'est pas autorisé. Veuillez utiliser uniquement le formatage de base (gras, italique, listes).",
		};
	}

	// Check minimum content length (10 characters of actual text)
	if (textContent.length < 10) {
		return {
			isValid: false,
			error: "Votre message doit contenir au moins 10 caractères",
		};
	}

	// Check maximum content length (10000 characters of actual text)
	if (textContent.length > 10000) {
		return {
			isValid: false,
			error: "Votre message ne peut pas dépasser 10 000 caractères",
		};
	}

	return {
		isValid: true,
		sanitized,
	};
}

/**
 * Extracts plain text from HTML content
 * Useful for text-length validation and search indexing
 *
 * @param html - HTML content
 * @returns Plain text without HTML tags
 */
export function extractPlainText(html: string): string {
	return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Configuration export for reference and testing
 */
export const SANITIZE_CONFIG = {
	ALLOWED_TAGS,
	ALLOWED_ATTRIBUTES,
	ALLOWED_SCHEMES,
} as const;
