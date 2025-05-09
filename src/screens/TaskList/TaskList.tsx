import React from "react";
import { TaskItem } from "../../components/TaskItem";
import { ListHeader } from "../../components/ListHeader";
import { InlineTaskEditor } from "../../components/InlineTaskEditor";
import { cn } from "../../lib/utils";
import { Theme } from "../../utils/theme";
import { useTasks } from "../../hooks/useTasks";
import { List } from "../../hooks/useLists";
import { AddListDialog } from "../../components/AddListDialog";
import { Task } from "../../types/task";

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
    isLoading,
    error,
    editingTaskId,
    newTaskList,
    newTaskTitle,
    activeList,
    tasksByList,
    setEditingTaskId,
    setNewTaskList,
    setNewTaskTitle,
    setActiveList,
    handleTaskComplete,
    handleTaskUpdate,
    handleNewTask,
    handleTaskTitleUpdate,
    handleDeleteTask,
  } = useTasks({ lists });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
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
                    isActive={activeList === list.id}
                    onListClick={setActiveList}
                    onAddTask={() => {
                      setEditingTaskId("new");
                      setActiveList(list.id);
                      setNewTaskList(list.id);
                      setNewTaskTitle("");
                    }}
                  />

                  <div className="space-y-2">
                    {editingTaskId === "new" && newTaskList === list.id && (
                      <InlineTaskEditor
                        value={newTaskTitle}
                        onChange={setNewTaskTitle}
                        onSave={() => {
                          const trimmed = newTaskTitle.trim();
                          if (!trimmed) return;
                          handleNewTask(list.id, trimmed);
                        }}
                        onCancel={() => {
                          setEditingTaskId(null);
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
                        onTaskComplete={handleTaskComplete}
                        onEditStart={(taskId) => {
                          setEditingTaskId(taskId);
                          setNewTaskTitle(task.title);
                        }}
                        onTitleChange={setNewTaskTitle}
                        onTitleUpdate={handleTaskTitleUpdate}
                        onEditCancel={() => {
                          setEditingTaskId(null);
                          setNewTaskTitle(task.title);
                        }}
                        onDeleteTask={handleDeleteTask}
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
        onClose={() => setIsAddListOpen(false)}
        onSave={(list) => {
          setIsAddListOpen(false);
          setLists([list, ...lists]);
        }}
      />
    </div>
  );
};
