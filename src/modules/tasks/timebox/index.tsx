import React, { useState } from "react";
import { TaskColumn } from "../../../components/TaskColumn";
import { TodoQueue } from "../../../components/TodoQueue";
import { Task } from "../../../types/task";
import { Story } from "../../../types/story";
import { TimeBox, TimeBoxStage } from "../../../types/timeBox";
import { TimeBoxConfig } from "../../../components/TimeBoxDialog";
import { Theme } from "../../../utils/theme";
import { toast } from "react-hot-toast";
import { useTasks } from "../../../contexts/TaskContext";
import {
  useFetchTodos,
  useUpdateStoryStatus,
  useDeleteStory,
} from "../../../hooks/storyHooks";
import {
  useUpdateTimeBoxConfig,
  useUpdateTimeBoxOrder,
} from "../../../hooks/timeBoxHooks";

interface PtbTimeBoxProps {
  theme?: Theme;
  onTaskSelect?: (task: Task) => void;
  selectedTaskId?: string | null;
  sortedTimeBoxesWithTasks?: Array<TimeBox & { tasks: Task[] }>;
}

export const PtbTimeBox: React.FC<PtbTimeBoxProps> = ({
  theme = "light",
  onTaskSelect,
  selectedTaskId,
  sortedTimeBoxesWithTasks = [],
}) => {
  console.log(
    "PtbTimeBox received sortedTimeBoxesWithTasks:",
    sortedTimeBoxesWithTasks,
  );

  const { updateTaskMutation, deleteTaskMutation, createTaskMutation } =
    useTasks();

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
          onSuccess: (newTask: Task | undefined) => {
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
    const currentIndex = sortedTimeBoxesWithTasks.findIndex(
      (tb) => tb.id === timeStageId,
    );
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedTimeBoxesWithTasks.length) return;

    const updatedTimeBoxesList = [...sortedTimeBoxesWithTasks];
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
          onSuccess: (newTask: Task | undefined) => {
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

      {(() => {
        console.log("About to render timeBoxes:", sortedTimeBoxesWithTasks);
        return sortedTimeBoxesWithTasks?.map((timeBox) => {
          console.log("Rendering timeBox:", timeBox);
          return (
            <TaskColumn
              key={timeBox.id}
              title={timeBox.name}
              count={timeBox.tasks.length}
              tasks={timeBox.tasks}
              badgeCount={timeBox.tasks.length}
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
                sortedTimeBoxesWithTasks.length > 0 &&
                timeBox.sort_order < sortedTimeBoxesWithTasks.length - 1
              }
              expireThreshold={timeBox.expireThreshold || 0}
              selectedTaskId={selectedTaskId}
            />
          );
        });
      })()}
    </div>
  );
};
