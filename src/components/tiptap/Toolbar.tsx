import { useCurrentEditor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  Heading2Icon,
  Quote,
} from "lucide-react";

export const Toolbar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        variant={editor.isActive("bold") ? "default" : "outline"}
        size="icon-sm"
        type="button"
        aria-label="Gras"
        title="Gras (Ctrl+B)"
      >
        <BoldIcon className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        variant={editor.isActive("italic") ? "default" : "outline"}
        size="icon-sm"
        type="button"
        aria-label="Italique"
        title="Italique (Ctrl+I)"
      >
        <ItalicIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        variant={
          editor.isActive("heading", { level: 2 }) ? "default" : "outline"
        }
        size="icon-sm"
        type="button"
        aria-label="Titre"
        title="Titre (Ctrl+Alt+2)"
      >
        <Heading2Icon className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        variant={editor.isActive("blockquote") ? "default" : "outline"}
        size="icon-sm"
        type="button"
        aria-label="Citation"
        title="Citation (Ctrl+Shift+B)"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive("bulletList") ? "default" : "outline"}
        size="icon-sm"
        type="button"
        aria-label="Liste à puces"
        title="Liste à puces"
      >
        <ListIcon className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive("orderedList") ? "default" : "outline"}
        size="icon-sm"
        type="button"
        aria-label="Liste numérotée"
        title="Liste numérotée"
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
