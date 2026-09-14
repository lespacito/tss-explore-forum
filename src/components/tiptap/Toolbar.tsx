import { useCurrentEditor } from "@tiptap/react";
import { BoldIcon, ItalicIcon, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Toolbar = () => {
	const { editor } = useCurrentEditor();

	if (!editor) {
		return null;
	}

	return (
		<div
			role="toolbar"
			aria-label="Outils de formatage de texte"
			className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30"
		>
			<Button
				onClick={() => editor.chain().focus().toggleBold().run()}
				variant={editor.isActive("bold") ? "default" : "outline"}
				size="icon"
				type="button"
				aria-label="Gras"
				aria-pressed={editor.isActive("bold")}
				title="Gras (Ctrl+B)"
			>
				<BoldIcon className="h-4 w-4" />
			</Button>

			<Button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				variant={editor.isActive("italic") ? "default" : "outline"}
				size="icon"
				type="button"
				aria-label="Italique"
				aria-pressed={editor.isActive("italic")}
				title="Italique (Ctrl+I)"
			>
				<ItalicIcon className="h-4 w-4" />
			</Button>

			<div className="w-px h-6 bg-border mx-1" />

			<Button
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				variant={editor.isActive("bulletList") ? "default" : "outline"}
				size="icon"
				type="button"
				aria-label="Liste à puces"
				aria-pressed={editor.isActive("bulletList")}
				title="Liste à puces"
			>
				<ListIcon className="h-4 w-4" />
			</Button>
		</div>
	);
};
