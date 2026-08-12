import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { SafeHtmlDisplay } from "../SafeHtmlDisplay";

describe("SafeHtmlDisplay", () => {
	describe("Basic rendering", () => {
		it("renders simple paragraph HTML", () => {
			const html = "<p>Hello world</p>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.querySelector("p")).toBeInTheDocument();
			expect(screen.getByText("Hello world")).toBeInTheDocument();
		});

		it("renders multiple paragraphs", () => {
			const html = "<p>First paragraph</p><p>Second paragraph</p>";
			render(<SafeHtmlDisplay html={html} />);

			expect(screen.getByText("First paragraph")).toBeInTheDocument();
			expect(screen.getByText("Second paragraph")).toBeInTheDocument();
		});
	});

	describe("Formatting elements", () => {
		it("renders bold text", () => {
			const html = "<p>This is <strong>bold</strong> text</p>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const strong = container.querySelector("strong");
			expect(strong).toBeInTheDocument();
			expect(strong?.textContent).toBe("bold");
		});

		it("renders italic text", () => {
			const html = "<p>This is <em>italic</em> text</p>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const em = container.querySelector("em");
			expect(em).toBeInTheDocument();
			expect(em?.textContent).toBe("italic");
		});

		it("renders bold and italic together", () => {
			const html = "<p><strong><em>Bold and italic</em></strong></p>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.querySelector("strong em")).toBeInTheDocument();
			expect(screen.getByText("Bold and italic")).toBeInTheDocument();
		});
	});

	describe("Headings", () => {
		it("renders h2 headings", () => {
			const html = "<h2>Section Title</h2>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const h2 = container.querySelector("h2");
			expect(h2).toBeInTheDocument();
			expect(h2?.textContent).toBe("Section Title");
		});

		it("renders h3 headings", () => {
			const html = "<h3>Subsection Title</h3>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const h3 = container.querySelector("h3");
			expect(h3).toBeInTheDocument();
			expect(h3?.textContent).toBe("Subsection Title");
		});

		it("does not render h1 headings (should be sanitized)", () => {
			const html = "<h1>This should not render</h1><p>Safe content</p>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.querySelector("h1")).not.toBeInTheDocument();
			expect(screen.getByText("Safe content")).toBeInTheDocument();
		});
	});

	describe("Lists", () => {
		it("renders unordered lists", () => {
			const html = "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const ul = container.querySelector("ul");
			expect(ul).toBeInTheDocument();
			expect(container.querySelectorAll("li")).toHaveLength(3);
			expect(screen.getByText("Item 1")).toBeInTheDocument();
			expect(screen.getByText("Item 2")).toBeInTheDocument();
			expect(screen.getByText("Item 3")).toBeInTheDocument();
		});

		it("renders ordered lists", () => {
			const html = "<ol><li>First</li><li>Second</li><li>Third</li></ol>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const ol = container.querySelector("ol");
			expect(ol).toBeInTheDocument();
			expect(container.querySelectorAll("li")).toHaveLength(3);
		});

		it("renders nested lists", () => {
			const html =
				"<ul><li>Parent<ul><li>Child 1</li><li>Child 2</li></ul></li></ul>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.querySelectorAll("ul")).toHaveLength(2);
			expect(screen.getByText("Parent")).toBeInTheDocument();
			expect(screen.getByText("Child 1")).toBeInTheDocument();
		});
	});

	describe("Blockquotes", () => {
		it("renders blockquote elements", () => {
			const html = "<blockquote>This is a quote</blockquote>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const blockquote = container.querySelector("blockquote");
			expect(blockquote).toBeInTheDocument();
			expect(blockquote?.textContent).toBe("This is a quote");
		});

		it("renders blockquote with paragraph", () => {
			const html = "<blockquote><p>Quote with paragraph</p></blockquote>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const blockquote = container.querySelector("blockquote");
			expect(blockquote).toBeInTheDocument();
			expect(blockquote?.querySelector("p")).toBeInTheDocument();
		});
	});

	describe("Security - XSS Protection", () => {
		it("removes script tags", () => {
			const html = '<p>Safe text</p><script>alert("XSS")</script>';
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.querySelector("script")).not.toBeInTheDocument();
			expect(screen.getByText("Safe text")).toBeInTheDocument();
		});

		it("removes iframe tags", () => {
			const html = '<p>Safe</p><iframe src="http://evil.com"></iframe>';
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.querySelector("iframe")).not.toBeInTheDocument();
		});

		it("removes onclick handlers", () => {
			const html = "<p onclick=\"alert('XSS')\">Click me</p>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const p = container.querySelector("p");
			expect(p).toBeInTheDocument();
			expect(p?.getAttribute("onclick")).toBeNull();
		});

		it("removes javascript: URLs", () => {
			const html = "<a href=\"javascript:alert('XSS')\">Link</a>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			// Links are disabled by default in ALLOWED_TAGS
			expect(container.querySelector("a")).not.toBeInTheDocument();
		});

		it("removes style tags", () => {
			const html = "<style>body { display: none; }</style><p>Content</p>";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.querySelector("style")).not.toBeInTheDocument();
		});

		it("removes inline styles", () => {
			const html = '<p style="color: red;">Styled text</p>';
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const p = container.querySelector("p");
			expect(p).toBeInTheDocument();
			expect(p?.getAttribute("style")).toBeNull();
		});

		it("removes onerror handlers", () => {
			const html = '<img src="x" onerror="alert(\'XSS\')" /><p>Text</p>';
			const { container } = render(<SafeHtmlDisplay html={html} />);

			// img tags are not allowed
			expect(container.querySelector("img")).not.toBeInTheDocument();
		});

		it("removes data attributes", () => {
			const html = '<p data-evil="payload">Text</p>';
			const { container } = render(<SafeHtmlDisplay html={html} />);

			const p = container.querySelector("p");
			expect(p).toBeInTheDocument();
			expect(p?.getAttribute("data-evil")).toBeNull();
		});
	});

	describe("Complex content", () => {
		it("renders mixed content with multiple formatting", () => {
			const html = `
        <h2>Title</h2>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
        <ul>
          <li>List item</li>
          <li>Another item</li>
        </ul>
        <blockquote>A quote</blockquote>
      `;
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.querySelector("h2")).toBeInTheDocument();
			expect(container.querySelector("strong")).toBeInTheDocument();
			expect(container.querySelector("em")).toBeInTheDocument();
			expect(container.querySelector("ul")).toBeInTheDocument();
			expect(container.querySelector("blockquote")).toBeInTheDocument();
		});

		it("handles empty content gracefully", () => {
			const html = "";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.firstChild).toBeInTheDocument();
		});

		it("handles whitespace-only content", () => {
			const html = "   ";
			const { container } = render(<SafeHtmlDisplay html={html} />);

			expect(container.firstChild).toBeInTheDocument();
		});
	});

	describe("Custom className", () => {
		it("applies custom className", () => {
			const html = "<p>Test</p>";
			const { container } = render(
				<SafeHtmlDisplay html={html} className="custom-class" />,
			);

			const div = container.firstChild;
			expect(div).toHaveClass("custom-class");
		});

		it("merges custom className with default classes", () => {
			const html = "<p>Test</p>";
			const { container } = render(
				<SafeHtmlDisplay html={html} className="text-lg" />,
			);

			const div = container.firstChild as HTMLElement;
			expect(div.className).toContain("text-lg");
			expect(div.className).toContain("text-foreground"); // default class
		});
	});

	describe("Accessibility", () => {
		it("renders semantic HTML", () => {
			const html = `
        <h2>Heading</h2>
        <p>Paragraph</p>
        <ul><li>List item</li></ul>
      `;
			const { container } = render(<SafeHtmlDisplay html={html} />);

			// Check semantic structure
			expect(container.querySelector("h2")).toBeInTheDocument();
			expect(container.querySelector("p")).toBeInTheDocument();
			expect(container.querySelector("ul")).toBeInTheDocument();
			expect(container.querySelector("li")).toBeInTheDocument();
		});
	});
});
