import React from "react";
import { Views, View } from "react-big-calendar";
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
    <div className="flex items-center justify-between mb-4">
      {/* Navigation Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toolbar.onNavigate("PREV")}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toolbar.onNavigate("NEXT")}
        >
          Next
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Title */}
      <h2
        className={cn(
          "text-xl font-semibold",
          theme === "dark" ? "text-white" : "text-gray-900",
        )}
      >
        {toolbar.label}
      </h2>

      {/* View Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant={view === Views.MONTH ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(Views.MONTH)}
        >
          Month
        </Button>
        <Button
          variant={view === Views.WEEK ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(Views.WEEK)}
        >
          Week
        </Button>
        <Button
          variant={view === Views.DAY ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(Views.DAY)}
        >
          Day
        </Button>
      </div>
    </div>
  );
};
