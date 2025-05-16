import { StarIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Theme } from "../utils/theme";
import { Task } from "../types/task";
import { useMemo } from "react";
import { differenceInDays, addDays } from "date-fns";

const TaskAge = ({ theme, task }: { theme: Theme; task: Task }) => {
  const age = useMemo<number>(() => {
    const now = new Date();
    const createdAt = new Date(task.createdAt);
    const scheduledAt = task.schedule?.date
      ? new Date(task.schedule.date)
      : null;

    // A task with no scheduled date
    if (!task.schedule || !scheduledAt)
      return Math.abs(differenceInDays(now, createdAt));

    const remainingDays = differenceInDays(scheduledAt, now);

    // If the remaining days is less than 1
    if (remainingDays < 1) {
      const durationDays = task.schedule?.durationDays ?? 0;

      // If the duration days is not set, return the remaining days even if it is negative
      if (!durationDays) return remainingDays;

      // If the duration days is set, return the duration days
      const scheduledAtPlusDurationDays = addDays(scheduledAt, durationDays);
      return differenceInDays(scheduledAtPlusDurationDays, now);
    }

    const leadDays = task.schedule?.leadDays ?? 0;

    // A task with no lead days or duration days with only a scheduled date
    if (!leadDays) return remainingDays;

    // A task with only a scheduled date and lead days
    // If the lead days has not still passed, return the remaining days - lead days
    const dayRemainingBasedOnLeadDays = remainingDays - leadDays;
    if (dayRemainingBasedOnLeadDays > 0) return dayRemainingBasedOnLeadDays;

    // If the lead days has passed, return remaining days so that the count is again resetted
    return remainingDays;
  }, [task.createdAt, task.schedule]);

  return (
    <Button
      variant="outline"
      className={cn(
        "h-9 rounded flex items-center gap-2",
        theme === "dark"
          ? "border-slate-600 text-slate-300"
          : "border-[#efefef] text-[#514f4f]",
        age > 0 && "border-green-600 text-green-600",
        age < 0 && "text-red-500 border-red-500",
      )}
    >
      <StarIcon className="w-5 h-5" />
      <span className="font-normal text-base">Age {age}</span>
    </Button>
  );
};

export default TaskAge;
