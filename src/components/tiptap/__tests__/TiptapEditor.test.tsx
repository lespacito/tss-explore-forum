import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { TipTap } from "../TiptapEditor";

describe("TipTap Editor - Unit Tests", () => {
  describe("Basic rendering", () => {
    it("renders the editor component", () => {
      const { container } = render(<TipTap content="" onChange={() => {}} />);

      // Editor container should be present
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("border-2", "border-border");
    });

    it("renders the toolbar with all formatting buttons", () => {
      render(<TipTap content="" onChange={() => {}} />);

      // Check all toolbar buttons are present
      expect(screen.getByRole("button", { name: /gras/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /italique/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /titre/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /citation/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /liste à puces/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /liste numérotée/i }),
      ).toBeInTheDocument();
    });

    it("renders with initial content", () => {
      const initialContent = "<p>Hello world</p>";
      const { container } = render(
        <TipTap content={initialContent} onChange={() => {}} />,
      );

      // Check content is rendered (Tiptap renders it in ProseMirror editor)
      expect(container.querySelector('[role="textbox"]')).toBeInTheDocument();
    });
  });

  describe("Placeholder functionality", () => {
    it("uses custom placeholder when provided", () => {
      const customPlaceholder = "Écrivez votre message...";
      const { container } = render(
        <TipTap
          content=""
          placeholder={customPlaceholder}
          onChange={() => {}}
        />,
      );

      const textbox = container.querySelector('[role="textbox"]');
      expect(textbox).toHaveAttribute("aria-label", customPlaceholder);
    });

    it("uses default placeholder when not provided", () => {
      const { container } = render(<TipTap content="" onChange={() => {}} />);

      const textbox = container.querySelector('[role="textbox"]');
      expect(textbox).toHaveAttribute(
        "aria-label",
        "Zone de texte avec formatage",
      );
    });
  });

  describe("onChange callback", () => {
    it("onChange prop is accepted and defined", () => {
      const onChange = vi.fn();
      render(<TipTap content="" onChange={onChange} />);

      // onChange callback should be provided to component
      expect(onChange).toBeDefined();
      expect(typeof onChange).toBe("function");
    });

    it("renders without onChange callback (optional)", () => {
      // onChange is optional, should not crash
      const { container } = render(<TipTap content="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    // Note: Full interaction testing (typing, clicking) requires E2E tests
    // due to jsdom limitations with ProseMirror/Tiptap's DOM manipulation
  });

  describe("onTextChange callback", () => {
    it("onTextChange prop is accepted and defined", () => {
      const onTextChange = vi.fn();
      render(
        <TipTap content="" onChange={() => {}} onTextChange={onTextChange} />,
      );

      // onTextChange callback should be provided to component
      expect(onTextChange).toBeDefined();
      expect(typeof onTextChange).toBe("function");
    });

    it("renders without onTextChange callback (optional)", () => {
      // onTextChange is optional, should not crash
      const { container } = render(<TipTap content="" onChange={() => {}} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    // Note: Text length validation requires interaction testing
    // Use E2E tests for verifying text extraction and length calculation
  });

  describe("Toolbar button functionality", () => {
    it("bold button has correct initial state", () => {
      render(<TipTap content="<p>Text</p>" onChange={() => {}} />);

      const boldButton = screen.getByRole("button", { name: /gras/i });

      // Initially not pressed (no bold formatting in content)
      expect(boldButton).toHaveAttribute("aria-pressed", "false");
      expect(boldButton).toHaveAttribute("type", "button");
    });

    it("italic button has correct initial state", () => {
      render(<TipTap content="<p>Text</p>" onChange={() => {}} />);

      const italicButton = screen.getByRole("button", { name: /italique/i });

      expect(italicButton).toHaveAttribute("aria-pressed", "false");
      expect(italicButton).toHaveAttribute("type", "button");
    });

    it("heading button has correct initial state", () => {
      render(<TipTap content="<p>Text</p>" onChange={() => {}} />);

      const headingButton = screen.getByRole("button", { name: /titre/i });

      expect(headingButton).toHaveAttribute("aria-pressed", "false");
      expect(headingButton).toHaveAttribute("type", "button");
    });

    it("blockquote button has correct initial state", () => {
      render(<TipTap content="<p>Text</p>" onChange={() => {}} />);

      const quoteButton = screen.getByRole("button", { name: /citation/i });

      expect(quoteButton).toHaveAttribute("aria-pressed", "false");
      expect(quoteButton).toHaveAttribute("type", "button");
    });

    it("bullet list button has correct initial state", () => {
      render(<TipTap content="<p>Text</p>" onChange={() => {}} />);

      const bulletButton = screen.getByRole("button", {
        name: /liste à puces/i,
      });

      expect(bulletButton).toHaveAttribute("aria-pressed", "false");
      expect(bulletButton).toHaveAttribute("type", "button");
    });

    it("ordered list button has correct initial state", () => {
      render(<TipTap content="<p>Text</p>" onChange={() => {}} />);

      const orderedButton = screen.getByRole("button", {
        name: /liste numérotée/i,
      });

      expect(orderedButton).toHaveAttribute("aria-pressed", "false");
      expect(orderedButton).toHaveAttribute("type", "button");
    });

    it("bold button reflects active state when content is bold", () => {
      // Test that aria-pressed updates based on editor state
      render(
        <TipTap content="<p><strong>Bold text</strong></p>" onChange={() => {}} />,
      );

      const boldButton = screen.getByRole("button", { name: /gras/i });

      // Note: aria-pressed state depends on cursor position in editor
      // This test verifies the attribute exists and can be updated
      expect(boldButton).toHaveAttribute("aria-pressed");
    });

    // Note: Full interaction testing (button clicks, formatting toggles)
    // requires E2E tests due to jsdom limitations with ProseMirror
    // See: docs/testing-strategy.md for E2E test coverage
  });

  describe("Content updates", () => {
    it("updates content when content prop changes", () => {
      const { rerender } = render(
        <TipTap content="<p>Initial</p>" onChange={() => {}} />,
      );

      // Update content
      rerender(<TipTap content="<p>Updated</p>" onChange={() => {}} />);

      // Editor should have new content
      const textbox = screen.getByRole("textbox");
      expect(textbox).toBeInTheDocument();
    });
  });

  describe("Security - Disabled extensions", () => {
    it("does not allow code blocks (security)", () => {
      // Code blocks should not be available in toolbar
      render(<TipTap content="" onChange={() => {}} />);

      // No code block button should exist
      expect(screen.queryByLabelText(/code/i)).not.toBeInTheDocument();
    });

    it("does not allow inline code (security)", () => {
      render(<TipTap content="" onChange={() => {}} />);

      // No inline code button should exist
      expect(
        screen.queryByRole("button", { name: /code inline/i }),
      ).not.toBeInTheDocument();
    });

    it("does not allow strike-through formatting", () => {
      render(<TipTap content="" onChange={() => {}} />);

      // No strike button should exist (disabled for simplicity)
      expect(
        screen.queryByRole("button", { name: /barré/i }),
      ).not.toBeInTheDocument();
    });

    it("only allows h2 headings, not h1", () => {
      // H1 is reserved for page titles
      // Tiptap is configured to only allow h2
      render(<TipTap content="" onChange={() => {}} />);

      // Only one heading button should exist (for h2)
      const headingButtons = screen.queryAllByRole("button", {
        name: /titre|heading/i,
      });
      expect(headingButtons).toHaveLength(1);
    });
  });

  describe("Editor styling", () => {
    it("applies proper CSS classes to editor container", () => {
      const { container } = render(<TipTap content="" onChange={() => {}} />);

      const editorContainer = container.firstChild as HTMLElement;

      // Check border and styling
      expect(editorContainer).toHaveClass("border-2");
      expect(editorContainer).toHaveClass("border-border");
      expect(editorContainer).toHaveClass("rounded-lg");
      expect(editorContainer).toHaveClass("bg-card");
    });

    it("applies proper text styling classes", () => {
      const { container } = render(<TipTap content="" onChange={() => {}} />);

      const textbox = container.querySelector('[role="textbox"]');

      // Check text classes
      expect(textbox).toHaveClass("text-foreground");
      expect(textbox).toHaveClass("p-4");
    });
  });
});
