import { Task } from '../types/task';
import { supabase } from './supabaseClient';

export async function createNewTask(title: string = '', timestage: string = 'queue'): Promise<Task> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No authenticated user found');
    }

    if (!timestage) {
      throw new Error('timestage is required');
    }

    const now = new Date().toISOString();
    const taskTitle = title.trim() || 'New Task';

    const task = {
      id: crypto.randomUUID(),
      title: taskTitle,
      description: '',
      timestage: timestage,
      stage_entry_date: now,
      assignee: user.id,
      // list_id: list_id,
      priority: 'medium',
      energy: 'medium',
      location: null,
      story: null,
      labels: [],
      show_in_time_box: true,
      show_in_list: true,
      show_in_calendar: false,
      icon: 'blue',
      highlighted: false,
      created_at: now,
      updated_at: now,
      created_by: user.id
    };

    console.log('Creating new task:', task);
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      timeStage: data.timestage,
      stageEntryDate: data.stage_entry_date,
      assignee: data.assignee,
      listId: data.list_id,
      priority: data.priority,
      energy: data.energy,
      location: data.location,
      story: data.story,
      labels: data.labels || [],
      icon: data.icon,
      showInTimeBox: data.show_in_time_box ?? true,
      showInList: data.show_in_list ?? true,
      showInCalendar: data.show_in_calendar ?? false,
      highlighted: data.highlighted,
      status: data.status,
      agingStatus: data.aging_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      checklistItems: [],
      comments: [],
      attachments: [],
      history: [{
        timeStage: data.timestage,
        entryDate: now,
        userId: user.id
      }]
    };
  } catch (error) {
    console.error('Error creating new task:', error);
    throw error;
  }
}

export function validateTaskTitle(title: string): string {
  return title.trim() || 'New Task';
}