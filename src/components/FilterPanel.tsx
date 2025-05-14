import React from "react";
import { Button } from "./ui/button";
import { EditableProperty } from "./EditableProperty";
import { LabelEditor } from "./LabelEditor";
import DatePicker from "react-datepicker";
import { X, User } from "lucide-react";
import { useFilterStore, FilterCriteria } from "../store/filterStore";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";

interface FilterPanelProps {
  onClose: () => void;
  view: "timebox" | "lists" | "calendar";
  theme?: Theme;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onClose,
  view,
  theme = "light",
}) => {
  const { filters, setFilter, clearFilter } = useFilterStore();
  const currentFilters = filters[view];

  return (
    <div
      className={cn(
        "w-[400px] h-screen flex flex-col",
        theme === "dark" ? "bg-[#1E293B]" : "bg-white",
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center px-6 border-b",
          theme === "dark" ? "border-[#334155]" : "border-gray-200",
        )}
      >
        <h2
          className={cn(
            "text-xl font-light flex-1",
            theme === "dark" ? "text-gray-300" : "text-gray-600",
          )}
        >
          Filters
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 mt-6">
        <EditableProperty
          label="Assignee"
          value={currentFilters.assignee || "All"}
          icon={<User className="w-5 h-5" />}
          options={["All", "Me", "Unassigned"]}
          onChange={(value) =>
            setFilter(view, {
              assignee: value === "All" ? undefined : value,
            })
          }
        />

        <EditableProperty
          label="Time Stage"
          value={currentFilters.timeStage?.join(", ") || "All"}
          options={["Queue", "Do", "Doing", "Today", "Done"]}
          onChange={(value) => {
            const stages = value === "All" ? undefined : [value.toLowerCase()];
            setFilter(view, { timeStage: stages });
          }}
        />

        <EditableProperty
          label="Priority"
          value={currentFilters.priority?.join(", ") || "All"}
          options={["All", "High", "Medium", "Low"]}
          onChange={(value) => {
            const priorities =
              value === "All" ? undefined : [value.toLowerCase()];
            setFilter(view, { priority: priorities });
          }}
        />

        <EditableProperty
          label="Energy"
          value={currentFilters.energy?.join(", ") || "All"}
          options={["All", "High", "Medium", "Low"]}
          onChange={(value) => {
            const energies =
              value === "All" ? undefined : [value.toLowerCase()];
            setFilter(view, { energy: energies });
          }}
        />

        <EditableProperty
          label="Location"
          value={currentFilters.location || "All"}
          options={["All", "Home", "Office", "Outside"]}
          onChange={(value) =>
            setFilter(view, {
              location: value === "All" ? undefined : value,
            })
          }
        />

        <EditableProperty
          label="Story"
          value={currentFilters.story || "All"}
          options={[
            "All",
            "Brazil Vacation",
            "Home Renovation",
            "Career Goals",
          ]}
          onChange={(value) =>
            setFilter(view, {
              story: value === "All" ? undefined : value,
            })
          }
        />
      </div>
      <div className="px-6">
        <div className="space-y-2 mt-4">
          <LabelEditor
            labels={currentFilters.labels || []}
            onChange={(labels) =>
              setFilter(view, { labels: labels.length ? labels : undefined })
            }
          />
        </div>

        <div className="space-y-2 mt-4 mb-4">
          <label
            className={cn(
              "block text-sm font-medium",
              theme === "dark" ? "text-gray-300" : "text-gray-700",
            )}
          >
            Due Date
          </label>
          <DatePicker
            selected={currentFilters.dueDate}
            onChange={(date) => setFilter(view, { dueDate: date })}
            isClearable
            placeholderText="Select a date"
            className={cn(
              "w-full px-3 py-2 border rounded-md",
              theme === "dark"
                ? "bg-slate-700 border-slate-600 text-white"
                : "bg-white border-gray-300",
            )}
          />
        </div>
      </div>
      <div
        className={cn(
          "p-6 border-t",
          theme === "dark" ? "border-[#334155]" : "border-gray-200",
        )}
      >
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            Object.keys(currentFilters).forEach((key) => {
              clearFilter(view, key as keyof FilterCriteria);
            });
          }}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};
