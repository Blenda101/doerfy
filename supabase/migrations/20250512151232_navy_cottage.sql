/*
  # Add Task Scheduling Columns

  1. Changes
    - Add schedule_date for storing the task's scheduled date
    - Add schedule_time for storing the task's scheduled time
    - Add lead_days and lead_hours for preparation time
    - Add duration_days and duration_hours for task duration
    - Add recurring field with enum type for recurring patterns
    - Add check constraints to ensure valid values

  2. Security
    - No changes to RLS policies needed
*/

-- Create enum type for recurring patterns
CREATE TYPE recurring_pattern AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- Add scheduling columns to tasks table
ALTER TABLE tasks
ADD COLUMN schedule_date date,
ADD COLUMN schedule_time time,
ADD COLUMN lead_days integer DEFAULT 0,
ADD COLUMN lead_hours integer DEFAULT 0,
ADD COLUMN duration_days integer DEFAULT 0,
ADD COLUMN duration_hours integer DEFAULT 0,
ADD COLUMN recurring recurring_pattern;

-- Add check constraints
ALTER TABLE tasks
ADD CONSTRAINT valid_lead_days CHECK (lead_days >= 0),
ADD CONSTRAINT valid_lead_hours CHECK (lead_hours >= 0 AND lead_hours < 24),
ADD CONSTRAINT valid_duration_days CHECK (duration_days >= 0),
ADD CONSTRAINT valid_duration_hours CHECK (duration_hours >= 0 AND duration_hours < 24);

-- Create index for schedule_date for better query performance
CREATE INDEX tasks_schedule_date_idx ON tasks(schedule_date);