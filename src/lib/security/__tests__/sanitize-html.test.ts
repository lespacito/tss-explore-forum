/**
 * Tests for server-side HTML sanitization
 * Critical security layer - comprehensive coverage required
 */

import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  validateAndSanitize,
  extractPlainText,
  SANITIZE_CONFIG,
} from "../sanitize-html";

describe("sanitizeHtml", () => {
  describe("XSS Protection (CVE-2025-14284 and general XSS)", () => {
    it("should remove script tags", () => {
      const malicious = '<p>Hello</p><script>alert("XSS")</script>';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<script");
      expect(result).not.toContain("alert");
      expect(result).toBe("<p>Hello</p>");
    });

    it("should remove script tags with attributes", () => {
      const malicious =
        '<p>Hello</p><script type="text/javascript">alert("XSS")</script>';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<script");
      expect(result).toBe("<p>Hello</p>");
    });

    it("should remove javascript: protocol in attributes", () => {
      const malicious = '<a href="javascript:alert(\'XSS\')">Click me</a>';
      const result = sanitizeHtml(malicious);

      // Links are not in ALLOWED_TAGS by default, so <a> should be removed entirely
      expect(result).not.toContain("<a");
      expect(result).not.toContain("javascript:");
    });

    it("should remove event handlers (onclick, onerror, onload)", () => {
      const malicious = '<p onclick="alert(\'XSS\')">Click me</p>';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("onclick");
      expect(result).toBe("<p>Click me</p>");
    });

    it("should remove img tags with onerror handler", () => {
      const malicious = '<img src="x" onerror="alert(\'XSS\')">';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<img");
      expect(result).not.toContain("onerror");
      expect(result).toBe("");
    });

    it("should remove iframe tags", () => {
      const malicious = '<p>Hello</p><iframe src="evil.com"></iframe>';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<iframe");
      expect(result).toBe("<p>Hello</p>");
    });

    it("should remove style tags", () => {
      const malicious = "<p>Hello</p><style>body{display:none}</style>";
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<style");
      expect(result).toBe("<p>Hello</p>");
    });

    it("should remove link tags", () => {
      const malicious = '<p>Hello</p><link rel="stylesheet" href="evil.css">';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<link");
      expect(result).toBe("<p>Hello</p>");
    });

    it("should remove meta tags", () => {
      const malicious = '<p>Hello</p><meta http-equiv="refresh" content="0;url=evil.com">';
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<meta");
      expect(result).toBe("<p>Hello</p>");
    });

    it("should handle data: protocol attempts", () => {
      const malicious = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';
      const result = sanitizeHtml(malicious);

      // Links are not allowed, so entire tag should be removed
      expect(result).not.toContain("<a");
      expect(result).not.toContain("data:");
    });

    it("should handle nested script obfuscation", () => {
      const malicious = "<scr<script>ipt>alert('XSS')</scr</script>ipt>";
      const result = sanitizeHtml(malicious);

      // Script tags should be removed, remaining text should be escaped
      expect(result).not.toContain("<script");
      expect(result).not.toContain("</script>");
      // The text is safe even if it contains the word "alert" (it's escaped)
    });

    it("should remove multiple dangerous elements in one input", () => {
      const malicious = `
        <p>Safe content</p>
        <script>alert('XSS')</script>
        <iframe src="evil.com"></iframe>
        <img src="x" onerror="alert('XSS')">
        <style>body{display:none}</style>
      `;
      const result = sanitizeHtml(malicious);

      expect(result).not.toContain("<script");
      expect(result).not.toContain("<iframe");
      expect(result).not.toContain("<img");
      expect(result).not.toContain("<style");
      expect(result).toContain("<p>Safe content</p>");
    });
  });

  describe("Valid HTML - Whitelisted Tags", () => {
    it("should preserve paragraphs", () => {
      const html = "<p>This is a paragraph</p>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<p>This is a paragraph</p>");
    });

    it("should preserve bold text (strong)", () => {
      const html = "<p>This is <strong>bold</strong> text</p>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<p>This is <strong>bold</strong> text</p>");
    });

    it("should preserve italic text (em)", () => {
      const html = "<p>This is <em>italic</em> text</p>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<p>This is <em>italic</em> text</p>");
    });

    it("should preserve unordered lists", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<ul><li>Item 1</li><li>Item 2</li></ul>");
    });

    it("should preserve ordered lists", () => {
      const html = "<ol><li>First</li><li>Second</li></ol>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<ol><li>First</li><li>Second</li></ol>");
    });

    it("should preserve blockquotes", () => {
      const html = "<blockquote>This is a quote</blockquote>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<blockquote>This is a quote</blockquote>");
    });

    it("should preserve h2 headings", () => {
      const html = "<h2>Heading 2</h2>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<h2>Heading 2</h2>");
    });

    it("should preserve h3 headings", () => {
      const html = "<h3>Heading 3</h3>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<h3>Heading 3</h3>");
    });

    it("should preserve line breaks", () => {
      const html = "<p>Line 1<br>Line 2</p>";
      const result = sanitizeHtml(html);

      expect(result).toBe("<p>Line 1<br />Line 2</p>");
    });

    it("should handle complex nested valid content", () => {
      const html = `
        <h2>Title</h2>
        <p>Introduction with <strong>bold</strong> and <em>italic</em></p>
        <ul>
          <li>First item</li>
          <li>Second item with <strong>emphasis</strong></li>
        </ul>
        <blockquote>A meaningful quote</blockquote>
      `;
      const result = sanitizeHtml(html);

      expect(result).toContain("<h2>Title</h2>");
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<em>italic</em>");
      expect(result).toContain("<ul>");
      expect(result).toContain("<blockquote>A meaningful quote</blockquote>");
    });
  });

  describe("Edge Cases and Invalid HTML", () => {
    it("should handle empty string", () => {
      const result = sanitizeHtml("");
      expect(result).toBe("");
    });

    it("should handle plain text without tags", () => {
      const html = "Just plain text";
      const result = sanitizeHtml(html);

      expect(result).toBe("Just plain text");
    });

    it("should handle malformed HTML", () => {
      const html = "<p>Unclosed paragraph";
      const result = sanitizeHtml(html);

      // sanitize-html should fix malformed tags
      expect(result).toContain("<p>");
    });

    it("should remove h1 tags (not in whitelist)", () => {
      const html = "<h1>Title</h1><p>Content</p>";
      const result = sanitizeHtml(html);

      expect(result).not.toContain("<h1");
      expect(result).toContain("<p>Content</p>");
    });

    it("should remove div tags (not in whitelist)", () => {
      const html = "<div>Content</div>";
      const result = sanitizeHtml(html);

      expect(result).not.toContain("<div");
      expect(result).toBe("Content");
    });

    it("should remove span tags (not in whitelist)", () => {
      const html = "<p>Text with <span>span</span></p>";
      const result = sanitizeHtml(html);

      expect(result).not.toContain("<span");
      expect(result).toBe("<p>Text with span</p>");
    });

    it("should remove all CSS classes", () => {
      const html = '<p class="dangerous-class">Text</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain("class");
      expect(result).toBe("<p>Text</p>");
    });

    it("should remove all CSS styles", () => {
      const html = '<p style="color:red">Text</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain("style");
      expect(result).toBe("<p>Text</p>");
    });

    it("should remove id attributes", () => {
      const html = '<p id="my-id">Text</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain("id");
      expect(result).toBe("<p>Text</p>");
    });
  });

  describe("validateAndSanitize", () => {
    it("should return valid result for safe content", () => {
      const html = "<p>This is <strong>valid</strong> content</p>";
      const result = validateAndSanitize(html);

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("<p>This is <strong>valid</strong> content</p>");
      expect(result.error).toBeUndefined();
    });

    it("should reject empty string", () => {
      const result = validateAndSanitize("");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Le contenu ne peut pas être vide");
    });

    it("should reject whitespace-only string", () => {
      const result = validateAndSanitize("   \n  \t  ");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Le contenu ne peut pas être vide");
    });

    it("should reject content with only dangerous tags", () => {
      const html = '<script>alert("XSS")</script>';
      const result = validateAndSanitize(html);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("contenu qui n'est pas autorisé");
    });

    it("should reject content shorter than 10 characters", () => {
      const html = "<p>Short</p>"; // "Short" = 5 chars
      const result = validateAndSanitize(html);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("au moins 10 caractères");
    });

    it("should accept content with exactly 10 characters", () => {
      const html = "<p>Ten chars!</p>"; // "Ten chars!" = 10 chars
      const result = validateAndSanitize(html);

      expect(result.isValid).toBe(true);
    });

    it("should reject content longer than 10000 characters", () => {
      const longText = "a".repeat(10001);
      const html = `<p>${longText}</p>`;
      const result = validateAndSanitize(html);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("10 000 caractères");
    });

    it("should accept content with exactly 10000 characters", () => {
      const longText = "a".repeat(10000);
      const html = `<p>${longText}</p>`;
      const result = validateAndSanitize(html);

      expect(result.isValid).toBe(true);
    });

    it("should sanitize and validate mixed safe/dangerous content", () => {
      const html = '<p>Safe text here</p><script>alert("XSS")</script>';
      const result = validateAndSanitize(html);

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("<p>Safe text here</p>");
      expect(result.sanitized).not.toContain("script");
    });
  });

  describe("extractPlainText", () => {
    it("should extract text from simple HTML", () => {
      const html = "<p>Hello world</p>";
      const result = extractPlainText(html);

      expect(result).toBe("Hello world");
    });

    it("should extract text from nested HTML", () => {
      const html = "<p>Text with <strong>bold</strong> and <em>italic</em></p>";
      const result = extractPlainText(html);

      expect(result).toBe("Text with bold and italic");
    });

    it("should extract text from lists", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const result = extractPlainText(html);

      expect(result).toBe("Item 1Item 2");
    });

    it("should handle empty string", () => {
      const result = extractPlainText("");
      expect(result).toBe("");
    });

    it("should handle plain text", () => {
      const result = extractPlainText("Plain text");
      expect(result).toBe("Plain text");
    });

    it("should extract text and trim whitespace", () => {
      const html = "  <p>  Text  </p>  ";
      const result = extractPlainText(html);

      expect(result).toBe("Text");
    });
  });

  describe("SANITIZE_CONFIG", () => {
    it("should export allowed tags configuration", () => {
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("p");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("h2");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("h3");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("ul");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("ol");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("li");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("em");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("strong");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("blockquote");
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toContain("br");
    });

    it("should have exactly 10 allowed tags (MVP whitelist)", () => {
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toHaveLength(10);
    });

    it("should not allow images in MVP", () => {
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).not.toContain("img");
    });

    it("should not allow links in MVP", () => {
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).not.toContain("a");
    });

    it("should export allowed schemes configuration", () => {
      expect(SANITIZE_CONFIG.ALLOWED_SCHEMES).toContain("http");
      expect(SANITIZE_CONFIG.ALLOWED_SCHEMES).toContain("https");
      expect(SANITIZE_CONFIG.ALLOWED_SCHEMES).toContain("mailto");
    });
  });
});
