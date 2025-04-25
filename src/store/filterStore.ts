import { create } from 'zustand';
import { Task } from '../types/task';

export type FilterCriteria = {
  assignee?: string;
  timeStage?: string[];
  list?: string;
  priority?: string[];
  energy?: string[];
  labels?: string[];
  location?: string;
  story?: string;
  dueDate?: Date | null;
};

type FilterStore = {
  filters: {
    timebox: FilterCriteria;
    lists: FilterCriteria;
    calendar: FilterCriteria;
  };
  setFilter: (view: 'timebox' | 'lists' | 'calendar', criteria: Partial<FilterCriteria>) => void;
  clearFilter: (view: 'timebox' | 'lists' | 'calendar', key: keyof FilterCriteria) => void;
  clearAllFilters: (view: 'timebox' | 'lists' | 'calendar') => void;
  filterTasks: (tasks: Task[], view: 'timebox' | 'lists' | 'calendar') => Task[];
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: {
    timebox: {},
    lists: {},
    calendar: {},
  },
  setFilter: (view, criteria) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [view]: {
          ...state.filters[view],
          ...criteria,
        },
      },
    }));
  },
  clearFilter: (view, key) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [view]: {
          ...state.filters[view],
          [key]: undefined,
        },
      },
    }));
  },
  clearAllFilters: (view) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [view]: {},
      },
    }));
  },
  filterTasks: (tasks, view) => {
    const filters = get().filters[view];
    
    return tasks.filter((task) => {
      if (filters.assignee && task.assignee !== filters.assignee) return false;
      if (filters.timeStage?.length && !filters.timeStage.includes(task.timeStage)) return false;
      if (filters.list && task.list !== filters.list) return false;
      if (filters.priority?.length && !filters.priority.includes(task.priority)) return false;
      if (filters.energy?.length && !filters.energy.includes(task.energy)) return false;
      if (filters.location && task.location !== filters.location) return false;
      if (filters.story && task.story !== filters.story) return false;
      if (filters.labels?.length) {
        const hasMatchingLabel = filters.labels.some(label => task.labels.includes(label));
        if (!hasMatchingLabel) return false;
      }
      if (filters.dueDate && task.schedule?.date) {
        const taskDate = new Date(task.schedule.date);
        const filterDate = new Date(filters.dueDate);
        if (taskDate.toDateString() !== filterDate.toDateString()) return false;
      }
      return true;
    });
  },
}));