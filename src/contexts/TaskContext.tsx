import React, {
  createContext,
  // useState,
  // useEffect,
  // useCallback,
  ReactNode,
  useContext, // Added for a hook to use the context
} from "react";
import {
  // useQuery, // Removed as useFetchTasks will be imported
  // useMutation, // Removed as mutation hooks will be imported
  // useQueryClient, // Removed as mutation hooks will be imported
  QueryClient, // Keep if still used directly, or remove if not
} from "@tanstack/react-query";
// supabase, toast, mappers, auth utils likely used by hooks, so remove if not directly used here
// import { supabase } from "../utils/supabaseClient";
import {
  AgingStatus,
  Task,
  TaskFromSupabase,
  TaskSchedule,
} from "../types/task";
// import { toast } from "react-hot-toast";
// import { mapTaskFromSupabase, mapTaskToSupabase } from "../utils/taskMapper";
// import { getAuthenticatedUser } from "../utils/auth";
// import { getTask } from "../utils/task";
// import { getDateInterval } from "../modules/tasks/calendar/utils/getDateInterval";

// Import hooks from the new location
import {
  taskKeys, // Assuming taskKeys is exported from taskHooks.ts
  useFetchTasks,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  // CreateTaskVariables, // Not needed if TaskContextState uses ReturnType
  // UpdateTaskVariables  // Not needed if TaskContextState uses ReturnType
} from "../hooks/taskHooks";

// Query Keys (This section will be removed)
// const taskKeys = { ... };

// Interface CreateTaskVariables (This section will be removed)
// interface CreateTaskVariables { ... };

// Interface UpdateTaskVariables (This section will be removed)
// interface UpdateTaskVariables { ... };

export interface TaskContextState {
  // From useQuery for fetching tasks
  tasks: Task[];
  isLoadingTasks: boolean;
  tasksError: Error | null;
  // Mutations
  createTaskMutation: ReturnType<typeof useCreateTaskMutation>;
  updateTaskMutation: ReturnType<typeof useUpdateTaskMutation>;
  deleteTaskMutation: ReturnType<typeof useDeleteTaskMutation>;
  // Derived or direct
  getTaskById: (taskId: string) => Task | undefined;
  refetchTasks: () => void; // Added to allow manual refetch
}

export const TaskContext = createContext<TaskContextState | undefined>(
  undefined,
);

interface TaskProviderProps {
  children: ReactNode;
}

// Custom hook for fetching tasks (This section will be removed)
// const useFetchTasks = () => { ... };

// Custom hook for creating a task (This section will be removed)
// const useCreateTaskMutation = () => { ... };

// Custom hook for updating a task (This section will be removed)
// const useUpdateTaskMutation = () => { ... };

// Custom hook for deleting a task (This section will be removed)
// const useDeleteTaskMutation = () => { ... };

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const {
    data: tasks = [], // Default to empty array if data is undefined
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks,
  } = useFetchTasks(); // Now uses imported hook

  const createTaskMutation = useCreateTaskMutation(); // Now uses imported hook
  const updateTaskMutation = useUpdateTaskMutation(); // Now uses imported hook
  const deleteTaskMutation = useDeleteTaskMutation(); // Now uses imported hook

  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find((task) => task.id === taskId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoadingTasks,
        tasksError: tasksError ? new Error(tasksError.message) : null, // Ensure error is an Error object or null
        createTaskMutation,
        updateTaskMutation,
        deleteTaskMutation,
        getTaskById,
        refetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the TaskContext
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
