/*
  # Add timeStage column to tasks table

  1. Changes
    - Add `time_stage` column to `tasks` table with valid stage values
    - Set default value to 'queue' for new tasks
    - Add check constraint to ensure valid values
    - Add index for performance optimization
    - Ensure existing tasks get a default value

  2. Notes
    - The time_stage column is required for task management functionality
    - Valid stages are: 'queue', 'do', 'doing', 'today', 'done'
    - Default value ensures data consistency
*/

-- Add the time_stage column with constraint
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS time_stage text NOT NULL DEFAULT 'queue'
CHECK (time_stage IN ('queue', 'do', 'doing', 'today', 'done'));

-- Add an index for performance
CREATE INDEX IF NOT EXISTS tasks_time_stage_idx ON tasks(time_stage);

-- Update any existing tasks to have the default value
UPDATE tasks SET time_stage = 'queue' WHERE time_stage IS NULL;