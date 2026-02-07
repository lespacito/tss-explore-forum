/**
 * Client-side HTML validation for user-generated content
 * Part of defense-in-depth security strategy (server-side is the critical layer)
 */

// Dangerous HTML patterns that should never appear in user content
const DANGEROUS_PATTERNS = [
  /<script[\s>]/i, // Script tags
  /javascript:/i, // JavaScript protocol
  /data:text\/html/i, // Data URI with HTML
  /<iframe/i, // iFrames
  /<embed/i, // Embed tags
  /<object/i, // Object tags
  /on\w+\s*=/i, // Event handlers (onclick, onerror, etc.)
  /<img/i, // Images (not allowed in MVP)
  /<link/i, // Link tags
  /<style/i, // Style tags
  /<meta/i, // Meta tags
];

// Safe HTML elements allowed in content (whitelisted by server)
const ALLOWED_ELEMENTS = [
  "p",
  "h2",
  "ul",
  "ol",
  "li",
  "em",
  "strong",
  "blockquote",
  "br",
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates HTML content for security issues
 * Returns validation result with empathetic error messages
 */
export function validateHtmlContent(html: string): ValidationResult {
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(html)) {
      return {
        isValid: false,
        error:
          "Votre message contient du contenu qui n'est pas autorisé. Veuillez utiliser uniquement le formatage de base (gras, italique, listes).",
      };
    }
  }

  // Check for suspicious nested HTML structures (potential obfuscation)
  const nestedTagCount = (html.match(/</g) || []).length;
  if (nestedTagCount > 500) {
    // Reasonable limit for formatted content
    return {
      isValid: false,
      error:
        "Votre message semble trop complexe. Veuillez simplifier le formatage.",
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes HTML content by removing potentially dangerous elements
 * Note: This is a client-side helper. Server-side sanitization is the critical layer.
 */
export function sanitizeClientSide(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, "");

  return sanitized;
}
