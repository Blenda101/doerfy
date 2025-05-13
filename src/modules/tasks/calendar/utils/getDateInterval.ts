import { TaskSchedule } from "../../../../types/task";

type ScheduleInput = {
  start: Date;
  end: Date;
};

type SupabaseScheduleData = {
  schedule_date: string; // YYYY-MM-DD
  schedule_time: string; // HH:mm:ss
  duration_days: number;
  duration_hours: number;
};

function getDateInterval({ start, end }: ScheduleInput): SupabaseScheduleData {
  if (end.getTime() < start.getTime()) {
    throw new Error("End date must be after start date.");
  }

  const schedule_date = start.toISOString().split("T")[0]; // ✅ Start date (YYYY-MM-DD)
  const schedule_time = start.toISOString().split("T")[1].split(".")[0]; // ✅ Start time (HH:mm:ss)

  const diffMs = end.getTime() - start.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  const msPerHour = 1000 * 60 * 60;

  const duration_days = Math.floor(diffMs / msPerDay);
  const duration_hours = Math.floor((diffMs % msPerDay) / msPerHour); // ✅ remainder after full days

  return {
    schedule_date,
    schedule_time,
    duration_days,
    duration_hours,
  };
}

function getSlotInterval(schedule: TaskSchedule): ScheduleInput {
  if (!schedule.enabled || !schedule.date)
    return {
      start: new Date(),
      end: new Date(),
    };

  const { time, durationDays = 0, durationHours = 0 } = schedule;

  const [hours, minutes, seconds] = time.split(":").map(Number);

  // Construct start time based on date and time components (in UTC)
  const start = new Date(
    Date.UTC(
      schedule.date.getUTCFullYear(),
      schedule.date.getUTCMonth(),
      schedule.date.getUTCDate(),
      hours,
      minutes,
      seconds,
    ),
  );

  const msPerDay = 1000 * 60 * 60 * 24;
  const msPerHour = 1000 * 60 * 60;
  const durationMs = durationDays * msPerDay + durationHours * msPerHour;

  const end = new Date(start.getTime() + durationMs);

  return { start, end };
}

export { getDateInterval, getSlotInterval };
