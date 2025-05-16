import { StarIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Theme } from "../utils/theme";
import { Task } from "../types/task";
import { useMemo } from "react";

const TaskAge = ({ theme, task }: { theme: Theme; task: Task }) => {
  const age = useMemo(() => {
    // If the task is not scheduled, return 0
    if (!task.schedule) {
      const now = new Date();
      const createdAt = new Date(task.createdAt);
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    // If the task is scheduled, return the difference between the scheduled date and the current date
    if (task.schedule.date) {
      const now = new Date();
      const scheduledAt = new Date(task.schedule.date);
      const diffTime = now.getTime() - scheduledAt.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  }, [task.createdAt, task.schedule]);
  return (
    <Button
      variant="outline"
      className={cn(
        "h-9 rounded flex items-center gap-2",
        theme === "dark"
          ? "border-slate-600 text-slate-300"
          : "border-[#efefef] text-[#514f4f]",
      )}
    >
      <StarIcon className="text-yellow-500 w-5 h-5" />
      <span className="font-normal text-base">Age {age}</span>
    </Button>
  );
};

export default TaskAge;
