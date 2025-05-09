import React from "react";
import { PropertySheet } from "../../components/PropertySheet";
import { TaskItem } from "../../components/TaskItem";
import { ListHeader } from "../../components/ListHeader";
import { InlineTaskEditor } from "../../components/InlineTaskEditor";
import { cn } from "../../lib/utils";
import { Theme } from "../../utils/theme";
import { List, useTasks } from "../../hooks/useTasks";
import { AddListDialog } from "../../components/AddListDialog";

interface TaskListProps {
  theme?: Theme;
  isAddListOpen: boolean;
  setIsAddListOpen: (open: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  theme = "light",
  isAddListOpen,
  setIsAddListOpen,
}) => {
  const {
    isLoading,
    error,
    lists,
    setLists,
    selectedTask,
    editingTaskId,
    newTaskList,
    newTaskTitle,
    activeList,
    tasksByList,
    setSelectedTask,
    setEditingTaskId,
    setNewTaskList,
    setNewTaskTitle,
    setActiveList,
    handleTaskComplete,
    handleTaskSelect,
    handleTaskUpdate,
    handleNewTask,
    handleTaskTitleUpdate,
    handleDeleteTask,
  } = useTasks();

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

  console.log({ lists, tasksByList });
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
                        isSelected={selectedTask?.id === task.id}
                        isEditing={editingTaskId === task.id}
                        newTaskTitle={newTaskTitle}
                        onTaskSelect={handleTaskSelect}
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

      {selectedTask && (
        <div
          className={cn(
            "border-l",
            theme === "dark"
              ? "border-[#334155] bg-[#1E293B]"
              : "border-gray-200",
          )}
        >
          <PropertySheet
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdate={handleTaskUpdate}
            theme={theme}
            availableLists={lists.map((list) => list.name)}
          />
        </div>
      )}

      {/* Add List Dialog */}
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
