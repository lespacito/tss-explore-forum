import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { Toolbar } from "./Toolbar";

const editorClasses = cn(
  // Base styles
  "p-4 min-h-50 focus:outline-none text-foreground leading-7",
  // Blockquote styles
  "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4",
  "[&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  // Heading styles
  "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground",
  // List styles
  "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4",
  "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4",
  "[&_li]:my-1",
  // Paragraph styles
  "[&_p]:my-3",
  // Placeholder styles
  "[&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
  "[&_.is-editor-empty]:before:text-muted-foreground",
  "[&_.is-editor-empty]:before:float-left",
  "[&_.is-editor-empty]:before:h-0",
  "[&_.is-editor-empty]:before:pointer-events-none",
);

interface TipTapProps {
  content: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  onTextChange?: (text: string, length: number) => void;
}

export const TipTap = ({
  content,
  placeholder,
  onChange,
  onTextChange,
}: TipTapProps) => {
  // Security: Configure StarterKit with only safe extensions
  // Disabled for security: CodeBlock, Code (code injection risk)
  // Disabled for simplicity: Strike, HorizontalRule (not needed for trauma-informed design)
  const extensions = [
    StarterKit.configure({
      // Disable dangerous extensions
      codeBlock: false, // ❌ Can inject code blocks
      code: false, // ❌ Can inject inline code
      // Disable unnecessary extensions
      strike: false, // Not needed for MVP
      horizontalRule: false, // Not needed for MVP
      // Configure heading to only allow h2
      heading: {
        levels: [2], // Only h2 (h1 reserved for page titles)
      },
      // Keep other safe extensions enabled (default behavior)
      // bold, italic, bulletList, orderedList, listItem, blockquote,
      // paragraph, hardBreak, history are enabled by default
    }),
    Placeholder.configure({
      placeholder: placeholder || "Commencez à écrire...",
    }),
  ];

  return (
    <div className="border-2 border-border rounded-lg bg-card overflow-hidden">
      <EditorProvider
        immediatelyRender={false}
        slotBefore={<Toolbar />}
        extensions={extensions}
        content={content}
        onUpdate={({ editor }) => {
          const html = editor.getHTML();
          const text = editor.getText();
          onChange?.(html);
          onTextChange?.(text, text.length);
        }}
        editorProps={{
          attributes: {
            class: editorClasses,
            role: "textbox",
            "aria-label": placeholder || "Zone de texte avec formatage",
            "aria-multiline": "true",
          },
        }}
      >
        <></>
      </EditorProvider>
    </div>
  );
};
