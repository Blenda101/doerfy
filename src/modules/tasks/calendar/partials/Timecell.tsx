import { useState } from "react";
import { Input } from "../../../../components/ui/input";
import { cn } from "../../../../lib/utils";

export const Timecell: React.FC<any> = ({
  open,
  createTask,
  start,
  end,
  position,
  onClose,
}) => {
  const [task, setTask] = useState<NewTaskState>({
    title: "",
    start: start,
    end: end,
  });

  const onSubmit = async () => {
    if (!task.date || !task.title) return;
    try {
      await createTask(task.title, task.date);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  if (!open) return null;

  return (
    <div
      className="z-50 w-64 rounded-md border bg-white p-1 text-sm shadow-md outline-none dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <Input
        autoFocus
        value={task.title}
        onChange={(e) => setTask({ ...task, title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
        className={cn(
          "w-full text-sm h-8 px-2",
          "bg-white dark:bg-slate-800",
          "border border-gray-200 dark:border-slate-700",
          "text-gray-900 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400",
          "focus:border-transparent",
        )}
        placeholder="Enter task title..."
      />
    </div>
  );
};
