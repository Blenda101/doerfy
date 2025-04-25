import { Task } from '../types/task';
import { TimeBox } from '../types/timeBox';
import { BannerConfig } from '../components/BannerManager';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  TIME_BOXES: 'doerfy_timeboxes',
} as const;

// TimeBox functions remain localStorage-based for now
export function saveTimeBoxes(timeBoxes: TimeBox[]): void {
  localStorage.setItem(STORAGE_KEYS.TIME_BOXES, JSON.stringify(timeBoxes));
}

export function loadTimeBoxes(): TimeBox[] | null {
  const stored = localStorage.getItem(STORAGE_KEYS.TIME_BOXES);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored time boxes:', e);
    return null;
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No authenticated user found');
    }

    const tasksToUpsert = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      time_stage: task.timeStage,
      stage_entry_date: task.stageEntryDate,
      assignee: user.id,
      list: task.list,
      priority: task.priority,
      energy: task.energy,
      location: task.location,
      story: task.story,
      labels: task.labels,
      icon: task.icon,
      show_in_time_box: task.showInTimeBox,
      show_in_list: task.showInList,
      show_in_calendar: task.showInCalendar,
      highlighted: task.highlighted,
      status: task.status,
      aging_status: task.agingStatus,
      created_at: task.createdAt,
      updated_at: new Date().toISOString(),
      created_by: user.id
    }));

    const { error } = await supabase
      .from('tasks')
      .upsert(tasksToUpsert, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving tasks to Supabase:', error);
    throw error;
  }
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No authenticated user found');
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!tasks) {
      return [];
    }

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      timeStage: task.time_stage,
      stageEntryDate: task.stage_entry_date,
      assignee: task.assignee,
      list: task.list,
      priority: task.priority,
      energy: task.energy,
      location: task.location,
      story: task.story,
      labels: task.labels || [],
      icon: task.icon,
      showInTimeBox: task.show_in_time_box ?? true,
      showInList: task.show_in_list ?? true,
      showInCalendar: task.show_in_calendar ?? false,
      highlighted: task.highlighted,
      status: task.status,
      agingStatus: task.aging_status,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      createdBy: task.created_by,
      checklistItems: [],
      comments: [],
      attachments: [],
      history: []
    }));
  } catch (error) {
    console.error('Error loading tasks from Supabase:', error);
    throw error;
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting task from Supabase:', error);
    throw error;
  }
}

export async function saveBannerConfig(config: BannerConfig): Promise<void> {
  try {
    console.log('Saving banner config:', config);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No authenticated user found');
    }

    const { error } = await supabase
      .from('banner_configs')
      .upsert({
        user_id: user.id,
        images: config.images,
        transition_time: config.transitionTime,
        audio: config.audio,
        autoplay: config.autoplay,
        volume: config.volume,
        quotes: config.quotes,
        quote_rotation: config.quoteRotation,
        quote_duration: config.quoteDuration,
        text_style: config.textStyle,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving banner config:', error);
      throw error;
    }

    console.log('Banner config saved successfully');
  } catch (error) {
    console.error('Error saving banner config:', error);
    throw error;
  }
}

export async function loadBannerConfig(): Promise<BannerConfig | null> {
  try {
    console.log('Loading banner config...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No authenticated user found');
    }

    const { data: config, error } = await supabase
      .from('banner_configs')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading banner config:', error);
      throw error;
    }

    if (!config) {
      console.log('No banner config found');
      return null;
    }

    const bannerConfig = {
      images: config.images || [],
      transitionTime: config.transition_time || 5,
      audio: config.audio || [],
      autoplay: config.autoplay || false,
      volume: config.volume || 50,
      quotes: config.quotes || [],
      quoteRotation: config.quote_rotation || false,
      quoteDuration: config.quote_duration || 10,
      textStyle: config.text_style || {
        font: 'Inter',
        size: 24,
        color: '#FFFFFF'
      }
    };

    console.log('Loaded banner config:', bannerConfig);
    return bannerConfig;
  } catch (error) {
    console.error('Error loading banner config:', error);
    throw error;
  }
}