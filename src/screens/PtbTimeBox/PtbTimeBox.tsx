import React, { useState, useEffect } from "react";
import { TaskColumn } from "../../components/TaskColumn";
import { TodoQueue } from "../../components/TodoQueue";
import { Task } from "../../types/task";
import { Story, mapStoryFromSupabase } from "../../types/story";
import { TimeBox, TimeBoxStage } from "../../types/timeBox";
import { TimeBoxConfig } from "../../components/TimeBoxDialog";
import { Theme } from "../../utils/theme";
import { toast } from "react-hot-toast";
import { useTasks } from "../../contexts/TaskContext";

// Import hooks from new location
import {
  useFetchTimeBoxes,
  useUpdateTimeBoxConfig,
  useUpdateTimeBoxOrder,
} from "../../hooks/timeBoxHooks";
import {
  useFetchTodos,
  useUpdateStoryStatus,
  useDeleteStory,
} from "../../hooks/storyHooks";

interface PtbTimeBoxProps {
  theme?: Theme;
  onTaskSelect?: (task: Task) => void;
  selectedTaskId?: string | null;
}

export const PtbTimeBox: React.FC<PtbTimeBoxProps> = ({
  theme = "light",
  onTaskSelect,
  selectedTaskId,
}) => {
  const { tasks, createTaskMutation, updateTaskMutation, deleteTaskMutation } =
    useTasks();

  const {
    data: timeBoxes = [],
    isLoading: isLoadingTimeBoxes,
    error: timeBoxesError,
  } = useFetchTimeBoxes();

  const {
    data: todos = [],
    isLoading: isLoadingTodos,
    error: todosError,
  } = useFetchTodos();

  const updateTimeBoxConfigMutation = useUpdateTimeBoxConfig();
  const updateTimeBoxOrderMutation = useUpdateTimeBoxOrder();
  const updateStoryStatusMutation = useUpdateStoryStatus();
  const deleteStoryMutation = useDeleteStory();

  const [activeTimeStage, setActiveTimeStage] = useState<TimeBoxStage>("queue");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleTaskSelectInternal = (task: Task) => {
    if (editingTaskId !== task.id) {
      onTaskSelect?.(task);
      setActiveTimeStage(task.timeStage as TimeBoxStage);
      setEditingTaskId(null);
    }
  };

  const handleNewTask = async (
    timeStage: TimeBoxStage,
    title: string,
  ): Promise<void> => {
    try {
      if (!timeStage) {
        throw new Error("timeStage is required");
      }
      const newTaskData: Partial<
        Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignee">
      > = {
        title,
        timeStage,
        showInTimeBox: true,
      };
      createTaskMutation.mutate(
        { taskData: newTaskData },
        {
          onSuccess: (newTask) => {
            if (newTask && onTaskSelect) {
              onTaskSelect(newTask);
              setActiveTimeStage(timeStage);
            } else if (!newTask) {
              toast.error("Task creation failed: mutation returned undefined");
            }
          },
        },
      );
    } catch (error) {
      console.error("Error creating new task (outer try-catch):", error);
      toast.error("Failed to create task in PtbTimeBox (outer try-catch)");
    }
  };

  const handleTaskTitleUpdate = async (taskId: string, title: string) => {
    if (editingTaskId === taskId) {
      updateTaskMutation.mutate({ taskId, updates: { title: title.trim() } });
      setEditingTaskId(null);
    } else {
      setEditingTaskId(taskId);
    }
  };

  const handleTimeBoxEdit = (timeStageId: string, config: TimeBoxConfig) => {
    updateTimeBoxConfigMutation.mutate({ id: timeStageId, config });
  };

  const handleTimeBoxMove = (timeStageId: string, direction: "up" | "down") => {
    const currentIndex = timeBoxes.findIndex((tb) => tb.id === timeStageId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= timeBoxes.length) return;

    const updatedTimeBoxesList = [...timeBoxes];
    const temp = updatedTimeBoxesList[currentIndex];
    updatedTimeBoxesList[currentIndex] = updatedTimeBoxesList[newIndex];
    updatedTimeBoxesList[newIndex] = temp;

    const finalUpdatedTimeBoxes = updatedTimeBoxesList.map((tb, index) => ({
      ...tb,
      sort_order: index,
    }));

    updateTimeBoxOrderMutation.mutate(finalUpdatedTimeBoxes);
  };

  const handleCreateTaskFromTodo = async (todo: Story, timeStage: string) => {
    try {
      if (!timeStage) {
        throw new Error("timeStage is required");
      }
      const newTaskData: Partial<
        Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignee">
      > = {
        title: todo.title,
        description: todo.description,
        story: todo.id,
        timeStage: timeStage as TimeBoxStage,
        showInTimeBox: true,
      };
      createTaskMutation.mutate(
        { taskData: newTaskData },
        {
          onSuccess: (newTask) => {
            if (newTask) {
              if (onTaskSelect) onTaskSelect(newTask);
              setActiveTimeStage(timeStage as TimeBoxStage);
              updateStoryStatusMutation.mutate({
                storyId: todo.id,
                status: "completed",
              });
            } else {
              toast.error("Task creation from todo failed: No new task data.");
            }
          },
        },
      );
    } catch (error) {
      console.error("Error in handleCreateTaskFromTodo process:", error);
      toast.error("Failed to process task creation from todo.");
    }
  };

  const handleDeleteTodo = async (todo: Story) => {
    deleteStoryMutation.mutate(todo.id);
  };

  const getTasksByStage = (stage: TimeBoxStage) => {
    return tasks.filter(
      (task) => task.timeStage === stage && task.showInTimeBox,
    );
  };

  if (isLoadingTimeBoxes || isLoadingTodos) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
        <p className="ml-4 text-lg">Loading TimeBox data...</p>
      </div>
    );
  }

  if (timeBoxesError) {
    return (
      <div className="text-red-500 p-4">
        Error loading time boxes: {timeBoxesError.message}
      </div>
    );
  }
  if (todosError) {
    return (
      <div className="text-red-500 p-4">
        Error loading todos: {todosError.message}
      </div>
    );
  }

  return (
    <div className="px-6 py-4 overflow-auto">
      <TodoQueue
        todos={todos}
        theme={theme}
        onCreateTask={handleCreateTaskFromTodo}
        onViewTodo={(todoItem) => {
          window.location.href = `/stories?id=${todoItem.id}`;
        }}
        onDeleteTodo={handleDeleteTodo}
      />

      {timeBoxes
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((timeBox) => {
          const stageTasks = getTasksByStage(timeBox.id as TimeBoxStage);
          return (
            <TaskColumn
              key={timeBox.id}
              title={timeBox.name}
              count={stageTasks.length}
              tasks={stageTasks}
              badgeCount={stageTasks.length}
              defaultExpanded={timeBox.id !== "doing" && timeBox.id !== "done"}
              timeStage={timeBox.id as TimeBoxStage}
              onTaskSelect={handleTaskSelectInternal}
              onNewTask={handleNewTask}
              onTaskTitleUpdate={handleTaskTitleUpdate}
              onTaskDelete={(taskId) => deleteTaskMutation.mutate(taskId)}
              onTimeBoxEdit={handleTimeBoxEdit}
              onTimeBoxMove={handleTimeBoxMove}
              editingTaskId={editingTaskId}
              isActive={activeTimeStage === timeBox.id}
              canMoveUp={timeBox.sort_order > 0}
              canMoveDown={
                timeBoxes.length > 0 &&
                timeBox.sort_order < timeBoxes.length - 1
              }
              expireThreshold={timeBox.expireThreshold || 0}
              selectedTaskId={selectedTaskId}
            />
          );
        })}
    </div>
  );
};
