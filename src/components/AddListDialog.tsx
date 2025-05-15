import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ListIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../utils/supabaseClient";
import { toast } from "react-hot-toast";
import { List } from "../hooks/useLists";

interface AddListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: List) => void;
}

export const AddListDialog: React.FC<AddListDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<List>({
    id: crypto.randomUUID(),
    name: "",
    description: "",
    icon: "list",
    color: "gray",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!config.name.trim()) {
        toast.error("List name is required");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a list");
        return;
      }

      const { data, error } = await supabase
        .from("lists")
        .insert({
          name: config.name.trim(),
          description: config.description.trim(),
          icon: config.icon,
          color: config.color,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("A list with this name already exists");
        } else {
          throw error;
        }
        return;
      }

      onSave(data);
      onClose();
      toast.success("List created successfully");
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Failed to create list");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-[425px]",
          "dark:bg-slate-800 dark:border-slate-700",
        )}
      >
        <DialogHeader className="flex flex-row items-center gap-2">
          <ListIcon className="w-5 h-5 text-[#5036b0] dark:text-[#8B5CF6]" />
          <DialogTitle className="text-xl font-light dark:text-slate-200">
            Add List
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="dark:text-slate-200">
              Name
            </Label>
            <Input
              id="name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="Enter list name"
              required
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-slate-200">
              Description
            </Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              placeholder="Enter description"
              className="h-20 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!config.name.trim()}
              className="dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
