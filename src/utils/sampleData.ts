// import { Task } from '../types/task';
// import { supabase } from './supabaseClient';

// export async function createSampleTasks() {
//   try {
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     if (userError || !user) {
//       throw new Error('No authenticated user found');
//     }

//     const now = new Date().toISOString();

//     // Sample tasks for each time stage
//     const sampleTasks: Task[] = [
//       // Queue tasks
//       {
//         id: crypto.randomUUID(),
//         title: 'Review Project Requirements',
//         description: 'Review and analyze project requirements document',
//         timeStage: 'queue',
//         stageEntryDate: now,
//         assignee: user.id,
//         listId: 'work',
//         priority: 'medium',
//         energy: 'high',
//         location: 'office',
//         // story: null,
//         labels: ['project', 'planning'],
//         showInTimeBox: true,
//         showInList: true,
//         showInCalendar: false,
//         icon: 'blue',
//         checklistItems: [],
//         comments: [],
//         attachments: [],
//         history: [],
//         createdAt: now,
//         updatedAt: now,
//         createdBy: user.id
//       },
//       // Do tasks
//       {
//         id: crypto.randomUUID(),
//         title: 'Update Documentation',
//         description: 'Update project documentation with latest changes',
//         timeStage: 'do',
//         stageEntryDate: now,
//         assignee: user.id,
//         listId: 'work',
//         priority: 'high',
//         energy: 'medium',
//         location: 'office',
//         story: null,
//         labels: ['documentation'],
//         showInTimeBox: true,
//         showInList: true,
//         showInCalendar: false,
//         icon: 'purple',
//         checklistItems: [],
//         comments: [],
//         attachments: [],
//         history: [],
//         createdAt: now,
//         updatedAt: now,
//         createdBy: user.id
//       },
//       // Doing tasks
//       {
//         id: crypto.randomUUID(),
//         title: 'Implement New Feature',
//         description: 'Working on implementing the new feature',
//         timeStage: 'doing',
//         stageEntryDate: now,
//         assignee: user.id,
//         listId: 'development',
//         priority: 'high',
//         energy: 'high',
//         location: null,
//         story: null,
//         labels: ['development', 'feature'],
//         showInTimeBox: true,
//         showInList: true,
//         showInCalendar: false,
//         icon: 'blue',
//         checklistItems: [],
//         comments: [],
//         attachments: [],
//         history: [],
//         createdAt: now,
//         updatedAt: now,
//         createdBy: user.id
//       },
//       // Today tasks
//       {
//         id: crypto.randomUUID(),
//         title: 'Team Meeting',
//         description: 'Daily team sync meeting',
//         timeStage: 'today',
//         stageEntryDate: now,
//         assignee: user.id,
//         listId: 'meetings',
//         priority: 'medium',
//         energy: 'medium',
//         location: 'office',
//         story: null,
//         labels: ['meeting', 'team'],
//         showInTimeBox: true,
//         showInList: true,
//         showInCalendar: true,
//         icon: 'purple',
//         checklistItems: [],
//         comments: [],
//         attachments: [],
//         history: [],
//         createdAt: now,
//         updatedAt: now,
//         createdBy: user.id
//       },
//       // Done tasks
//       {
//         id: crypto.randomUUID(),
//         title: 'Code Review',
//         description: 'Review pull request for new feature',
//         timeStage: 'done',
//         stageEntryDate: now,
//         assignee: user.id,
//         listId: 'development',
//         priority: 'high',
//         energy: 'high',
//         location: null,
//         story: null,
//         labels: ['development', 'review'],
//         showInTimeBox: true,
//         showInList: true,
//         showInCalendar: false,
//         icon: 'blue',
//         checklistItems: [],
//         comments: [],
//         attachments: [],
//         history: [],
//         createdAt: now,
//         updatedAt: now,
//         createdBy: user.id
//       }
//     ];

//     // Delete existing tasks
//     const { error: deleteError } = await supabase
//       .from('tasks')
//       .delete()
//       .eq('assignee', user.id);

//     if (deleteError) throw deleteError;

//     // Insert sample tasks
//     const { error: insertError } = await supabase
//       .from('tasks')
//       .insert(sampleTasks.map(task => ({
//         id: task.id,
//         title: task.title,
//         description: task.description,
//         timestage: task.timeStage,
//         stage_entry_date: task.stageEntryDate,
//         assignee: task.assignee,
//         list_id: task.listId,
//         priority: task.priority,
//         energy: task.energy,
//         location: task.location,
//         story: task.story,
//         labels: task.labels,
//         icon: task.icon,
//         show_in_time_box: task.showInTimeBox,
//         show_in_list: task.showInList,
//         show_in_calendar: task.showInCalendar,
//         highlighted: false,
//         created_at: task.createdAt,
//         updated_at: task.updatedAt,
//         created_by: task.createdBy
//       })));

//     if (insertError) throw insertError;

//     console.log('Sample tasks created:', sampleTasks);
//     return sampleTasks;
//   } catch (error) {
//     console.error('Error creating sample tasks:', error);
//     throw error;
//   }
// }
