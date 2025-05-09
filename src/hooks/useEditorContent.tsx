import { generateHTML, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useMemo } from "react";
import { createLowlight, common } from "lowlight";
import { Theme } from "../utils/theme";
const lowlight = createLowlight(common);

const useEditorContent = (content: string | null | undefined, theme: Theme) => {
  const output = useMemo(() => {
    if (!content) return "";
    try {
      const result = JSON.parse(content);
      return generateHTML(result, [
        StarterKit,
        Placeholder,
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
      ]);
    } catch (e) {
      return content;
    }
  }, [content]);

  return output;
};

export default useEditorContent;
