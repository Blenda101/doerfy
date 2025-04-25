import { addDays, differenceInDays, startOfDay } from 'date-fns';
import { Task, TimeStage, SCHEDULING_THRESHOLDS } from '../types/task';

export function calculateEffectiveDueDate(task: Task): Date | null {
  if (!task.schedule?.enabled || !task.schedule.date) return null;

  const dueDate = new Date(task.schedule.date);
  const leadTimeInDays = (task.schedule.leadDays || 0) + (task.schedule.leadHours || 0) / 24;
  
  return addDays(dueDate, -leadTimeInDays);
}

export function calculateDaysRemaining(date: Date | null): number | null {
  if (!date) return null;
  
  const today = startOfDay(new Date());
  const targetDate = startOfDay(date);
  return differenceInDays(targetDate, today);
}

export function determineTimeStage(daysRemaining: number | null): TimeStage {
  if (daysRemaining === null) return 'queue';
  
  if (daysRemaining <= 0) return 'today';
  if (daysRemaining <= SCHEDULING_THRESHOLDS.doing.max) return 'doing';
  if (daysRemaining <= SCHEDULING_THRESHOLDS.do.max) return 'do';
  return 'queue';
}

export function updateTaskScheduling(task: Task): Task {
  // Calculate the effective due date considering lead time
  const effectiveDueDate = calculateEffectiveDueDate(task);
  
  // Calculate days remaining until the effective due date
  const daysRemaining = calculateDaysRemaining(effectiveDueDate);
  
  // Determine the appropriate time stage based on days remaining
  const targetTimeStage = determineTimeStage(daysRemaining);

  // Only update the task if the time stage needs to change
  if (targetTimeStage !== task.timeStage) {
    const now = new Date().toISOString();
    
    // Calculate days in current stage
    const daysInCurrentStage = task.stageEntryDate ? 
      calculateDaysRemaining(new Date(task.stageEntryDate)) || 0 : 
      0;

    return {
      ...task,
      timeStage: targetTimeStage,
      stageEntryDate: now,
      history: [
        ...(task.history || []),
        {
          timeStage: task.timeStage,
          entryDate: task.stageEntryDate,
          daysInStage: daysInCurrentStage,
          userId: task.assignee
        },
        {
          timeStage: targetTimeStage,
          entryDate: now,
          userId: task.assignee
        }
      ]
    };
  }

  return task;
}