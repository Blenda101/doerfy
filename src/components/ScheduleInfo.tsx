import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  AlarmClock,
  Repeat,
  Calendar,
  CalendarCheck,
  Clock,
} from "lucide-react";
import { TaskSchedule } from "../types/task";
import { toZonedTime, format as tzFormat } from "date-fns-tz";

const ScheduleInfo = (props: { schedule: TaskSchedule }) => {
  const { schedule } = props;

  // Format date/time
  let dateTimeStr = "";
  const timeZone = "America/New_York"; // EST
  if (schedule.date) {
    const dateObj = new Date(schedule.date);
    if (schedule.time) {
      // Parse time string (HH:mm or HH:mm:ss)
      const [h, m, s] = schedule.time.split(":").map(Number);
      dateObj.setHours(h || 0, m || 0, s || 0, 0);
      const zoned = toZonedTime(dateObj, timeZone);
      dateTimeStr = tzFormat(zoned, "MMM d, yyyy h:mm a zzz", { timeZone });
    } else {
      const zoned = toZonedTime(dateObj, timeZone);
      dateTimeStr = tzFormat(zoned, "MMM d, yyyy", { timeZone }); // No timezone if only date
    }
  } else if (schedule.time) {
    // If only time is present
    const now = new Date();
    const [h, m, s] = schedule.time.split(":").map(Number);
    now.setHours(h || 0, m || 0, s || 0, 0);
    const zoned = toZonedTime(now, timeZone);
    dateTimeStr = tzFormat(zoned, "h:mm a zzz", { timeZone });
  }

  // Determine icon and title based on schedule properties
  let title = "";
  let IconComponent = Calendar;

  if (schedule.time) {
    title = "Time";
    if (schedule.alarmEnabled) {
      if (schedule.recurring?.type) {
        title = "Time alarm recurring";
        IconComponent = Repeat; // You can use a custom icon if you want to combine alarm+repeat
      } else {
        title = "Time alarm";
        IconComponent = AlarmClock;
      }
    } else {
      if (schedule.recurring?.type) {
        title = "Time recurring";
        IconComponent = Repeat;
      } else {
        title = "Time";
        IconComponent = Clock;
      }
    }
  } else if (schedule.date) {
    if (schedule.recurring?.type) {
      title = "Date recurring";
      IconComponent = CalendarCheck;
    } else {
      title = "Date";
      IconComponent = Calendar;
    }
  }

  // Lead and duration
  const leadParts = [];
  if (schedule.leadDays) leadParts.push(`${schedule.leadDays}d`);
  if (schedule.leadHours) leadParts.push(`${schedule.leadHours}hr`);
  const leadStr = leadParts.length ? `${leadParts.join(" ")} lead` : null;

  const durationParts = [];
  if (schedule.durationDays) durationParts.push(`${schedule.durationDays}d`);
  if (schedule.durationHours) durationParts.push(`${schedule.durationHours}hr`);
  const durationStr = durationParts.length
    ? `${durationParts.join(" ")} duration`
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <IconComponent
            size={16}
            className="ml-2 text-[#5036b0] hover:text-[#6c47d6] transition-colors"
          />
        </TooltipTrigger>
        <TooltipContent className="min-w-[220px] p-3">
          <div className="flex items-center gap-2 mb-1">
            <IconComponent size={16} className="text-[#5036b0]" />
            <span className="font-semibold text-[#5036b0]">{title}</span>
          </div>
          <div className="text-xs text-black mb-1 text-center">
            {dateTimeStr}
          </div>
          <div className="text-xs text-black text-center">
            {leadStr}
            {leadStr && durationStr ? ", " : null}
            {durationStr}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScheduleInfo;
