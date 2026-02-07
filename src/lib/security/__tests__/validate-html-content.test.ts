import { describe, it, expect } from "vitest";
import { validateHtmlContent, sanitizeClientSide } from "../validate-html-content";

describe("validateHtmlContent", () => {
  describe("Security - Dangerous patterns rejection", () => {
    it("should reject script tags", () => {
      const result = validateHtmlContent(
        '<p>Hello</p><script>alert("xss")</script>',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("n'est pas autorisé");
    });

    it("should reject script tags with attributes", () => {
      const result = validateHtmlContent(
        '<script type="text/javascript">alert("xss")</script>',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject javascript: protocol", () => {
      const result = validateHtmlContent(
        '<a href="javascript:alert(1)">Click</a>',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("n'est pas autorisé");
    });

    it("should reject data URI with HTML", () => {
      const result = validateHtmlContent(
        '<a href="data:text/html,<script>alert(1)</script>">Click</a>',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject iframe tags", () => {
      const result = validateHtmlContent(
        '<iframe src="https://evil.com"></iframe>',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("n'est pas autorisé");
    });

    it("should reject embed tags", () => {
      const result = validateHtmlContent('<embed src="malicious.swf">');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject object tags", () => {
      const result = validateHtmlContent('<object data="malicious.swf"></object>');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject event handlers (onclick)", () => {
      const result = validateHtmlContent(
        '<p onclick="alert(1)">Click me</p>',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("n'est pas autorisé");
    });

    it("should reject event handlers (onerror)", () => {
      const result = validateHtmlContent(
        '<img src="x" onerror="alert(1)">',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject img tags (not allowed in MVP)", () => {
      const result = validateHtmlContent(
        '<p>Hello</p><img src="photo.jpg" alt="Photo">',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("n'est pas autorisé");
    });

    it("should reject link tags", () => {
      const result = validateHtmlContent(
        '<link rel="stylesheet" href="malicious.css">',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject style tags", () => {
      const result = validateHtmlContent("<style>body { display: none; }</style>");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("n'est pas autorisé");
    });

    it("should reject meta tags", () => {
      const result = validateHtmlContent(
        '<meta http-equiv="refresh" content="0;url=evil.com">',
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Security - Valid content acceptance", () => {
    it("should accept valid bold text", () => {
      const result = validateHtmlContent("<p>This is <strong>bold</strong> text</p>");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid italic text", () => {
      const result = validateHtmlContent("<p>This is <em>italic</em> text</p>");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid bullet list", () => {
      const result = validateHtmlContent(
        "<ul><li>Item 1</li><li>Item 2</li></ul>",
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid ordered list", () => {
      const result = validateHtmlContent(
        "<ol><li>First</li><li>Second</li></ol>",
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid blockquote", () => {
      const result = validateHtmlContent(
        "<blockquote><p>This is a quote</p></blockquote>",
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid heading h2", () => {
      const result = validateHtmlContent("<h2>Section Title</h2><p>Content</p>");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept complex valid content", () => {
      const html = `
        <h2>Mon expérience</h2>
        <p>Voici ce qui s'est passé :</p>
        <ul>
          <li>Premier point avec <strong>emphase</strong></li>
          <li>Deuxième point avec <em>italique</em></li>
        </ul>
        <blockquote>
          <p>Une citation importante</p>
        </blockquote>
        <p>Conclusion finale.</p>
      `;
      const result = validateHtmlContent(html);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("Security - Nested structure protection", () => {
    it("should reject excessively nested HTML", () => {
      // Generate deeply nested HTML (potential DoS or obfuscation)
      let nestedHtml = "<p>";
      for (let i = 0; i < 600; i++) {
        nestedHtml += "<span>";
      }
      nestedHtml += "text";
      for (let i = 0; i < 600; i++) {
        nestedHtml += "</span>";
      }
      nestedHtml += "</p>";

      const result = validateHtmlContent(nestedHtml);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("trop complexe");
    });

    it("should accept reasonable nested HTML", () => {
      const html = `
        <ul>
          <li><strong>Bold</strong> in list</li>
          <li><em>Italic</em> in list</li>
          <li>
            <ul>
              <li>Nested list item</li>
            </ul>
          </li>
        </ul>
      `;
      const result = validateHtmlContent(html);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("Edge cases", () => {
    it("should accept empty content", () => {
      const result = validateHtmlContent("");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept plain text without HTML", () => {
      const result = validateHtmlContent("Plain text without any HTML");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should be case-insensitive for dangerous patterns", () => {
      const result = validateHtmlContent('<SCRIPT>alert("XSS")</SCRIPT>');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe("sanitizeClientSide", () => {
  it("should remove script tags", () => {
    const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    const output = sanitizeClientSide(input);
    expect(output).not.toContain("<script");
    expect(output).not.toContain("alert");
    expect(output).toContain("<p>Hello</p>");
    expect(output).toContain("<p>World</p>");
  });

  it("should remove event handlers", () => {
    const input = '<p onclick="alert(1)">Click me</p>';
    const output = sanitizeClientSide(input);
    expect(output).not.toContain("onclick");
    expect(output).toContain("<p>Click me</p>");
  });

  it("should remove javascript: protocols", () => {
    const input = '<a href="javascript:alert(1)">Link</a>';
    const output = sanitizeClientSide(input);
    expect(output).not.toContain("javascript:");
  });

  it("should preserve safe HTML", () => {
    const input = "<p>Text with <strong>bold</strong> and <em>italic</em></p>";
    const output = sanitizeClientSide(input);
    expect(output).toBe(input);
  });
});
