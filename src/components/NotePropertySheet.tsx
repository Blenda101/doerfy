import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { LabelEditor } from "./LabelEditor";
import { Note, Notebook, NoteWithAuthor } from "../types/note";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import {
  X,
  Lock,
  Unlock,
  StickyNote,
  InfoIcon,
  ShareIcon,
  Share2,
} from "lucide-react";
import { NoteEditor } from "./NoteEditor";
import { colorVariants } from "../data/map";

interface NotePropertySheetProps {
  item: NoteWithAuthor;
  onClose: () => void;
  onUpdate: (item: NoteWithAuthor) => void;
  theme?: Theme;
  notebooks?: Notebook[];
}

export const NotePropertySheet: React.FC<NotePropertySheetProps> = ({
  item,
  onClose,
  onUpdate,
  theme = "light",
  notebooks = [],
}) => {
  const [isProtected, setIsProtected] = useState(item.is_protected);
  const [pinHash, setPinHash] = useState(item.pin_hash || "");

  const handleColorThemeChange = (color: Note["color_theme"]) => {
    onUpdate({ ...item, color_theme: color });
  };

  const handleLabelsChange = (labels: string[]) => {
    onUpdate({ ...item, labels });
  };

  const handleProtectionChange = (enabled: boolean) => {
    setIsProtected(enabled);
    if (!enabled) {
      setPinHash("");
      onUpdate({ ...item, is_protected: false, pin_hash: null });
    }
  };

  const handlePinChange = (pin: string) => {
    setPinHash(pin);
    if (pin) {
      onUpdate({ ...item, is_protected: true, pin_hash: pin });
    }
  };

  const handleNotebookChange = (notebookId: string | null) => {
    if ("notebook_id" in item) {
      onUpdate({ ...item, notebook_id: notebookId });
    }
  };

  return (
    <div
      className={cn(
        "min-w-[500px] h-screen flex flex-col border-l",
        theme === "dark" ? "bg-[#1E293B]" : "bg-white",
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center px-6 border-b",
          theme === "dark" ? "border-[#334155]" : "border-gray-200",
        )}
      >
        <InfoIcon
          className={cn(
            "w-5 h-5 mr-2",
            theme === "dark" ? "text-[#8B5CF6]" : "text-[#5036b0]",
          )}
        />
        <h2
          className={cn(
            "text-xl font-light flex-1",
            theme === "dark" ? "text-gray-300" : "text-gray-600",
          )}
        >
          About Note
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full flex items-center justify-center"
        >
          <Share2 className="h-5 w-5 mr-2" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <Label className="dark:text-slate-200">Title</Label>
          {/* <Input
            value={item.title}
            onChange={(e) => onUpdate({ ...item, title: e.target.value })}
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          /> */}
          <Input
            disabled={false}
            value={item.title}
            onChange={(e) => onUpdate({ ...item, title: e.target.value })}
            autoFocus
            className={cn(
              "text-xl font-semibold mb-6 border-none p-0 focus-visible:ring-0 w-full",
              theme === "dark" && "bg-transparent text-white",
            )}
            placeholder="Untitled Note"
          />
        </div>
        <div className="w-full">
          <Label className="dark:text-slate-200">Description</Label>

          <NoteEditor
            content={item.content}
            onChange={(content) => onUpdate({ ...item, content })}
            theme={theme}
            config={{
              placeholder: "Start writing...",
              autofocus: true,
            }}
          />
        </div>

        {"notebook_id" in item && notebooks.length > 0 && (
          <div>
            <Label className="dark:text-slate-200">Notebook</Label>
            <select
              value={item.notebook_id || ""}
              onChange={(e) => handleNotebookChange(e.target.value || null)}
              className={cn(
                "w-full mt-1 rounded-md border p-2",
                theme === "dark"
                  ? "bg-slate-700 border-slate-600 text-slate-200"
                  : "bg-white border-gray-300",
              )}
            >
              <option value="">No Notebook</option>
              {notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Label className="dark:text-slate-200">Color Theme</Label>
          <div className="flex flex-wrap gap-4 mt-2">
            {Object.keys(colorVariants).map((color) => (
              <button
                key={color}
                onClick={() =>
                  handleColorThemeChange(color as Note["color_theme"])
                }
                className={cn(
                  "w-8 h-8 rounded-full",
                  colorVariants[color as Note["color_theme"]],
                  item.color_theme === color &&
                    "ring-2 ring-offset-2 ring-purple-500",
                )}
              />
            ))}
          </div>
        </div>

        <div>
          <LabelEditor labels={item.labels} onChange={handleLabelsChange} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isProtected ? (
                <Lock className="w-4 h-4 text-purple-500" />
              ) : (
                <Unlock className="w-4 h-4 text-gray-400" />
              )}
              <Label className="dark:text-slate-200">Protection</Label>
            </div>
            <Switch
              checked={isProtected}
              onCheckedChange={handleProtectionChange}
            />
          </div>

          {isProtected && (
            <div>
              <Label className="dark:text-slate-200">PIN</Label>
              <Input
                type="password"
                value={pinHash}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="Enter PIN"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
