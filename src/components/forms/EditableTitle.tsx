import React, { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Theme } from "../../utils/theme";

interface EditableTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  theme?: Theme;
  className?: string;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  title = "",
  onTitleChange,
  theme = "light",
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleSave = () => {
    const trimmedTitle = titleValue.trim();
    if (!trimmedTitle) {
      setTitleValue(title);
      setIsEditing(false);
      return;
    }

    if (trimmedTitle !== title) {
      onTitleChange(trimmedTitle);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setTitleValue(title);
      setIsEditing(false);
    }
  };

  return (
    <div className={className}>
      {isEditing ? (
        <Input
          ref={titleInputRef}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          onBlur={handleTitleSave}
          className={cn(
            "text-[21px] font-medium",
            theme === "dark"
              ? "bg-slate-700 border-slate-600 text-white"
              : "bg-white",
          )}
        />
      ) : (
        <h1
          className={cn(
            "text-[21px] font-medium cursor-text",
            theme === "dark" ? "text-white" : "text-gray-900",
          )}
          onClick={() => setIsEditing(true)}
        >
          {title}
        </h1>
      )}
    </div>
  );
};
