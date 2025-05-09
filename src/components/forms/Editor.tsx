import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import React, { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListTodo,
  Code,
  Highlighter,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { common, createLowlight } from "lowlight";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const lowlight = createLowlight(common);

export interface EditorConfig {
  placeholder?: string;
  autofocus?: boolean;
  editable?: boolean;
}

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
  config?: EditorConfig;
  theme?: "light" | "dark";
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  onBlur,
  config = {},
  theme = "light",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: config.placeholder || "Start writing...",
        showOnlyWhenEditable: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: theme === "dark" ? "text-blue-400" : "text-blue-600",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
    ],
    editable: config.editable !== false,
    autofocus: config.autofocus || false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      if (onBlur) onBlur();
      // setIsFocused(false);
    },
    onFocus: () => setIsFocused(true),
  });

  useEffect(() => {
    editor?.commands.setContent(content);
  }, [content]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!editorRef.current) return;

      const target = event.target as HTMLElement;

      // Check if the click is inside the editor
      const isEditorClick = editorRef.current.contains(target);

      // Check for all possible editor-related elements
      const isEditorElement =
        target.closest(".ProseMirror") || // Editor content
        target.closest("[data-tippy-root]") || // Tooltips
        target.closest("button") || // Buttons
        target.closest("input") || // Input fields
        target.closest("select") || // Select dropdowns
        target.closest('[contenteditable="true"]') || // Editable content
        target.closest(".tiptap-menu-item"); // Any custom menu items

      if (!isEditorClick && !isEditorElement) {
        setIsFocused(false);
        setShowLinkInput(false);
        if (editor) {
          editor.commands.blur();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editor]);

  const handleToolbarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Here you would typically upload the image to your storage
      // For now, we'll use a data URL as a placeholder
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && editor) {
          editor
            .chain()
            .focus()
            .setImage({ src: e.target.result as string })
            .run();
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div
      ref={editorRef}
      className={cn(
        "w-full transition-all duration-200 border rounded-md overflow-hidden",
        isFocused ? "border-[#5036b0] dark:border-[#8B5CF6]" : "",
      )}
      onClick={() => {
        if (!isFocused && editor) {
          editor.commands.focus();
        }
      }}
    >
      <EditorContent
        editor={editor}
        className="editor"
        style={{ height: 120 }}
      />
      <div
        className={cn(
          "sticky top-0 z-10",
          isFocused ? "opacity-100" : "opacity-0",
          "transition-opacity duration-200 overflow-hidden",
        )}
      >
        <div
          className={cn(
            "flex flex-wrap gap-1 p-2 border-b",
            theme === "dark"
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200",
          )}
          onClick={handleToolbarClick}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("bold") && "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("italic") && "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("heading", { level: 1 }) &&
                "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <Heading1 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("heading", { level: 2 }) &&
                "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("bulletList") && "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("taskList") && "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <ListTodo className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("codeBlock") && "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <Code className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("highlight") && "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <Highlighter className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={cn(
              "p-1 h-8 w-8",
              editor.isActive("link") && "bg-gray-200 dark:bg-slate-700",
            )}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              };
              input.click();
            }}
            className="p-1 h-8 w-8"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="flex-grow" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1 h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1 h-8 w-8"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {showLinkInput && (
          <div
            className={cn(
              "flex items-center gap-2 p-2 border-b",
              theme === "dark"
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200",
            )}
          >
            <input
              type="text"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className={cn(
                "flex-1 px-2 py-1 text-sm rounded border",
                theme === "dark"
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-gray-300",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (linkUrl) {
                    editor.chain().focus().setLink({ href: linkUrl }).run();
                    setLinkUrl("");
                    setShowLinkInput(false);
                  }
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (linkUrl) {
                  editor.chain().focus().setLink({ href: linkUrl }).run();
                  setLinkUrl("");
                  setShowLinkInput(false);
                }
              }}
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLinkUrl("");
                setShowLinkInput(false);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
