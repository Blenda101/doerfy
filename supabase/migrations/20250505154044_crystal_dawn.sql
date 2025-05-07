/*
  # Add Task Stage Column

  1. Changes
    - Add timestage column to tasks table
    - Add check constraint for valid values
    - Create index for performance
*/

-- Add the column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'timestage'
  ) THEN
    ALTER TABLE tasks ADD COLUMN timestage text;
  END IF;
END $$;

-- Add check constraint for valid values
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS valid_timestage;

ALTER TABLE tasks
ADD CONSTRAINT valid_timestage 
CHECK (timestage = ANY (ARRAY['queue', 'do', 'doing', 'today', 'done']));

-- Create index for performance
DROP INDEX IF EXISTS tasks_timestage_idx;
CREATE INDEX tasks_timestage_idx ON tasks(timestage);

-- Set default value for existing rows
UPDATE tasks 
SET timestage = 'queue' 
WHERE timestage IS NULL;