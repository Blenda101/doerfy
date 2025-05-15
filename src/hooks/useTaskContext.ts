import { useContext } from "react";
import { TaskContext, TaskContextState } from "../contexts/TaskContext";

export const useTaskContext = (): TaskContextState => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
