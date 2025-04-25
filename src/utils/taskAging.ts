import { Task, TimeStage, AgingStatus } from '../types/task';
import { TimeBox } from '../types/timeBox';

export function calculateTaskAge(task: Task): number {
  const entryDate = new Date(task.stageEntryDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - entryDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getAgingStatus(task: Task, timeBoxes: TimeBox[]): { status: AgingStatus; daysCount: number | null } {
  const timeBox = timeBoxes.find(tb => tb.id === task.timeStage);
  
  // If no time box found or no expiry threshold set, return normal status
  if (!timeBox?.expireThreshold) {
    return { status: 'normal', daysCount: null };
  }

  const age = calculateTaskAge(task);
  
  if (age > timeBox.expireThreshold) {
    const overdueDays = age - timeBox.expireThreshold;
    return { status: 'overdue', daysCount: -overdueDays };
  } else if (timeBox.warnThreshold && age >= timeBox.warnThreshold) {
    return { status: 'warning', daysCount: timeBox.expireThreshold - age };
  }
  
  return { status: 'normal', daysCount: null };
}

export function updateTaskAging(tasks: Task[], timeBoxes: TimeBox[]): Task[] {
  // Return empty array if tasks is not an array or is null/undefined
  if (!Array.isArray(tasks)) {
    return [];
  }

  return tasks.map(task => {
    const { status, daysCount } = getAgingStatus(task, timeBoxes);
    return {
      ...task,
      agingStatus: status,
      status: daysCount !== null ? daysCount.toString() : undefined
    };
  });
}