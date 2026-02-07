import { sanitizeHtml } from "@/lib/security/sanitize-html";
import { cn } from "@/lib/utils";

/**
 * SafeHtmlDisplay Component
 *
 * Renders sanitized HTML content from Tiptap editor with consistent styling.
 * Uses the same design system classes as TiptapEditor for visual consistency.
 *
 * Security:
 * - HTML is sanitized using sanitizeHtml() before rendering
 * - Only whitelisted tags are allowed (p, h2, h3, ul, ol, li, em, strong, blockquote, br)
 * - All dangerous elements (script, iframe, etc.) are removed
 * - Uses dangerouslySetInnerHTML only AFTER sanitization
 *
 * @param html - Raw HTML content from database
 * @param className - Optional additional CSS classes
 */

const contentClasses = cn(
	// Base styles matching TiptapEditor
	"leading-7 text-foreground",
	// Blockquote styles
	"[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4",
	"[&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
	// Heading styles
	"[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground",
	"[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-foreground",
	// List styles
	"[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4",
	"[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4",
	"[&_li]:my-1",
	// Paragraph styles
	"[&_p]:my-3",
	// Emphasis styles
	"[&_strong]:font-bold",
	"[&_em]:italic",
);

interface SafeHtmlDisplayProps {
	html: string;
	className?: string;
}

export const SafeHtmlDisplay = ({ html, className }: SafeHtmlDisplayProps) => {
	// Sanitize HTML before rendering (critical security step)
	const sanitizedHtml = sanitizeHtml(html);

	return (
		<div
			className={cn(contentClasses, className)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized using sanitizeHtml() before rendering - see lib/security/sanitize-html.ts for whitelist and XSS protection
			dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
		/>
	);
};
