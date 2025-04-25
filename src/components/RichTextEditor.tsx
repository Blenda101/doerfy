import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useState, useEffect, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add a description',
        showOnlyWhenEditable: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      if (onBlur) onBlur();
    },
    onFocus: () => setIsFocused(true),
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[120px] w-full',
      },
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        if (editor) {
          editor.commands.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editor]);

  const handleToolbarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      ref={editorRef}
      className={`w-full transition-all duration-200 ${
        isFocused ? 'border rounded-md border-[#5036b0]' : 'border-none'
      }`}
      onClick={() => {
        if (!isFocused && editor) {
          editor.commands.focus();
        }
      }}
    >
      <div className={`${isFocused ? 'p-3' : 'p-0'}`}>
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none [&>div]:min-h-[120px]"
        />
      </div>
      {isFocused && (
        <div 
          className="border-t border-gray-200 p-2 bg-gray-50 flex gap-2"
          onClick={handleToolbarClick}
        >
          <button 
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('bold') ? 'bg-gray-200' : ''
            }`}
          >
            B
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('italic') ? 'bg-gray-200' : ''
            }`}
          >
            I
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
          >
            •
          </button>
        </div>
      )}
    </div>
  );
};