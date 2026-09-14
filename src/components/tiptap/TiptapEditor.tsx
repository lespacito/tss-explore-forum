import Placeholder from "@tiptap/extension-placeholder";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Toolbar } from "./Toolbar";

const editorClasses = cn(
	// Base styles
	"p-4 min-h-50 focus:outline-none text-foreground leading-7",
	// Blockquote styles
	"[&_blockquote]:border-l [&_blockquote]:border-primary [&_blockquote]:pl-4",
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
	// Placeholder styles
	"[&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
	"[&_.is-editor-empty]:before:text-muted-foreground",
	"[&_.is-editor-empty]:before:float-left",
	"[&_.is-editor-empty]:before:h-0",
	"[&_.is-editor-empty]:before:pointer-events-none",
);

interface TipTapProps {
	content: string;
	id?: string;
	placeholder?: string;
	ariaDescribedBy?: string;
	ariaInvalid?: boolean;
	onChange?: (html: string) => void;
	onTextChange?: (text: string, length: number) => void;
}

export const TipTap = ({
	content,
	id,
	placeholder,
	ariaDescribedBy,
	ariaInvalid = false,
	onChange,
	onTextChange,
}: TipTapProps) => {
	// Security: Configure StarterKit with only safe extensions
	// Disabled for security: CodeBlock, Code (code injection risk)
	// Private-beta preset: only bold, italic and bullet lists are authorable.
	const extensions = [
		StarterKit.configure({
			codeBlock: false,
			code: false,
			strike: false,
			horizontalRule: false,
			heading: false,
			blockquote: false,
			orderedList: false,
		}),
		Placeholder.configure({
			placeholder: placeholder || "Commencez à écrire...",
		}),
	];

	return (
		<div className="overflow-hidden rounded-xl border bg-card focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/20">
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
						...(id ? { id } : {}),
						role: "textbox",
						"aria-label": placeholder || "Zone de texte avec formatage",
						...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
						"aria-invalid": String(ariaInvalid),
						"aria-multiline": "true",
					},
				}}
			>
				<EditorContentSync content={content} onTextChange={onTextChange} />
			</EditorProvider>
		</div>
	);
};

function EditorContentSync({
	content,
	onTextChange,
}: Pick<TipTapProps, "content" | "onTextChange">) {
	const { editor } = useCurrentEditor();
	useEffect(() => {
		if (!editor || editor.isDestroyed) return;
		if (editor.getHTML() !== content) {
			editor.commands.setContent(content, { emitUpdate: false });
			const text = editor.getText();
			onTextChange?.(text, text.length);
		}
	}, [editor, content, onTextChange]);
	return null;
}
