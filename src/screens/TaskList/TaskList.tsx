import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { PropertySheet } from '../../components/PropertySheet';
import { InlineTaskEditor } from '../../components/InlineTaskEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Search,
  Bell,
  MoreHorizontal,
  Plus,
  ListIcon,
  InfoIcon,
  Edit,
  Trash2,
} from 'lucide-react';
import { Task } from '../../types/task';
import { supabase } from '../../utils/supabaseClient';
import { cn } from '../../lib/utils';
import { Theme } from '../../utils/theme';
import { TaskHoverCard } from '../../components/TaskHoverCard';
import { createNewTask } from '../../utils/taskUtils';
import { toast } from 'react-hot-toast';

interface TaskListProps {
  theme?: Theme;
  isAddListOpen?: boolean;
  setIsAddListOpen?: (open: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  theme = 'light',
  isAddListOpen,
  setIsAddListOpen,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskList, setNewTaskList] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeList, setActiveList] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user found');

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignee', user.id)
          .eq('show_in_list', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTasks(data || []);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks. Please try again.');
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTaskData();
  }, []);

  const tasksByList = tasks.reduce((acc, task) => {
    if (!acc[task.list]) {
      acc[task.list] = [];
    }
    acc[task.list].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const availableLists = Object.keys(tasksByList);

  const handleTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ timestage: 'done' })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, timestage: 'done' } : task
      ));
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleTaskSelect = (task: Task) => {
    if (editingTaskId !== task.id) {
      setSelectedTask(task);
      setEditingTaskId(null);
      setActiveList(task.list);
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          timestage: updatedTask.timeStage,
          stage_entry_date: updatedTask.stageEntryDate,
          list: updatedTask.list,
          priority: updatedTask.priority,
          energy: updatedTask.energy,
          location: updatedTask.location,
          story: updatedTask.story,
          labels: updatedTask.labels,
          show_in_time_box: updatedTask.showInTimeBox,
          show_in_list: updatedTask.showInList,
          show_in_calendar: updatedTask.showInCalendar,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id);

      if (error) throw error;

      setTasks(tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ));
      setSelectedTask(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleTaskTitleUpdate = async (taskId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          title: title.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, title: title.trim() } : task
      ));
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error updating task title:', error);
      toast.error('Failed to update task title');
    }
  };

  const handleNewTask = async (list: string) => {
    try {
      const newTask = await createNewTask(list);
      setTasks([newTask, ...tasks]);
      setNewTaskList(list);
      setEditingTaskId(newTask.id);
      setNewTaskTitle('');
      setActiveList(list);
    } catch (error) {
      console.error('Error creating new task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(tasksByList).map(([list, tasks]) => (
              <div
                key={list}
                className={cn(
                  "space-y-4",
                  activeList === list && "col-span-2"
                )}
              >
                <div className="flex items-center border-b pb-4 dark:border-slate-700">
                  <div
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => setActiveList(list)}
                  >
                    <h2
                      className={cn(
                        "text-lg font-semibold capitalize",
                        list === activeList
                          ? theme === "dark"
                            ? "text-[#8B5CF6]"
                            : "text-[#5036b0]"
                          : theme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800",
                      )}
                    >
                      {list}
                    </h2>
                    <Badge
                      className={cn(
                        "ml-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
                      )}
                    >
                      {tasks.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8"
                    onClick={() => handleNewTask(list)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start space-x-2 p-2 rounded-lg",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        "cursor-pointer",
                        selectedTask?.id === task.id && "bg-gray-50 dark:bg-gray-800"
                      )}
                      onClick={() => handleTaskSelect(task)}
                      onDoubleClick={() => {
                        setEditingTaskId(task.id);
                        setNewTaskTitle(task.title);
                      }}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                    >
                      <Checkbox
                        checked={task.timeStage === "done"}
                        onCheckedChange={() => handleTaskComplete(task.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {editingTaskId === task.id ? (
                        <InlineTaskEditor
                          value={newTaskTitle}
                          onChange={setNewTaskTitle}
                          onSave={() => handleTaskTitleUpdate(task.id, newTaskTitle)}
                          onCancel={() => {
                            setEditingTaskId(null);
                            setNewTaskTitle(task.title);
                          }}
                          className="flex-1"
                        />
                      ) : (
                        <>
                          <span
                            className={cn(
                              "text-sm flex-1",
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700",
                              task.timeStage === "done" &&
                                "line-through opacity-50",
                            )}
                          >
                            {task.title}
                          </span>
                          <div
                            className={cn(
                              "flex items-center gap-2",
                              hoveredTaskId === task.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          >
                            <TaskHoverCard task={task}>
                              <InfoIcon
                                size={16}
                                className="text-gray-400 dark:text-slate-500 cursor-pointer hover:text-gray-600 dark:hover:text-slate-300"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TaskHoverCard>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal
                                    size={16}
                                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTaskId(task.id);
                                    setNewTaskTitle(task.title);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            availableLists={availableLists}
          />
        </div>
      )}
    </div>
  );
};