import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskColumn } from "../../components/TaskColumn";
import { Task } from "../../types/task";
import { TimeBox, TimeBoxStage } from "../../types/timeBox";
import { defaultTimeBoxes } from "../../data/timeBoxes";
import { loadTimeBoxes, saveTimeBoxes, saveTasks } from "../../utils/storage";
import { updateTaskAging } from "../../utils/taskAging";
import { updateTaskScheduling } from '../../utils/taskScheduling';
import { TimeBoxConfig } from "../../components/TimeBoxDialog";
import { cn } from "../../lib/utils";
import { Theme } from '../../utils/theme';
import { createNewTask } from '../../utils/taskUtils';

interface PtbTimeBoxProps {
  theme?: Theme;
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
  selectedTaskId?: string | null;
}

export const PtbTimeBox: React.FC<PtbTimeBoxProps> = ({ 
  theme = 'light',
  tasks,
  onTaskSelect,
  selectedTaskId
}) => {
  const [timeBoxes, setTimeBoxes] = useState<TimeBox[]>([]);
  const [activeTimeStage, setActiveTimeStage] = useState<TimeBoxStage>('queue');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    const storedTimeBoxes = loadTimeBoxes();
    setTimeBoxes(storedTimeBoxes || defaultTimeBoxes);
  }, []);

  useEffect(() => {
    const updateAging = () => {
      const updatedTasks = updateTaskAging(tasks, timeBoxes);
      saveTasks(updatedTasks);
    };

    updateAging();
    const agingInterval = setInterval(updateAging, 1000 * 60 * 60);

    const updateScheduling = () => {
      const updatedTasks = tasks.map(task => updateTaskScheduling(task));
      saveTasks(updatedTasks);
    };

    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      updateScheduling();
      setInterval(updateScheduling, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => {
      clearInterval(agingInterval);
      clearTimeout(midnightTimeout);
    };
  }, [timeBoxes, tasks]);

  const handleTaskSelect = (task: Task) => {
    if (editingTaskId !== task.id) {
      onTaskSelect?.(task.id);
      setActiveTimeStage(task.timeStage as TimeBoxStage);
      setEditingTaskId(null);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    await saveTasks(newTasks);
  };

  const calculateDaysInStage = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleNewTask = async (timeStage: TimeBoxStage, title: string): Promise<Task> => {
    try {
      const newTask = await createNewTask('personal', title);
      newTask.timeStage = timeStage;
      
      const updatedTasks = [newTask, ...tasks];
      await saveTasks(updatedTasks);
      onTaskSelect?.(newTask.id);
      setActiveTimeStage(timeStage);
      return newTask;
    } catch (error) {
      console.error('Error creating new task:', error);
      throw error;
    }
  };

  const handleTaskTitleUpdate = async (taskId: string, title: string) => {
    if (editingTaskId === taskId) {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, title: title.trim() || task.title } : task
      );
      await saveTasks(updatedTasks);
      setEditingTaskId(null);
    } else {
      setEditingTaskId(taskId);
    }
  };

  const handleTimeBoxEdit = (timeStage: TimeBoxStage, config: TimeBoxConfig) => {
    const updatedTimeBoxes = timeBoxes.map(tb =>
      tb.id === timeStage ? { ...tb, ...config } : tb
    );
    setTimeBoxes(updatedTimeBoxes);
    saveTimeBoxes(updatedTimeBoxes);
  };

  const handleTimeBoxMove = (timeStage: TimeBoxStage, direction: 'up' | 'down') => {
    const currentIndex = timeBoxes.findIndex(tb => tb.id === timeStage);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= timeBoxes.length) return;

    const updatedTimeBoxes = arrayMove(timeBoxes, currentIndex, newIndex);
    updatedTimeBoxes.forEach((tb, index) => {
      tb.order = index;
    });

    setTimeBoxes(updatedTimeBoxes);
    saveTimeBoxes(updatedTimeBoxes);
  };

  const handleAddTimeBox = (config: TimeBoxConfig) => {
    const newTimeBox: TimeBox = {
      ...config,
      order: timeBoxes.length,
    };
    const updatedTimeBoxes = [...timeBoxes, newTimeBox];
    setTimeBoxes(updatedTimeBoxes);
    saveTimeBoxes(updatedTimeBoxes);
  };

  const getTasksByStage = (stage: TimeBoxStage) => {
    return tasks.filter(task => task.timeStage === stage);
  };

  const validDropTargets = {
    queue: ['do', 'doing', 'today', 'done'],
    do: ['queue', 'doing', 'today', 'done'],
    doing: ['queue', 'do', 'today', 'done'],
    today: ['queue', 'do', 'doing', 'done'],
    done: ['queue', 'do', 'doing', 'today'],
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setDraggedTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (!activeTask || !overTask) return;

    if (activeTask.timeStage !== overTask.timeStage) {
      const now = new Date().toISOString();
      const daysInPreviousStage = calculateDaysInStage(
        activeTask.stageEntryDate,
        now
      );

      const updatedHistory = [
        ...activeTask.history,
        {
          timeStage: activeTask.timeStage,
          entryDate: activeTask.stageEntryDate,
          daysInStage: daysInPreviousStage,
          userId: activeTask.assignee
        },
        {
          timeStage: overTask.timeStage,
          entryDate: now,
          userId: activeTask.assignee
        }
      ];

      const updatedTasks = tasks.map(task =>
        task.id === active.id
          ? { 
              ...task, 
              timeStage: overTask.timeStage,
              stageEntryDate: now,
              status: undefined,
              agingStatus: 'normal',
              history: updatedHistory
            }
          : task
      );
      saveTasks(updatedTasks);
    } else if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      const updatedTasks = arrayMove(tasks, oldIndex, newIndex);
      saveTasks(updatedTasks);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <div className="px-6 py-4 overflow-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {timeBoxes.sort((a, b) => a.order - b.order).map((timeBox) => (
          <TaskColumn
            key={timeBox.id}
            title={timeBox.name}
            count={getTasksByStage(timeBox.id as TimeBoxStage).length}
            tasks={getTasksByStage(timeBox.id as TimeBoxStage)}
            badgeCount={getTasksByStage(timeBox.id as TimeBoxStage).length}
            defaultExpanded={timeBox.id !== 'doing' && timeBox.id !== 'done'}
            timeStage={timeBox.id as TimeBoxStage}
            onTaskSelect={handleTaskSelect}
            onNewTask={handleNewTask}
            onTaskTitleUpdate={handleTaskTitleUpdate}
            onTaskDelete={handleTaskDelete}
            onTimeBoxEdit={handleTimeBoxEdit}
            onTimeBoxMove={handleTimeBoxMove}
            editingTaskId={editingTaskId}
            isActive={activeTimeStage === timeBox.id}
            canMoveUp={timeBox.order > 0}
            canMoveDown={timeBox.order < timeBoxes.length - 1}
            expireThreshold={timeBox.expireThreshold}
            selectedTaskId={selectedTaskId}
          />
        ))}
      </DndContext>
    </div>
  );
};