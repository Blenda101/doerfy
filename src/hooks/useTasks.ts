import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Task } from "../types/task";
import { toast } from "react-hot-toast";
import { createNewTask } from "../utils/taskUtils";

export interface List {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface UseTasksReturn {
  isLoading: boolean;
  error: string | null;
  lists: List[];
  tasks: Task[];
  selectedTask: Task | null;
  editingTaskId: string | null;
  newTaskList: string | null;
  newTaskTitle: string;
  activeList: string | null;
  newTaskId: string | null;
  tasksByList: Record<string, { list: List; tasks: Task[] }>;
  setSelectedTask: (task: Task | null) => void;
  setEditingTaskId: (id: string | null) => void;
  setNewTaskList: (id: string | null) => void;
  setNewTaskTitle: (title: string) => void;
  setActiveList: (id: string | null) => void;
  setLists: (lists: List[]) => void;
  handleTaskComplete: (taskId: string) => Promise<void>;
  handleTaskSelect: (task: Task) => void;
  handleTaskUpdate: (updatedTask: Task) => Promise<void>;
  handleNewTask: (listId: string, title: string) => Promise<void>;
  handleUpdateTask: (taskId: string, newTitle: string) => Promise<void>;
  handleTaskTitleUpdate: (taskId: string, title: string) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskList, setNewTaskList] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeList, setActiveList] = useState<string | null>(null);
  const [newTaskId, setNewTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("No authenticated user found");
        }

        // Load lists
        const { data: listsData, error: listsError } = await supabase
          .from("lists")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (listsError) throw listsError;
        setLists(listsData || []);

        // Load tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("assignee", user.id)
          .eq("show_in_list", true)
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;

        const transformedTasks =
          tasksData?.map((task) => ({
            ...task,
            showInTimeBox: task.show_in_time_box,
            showInList: task.show_in_list,
            showInCalendar: task.show_in_calendar,
            timeStage: task.timestage,
            agingStatus: task.aging_status,
            stageEntryDate: task.stage_entry_date,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            createdBy: task.created_by,
            listId: task.list_id,
            checklistItems: [],
            comments: [],
            attachments: [],
            history: [],
          })) || [];

        setTasks(transformedTasks);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data");
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const tasksByList = tasks.reduce((acc, task) => {
    const list = lists.find((l) => l.id === task.listId);
    if (!list) return acc;

    if (!acc[list.id]) {
      acc[list.id] = {
        list,
        tasks: [],
      };
    }
    acc[list.id].tasks.push(task);
    return acc;
  }, {} as Record<string, { list: List; tasks: Task[] }>);

  const handleTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ timestage: "done" })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, timeStage: "done" } : task,
        ),
      );
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
    }
  };

  const handleTaskSelect = (task: Task) => {
    if (editingTaskId !== task.id) {
      setSelectedTask(task);
      setEditingTaskId(null);
      setActiveList(task.listId || null);
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          timestage: updatedTask.timeStage,
          stage_entry_date: updatedTask.stageEntryDate,
          list_id: updatedTask.listId,
          priority: updatedTask.priority,
          energy: updatedTask.energy,
          location: updatedTask.location,
          story: updatedTask.story,
          labels: updatedTask.labels,
          show_in_time_box: updatedTask.showInTimeBox,
          show_in_list: updatedTask.showInList,
          show_in_calendar: updatedTask.showInCalendar,
          aging_status: updatedTask.agingStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedTask.id);

      if (error) throw error;

      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
      setSelectedTask(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleNewTask = async (listId: string, title: string) => {
    if (!title.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }

    try {
      const list = lists.find((l) => l.id === listId);
      if (!list) throw new Error("List not found");

      const newTask = await createNewTask(title, "queue", listId);

      setTasks([newTask, ...tasks]);
      setNewTaskId(newTask.id);
      setNewTaskTitle("");
    } catch (error) {
      console.error("Error creating new task:", error);
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async (taskId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, title: newTitle } : task,
        ),
      );
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleTaskTitleUpdate = async (taskId: string, title: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: title.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, title: title.trim() } : task,
        ),
      );
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task title:", error);
      toast.error("Failed to update task title");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.filter((task) => task.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  return {
    isLoading,
    error,
    lists,
    tasks,
    selectedTask,
    editingTaskId,
    newTaskList,
    newTaskTitle,
    activeList,
    newTaskId,
    tasksByList,
    setLists,
    setSelectedTask,
    setEditingTaskId,
    setNewTaskList,
    setNewTaskTitle,
    setActiveList,
    handleTaskComplete,
    handleTaskSelect,
    handleTaskUpdate,
    handleNewTask,
    handleUpdateTask,
    handleTaskTitleUpdate,
    handleDeleteTask,
  };
};
