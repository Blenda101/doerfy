
-- Add scheduling columns to tasks table
ALTER TABLE tasks
ADD COLUMN recurring_interval integer DEFAULT 0;
