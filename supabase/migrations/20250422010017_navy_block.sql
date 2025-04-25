/*
  # Add Task Visibility Flags

  1. Changes
    - Add show_in_time_box column to tasks table
    - Add show_in_list column to tasks table
    - Add show_in_calendar column to tasks table
    - Set default values for visibility flags
*/

-- Add visibility columns
ALTER TABLE tasks
ADD COLUMN show_in_time_box boolean DEFAULT true,
ADD COLUMN show_in_list boolean DEFAULT true,
ADD COLUMN show_in_calendar boolean DEFAULT false;