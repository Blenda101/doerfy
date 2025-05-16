import React from "react";
import { Views } from "react-big-calendar";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";
import { ToolbarProps } from "../types";

/**
 * CustomToolbar component provides navigation and view controls for the calendar
 * Includes Previous/Next/Today buttons and Month/Week/Day view toggles
 */
export const CustomToolbar: React.FC<ToolbarProps> = ({
  toolbar,
  view,
  onViewChange,
  theme,
}) => {
  const goToToday = () => {
    toolbar.onNavigate("TODAY");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toolbar.onNavigate("PREV")}
          className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toolbar.onNavigate("NEXT")}
          className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Today
        </Button>
      </div>

      {/* Calendar Title */}
      <h2
        className={cn(
          "text-xl font-semibold tracking-tight",
          theme === "dark" ? "text-white" : "text-gray-900",
        )}
      >
        {toolbar.label}
      </h2>

      {/* View Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={view === Views.MONTH ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(Views.MONTH)}
          className={cn(
            "transition-colors",
            view === Views.MONTH
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-700",
          )}
        >
          Month
        </Button>
        <Button
          variant={view === Views.WEEK ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(Views.WEEK)}
          className={cn(
            "transition-colors",
            view === Views.WEEK
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-700",
          )}
        >
          Week
        </Button>
        <Button
          variant={view === Views.DAY ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(Views.DAY)}
          className={cn(
            "transition-colors",
            view === Views.DAY
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-700",
          )}
        >
          Day
        </Button>
      </div>
    </div>
  );
};
