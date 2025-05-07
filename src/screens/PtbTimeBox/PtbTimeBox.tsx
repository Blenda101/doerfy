import React, { useState, useEffect } from "react";
import { TaskColumn } from "../../components/TaskColumn";
import { TodoQueue } from "../../components/TodoQueue";
import { Task } from "../../types/task";
import { StoryWithRelations } from "../../types/story";
import { TimeBox, TimeBoxStage } from "../../types/timeBox";
import { defaultTimeBoxes } from "../../data/timeBoxes";
import { loadTimeBoxes, saveTimeBoxes, saveTasks, deleteTask } from "../../utils/storage";
import { updateTaskAging } from "../../utils/taskAging";
import { updateTaskScheduling } from '../../utils/taskScheduling';
import { TimeBoxConfig } from "../../components/TimeBoxDialog";
import { cn } from "../../lib/utils";
import { Theme } from '../../utils/theme';
import { createNewTask } from '../../utils/taskUtils';
import { toast } from 'react-hot-toast';
import { supabase } from "../../utils/supabaseClient";

interface PtbTimeBoxProps {
  theme?: Theme;
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
  selectedTaskId?: string | null;
  onTaskUpdate?: (task: Task) => void;
}

export const PtbTimeBox: React.FC<PtbTimeBoxProps> = ({
  theme = 'light',
  tasks,
  onTaskSelect,
  selectedTaskId,
  onTaskUpdate
}) => {
  const [timeBoxes, setTimeBoxes] = useState<TimeBox[]>([]);
  const [activeTimeStage, setActiveTimeStage] = useState<TimeBoxStage>('queue');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTargetStage, setDropTargetStage] = useState<TimeBoxStage | null>(null);
  const [todos, setTodos] = useState<StoryWithRelations[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: timeBoxData, error: timeBoxError } = await supabase
          .from('time_boxes')
          .select('*')
          .order('sort_order');

        if (timeBoxError) throw timeBoxError;
        
        if (!timeBoxData?.length) {
          const { error: insertError } = await supabase
            .from('time_boxes')
            .insert(defaultTimeBoxes);

          if (insertError) throw insertError;
          setTimeBoxes(defaultTimeBoxes);
        } else {
          setTimeBoxes(timeBoxData);
        }
      } catch (error) {
        console.error('Error loading time boxes:', error);
        toast.error('Failed to load time boxes');
        setTimeBoxes(defaultTimeBoxes);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: stories, error } = await supabase
          .from('stories')
          .select('*')
          .eq('type', 'todo')
          .eq('status', 'active')
          .or(`assignee.eq.${user.id},created_by.eq.${user.id}`);

        if (error) throw error;
        setTodos(stories || []);
      } catch (error) {
        console.error('Error loading todos:', error);
        toast.error('Failed to load todos');
      }
    };

    loadTodos();
  }, []);

  const handleTaskSelect = (task: Task) => {
    if (editingTaskId !== task.id) {
      onTaskSelect?.(task.id);
      setActiveTimeStage(task.timestage as TimeBoxStage);
      setEditingTaskId(null);
    }
  };

  const handleNewTask = async (timeStage: TimeBoxStage, title: string): Promise<void> => {
    try {
      if (!timeStage) {
        throw new Error('timeStage is required');
      }
      
      const newTask = await createNewTask('personal', title, timeStage);
      if (!newTask.timestage) {
        throw new Error('Task creation failed: timestage is missing');
      }
      
      const updatedTasks = [newTask, ...tasks];
      await saveTasks(updatedTasks);
      onTaskSelect?.(newTask.id);
      setActiveTimeStage(timeStage);
    } catch (error) {
      console.error('Error creating new task:', error);
      toast.error('Failed to create task');
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

    const updatedTimeBoxes = [...timeBoxes];
    const temp = updatedTimeBoxes[currentIndex];
    updatedTimeBoxes[currentIndex] = updatedTimeBoxes[newIndex];
    updatedTimeBoxes[newIndex] = temp;

    updatedTimeBoxes.forEach((tb, index) => {
      tb.order = index;
    });

    setTimeBoxes(updatedTimeBoxes);
    saveTimeBoxes(updatedTimeBoxes);
  };

  const handleCreateTaskFromTodo = async (todo: StoryWithRelations, timeStage: string) => {
    try {
      if (!timeStage) {
        throw new Error('timeStage is required');
      }

      const newTask = await createNewTask('personal', todo.title, timeStage);
      if (!newTask.timestage) {
        throw new Error('Task creation failed: timestage is missing');
      }

      newTask.description = todo.description;
      newTask.story = todo.id;

      const updatedTasks = [newTask, ...tasks];
      await saveTasks(updatedTasks);
      onTaskSelect?.(newTask.id);
      setActiveTimeStage(timeStage as TimeBoxStage);

      const { error } = await supabase
        .from('stories')
        .update({ status: 'completed' })
        .eq('id', todo.id);

      if (error) throw error;

      setTodos(todos.filter(t => t.id !== todo.id));
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task from todo:', error);
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTodo = async (todo: StoryWithRelations) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', todo.id);

      if (error) throw error;

      setTodos(todos.filter(t => t.id !== todo.id));
      toast.success('Todo deleted successfully');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  const getTasksByStage = (stage: TimeBoxStage) => {
    const stageTasks = tasks.filter(task => task.timestage === stage && task.show_in_time_box);
    return stageTasks;
  };

  return (
    <div className="px-6 py-4 overflow-auto">
      <TodoQueue
        todos={todos}
        theme={theme}
        onCreateTask={handleCreateTaskFromTodo}
        onViewTodo={(todo) => {
          window.location.href = `/stories?id=${todo.id}`;
        }}
        onDeleteTodo={handleDeleteTodo}
      />

      {timeBoxes.sort((a, b) => a.order - b.order).map((timeBox) => {
        const stageTasks = getTasksByStage(timeBox.id as TimeBoxStage);
        return (
          <TaskColumn
            key={timeBox.id}
            title={timeBox.name}
            count={stageTasks.length}
            tasks={stageTasks}
            badgeCount={stageTasks.length}
            defaultExpanded={timeBox.id !== 'doing' && timeBox.id !== 'done'}
            timeStage={timeBox.id as TimeBoxStage}
            onTaskSelect={handleTaskSelect}
            onNewTask={handleNewTask}
            onTaskTitleUpdate={handleTaskTitleUpdate}
            onTaskDelete={deleteTask}
            onTimeBoxEdit={handleTimeBoxEdit}
            onTimeBoxMove={handleTimeBoxMove}
            editingTaskId={editingTaskId}
            isActive={activeTimeStage === timeBox.id}
            canMoveUp={timeBox.order > 0}
            canMoveDown={timeBox.order < timeBoxes.length - 1}
            expireThreshold={timeBox.expireThreshold}
            selectedTaskId={selectedTaskId}
          />
        );
      })}
    </div>
  );
};