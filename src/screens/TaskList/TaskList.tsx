import React, { useState, useEffect, useMemo } from "react";
import { TaskItem } from "../../components/TaskItem";
import { ListHeader } from "../../components/ListHeader";
import { InlineTaskEditor } from "../../components/InlineTaskEditor";
import { Theme } from "../../utils/theme";
import { List } from "../../hooks/useLists";
import { AddListDialog } from "../../components/AddListDialog";
import { Task } from "../../types/task";
import { supabase } from "../../utils/supabaseClient";
import { toast } from "react-hot-toast";
import { useTasks } from "../../contexts/TaskContext";

interface TaskListProps {
  theme?: Theme;
  isAddListOpen: boolean;
  setIsAddListOpen: (open: boolean) => void;
  lists: List[];
  setLists: (lists: List[]) => void;
  onTaskSelect: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  theme = "light",
  isAddListOpen,
  setIsAddListOpen,
  lists,
  setLists,
  onTaskSelect,
}) => {
  const {
    tasks,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    isLoadingTasks: tasksLoadingGlobal,
    tasksError: tasksErrorGlobal,
  } = useTasks();

  const [editingList, setEditingList] = useState<List | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskListId, setNewTaskListId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const tasksByList = useMemo(() => {
    return lists.reduce((acc, list) => {
      acc[list.id] = {
        list,
        tasks: tasks.filter(
          (task) => task.listId === list.id && task.showInList,
        ),
      };
      return acc;
    }, {} as Record<string, { list: List; tasks: Task[] }>);
  }, [lists, tasks]);

  const handleTaskComplete = async (taskId: string) => {
    updateTaskMutation.mutate({ taskId, updates: { timeStage: "done" } });
  };

  const handleLocalNewTask = async (listId: string, title: string) => {
    if (!title.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }
    const newTaskData: Partial<
      Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignee">
    > = {
      title: title.trim(),
      listId,
      showInList: true,
      timeStage: "queue",
    };
    createTaskMutation.mutate(
      { taskData: newTaskData },
      {
        onSuccess: (created) => {
          if (created) {
            setNewTaskTitle("");
            setEditingTaskId(null);
            setNewTaskListId(null);
          }
        },
      },
    );
  };

  const handleLocalTaskTitleUpdate = async (taskId: string, title: string) => {
    updateTaskMutation.mutate({ taskId, updates: { title: title.trim() } });
    setEditingTaskId(null);
  };

  const openAddListDialog = () => {
    setEditingList(null);
    setIsAddListOpen(true);
  };

  const openEditListDialog = (list: List) => {
    setEditingList(list);
    setIsAddListOpen(true);
  };

  const handleDeleteList = async (listId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this list and all its tasks? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      const tasksInList = tasks.filter((task) => task.listId === listId);
      for (const task of tasksInList) {
        deleteTaskMutation.mutate(task.id);
      }

      const { error: listDeletionError } = await supabase
        .from("lists")
        .delete()
        .eq("id", listId);

      if (listDeletionError) throw listDeletionError;

      setLists(lists.filter((list) => list.id !== listId));
      if (activeListId === listId) {
        setActiveListId(null);
      }
      toast.success("List and its tasks deleted successfully");
    } catch (err) {
      console.error("Error deleting list and tasks:", err);
      const message =
        err instanceof Error ? err.message : "Failed to delete list.";
      toast.error(message);
    }
  };

  if (tasksLoadingGlobal) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (tasksErrorGlobal) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-red-500 p-3 bg-red-50 border border-red-300 rounded">
          Error: {tasksErrorGlobal.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 px-6 py-4 overflow-auto">
          <div className="flex flex-wrap gap-6">
            {lists.map((list) => {
              const listTasks = tasksByList[list.id]?.tasks || [];
              return (
                <div key={list.id} className="max-w-sm min-w-[300px]">
                  <ListHeader
                    listId={list.id}
                    listName={list.name}
                    taskCount={listTasks.length}
                    theme={theme}
                    isActive={activeListId === list.id}
                    onListClick={setActiveListId}
                    onAddTask={() => {
                      setNewTaskListId(list.id);
                      setEditingTaskId("new-" + list.id);
                      setNewTaskTitle("");
                      setActiveListId(list.id);
                    }}
                    onEditList={() => openEditListDialog(list)}
                    onDeleteList={() => handleDeleteList(list.id)}
                  />

                  <div className="space-y-2 mt-2">
                    {editingTaskId === "new-" + list.id &&
                      newTaskListId === list.id && (
                        <InlineTaskEditor
                          value={newTaskTitle}
                          onChange={setNewTaskTitle}
                          onSave={() => {
                            handleLocalNewTask(list.id, newTaskTitle);
                          }}
                          onCancel={() => {
                            setEditingTaskId(null);
                            setNewTaskListId(null);
                            setNewTaskTitle("");
                          }}
                          className="flex-1"
                        />
                      )}

                    {listTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        theme={theme}
                        isSelected={false}
                        isEditing={editingTaskId === task.id}
                        newTaskTitle={newTaskTitle}
                        onTaskSelect={() => onTaskSelect(task)}
                        onTaskComplete={() => handleTaskComplete(task.id)}
                        onEditStart={(taskId) => {
                          setEditingTaskId(taskId);
                          setNewTaskTitle(task.title);
                          setNewTaskListId(null);
                        }}
                        onTitleChange={setNewTaskTitle}
                        onTitleUpdate={(newTitle) =>
                          handleLocalTaskTitleUpdate(task.id, newTitle)
                        }
                        onEditCancel={() => {
                          setEditingTaskId(null);
                          setNewTaskTitle("");
                        }}
                        onDeleteTask={() => deleteTaskMutation.mutate(task.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AddListDialog
        isOpen={isAddListOpen}
        onClose={() => {
          setIsAddListOpen(false);
          setEditingList(null);
        }}
        listToEdit={editingList}
        onSave={(savedList) => {
          if (editingList) {
            setLists(
              lists.map((list) =>
                list.id === savedList.id ? savedList : list,
              ),
            );
          } else {
            setLists([savedList, ...lists]);
          }
          setIsAddListOpen(false);
          setEditingList(null);
        }}
      />
    </div>
  );
};
