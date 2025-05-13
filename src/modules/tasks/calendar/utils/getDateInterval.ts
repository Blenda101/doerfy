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
  // Extract schedule_date (YYYY-MM-DD) and schedule_time (HH:mm:ss) from 'start'
  const schedule_date = start.toISOString().split("T")[0];
  const schedule_time = start.toTimeString().split(" ")[0];

  // Calculate duration in milliseconds
  const diffMs = end.getTime() - start.getTime();

  // Ensure start is before end
  if (diffMs < 0) {
    throw new Error("End date must be after start date.");
  }

  // Duration breakdown
  const msPerDay = 1000 * 60 * 60 * 24;
  const msPerHour = 1000 * 60 * 60;

  const duration_days = Math.floor(diffMs / msPerDay);
  const duration_hours = Math.floor((diffMs % msPerDay) / msPerHour);

  return {
    schedule_date,
    schedule_time,
    duration_days,
    duration_hours,
  };
}

export default getDateInterval;
