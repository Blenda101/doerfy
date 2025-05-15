import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, RepeatIcon } from "lucide-react";
import { Button } from "./ui/button";
import { TaskScheduler } from "./TaskScheduler";
import { cn } from "../lib/utils";
import { TaskSchedule } from "../types/task";
import { Theme } from "../utils/theme";

interface ScheduleProps {
  schedule: TaskSchedule | null | undefined;
  onScheduleChange: (schedule: TaskSchedule) => void;
  theme?: Theme;
}

export const Schedule: React.FC<ScheduleProps> = ({
  schedule,
  onScheduleChange,
  theme = "light",
}) => {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  const formatScheduleDetails = () => {
    if (!schedule?.enabled) return "Schedule";

    const parts: string[] = [];

    // Date/Recurring Part
    if (schedule.recurring?.type) {
      const recurringType = schedule.recurring.type.charAt(0).toUpperCase();
      let recurringPart = `↻ ${recurringType}`;

      if (schedule.leadDays || schedule.durationDays) {
        const leadPart = schedule.leadDays ? `L${schedule.leadDays}d` : "";
        const durationPart = schedule.durationDays
          ? `D${schedule.durationDays}d`
          : "";
        if (leadPart && durationPart) {
          recurringPart += `, ${leadPart}|${durationPart}`;
        } else {
          recurringPart += `, ${leadPart}${durationPart}`;
        }
      }
      parts.push(recurringPart);
    } else if (schedule.date) {
      const date = new Date(schedule.date);
      const datePart = `📅 ${format(date, "M/d")}`;

      if (schedule.leadDays || schedule.durationDays) {
        const leadPart = schedule.leadDays ? `L${schedule.leadDays}d` : "";
        const durationPart = schedule.durationDays
          ? `D${schedule.durationDays}d`
          : "";
        if (leadPart && durationPart) {
          parts.push(`${datePart}, ${leadPart}|${durationPart}`);
        } else {
          parts.push(`${datePart}, ${leadPart}${durationPart}`);
        }
      } else {
        parts.push(datePart);
      }
    }

    // Time Part
    if (schedule.time) {
      const timeIcon = schedule.alarmEnabled ? "🔔" : "🕒";
      let timePart = `${timeIcon} ${schedule.time}`;

      if (schedule.leadHours || schedule.durationHours) {
        const leadPart = schedule.leadHours ? `L${schedule.leadHours}h` : "";
        const durationPart = schedule.durationHours
          ? `D${schedule.durationHours}h`
          : "";
        if (leadPart && durationPart) {
          timePart += `, ${leadPart}|${durationPart}`;
        } else {
          timePart += `, ${leadPart}${durationPart}`;
        }
      }
      parts.push(timePart);
    }

    return parts.join(" ");
  };

  return (
    <>
      <Button
        variant={schedule?.enabled ? "default" : "ghost"}
        className={cn(
          "h-9 border-none rounded flex items-center text-base gap-2",
          schedule?.enabled
            ? "bg-[#5036b0] text-white hover:bg-[#3a2783] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED]"
            : "bg-[#efefef] hover:bg-[#e5e5e5] dark:bg-slate-700 dark:hover:bg-slate-600",
        )}
        onClick={() => setIsSchedulerOpen(true)}
      >
        {schedule?.recurring?.type ? (
          <RepeatIcon
            className={cn(
              "w-5 h-5",
              schedule?.enabled
                ? "text-white"
                : theme === "dark"
                ? "text-slate-300"
                : "text-[#6f6f6f]",
            )}
          />
        ) : (
          <CalendarIcon
            className={cn(
              "w-5 h-5",
              schedule?.enabled
                ? "text-white"
                : theme === "dark"
                ? "text-slate-300"
                : "text-[#6f6f6f]",
            )}
          />
        )}
        <span className="font-normal">{formatScheduleDetails()}</span>
      </Button>

      <TaskScheduler
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        schedule={schedule || null}
        onChange={onScheduleChange}
      />
    </>
  );
};
