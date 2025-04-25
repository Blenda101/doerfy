import { Task } from '../types/task';
import { supabase } from './supabaseClient';

const getDateWithOffset = (dayOffset: number, timeString?: string): string => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  if (timeString) {
    const [hours, minutes] = timeString.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  return date.toISOString();
};

export async function createSampleTasks() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No authenticated user found');
    }

    const now = new Date().toISOString();

    // Overdue tasks
    const overdueTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        title: 'Complete Q4 Financial Report',
        description: 'Finalize and submit Q4 2024 financial analysis and projections',
        timeStage: 'doing',
        stageEntryDate: getDateWithOffset(-30),
        assignee: user.id,
        list: 'work',
        priority: 'high',
        energy: 'high',
        location: 'office',
        story: null,
        labels: ['finance', 'quarterly', 'reports'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: true,
        icon: 'purple',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-35),
        updatedAt: now,
        createdBy: user.id,
        status: '30',
        agingStatus: 'overdue'
      },
      {
        id: crypto.randomUUID(),
        title: 'Update Team Documentation',
        description: 'Review and update team onboarding documentation',
        timeStage: 'do',
        stageEntryDate: getDateWithOffset(-15),
        assignee: user.id,
        list: 'team',
        priority: 'medium',
        energy: 'medium',
        location: null,
        story: null,
        labels: ['documentation', 'team'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: false,
        icon: 'blue',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-20),
        updatedAt: now,
        createdBy: user.id,
        status: '15',
        agingStatus: 'warning'
      },
      {
        id: crypto.randomUUID(),
        title: 'Client Presentation Review',
        description: 'Review and approve client presentation materials',
        timeStage: 'doing',
        stageEntryDate: getDateWithOffset(-10),
        assignee: user.id,
        list: 'client',
        priority: 'high',
        energy: 'high',
        location: 'office',
        story: null,
        labels: ['client', 'presentation'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: true,
        icon: 'purple',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-12),
        updatedAt: now,
        createdBy: user.id,
        status: '10',
        agingStatus: 'overdue'
      }
    ];

    // Today's tasks
    const todayTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        title: 'Team Stand-up Meeting',
        description: 'Daily team sync and progress update',
        timeStage: 'today',
        stageEntryDate: getDateWithOffset(0),
        assignee: user.id,
        list: 'team',
        priority: 'medium',
        energy: 'medium',
        location: 'office',
        story: null,
        labels: ['meeting', 'team'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: true,
        icon: 'blue',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-1),
        updatedAt: now,
        createdBy: user.id,
        schedule: {
          enabled: true,
          date: new Date(),
          time: '09:30',
          leadDays: 0,
          leadHours: 1,
          recurring: {
            type: 'daily',
            interval: 1,
            workdaysOnly: true,
            ends: { type: 'endless' }
          }
        }
      },
      {
        id: crypto.randomUUID(),
        title: 'Project Status Update',
        description: 'Update project timeline and deliverables',
        timeStage: 'today',
        stageEntryDate: getDateWithOffset(0),
        assignee: user.id,
        list: 'work',
        priority: 'high',
        energy: 'high',
        location: 'office',
        story: null,
        labels: ['project', 'status'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: true,
        icon: 'purple',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-1),
        updatedAt: now,
        createdBy: user.id,
        schedule: {
          enabled: true,
          date: new Date(),
          time: '14:00',
          leadDays: 0,
          leadHours: 2
        }
      },
      {
        id: crypto.randomUUID(),
        title: 'Review Pull Requests',
        description: 'Review and merge pending pull requests',
        timeStage: 'today',
        stageEntryDate: getDateWithOffset(0),
        assignee: user.id,
        list: 'development',
        priority: 'medium',
        energy: 'high',
        location: null,
        story: null,
        labels: ['development', 'code-review'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: false,
        icon: 'blue',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-1),
        updatedAt: now,
        createdBy: user.id
      }
    ];

    // Upcoming tasks
    const upcomingTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        title: 'Monthly Team Review',
        description: 'Monthly team performance review and planning',
        timeStage: 'queue',
        stageEntryDate: getDateWithOffset(0),
        assignee: user.id,
        list: 'team',
        priority: 'high',
        energy: 'high',
        location: 'office',
        story: null,
        labels: ['team', 'review', 'monthly'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: true,
        icon: 'purple',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-5),
        updatedAt: now,
        createdBy: user.id,
        schedule: {
          enabled: true,
          date: new Date(getDateWithOffset(7)),
          time: '10:00',
          leadDays: 2,
          recurring: {
            type: 'monthly',
            interval: 1,
            monthDay: 1,
            ends: { type: 'endless' }
          }
        }
      },
      {
        id: crypto.randomUUID(),
        title: 'Client Project Demo',
        description: 'Present project progress to client',
        timeStage: 'queue',
        stageEntryDate: getDateWithOffset(0),
        assignee: user.id,
        list: 'client',
        priority: 'high',
        energy: 'high',
        location: 'office',
        story: null,
        labels: ['client', 'demo', 'presentation'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: true,
        icon: 'purple',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-3),
        updatedAt: now,
        createdBy: user.id,
        schedule: {
          enabled: true,
          date: new Date(getDateWithOffset(10)),
          time: '15:00',
          leadDays: 3
        }
      },
      {
        id: crypto.randomUUID(),
        title: 'Weekly Code Review',
        description: 'Team code review session',
        timeStage: 'queue',
        stageEntryDate: getDateWithOffset(0),
        assignee: user.id,
        list: 'development',
        priority: 'medium',
        energy: 'high',
        location: null,
        story: null,
        labels: ['development', 'code-review', 'team'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: true,
        icon: 'blue',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-1),
        updatedAt: now,
        createdBy: user.id,
        schedule: {
          enabled: true,
          date: new Date(getDateWithOffset(5)),
          time: '11:00',
          leadDays: 1,
          recurring: {
            type: 'weekly',
            interval: 1,
            weekDays: ['W'],
            ends: { type: 'endless' }
          }
        }
      }
    ];

    // Unscheduled tasks
    const unscheduledTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        title: 'Update Development Environment',
        description: 'Update development tools and dependencies',
        timeStage: 'queue',
        stageEntryDate: getDateWithOffset(0),
        assignee: user.id,
        list: 'development',
        priority: 'low',
        energy: 'medium',
        location: null,
        story: null,
        labels: ['development', 'maintenance'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: false,
        icon: 'blue',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-2),
        updatedAt: now,
        createdBy: user.id
      },
      {
        id: crypto.randomUUID(),
        title: 'Research New Technologies',
        description: 'Research and evaluate new technologies for upcoming projects',
        timeStage: 'queue',
        stageEntryDate: getDateWithOffset(0),
        assignee: user.id,
        list: 'research',
        priority: 'low',
        energy: 'high',
        location: null,
        story: null,
        labels: ['research', 'technology'],
        showInTimeBox: true,
        showInList: true,
        showInCalendar: false,
        icon: 'purple',
        checklistItems: [],
        comments: [],
        attachments: [],
        history: [],
        createdAt: getDateWithOffset(-1),
        updatedAt: now,
        createdBy: user.id
      }
    ];

    const allTasks = [
      ...overdueTasks,
      ...todayTasks,
      ...upcomingTasks,
      ...unscheduledTasks
    ];

    // Delete existing tasks
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('assignee', user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new tasks
    const { error: insertError } = await supabase
      .from('tasks')
      .insert(allTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        time_stage: task.timeStage,
        stage_entry_date: task.stageEntryDate,
        assignee: task.assignee,
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
        updated_at: task.updatedAt,
        created_by: task.createdBy
      })));

    if (insertError) {
      throw insertError;
    }

    return allTasks;
  } catch (error) {
    console.error('Error creating sample tasks:', error);
    throw error;
  }
}