import { Task } from '../types/task';

const baseTask: Partial<Task> = {
  assignee: 'user-456',
  list: 'personal',
  createdBy: 'user-789',
  comments: [],
  attachments: [],
  history: [],
};

export const queueTasks: Task[] = [
  {
    ...baseTask,
    id: 'task-1',
    title: 'Complete quarterly report',
    description: 'Complete the Q1 2025 financial report',
    timeStage: 'queue',
    stageEntryDate: '2025-02-24T07:38:00Z',
    priority: 'high',
    energy: 'high',
    location: null,
    story: null,
    isReoccurring: false,
    reoccurringPattern: null,
    dueDate: null,
    labels: ['finance', 'quarterly'],
    alarm: true,
    icon: 'purple',
    highlighted: true,
    checklistItems: [],
    history: [{
      timeStage: 'queue',
      entryDate: '2025-02-24T07:38:00Z',
      userId: 'user-456'
    }],
    createdAt: '2025-02-24T07:38:00Z',
    updatedAt: '2025-03-10T13:51:00Z',
  },
  {
    ...baseTask,
    id: 'task-2',
    title: 'Schedule team meeting',
    description: 'Set up weekly team sync',
    timeStage: 'queue',
    stageEntryDate: '2025-02-24T07:38:00Z',
    priority: 'medium',
    energy: 'low',
    location: null,
    story: null,
    isReoccurring: true,
    reoccurringPattern: 'weekly',
    dueDate: null,
    labels: ['team', 'meetings'],
    alarm: false,
    icon: 'blue',
    checklistItems: [],
    history: [{
      timeStage: 'queue',
      entryDate: '2025-02-24T07:38:00Z',
      userId: 'user-456'
    }],
    createdAt: '2025-02-24T07:38:00Z',
    updatedAt: '2025-03-10T13:51:00Z',
  },
];

// Update other task arrays with history...
export const doTasks: Task[] = [
  {
    ...baseTask,
    id: 'task-8',
    title: 'Complete quarterly report',
    description: 'Review and finalize Q1 2025 report',
    timeStage: 'do',
    stageEntryDate: '2025-02-24T07:38:00Z',
    priority: 'high',
    energy: 'medium',
    location: null,
    story: null,
    isReoccurring: false,
    reoccurringPattern: null,
    dueDate: null,
    labels: ['finance'],
    alarm: false,
    icon: 'purple',
    checklistItems: [],
    history: [{
      timeStage: 'do',
      entryDate: '2025-02-24T07:38:00Z',
      userId: 'user-456'
    }],
    createdAt: '2025-02-24T07:38:00Z',
    updatedAt: '2025-03-10T13:51:00Z',
  },
];

export const doingTasks: Task[] = [
  {
    ...baseTask,
    id: 'task-15',
    title: 'Join Meetup Error on Recurring Meetups',
    description: 'Enable social login considering becoming part of the Access and Security Core.',
    timeStage: 'doing',
    stageEntryDate: '2025-02-24T07:38:00Z',
    priority: 'high',
    energy: 'medium',
    location: null,
    story: 'Brazil Vacation',
    isReoccurring: false,
    reoccurringPattern: null,
    dueDate: null,
    labels: ['frontend', 'meetup'],
    alarm: true,
    icon: 'blue',
    checklistItems: [
      { id: 'check-1', text: 'Google', completed: false },
      { id: 'check-2', text: 'Fire Fox', completed: false },
      { id: 'check-3', text: 'Safari', completed: false },
    ],
    history: [{
      timeStage: 'doing',
      entryDate: '2025-02-24T07:38:00Z',
      userId: 'user-456'
    }],
    createdAt: '2025-02-24T07:38:00Z',
    updatedAt: '2025-03-10T13:51:00Z',
    status: '6',
  },
];

export const todayTasks: Task[] = [
  {
    ...baseTask,
    id: 'task-20',
    title: 'Join Meetup Error on Recurring ...',
    description: 'Fix recurring meetup scheduling issues',
    timeStage: 'today',
    stageEntryDate: '2025-02-24T07:38:00Z',
    priority: 'high',
    energy: 'medium',
    location: null,
    story: null,
    isReoccurring: false,
    reoccurringPattern: null,
    dueDate: '2025-03-11T00:00:00Z',
    labels: ['frontend', 'bugfix'],
    alarm: true,
    icon: 'blue',
    checklistItems: [],
    history: [{
      timeStage: 'today',
      entryDate: '2025-02-24T07:38:00Z',
      userId: 'user-456'
    }],
    createdAt: '2025-02-24T07:38:00Z',
    updatedAt: '2025-03-10T13:51:00Z',
  },
];