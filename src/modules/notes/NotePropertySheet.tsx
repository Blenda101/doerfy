import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { LabelEditor } from "../../components/LabelEditor";
import { Note, Notebook, NoteWithAuthor } from "../../types/note";
import { Theme } from "../../utils/theme";
import { InfoIcon, Lock, Unlock, Share2 } from "lucide-react";
import { colorVariants } from "../../data/map";
import { Editor } from "../../components/forms/Editor";
import { Sheet } from "../../components/Sheet";
import { cn } from "../../lib/utils";
import { EditableTitle } from "../../components/forms/EditableTitle";

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

  // Header actions for the Sheet component
  const headerActions = (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-full flex items-center justify-center"
    >
      <Share2 className="h-5 w-5 mr-2" />
    </Button>
  );

  return (
    <Sheet
      title="About Note"
      icon={<InfoIcon className="w-5 h-5" />}
      onClose={onClose}
      theme={theme}
      headerActions={headerActions}
    >
      {/* Note Title */}
      <EditableTitle
        title={item.title}
        onTitleChange={(title) => onUpdate({ ...item, title })}
        theme={theme}
      />

      {/* Note Description */}
      <div className="w-full">
        <Label className="dark:text-slate-200 mb-2">Description</Label>
        <Editor
          content={item.content}
          onChange={(content) => onUpdate({ ...item, content })}
          theme={theme}
          config={{
            placeholder: "Start writing...",
            autofocus: true,
          }}
        />
      </div>

      {/* Notebook Selection */}
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

      {/* Color Theme Selection */}
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

      {/* Labels */}
      <div>
        <LabelEditor labels={item.labels} onChange={handleLabelsChange} />
      </div>

      {/* Protection Settings */}
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
    </Sheet>
  );
};
