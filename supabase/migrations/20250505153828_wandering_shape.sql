/*
  # Fix Task Stage Column

  1. Changes
    - Rename time_stage column to timestage to match frontend
    - Add check constraint for valid values
    - Create index for performance
*/

-- Rename the column
ALTER TABLE tasks
RENAME COLUMN time_stage TO timestage;

-- Add check constraint for valid values
ALTER TABLE tasks
ADD CONSTRAINT valid_timestage 
CHECK (timestage IN ('queue', 'do', 'doing', 'today', 'done'));

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS tasks_timestage_idx ON tasks(timestage);