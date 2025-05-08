import React from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";

// Props interface for the Sheet component
interface SheetProps {
  /**
   * Title to be displayed in the header
   */
  title: string;

  /**
   * Icon component to be displayed before the title
   */
  icon: React.ReactNode;

  /**
   * Function to be called when the sheet is closed
   */
  onClose: () => void;

  /**
   * Theme for styling (light/dark)
   */
  theme?: Theme;

  /**
   * Additional actions to be displayed in the header (optional)
   */
  headerActions?: React.ReactNode;

  /**
   * Content to be rendered inside the sheet
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes for the sheet container (optional)
   */
  className?: string;
}

/**
 * A reusable sheet component that provides a consistent layout and styling
 * for property sheets, sidebars, and similar UI elements.
 */
export const Sheet: React.FC<SheetProps> = ({
  title,
  icon,
  onClose,
  theme = "light",
  headerActions,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "min-w-[520px] w-[520px] h-screen flex flex-col border-l",
        theme === "dark" ? "bg-[#1E293B]" : "bg-white",
        className,
      )}
    >
      {/* Header section with title, icon, and actions */}
      <div
        className={cn(
          "h-16 flex items-center px-6 border-b shrink-0",
          theme === "dark" ? "border-[#334155]" : "border-gray-200",
        )}
      >
        <div
          className={cn(
            "mr-2",
            theme === "dark" ? "text-[#8B5CF6]" : "text-[#5036b0]",
          )}
        >
          {icon}
        </div>

        <h2
          className={cn(
            "text-xl font-light flex-1",
            theme === "dark" ? "text-gray-300" : "text-gray-600",
          )}
        >
          {title}
        </h2>

        {/* Optional header actions */}
        {headerActions}

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content section with proper scrolling */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 space-y-6 ">{children}</div>
      </div>
    </div>
  );
};
